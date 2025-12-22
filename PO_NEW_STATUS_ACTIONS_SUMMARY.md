# PO NEW状态操作支持总结

## 概述
为PO的NEW状态添加了完整的操作支持，包括创建、发运、入库、取消等操作，同时支持单个操作和批量操作。

## 新增功能

### 1. 单个PO操作 (Individual Actions)

为NEW状态的PO添加了以下操作：

| 操作 | 中文 | 英文 | 图标 | 说明 |
|------|------|------|------|------|
| send | 发送 | Send | Send | 发送给供应商确认 |
| createShipment | 创建发运单 | Create Shipment | Truck | 创建发运单，开始物流流程 |
| createReceipt | 创建收货单 | Create Receipt | Package | 创建收货单，直接入库 |
| cancel | 取消 | Cancel | X | 取消采购订单 |

### 2. 批量操作 (Batch Actions)

为NEW状态的PO添加了以下批量操作：

| 操作 | 中文 | 英文 | 说明 |
|------|------|------|------|
| batchSend | 批量发送 | Batch Send | 批量发送给供应商 |
| batchCreateShipment | 批量创建发运单 | Batch Create Shipment | 批量创建发运单 |
| batchCreateReceipt | 批量创建收货单 | Batch Create Receipt | 批量创建收货单 |
| batchCancel | 批量取消 | Batch Cancel | 批量取消订单 |

## 操作流程说明

### 创建发运单 (Create Shipment)
1. **触发条件**: PO状态为NEW
2. **操作结果**: 
   - 创建新的Shipment记录
   - PO状态可能变更为IN_TRANSIT
   - 开始物流跟踪流程
3. **使用场景**: 供应商已准备好货物，开始发运

### 创建收货单 (Create Receipt)
1. **触发条件**: PO状态为NEW
2. **操作结果**:
   - 创建新的Receipt记录
   - PO状态可能变更为RECEIVING
   - 开始入库流程
3. **使用场景**: 货物已到达仓库，直接入库（跳过发运流程）

### 取消订单 (Cancel)
1. **触发条件**: PO状态为NEW
2. **操作结果**:
   - PO状态变更为CANCELLED
   - 释放相关资源
   - 通知供应商取消
3. **使用场景**: 订单需求变更或其他原因需要取消

## 文件修改

### 1. PO列表页 (`app/purchase/po/page.tsx`)

#### 单个操作配置
```typescript
case POStatus.NEW:
  return [
    { label: t('send'), icon: <Send />, action: () => console.log("Send to supplier") },
    { label: t('createShipment'), icon: <Truck />, action: () => console.log("Create shipment") },
    { label: t('createReceipt'), icon: <Package />, action: () => console.log("Create receipt") },
    { label: t('cancel'), icon: <X />, action: () => console.log("Cancel PO"), variant: "destructive" },
  ]
```

#### 批量操作配置
```typescript
case POStatus.NEW:
  return [
    { label: t('batchSend'), action: () => console.log("Batch send") },
    { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment") },
    { label: t('batchCreateReceipt'), action: () => console.log("Batch create receipt") },
    { label: t('batchCancel'), action: () => console.log("Batch cancel"), variant: "destructive" },
  ]
```

### 2. 国际化文件 (`lib/i18n.ts`)

#### 中文翻译
```typescript
// PO操作
createShipment: '创建发运单',
createReceipt: '创建收货单',

// 批量操作
batchCreateShipment: '批量创建发运单',
batchCreateReceipt: '批量创建收货单',
```

#### 英文翻译
```typescript
// PO Actions
createShipment: 'Create Shipment',
createReceipt: 'Create Receipt',

// Batch Actions
batchCreateShipment: 'Batch Create Shipment',
batchCreateReceipt: 'Batch Create Receipt',
```

## 测试页面

创建了专门的测试页面 `/po-new-status-actions-test` 用于验证：
- 所有单个操作的显示和功能
- 所有批量操作的显示和功能
- 中英文翻译切换
- 操作流程说明

## 使用示例

### 在PO列表页
1. 找到状态为NEW的PO
2. 在操作列可以看到4个操作按钮：
   - 发送
   - 创建发运单
   - 创建收货单
   - 取消

### 批量操作
1. 选择多个NEW状态的PO
2. 点击"批量操作"按钮
3. 可以看到4个批量操作选项：
   - 批量发送
   - 批量创建发运单
   - 批量创建收货单
   - 批量取消

## 状态流转

```
NEW (新建)
  ├─ 发送 → PENDING_CONFIRMATION (待确认)
  ├─ 创建发运单 → IN_TRANSIT (运输中)
  ├─ 创建收货单 → RECEIVING (收货中)
  └─ 取消 → CANCELLED (已取消)
```

## 后续开发建议

### 1. 创建发运单功能
- 实现发运单创建对话框
- 填写承运商、跟踪号等信息
- 自动更新PO状态
- 发送通知给相关人员

### 2. 创建收货单功能
- 实现收货单创建对话框
- 填写收货数量、质检状态等
- 自动更新PO状态和库存
- 生成收货记录

### 3. 取消订单功能
- 实现取消确认对话框
- 填写取消原因
- 通知供应商
- 记录取消历史

### 4. 批量操作优化
- 添加进度显示
- 支持部分成功/失败处理
- 生成批量操作报告
- 错误处理和重试机制

## 完成状态

✅ **已完成**:
- NEW状态单个操作配置
- NEW状态批量操作配置
- 中英文翻译添加
- 测试页面创建
- 文档编写

⏳ **待实现**:
- 实际的业务逻辑实现
- 对话框组件开发
- API接口集成
- 状态流转逻辑
- 通知系统集成

## 总结

成功为PO的NEW状态添加了完整的操作支持，包括创建发运单、创建收货单、取消等核心功能。所有操作都支持单个和批量执行，并提供了完整的中英文翻译。这为后续的业务逻辑实现奠定了良好的基础。