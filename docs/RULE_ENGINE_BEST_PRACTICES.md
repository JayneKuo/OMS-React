# Rule Engine Best Practices - 规则引擎最佳实践

## 🎯 核心问题

### 问题1: 动作执行顺序
**问题**: 一个规则有多个动作，按什么顺序执行？

**解决方案**: 按动作类型的优先级执行

```typescript
// 动作优先级（从高到低）
const ACTION_PRIORITY = {
  "HOLD_ORDER": 1,        // 最高优先级 - 暂停订单
  "SET_WORKFLOW": 2,      // 设置工作流
  "SPLIT_ORDER": 3,       // 拆单
  "ASSIGN_WAREHOUSE": 4,  // 分配仓库
  "SET_PRIORITY": 5,      // 设置优先级
  "ADD_TAG": 6,           // 添加标签
  "SEND_NOTIFICATION": 7  // 最低优先级 - 发送通知
}
```

**为什么这样排序？**
- **HOLD_ORDER** 最先 - 如果要暂停，其他动作都不应该执行
- **SET_WORKFLOW** 其次 - 决定整个流程
- **SPLIT_ORDER** 第三 - 拆单后其他动作应用到拆分后的订单
- **通知类** 最后 - 所有业务逻辑完成后再通知

---

### 问题2: 动作冲突
**问题**: 如果一个规则既设置了Dropship又设置了Standard怎么办？

**解决方案**: 限制冲突动作

#### 方案A: UI层面限制（推荐）
```typescript
// 互斥动作组
const MUTUALLY_EXCLUSIVE_ACTIONS = {
  "SET_WORKFLOW": ["SET_WORKFLOW"],  // 只能有一个workflow
  "SPLIT_ORDER": ["SPLIT_ORDER"],    // 只能拆一次
  "HOLD_ORDER": ["HOLD_ORDER"]       // 只能暂停一次
}

// 在添加动作时检查
function canAddAction(existingActions, newActionType) {
  const exclusiveGroup = MUTUALLY_EXCLUSIVE_ACTIONS[newActionType]
  if (exclusiveGroup) {
    return !existingActions.some(a => exclusiveGroup.includes(a.type))
  }
  return true
}
```

#### 方案B: 后端验证
```typescript
// 规则保存时验证
function validateRule(rule: RoutingRule) {
  const workflowActions = rule.actions.filter(a => a.type === "SET_WORKFLOW")
  if (workflowActions.length > 1) {
    throw new Error("一个规则只能有一个Workflow动作")
  }
  
  const splitActions = rule.actions.filter(a => a.type === "SPLIT_ORDER")
  if (splitActions.length > 1) {
    throw new Error("一个规则只能有一个拆单动作")
  }
}
```

---

### 问题3: 回滚问题
**问题**: 如果动作执行到一半失败了，怎么回滚？

**解决方案**: 事务性执行 + 补偿机制

#### 方案A: 两阶段提交（推荐）
```typescript
// Phase 1: 验证阶段（不修改数据）
async function validateActions(po: PurchaseOrder, actions: RuleAction[]) {
  for (const action of actions) {
    switch (action.type) {
      case "SET_WORKFLOW":
        // 验证workflow配置是否有效
        await validateWorkflowConfig(action)
        break
      case "ASSIGN_WAREHOUSE":
        // 验证仓库是否存在且有容量
        await validateWarehouse(action.warehouseId)
        break
      // ... 其他验证
    }
  }
}

// Phase 2: 执行阶段（修改数据）
async function executeActions(po: PurchaseOrder, actions: RuleAction[]) {
  const executedActions = []
  
  try {
    for (const action of sortActionsByPriority(actions)) {
      await executeAction(po, action)
      executedActions.push(action)
    }
  } catch (error) {
    // 回滚已执行的动作
    await rollbackActions(po, executedActions)
    throw error
  }
}
```

#### 方案B: 补偿事务（Saga Pattern）
```typescript
// 每个动作都有对应的补偿动作
const COMPENSATION_ACTIONS = {
  "SET_WORKFLOW": async (po, action) => {
    // 恢复原始workflow
    await restoreOriginalWorkflow(po)
  },
  "ASSIGN_WAREHOUSE": async (po, action) => {
    // 取消仓库分配
    await unassignWarehouse(po)
  },
  "ADD_TAG": async (po, action) => {
    // 移除添加的标签
    await removeTags(po, action.tags)
  }
}

async function rollbackActions(po, executedActions) {
  // 逆序回滚
  for (const action of executedActions.reverse()) {
    const compensate = COMPENSATION_ACTIONS[action.type]
    if (compensate) {
      await compensate(po, action)
    }
  }
}
```

---

### 问题4: 多规则命中
**问题**: 如果多个规则都匹配，动作如何合并？

**解决方案**: 根据执行模式处理

#### FIRST_MATCH 模式（最简单，推荐）
```typescript
// 只执行第一个匹配的规则
function executeRules(po: PurchaseOrder, rules: RoutingRule[]) {
  const sortedRules = rules.sort((a, b) => a.priority - b.priority)
  
  for (const rule of sortedRules) {
    if (matchesConditions(po, rule.conditions)) {
      // 找到第一个匹配的规则，执行后停止
      await executeActions(po, rule.actions)
      return
    }
  }
  
  // 没有规则匹配，使用全局默认设置
  await applyGlobalDefaults(po)
}
```

