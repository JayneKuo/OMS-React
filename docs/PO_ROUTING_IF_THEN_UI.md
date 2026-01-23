cn/ui**: UI组件库
- **Lucide Icons**: 图标系统

## 相关文档

- [Routing Rule Types](../lib/types/routing-rule.ts)
- [Execution Modes](./ROUTING_EXECUTION_MODES.md)
- [Complete Implementation](./PO_ROUTING_COMPLETE_IMPLEMENTATION.md)
- [Design System](../.kiro/steering/design-system.md)

## 总结

新的IF-THEN规则构建器UI提供了：
- ✅ 符合美国OMS系统标准的规则引擎
- ✅ 直观的可视化规则构建体验
- ✅ 强大的条件和动作配置能力
- ✅ 灵活的扩展性和可维护性

这是一个现代化、专业化、国际化的规则管理系统。
### 1. 直观易懂
- IF-THEN 模式符合人类思维
- 可视化条件和动作
- 清晰的逻辑关系

### 2. 灵活强大
- 14种条件字段
- 10种操作符
- 8种动作类型
- 无限条件和动作组合

### 3. 易于扩展
- 新增字段类型简单
- 新增动作类型容易
- 模块化组件设计

### 4. 符合国际标准
- 参考美国主流OMS系统
- 采用行业最佳实践
- 专业的UI/UX设计

## 未来扩展

### Phase 1 (当前)
- ✅ IF-THEN 规则构建器
- ✅ 8种动作类型
- ✅ 14种条件字段
- ✅ 执行模式选择

### Phase 2 (计划中)
- 🔄 规则模拟器（测试规则匹配）
- 🔄 规则模板库
- 🔄 规则导入/导出
- 🔄 规则执行日志

### Phase 3 (未来)
- 🔄 AI辅助规则生成
- 🔄 规则性能分析
- 🔄 规则冲突检测
- 🔄 可视化规则流程图

## 技术栈

- **React 18**: 组件框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式系统
- **shad
  actions: [
    {
      type: "ASSIGN_WAREHOUSE",
      warehouseId: "WH_ELEC_01",
      warehouseName: "Electronics Warehouse"
    },
    {
      type: "ADD_TAG",
      tags: ["electronics", "fragile", "special-handling"]
    }
  ]
}
```

## 与美国OMS系统对比

### Pipe17
- ✅ IF-THEN 条件-动作模式
- ✅ 多条件AND/OR组合
- ✅ 多动作支持
- ✅ 可视化规则构建器

### Oracle OMS
- ✅ 规则优先级排序
- ✅ 执行模式选择
- ✅ 规则启用/禁用
- ✅ 规则复制功能

### ShipStation
- ✅ 标签管理
- ✅ 通知系统
- ✅ 优先级设置
- ✅ 简洁的UI设计

### FluentCommerce
- ✅ 工作流配置
- ✅ 仓库分配
- ✅ 规则链式执行
- ✅ 灵活的条件系统

## 优势

egion", operator: "equals", value: "Asia" }
  ],
  actions: [
    {
      type: "ASSIGN_WAREHOUSE",
      warehouseId: "WH_WEST_01",
      warehouseName: "West Coast Distribution Center"
    },
    {
      type: "SET_PRIORITY",
      priority: "HIGH"
    }
  ]
}
```

### 示例3: SKU分类路由

```typescript
{
  name: "Electronics to Specialized Warehouse",
  conditions: [
    { field: "category", operator: "equals", value: "Electronics", logic: "OR" },
    { field: "sku", operator: "startsWith", value: "ELEC-" }
  ],CreateFinalReceipt: true
      }
    },
    {
      type: "SEND_NOTIFICATION",
      channel: "EMAIL",
      recipients: ["procurement@company.com"],
      message: "High value factory direct order received"
    },
    {
      type: "ADD_TAG",
      tags: ["high-value", "factory-direct", "priority"]
    }
  ]
}
```

### 示例2: 供应商区域路由

