# PO全状态操作支持总结

## 概述
为PO系统的所有8个状态配置了完整的操作支持，每个状态都有针对性的单个操作和批量操作，符合实际业务流程需求。

## 状态操作配置

### 1. NEW (新建) - 4个操作
**单个操作:**
- **发送** (Send) - 发送给供应商确认
- **创建发运单** (Create Shipment) - 开始物流流程
- **创建收货单** (Create Receipt) - 直接入库流程
- **取消** (Cancel) - 取消采购订单

**批量操作:**
- 批量发送、批量创建发运单、批量创建收货单、批量取消

### 2. IN_TRANSIT (运输中) - 3个操作
**单个操作:**
- **查看** (View) - 查看详情
- **创建发运单** (Create Shipment) - 继续发运
- **标记送达** (Mark Arrived) - 标记货物已送达

**批量操作:**
- 批量创建发运单、批量标记送达

### 3. WAITING_FOR_RECEIVING (待收货) - 3个操作
**单个操作:**
- **查看** (View) - 查看详情
- **创建发运单** (Create Shipment) - 继续发运
- **创建收货单** (Create Receipt) - 开始收货流程

**批量操作:**
- 批量创建发运单、批量创建收货单

### 4. RECEIVING (收货中) - 3个操作
**单个操作:**
- **查看** (View) - 查看详情
- **创建发运单** (Create Shipment) - 继续发运
- **完成收货** (Complete Receipt) - 完成收货流程

**批量操作:**
- 批量创建发运单、批量完成收货

### 5. PARTIAL_RECEIPT (部分收货) - 3个操作
**单个操作:**
- **查看** (View) - 查看详情
- **创建发运单** (Create Shipment) - 继续发运
- **创建收货单** (Create Receipt) - 继续收货流程

**批量操作:**
- 批量创建发运单、批量创建收货单

### 6. COMPLETED (已完成) - 2个操作
**单个操作:**
- **查看** (View) - 查看详情
- **复制** (Copy) - 复制为新订单

**批量操作:**
- 无特殊批量操作（只有通用的批量导出）

### 7. CANCELLED (已取消) - 3个操作
**单个操作:**
- **查看** (View) - 查看详情
- **重开** (Reopen) - 重新开启订单
- **复制** (Copy) - 复制为新订单

**批量操作:**
- 批量重开

### 8. EXCEPTION (异常) - 4个操作
**单个操作:**
- **查看** (View) - 查看详情
- **重开** (Reopen) - 重新开启订单
- **复制** (Copy) - 复制为新订单
- **查看原因** (View Reason) - 查看异常原因

**批量操作:**
- 批量重开

## 新增翻译

### 中文翻译
```typescript
// 单个操作
completeReceipt: '完成收货',
reopen: '重开',
viewReason: '查看原因',
markArrived: '标记到达',

// 批量操作
batchCompleteReceipt: '批量完成收货',
batchReopen: '批量重开',
batchMarkArrived: '批量标记到达',
```

### 英文翻译
```typescript
// Individual Actions
completeReceipt: 'Complete Receipt',
reopen: 'Reopen',
viewReason: 'View Reason',
markArrived: 'Mark Arrived',

// Batch Actions
batchCompleteReceipt: 'Batch Complete Receipt',
batchReopen: 'Batch Reopen',
batchMarkArrived: 'Batch Mark Arrived',
```

## 操作流程图

```
PO状态流转与操作:

NEW (新建)
├─ 发送 → 供应商确认流程
├─ 创建发运单 → IN_TRANSIT (运输中)
├─ 创建收货单 → RECEIVING (收货中)
└─ 取消 → CANCELLED (已取消)

IN_TRANSIT (运输中)
├─ 创建发运单 → 继续发运
└─ 标记送达 → WAITING_FOR_RECEIVING (待收货)

WAITING_FOR_RECEIVING (待收货)
├─ 创建发运单 → 继续发运
└─ 创建收货单 → RECEIVING (收货中)

RECEIVING (收货中)
├─ 创建发运单 → 继续发运
└─ 完成收货 → COMPLETED (已完成) / PARTIAL_RECEIPT (部分收货)

PARTIAL_RECEIPT (部分收货)
├─ 创建发运单 → 继续发运
└─ 创建收货单 → 继续收货流程

COMPLETED (已完成)
└─ 复制 → 创建新PO

CANCELLED (已取消)
├─ 重开 → NEW (新建)
└─ 复制 → 创建新PO

EXCEPTION (异常)
├─ 重开 → NEW (新建)
├─ 复制 → 创建新PO
└─ 查看原因 → 异常详情
```

