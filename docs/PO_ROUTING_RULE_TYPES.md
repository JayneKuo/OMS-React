 ┌──────────┐ [启用]         │
│ │ 输入框      │    │ 首次匹配  │                │
│ └─────────────┘    └──────────┘                │
└─────────────────────────────────────────────────┘

💡 此规则类型推荐的动作
推荐使用：SET_WORKFLOW, ASSIGN_WAREHOUSE, CREATE_ASN...
```

---

**文档维护**: 开发团队  
**最后更新**: 2025-01-07  
**版本**: 1.0
────────────┐
│ 基本配置                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ 规则名称 *          规则类型 *                   │
│ ┌─────────────┐    ┌──────────────────────┐    │
│ │ 输入框      │    │ 🏭 工厂直发路由规则   │    │
│ └─────────────┘    └──────────────────────┘    │
│                    工厂直发采购单通过成品仓路由   │
│                                                 │
│ 规则描述            执行模式                     │
│ ┌─────────────┐   T_WORKFLOW | 高 |
| 暂停订单 | 风险控制审核 | HOLD_ORDER, SEND_NOTIFICATION | 中 |
| 自动审批 | 提高审批效率 | AUTO_APPROVE | 高 |
| 自定义 | 特殊需求 | 任意动作 | 低 |

---

## 最佳实践

### 1. 规则优先级设置
- 暂停订单规则应该优先级最高（先拦截）
- 工厂直发路由次之（特殊流程）
- 采购单路由规则中等（常规路由）
- 自动审批规则较低（最后处理）

### 2. 规则命名建议
- 工厂直发：`Factory Direct - [场景描述]`
- 采购单路由：`Route to [仓库] - [条件]`
- 暂停订单：`Hold - [原因]`
- 自动审批：`Auto Approve - [条件]`

### 3. 条件设置建议
- 暂停订单：使用 OR 逻辑，宽松拦截
- 自动审批：使用 AND 逻辑，严格限制
- 路由规则：根据实际情况灵活组合

---

## UI 实现

在弹窗的基本信息区域：

```
┌─────────────────────────────────────

---

### 5. ⚙️ Custom Rule (自定义规则)

**用途**: 创建任意自定义自动化规则

**业务场景**:
- 特殊业务需求
- 复杂的组合逻辑
- 临时性规则

**可用动作**: 所有动作类型都可使用

**示例**:
```
IF tags CONTAINS "urgent" AND warehouse = "US-EAST"
THEN SET_PRIORITY = "CRITICAL"
     SPLIT_ORDER (by: "SUPPLIER")
     SEND_NOTIFICATION (channel: "SMS")
```

---

## 规则类型对比表

| 规则类型 | 主要用途 | 核心动作 | 使用频率 |
|---------|---------|---------|---------|
| 工厂直发路由 | 工厂直发场景 | SET_WORKFLOW, ASSIGN_WAREHOUSE | 中 |
| 采购单路由 | 仓库分配路由 | ASSIGN_WAREHOUSE, SE"
THEN HOLD_ORDER (reason: "需要人工审核")
     SEND_NOTIFICATION (to: "buyer@company.com")
     SET_PRIORITY = "HIGH"
```

---

### 4. ✅ Auto-Approval Rule (自动审批规则)

**用途**: 自动审批符合条件的采购单，提高效率

**业务场景**:
- 小额采购自动审批
- 信任供应商自动审批
- 常规补货订单自动审批

**推荐动作**:
- ✅ AUTO_APPROVE - 自动审批
- ✅ SEND_NOTIFICATION - 发送通知
- ✅ ADD_TAG - 添加标签
- ✅ SET_PRIORITY - 设置优先级

**示例条件**:
```
IF totalAmount < 1000 AND supplier.trustLevel = "HIGH"
THEN AUTO_APPROVE
     ADD_TAG = "auto-approved"
     SEND_NOTIFICATION (to: "finance@company.com")
```RKFLOW - 设置工作流类型
- ✅ CREATE_ASN - 创建预发货通知
- ✅ SEND_NOTIFICATION - 发送通知
- ✅ TRIGGER_WEBHOOK - 触发外部系统

**示例条件**:
```
IF country = "BR" AND category = "Electronics"
THEN ASSIGN_WAREHOUSE = "BR-SP"
```

---

### 3. ⏸️ Hold Order Rule (暂停订单规则)

**用途**: 自动暂停需要人工审核的订单

**业务场景**:
- 高风险订单需要审核
- 超过信用额度
- 合规性检查
- 异常订单拦截

**推荐动作**:
- ✅ HOLD_ORDER - 暂停订单
- ✅ SEND_NOTIFICATION - 通知相关人员
- ✅ SET_PRIORITY - 设置优先级
- ✅ ASSIGN_BUYER - 分配采购员审核
- ✅ ADD_TAG - 添加标签标记

**示例条件**:
```
IF totalAmount > 10000 OR supplier.riskLevel = "HIGH(工厂直发路由规则)

**用途**: 专门处理工厂直发场景的采购单路由

**业务场景**:
- 工厂生产完成后先入成品仓
- 从成品仓配送到目标仓库
- 需要创建成品入库单和出库单

**推荐动作**:
- ✅ SET_WORKFLOW - 设置为工厂直发工作流
- ✅ ASSIGN_WAREHOUSE - 分配成品仓和目标仓
- ✅ CREATE_ASN - 创建预发货通知
- ✅ SCHEDULE_RECEIPT - 安排收货时间
- ✅ SEND_NOTIFICATION - 发送通知

**示例条件**:
```
IF purchaseType = "FACTORY_DIRECT"
THEN SET_WORKFLOW = "FACTORY_DIRECT"
```

---

### 2. 📦 PO Routing Rule (采购单路由规则)

**用途**: 根据各种条件将采购单路由到合适的仓库

**业务场景**:
- 根据SKU、供应商、地区等条件路由
- 自动分配目标仓库
- 设置合适的履行工作流

**推荐动作**:
- ✅ ASSIGN_WAREHOUSE - 分配目标仓库
- ✅ SET_WO# PO Routing Rule Types (采购单路由规则类型)

## 规则类型说明

### 1. 🏭 Factory Direct Routing 