```typescript
{
  name: "China Supplier to West Coast Warehouse",
  conditions: [
    { field: "supplier", operator: "contains", value: "China", logic: "AND" },
    { field: "r
   - 全局设置管理

## 使用示例

### 示例1: 工厂直发高价值订单

```typescript
{
  name: "Factory Direct - High Value Orders",
  conditions: [
    { field: "purchaseType", operator: "equals", value: "FACTORY_DIRECT", logic: "AND" },
    { field: "amount", operator: "greaterThan", value: 5000 }
  ],
  actions: [
    {
      type: "SET_WORKFLOW",
      workflow: "FACTORY_DIRECT",
      config: {
        enableFGStaging: true,
        generateFGReceipt: true,
        generateSaleOrder: true,
        waitForFGReceipt: false,
        auto分配仓库
  | NotificationAction  // 发送通知
  | TagAction           // 添加标签
  | PriorityAction      // 设置优先级
  | HoldAction          // 暂停订单
  | SplitAction         // 拆分订单
  | CustomAction        // 自定义动作
```

## UI组件架构

### 主要组件

1. **RuleBuilderDialog** (`components/automation/rule-builder-dialog.tsx`)
   - 主对话框组件
   - 管理规则编辑状态
   - 条件和动作的增删改

2. **ActionEditor** (内部组件)
   - 动作配置编辑器
   - 根据动作类型渲染不同配置界面
   - 支持8种动作类型

3. **POOrderRoutingPage** (`app/automation/purchase-order/routing/page.tsx`)
   - 主页面
   - 规则列表展示itions)
  conditions: RoutingRuleCondition[]
  conditionLogic: "AND" | "OR"
  
  // THEN (Actions)
  actions: RuleAction[]
  
  createdAt: string
  updatedAt: string
}
```

### 条件类型

```typescript
interface RoutingRuleCondition {
  id: string
  field: ConditionField // 14种字段类型
  operator: ConditionOperator // 10种操作符
  value: string | number | string[] | number[]
  logic?: "AND" | "OR" // 与下一个条件的逻辑关系
}
```

### 动作类型

```typescript
type RuleAction = 
  | WorkflowAction      // 设置工作流
  | WarehouseAction     // 行模式标识
- 🎯 First Match (默认)
- 🔗 Chain Mode
- 🎭 All Match

### 3. 用户体验优化

#### 条件构建
- **即时反馈**: 字段类型变化时自动调整操作符
- **清晰的逻辑**: AND/OR 用徽章显示
- **易于删除**: 每个条件都有删除按钮

#### 动作配置
- **分类图标**: 每种动作类型有独特图标
- **展开配置**: 点击动作展开详细配置
- **颜色编码**: 不同动作类型用不同颜色区分

#### 验证提示
- 规则名称必填
- 至少一个条件
- 至少一个动作
- 实时错误提示

## 数据结构

### 新的RoutingRule类型

```typescript
interface RoutingRule {
  id: string
  name: string
  description: string
  type: RuleType
  enabled: boolean
  priority: number
  executionMode?: ExecutionMode
  
  // IF (Cond仓库
  
  3. **Send Notification** - 发送通知
     - Email, Webhook, SMS
     - 自定义消息内容
  
  4. **Add Tag** - 添加标签
     - 多标签支持
  
  5. **Set Priority** - 设置优先级
     - High, Medium, Low
  
  6. **Hold Order** - 暂停订单
     - 指定原因
     - 是否需要审批

- **可添加多个动作**: 一个规则可以触发多个动作

### 2. 规则列表展示

#### 清晰的IF-THEN显示
```
Rule: Factory Direct - High Value Orders
Priority: 1
Status: Active

IF: purchaseType equals "FACTORY_DIRECT" AND amount > "5000"
THEN: FACTORY_DIRECT Workflow | Assign Warehouse | Send Notification
```

#### 执Section - 条件构建
- **动态字段选择**: 14种条件字段
  - Purchase Type, Supplier, SKU, Category, Brand
  - Warehouse, Amount, Quantity, Weight
  - Country, Region, Tags, etc.

- **智能操作符**: 根据字段类型自动调整
  - 文本字段: equals, contains, starts with, ends with
  - 数字字段: >, <, ≥, ≤, equals
  
- **逻辑组合**: AND/OR 连接多个条件
  - 可视化显示逻辑关系
  - 支持复杂条件组合

#### THEN Section - 动作配置
- **多种动作类型**:
  1. **Set Workflow** - 设置履行工作流
     - Factory Direct, Standard, Dropship, Cross Dock
     - 完整的工厂直发配置（5个开关）
  
  2. **Assign Warehouse** - 分配仓库
     - 指定目标# PO Routing IF-THEN UI Implementation

## 概述

基于美国OMS系统（Pipe17, Oracle OMS, ShipStation, FluentCommerce等）的最佳实践，我们重构了PO路由规则系统，采用清晰的 **IF-THEN（条件-动作）** 模式。

## 设计理念

### 美国OMS系统的规则引擎模式

```
IF (Conditions)
  - Purchase Type = Factory Direct
  - AND Supplier = Supplier_A  
  - AND Amount > $5000

THEN (Actions)
  - Set Workflow: Factory Direct
  - Assign Warehouse: FG_WAREHOUSE_01
  - Send Notification: Email to procurement@company.com
  - Add Tag: high-value, factory-direct
```

## 新UI特性

### 1. 可视化规则构建器

#### IF 