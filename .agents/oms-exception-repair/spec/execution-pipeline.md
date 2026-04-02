# 执行管线 (Execution Pipeline)

## 管线总览

```
DiagnosisResult (handoff)
  │
  ▼
┌──────────────────────┐
│ Step 1: Handoff 验收  │  验证合法性 + 去重检查
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Step 2: 动作编排      │  过滤 → 排序 → 依赖分析 → 执行计划
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Step 3: 逐个执行      │  调用执行器 → 记录结果 → 处理依赖
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Step 4: 人工升级      │  生成升级通知
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Step 5: 结果汇总      │  组装 RepairResult → 反馈学习 Agent
└──────────────────────┘
```

---

## Step 1: Handoff 验收

### 验证清单

```
1. diagnosis_id 非空且格式正确 (DIAG-{timestamp}-{random4})
2. handoff_ready === true
3. overall_confidence >= 0.5
4. recommended_actions.length > 0
5. recommended_actions 中至少 1 个 auto_executable === true
6. order_context !== null
7. order_context.order_no 非空
```

### 去重检查

```
检查 diagnosis_id 是否已经处理过:
  - 已处理 → 返回之前的 RepairResult（幂等）
  - 未处理 → 继续执行
```

### 验收失败处理

```
返回 RepairResult:
  overall_status: 'skipped'
  action_results: []
  feedback.diagnosis_was_correct: null
  feedback.notes: "Handoff 验收失败: {具体原因}"
```

---

## Step 2: 动作编排

### 2.1 过滤

```
从 recommended_actions 中分离:
  auto_actions = filter(auto_executable === true)
  manual_actions = filter(auto_executable === false)
```

### 2.2 排序

```
auto_actions.sort(by priority ASC)  // priority 1 = 最高
```

### 2.3 依赖分析

根据 action-executors.md 中定义的依赖关系，构建执行图：

```
示例: recommended_actions = [MAP_ITEM_ID, RESYNC_ORDER, NOTIFY_MERCHANT]

执行图:
  MAP_ITEM_ID (priority 1)
      │
      ▼ (post_action dependency)
  RESYNC_ORDER (priority 2)
      │
      ▼ (independent)
  NOTIFY_MERCHANT (priority 3)
```

### 2.4 生成执行计划

```typescript
interface ExecutionPlan {
  steps: ExecutionStep[];
  total_estimated_time_ms: number;
  has_destructive_actions: boolean;
}

interface ExecutionStep {
  action_code: string;
  executor: string;
  parameters: Record<string, unknown>;
  depends_on?: string;       // 依赖的上游 action_code
  is_destructive: boolean;
  estimated_time_ms: number;
}
```

---

## Step 3: 逐个执行

### 执行循环

```
for each step in execution_plan.steps:
  1. 检查依赖:
     - 如果 depends_on 的动作 failed/timeout → skip，记录 skip_reason
  
  2. 检查前置条件:
     - 如果 precondition 不满足 → skip
  
  3. 检查破坏性:
     - 如果 is_destructive && !confirmed → status = pending_confirmation，暂停
  
  4. 执行:
     - 调用对应的 executor
     - 设置超时（单个动作 30s）
     - 记录 started_at
  
  5. 处理结果:
     - 成功 → status = success，记录 response
     - 失败 → 检查是否可重试
       - 可重试 → 按 retry 策略重试
       - 不可重试 → status = failed，记录 error
     - 超时 → status = timeout
  
  6. 记录 completed_at 和 duration_ms
  
  7. 检查总超时:
     - 如果累计耗时 > 120s → 剩余动作全部 skip，skip_reason = "total_timeout"
```

### 重试策略

```
exponential backoff:
  attempt 1: wait 1s
  attempt 2: wait 2s
  attempt 3: wait 4s

fixed backoff:
  每次等待固定时间（由 executor 定义）

retry_on 条件:
  - HTTP 5xx
  - TIMEOUT
  - CONNECTION_ERROR
  
不重试:
  - destructive 动作
```

### ⚠️ 自愈策略 (Self-Healing on API Error)

**核心原则: API 报错时，先尝试自主修复，不要直接暴露给用户。**