#### CHAIN 模式（复杂，需要合并逻辑）
```typescript
// 执行所有匹配的规则，后面的覆盖前面的
function executeRulesChain(po: PurchaseOrder, rules: RoutingRule[]) {
  const sortedRules = rules.sort((a, b) => a.priority - b.priority)
  const matchedRules = sortedRules.filter(r => matchesConditions(po, r.conditions))
  
  // 合并所有动作
  const mergedActions = mergeActions(matchedRules.map(r => r.actions))
  
  // 执行合并后的动作
  await executeActions(po, mergedActions)
}

function mergeActions(actionsList: RuleAction[][]) {
  const merged = new Map<string, RuleAction>()
  
  for (const actions of actionsList) {
    for (const action of actions) {
      // 后面的规则覆盖前面的
      const key = getActionKey(action)
      merged.set(key, action)
    }
  }
  
  return Array.from(merged.values())
}
```

---

## 🎯 推荐方案

### 方案1: 简单可靠（推荐用于MVP）

```typescript
// 1. 只使用 FIRST_MATCH 模式
// 2. 一个规则只能有一个 SET_WORKFLOW 动作
// 3. 其他动作可以有多个（标签、通知等）
// 4. 按优先级排序执行
// 5. 失败时记录日志，不回滚

interface SimplifiedRule {
  conditions: Condition[]
  workflow: WorkflowAction  // 只能有一个
  additionalActions: Action[]  // 标签、通知等
}

async function executeSimplifiedRule(po: PurchaseOrder, rule: SimplifiedRule) {
  try {
    // 1. 设置workflow（最重要）
    await setWorkflow(po, rule.workflow)
    
    // 2. 执行其他动作（失败不影响主流程）
    for (const action of rule.additionalActions) {
      try {
        await executeAction(po, action)
      } catch (error) {
        // 记录日志但继续执行
        logger.error(`Action failed: ${action.type}`, error)
      }
    }
  } catch (error) {
    // workflow设置失败，整个规则失败
    throw error
  }
}
```

### 方案2: 完整企业级（用于生产环境）

```typescript
// 1. 支持三种执行模式
// 2. 动作分为关键动作和非关键动作
// 3. 关键动作失败回滚，非关键动作失败继续
// 4. 完整的审计日志

interface EnterpriseRule {
  executionMode: "FIRST_MATCH" | "CHAIN" | "ALL_MATCH"
  conditions: Condition[]
  criticalActions: Action[]     // 失败必须回滚
  nonCriticalActions: Action[]  // 失败可以继续
}

async function executeEnterpriseRule(po: PurchaseOrder, rule: EnterpriseRule) {
  const transaction = await startTransaction()
  const executedActions = []
  
  try {
    // 1. 验证所有关键动作
    await validateActions(po, rule.criticalActions)
    
    // 2. 执行关键动作（事务性）
    for (const action of rule.criticalActions) {
      await executeAction(po, action, transaction)
      executedActions.push(action)
    }
    
    // 3. 提交事务
    await transaction.commit()
    
    // 4. 执行非关键动作（失败不影响）
    for (const action of rule.nonCriticalActions) {
      try {
        await executeAction(po, action)
      } catch (error) {
        logger.warn(`Non-critical action failed: ${action.type}`, error)
      }
    }
    
  } catch (error) {
    // 回滚事务
    await transaction.rollback()
    throw error
  }
}
```

---

## 📊 动作分类建议

### 关键动作（Critical Actions）
**失败必须回滚**
- SET_WORKFLOW - 设置工作流
- SPLIT_ORDER - 拆单
- ASSIGN_WAREHOUSE - 分配仓库
- HOLD_ORDER - 暂停订单

### 非关键动作（Non-Critical Actions）
**失败可以继续**
- ADD_TAG - 添加标签
- SEND_NOTIFICATION - 发送通知
- SET_PRIORITY - 设置优先级

---

## 🎯 UI改进建议

### 1. 动作分组显示
```
关键动作 (Critical)
├─ Set Workflow
├─ Split Order
└─ Assign Warehouse

辅助动作 (Additional)
├─ Add Tag
├─ Send Notification
└─ Set Priority
```

### 2. 冲突检测
```
⚠️ 警告: 已存在 SET_WORKFLOW 动作
   一个规则只能有一个工作流配置
```

### 3. 执行顺序可视化
```
执行顺序:
1️⃣ Hold Order (if applicable)
2️⃣ Set Workflow
3️⃣ Split Order
4️⃣ Assign Warehouse
5️⃣ Add Tags
6️⃣ Send Notifications
```

---

## 💡 最终建议

### 对于你的系统，我建议：

1. **使用 FIRST_MATCH 模式** - 简单可靠
2. **限制每个规则只能有一个 SET_WORKFLOW** - 避免冲突
3. **动作分为关键和非关键** - 关键动作失败回滚，非关键动作失败继续
4. **按优先级自动排序** - 用户不需要手动排序
5. **UI层面做冲突检测** - 添加动作时就提示冲突

这样既简单又可靠，符合大多数业务场景！
