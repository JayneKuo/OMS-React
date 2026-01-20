# PO Order Routing 重构总结

## 更新日期
2025-01-07 (最终版本)

## 核心业务逻辑

### 触发节点说明

#### 1. Receipt 创建触发（基于 PO 状态）
- **NEW**: PO 新建时立即创建收货单
- **IN_TRANSIT**: PO 运输中时创建收货单
- **WAITING_FOR_RECEIVING**: PO 到达仓库待收货时创建收货单

#### 2. WMS 推送触发（基于 Receipt 状态）
- **RECEIPT_CREATED**: 收货单创建成功（NEW 状态）时自动推送
- **仅适用于非本地仓库**：本地仓库不需要推送到 WMS

### 业务流程

```
PO 状态变更 (NEW/IN_TRANSIT/WAITING_FOR_RECEIVING)
    ↓
自动创建 Receipt (状态: NEW)
    ↓
    ├─→ 本地仓库
    │   └─→ 如果启用自动完成：直接完成入库，更新库存
    │
    └─→ 非本地仓库
        └─→ 如果启用 WMS 推送：推送数据到 WMS
```

## 新增功能

### 1. 基于 PO 状态的 Receipt 创建
- 使用真实的 PO 状态枚举（NEW, IN_TRANSIT, WAITING_FOR_RECEIVING）
- 当 PO 到达指定状态时自动创建收货单

### 2. 本地仓库自动完成入库
- 启用后，创建收货单时自动完成收货流程
- 跳过手动收货步骤
- 仅适用于本地/物理仓库
- 直接更新库存

### 3. 自动创建缺失商品
- 收货时如果商品不存在系统中，自动创建商品记录
- 适用于所有仓库类型
- 防止因商品数据缺失导致的收货错误

### 4. 非本地仓库 WMS 推送
- 仅在收货单创建成功（NEW 状态）时触发
- 仅适用于非本地仓库（3PL、虚拟仓等）
- 本地仓库不推送到 WMS

## 配置说明

### 全局默认设置

#### Auto-Create Receipt
- **触发节点**: PO 状态（NEW / IN_TRANSIT / WAITING_FOR_RECEIVING）
- **默认值**: IN_TRANSIT
- **说明**: 当 PO 到达指定状态时自动创建收货单

#### Auto-Complete Receipt (Local Warehouse)
- **适用范围**: 仅本地仓库
- **默认值**: 禁用
- **说明**: 创建收货单时自动完成入库，跳过人工验货

#### Auto-Create Missing Products
- **适用范围**: 所有仓库
- **默认值**: 禁用
- **说明**: 收货时自动创建系统中不存在的商品

#### Push to WMS (Non-Local Warehouse)
- **触发节点**: Receipt 状态（RECEIPT_CREATED）
- **适用范围**: 仅非本地仓库
- **默认值**: 禁用
- **说明**: 收货单创建成功时自动推送到 WMS

## 仓库类型行为

### Local Warehouse (本地仓库)
- ✅ 自动创建收货单（基于 PO 状态）
- ✅ 可选自动完成入库
- ✅ 可选自动创建缺失商品
- ❌ 不推送到 WMS（本地管理）

### Non-Local Warehouse (非本地仓库：3PL、虚拟仓等)
- ✅ 自动创建收货单（基于 PO 状态）
- ❌ 不自动完成（由 WMS 管理）
- ✅ 可选自动创建缺失商品
- ✅ 可选推送到 WMS（收货单创建时）

## 业务场景示例

### 场景 1: 本地仓库快速入库
```
配置:
- Receipt 触发: IN_TRANSIT
- 自动完成: 启用
- 自动创建商品: 禁用
- WMS 推送: 不适用

流程:
1. PO 状态变为 IN_TRANSIT
2. 自动创建收货单
3. 自动完成入库
4. 库存立即更新
```

### 场景 2: 3PL 仓库集成
```
配置:
- Receipt 触发: WAITING_FOR_RECEIVING
- 自动完成: 禁用
- 自动创建商品: 启用
- WMS 推送: 启用

流程:
1. PO 状态变为 WAITING_FOR_RECEIVING（货物已到达）
2. 自动创建收货单
3. 检查并创建缺失商品
4. 推送数据到 3PL WMS
5. 等待 3PL 确认收货
```

### 场景 3: 标准物理仓库
```
配置:
- Receipt 触发: IN_TRANSIT
- 自动完成: 禁用
- 自动创建商品: 根据需要
- WMS 推送: 不适用

流程:
1. PO 状态变为 IN_TRANSIT
2. 自动创建收货单
3. 仓库人员手动验货
4. 手动完成收货
5. 库存更新
```

## 技术实现

### 数据结构
```typescript
interface GlobalSettings {
  autoCreateReceipt: boolean
  receiptTrigger?: "NEW" | "IN_TRANSIT" | "WAITING_FOR_RECEIVING" // PO状态
  autoCompleteReceipt: boolean // 仅本地仓
  autoCreateProduct: boolean // 所有仓库
  pushToWMS: boolean // 仅非本地仓
  wmsTrigger?: "RECEIPT_CREATED" // Receipt状态
}
```

### PO 状态枚举
使用 `/lib/enums/po-status.ts` 中定义的标准状态：
- NEW: 新建
- IN_TRANSIT: 运输中
- WAITING_FOR_RECEIVING: 待收货/已到达
- RECEIVING: 收货中
- PARTIAL_RECEIPT: 部分收货
- CLOSED: 已关闭
- CANCELLED: 已取消
- EXCEPTION: 异常

## 更新的文件

1. **`/app/automation/purchase-order/routing/page.tsx`**
   - 使用真实的 PO 状态枚举
   - 简化 WMS 推送触发（仅 RECEIPT_CREATED）
   - 添加业务流程说明卡片
   - 明确本地/非本地仓库的不同行为

2. **`/docs/PO_ROUTING_REFACTOR_SUMMARY.md`** (本文件)
   - 更新业务逻辑说明
   - 添加仓库类型行为说明
   - 添加业务场景示例

## 后续工作

1. 后端 API 实现
   - PO 状态变更监听
   - Receipt 自动创建逻辑
   - 仓库类型判断（本地/非本地）
   - WMS 推送集成

2. 自动创建商品功能
   - 商品数据验证
   - 默认字段填充
   - 审计日志

3. 自动完成入库功能
   - 库存更新逻辑
   - 事务处理
   - 回滚机制

4. WMS 推送功能
   - 推送失败重试
   - 推送状态追踪
   - 错误处理

5. 日志和监控
   - 自动化操作日志
   - 性能监控
   - 异常告警

## 测试建议

1. PO 状态触发测试
   - 测试 NEW、IN_TRANSIT、WAITING_FOR_RECEIVING 状态触发
   - 验证收货单正确创建

2. 仓库类型测试
   - 本地仓库：测试自动完成功能
   - 非本地仓库：测试 WMS 推送功能

3. 自动创建商品测试
   - 测试商品不存在时的创建逻辑
   - 验证商品数据完整性

4. 边界情况测试
   - PO 取消后的处理
   - 重复触发的防护
   - 并发场景测试