```
API 返回错误时的处理流程:

  1. 解析错误信息:
     - 提取错误类型（校验错误、权限错误、资源不存在等）
     - 提取缺失字段名（如 "订单日期不能为空" → 缺少 orderDate）
     - 提取具体原因（如 "SKU not found" → 需要先创建商品）

  2. 判断是否可自愈:
     a. 缺少字段（HTTP 400 校验错误）:
        → 检查 order_context / diagnosis 中是否已有该数据
        → 有 → 补充字段后重试
        → 没有 → 尝试 GET API 获取完整数据后重试
     b. 全量更新接口只传了部分字段:
        → 先 GET 完整数据，合并修改字段后重试
        → 这是最常见的自愈场景，PUT 接口默认假设全量更新
     c. Token 过期 / 权限错误:
        → 刷新 Token 后重试
     d. 资源不存在:
        → 检查是否需要先创建（如 SYNC_ITEM_MASTER → RESYNC_ORDER）
     e. 并发冲突:
        → 等待 2s 后重试

  3. 自愈重试:
     - 最多自愈重试 2 次
     - 每次自愈必须改变请求内容（不是简单重复）
     - 记录自愈过程到 action_result.notes
     - 自愈成功后，将经验写入知识库（通过学习 Agent）

  4. 自愈失败 → 才标记为 failed:
     - 翻译为用户友好的描述（不暴露原始 API 错误）
     - 给出可操作的建议（如 "需要补充地址" 而不是 "Invalid request parameters"）
     - 记录完整错误链到 action_result.error（供学习 Agent 分析）

关键规则:
  - PUT 接口: 永远先 GET 完整数据再合并修改后 PUT
  - order_context 已有的数据: 优先从中取值，不要让用户重复提供
  - 错误是学习材料: 每次自愈（成功或失败）都应反馈给学习 Agent
  - 不要猜测 API 字段: 如果文档不完整，先调 GET 接口看实际返回
```
  - destructive 动作
```

---

## Step 4: 人工升级

### 处理 manual_actions

```
for each action in manual_actions:
  1. 确定 assigned_to（根据 action_code 映射）
  2. 组装上下文信息（order_no, merchant_no, diagnosis 摘要等）
  3. 生成 Escalation 记录
  4. 发送通知（Slack/邮件/工单系统）
```

### 处理执行失败的 auto_actions

```
for each failed_action in auto_actions where status = failed:
  如果 retry_count >= max_retries:
    生成 Escalation:
      reason: "自动修复失败，已重试 {retry_count} 次"
      assigned_to: engineering
      severity: 根据原始 diagnosis severity
```

---

## Step 5: 结果汇总

### 组装 RepairResult

```
1. repair_id = "REPAIR-{yyyyMMddHHmmss}-{random4}"
2. overall_status = 判定规则（见 repair-result-schema.md）
3. action_results = 所有动作的执行记录
4. escalations = Step 4 生成的升级记录
5. needs_confirmation = (overall_confidence < 0.8)
6. feedback = 组装学习反馈
```

### 组装学习反馈

```
feedback:
  diagnosis_id: 原始诊断 ID
  repair_id: 本次修复 ID
  diagnosis_was_correct: null  // 初始为 null，等待后续验证
  actions_effective: 
    for each auto_action:
      was_effective: (status === 'success')
      order_status_before: order_context.status
      order_status_after: null  // 异步检查
  new_pattern_detected: false  // 由学习 Agent 判断
```

### 异步状态验证

修复完成后 5 分钟，异步检查订单状态是否改善：

```
1. 查询 sales_order.status
2. 如果 status 从 Exception(10) 变为其他 → actions_effective[].was_effective = true
3. 如果 status 未变 → actions_effective[].was_effective = false
4. 更新 feedback.diagnosis_was_correct
5. 将更新后的 feedback 发送给学习 Agent
```

---

## 超时和熔断

| 级别 | 超时 | 处理 |
|------|------|------|
| 单个动作 | 30s | 标记 timeout，继续下一个 |
| 单个动作重试 | 按 backoff 策略 | 超过 max_retries 后放弃 |
| 总执行时间 | 120s | 剩余动作全部 skip |
| 下游系统连续失败 | 3 次 | 熔断该执行器，后续同类动作 skip |

## 并发控制

- 同一个 order_no 同时只允许一个 RepairResult 在执行
- 使用 order_no 级别的分布式锁
- 锁超时 180s（120s 执行 + 60s 缓冲）
- 获取锁失败 → overall_status = skipped，skip_reason = "concurrent_repair"