## 业务逻辑说明

### 发运操作 (Create Shipment)
- **适用状态**: NEW, IN_TRANSIT, WAITING_FOR_RECEIVING, RECEIVING, PARTIAL_RECEIPT
- **业务含义**: 创建新的发运单，支持分批发货
- **状态变更**: 可能触发状态变更到IN_TRANSIT

### 收货操作 (Create Receipt / Complete Receipt)
- **Create Receipt**: 创建新的收货单，开始收货流程
- **Complete Receipt**: 完成当前收货流程
- **适用状态**: NEW, WAITING_FOR_RECEIVING, RECEIVING, PARTIAL_RECEIPT
- **状态变更**: 可能触发状态变更到RECEIVING, PARTIAL_RECEIPT, COMPLETED

### 标记送达 (Mark Arrived)
- **适用状态**: IN_TRANSIT
- **业务含义**: 货物已到达目的地，等待收货
- **状态变更**: IN_TRANSIT → WAITING_FOR_RECEIVING

### 重开操作 (Reopen)
- **适用状态**: CANCELLED, EXCEPTION
- **业务含义**: 重新激活已取消或异常的订单
- **状态变更**: CANCELLED/EXCEPTION → NEW

### 查看原因 (View Reason)
- **适用状态**: EXCEPTION
- **业务含义**: 查看导致异常的具体原因和详情
- **用途**: 帮助用户了解问题并决定后续处理方式

## 文件修改

### 1. PO列表页 (`app/purchase/po/page.tsx`)
- 为每个状态配置了专门的操作列表
- 添加了新的图标导入 (MapPin, FileCheck)
- 更新了批量操作配置

### 2. 国际化文件 (`lib/i18n.ts`)
- 添加了新的操作翻译
- 添加了批量操作翻译
- 支持中英文切换

### 3. 测试页面 (`app/po-all-status-actions-test/page.tsx`)
- 创建了全面的测试页面
- 展示所有状态的操作配置
- 支持翻译测试和功能验证

## 使用示例

### 在PO列表页
1. **NEW状态PO**: 显示发送、创建发运单、创建收货单、取消按钮
2. **IN_TRANSIT状态PO**: 显示查看、创建发运单、标记送达按钮
3. **EXCEPTION状态PO**: 显示查看、重开、复制、查看原因按钮

### 批量操作
1. 选择相同状态的多个PO
2. 点击"批量操作"按钮
3. 根据状态显示对应的批量操作选项

## 后续开发建议

### 1. 对话框实现
- 创建发运单对话框
- 创建收货单对话框
- 完成收货确认对话框
- 重开订单确认对话框
- 查看异常原因对话框

### 2. 状态流转逻辑
- 实现操作后的自动状态更新
- 添加状态变更历史记录
- 实现状态变更通知

### 3. 权限控制
- 基于用户角色的操作权限
- 基于PO状态的操作限制
- 批量操作权限控制

### 4. 业务规则验证
- 操作前的业务规则检查
- 数据完整性验证
- 异常情况处理

## 完成状态

✅ **已完成**:
- 8个状态的完整操作配置
- 单个操作和批量操作支持
- 完整的中英文翻译
- 测试页面和文档

⏳ **待实现**:
- 实际业务逻辑实现
- 对话框组件开发
- API接口集成
- 状态流转逻辑
- 权限控制系统

## 总结

成功为PO系统的所有8个状态配置了完整的操作支持，每个状态都有针对性的操作选项，符合实际业务流程。操作设计考虑了状态流转的合理性和业务逻辑的完整性，为后续的功能实现提供了完善的基础框架。