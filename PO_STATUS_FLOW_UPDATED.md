# PO状态体系更新 - 基于实际触发事件

## 概述
根据您提供的详细触发事件说明，我已经更新了PO系统中的运输状态和收货状态配置，使其更准确地反映实际业务流程。

## 运输状态（Shipping Status）更新

### 状态列表及触发事件

| 状态 | 英文 | 触发事件 | 是否常见 | 颜色标识 |
|------|------|----------|----------|----------|
| 未发运 | NOT_SHIPPED | 没有ASN | 必须有 | 灰色 |
| 已创建ASN | ASN_CREATED | 创建了ASN，但供应商尚未发运 | 必须有 | 蓝色 |
| 已发运 | SHIPPED | ASN标记Shipped或有tracking event | 必须有 | 紫色 |
| 在途 | IN_TRANSIT | Carrier event进入运输阶段 | 强烈推荐 | 靛蓝色 |
| 到仓 | ARRIVED_AT_WAREHOUSE | 货到仓库 | 必须有 | 绿色 |
| 发运完成 | SHIPMENT_COMPLETED | 所有ASN都完成 | 可选（建议保留） | 青色 |

### 状态流转逻辑
```
NOT_SHIPPED → ASN_CREATED → SHIPPED → IN_TRANSIT → ARRIVED_AT_WAREHOUSE → SHIPMENT_COMPLETED
```

## 收货状态（Receiving Status）更新

### 状态列表及触发事件

| 状态 | 英文 | 触发事件 | 颜色标识 |
|------|------|----------|----------|
| 未收货 | NOT_RECEIVED | 没有任意收货记录 | 灰色 |
| 收货中 | IN_RECEIVING | 仓库开始卸货/收货 | 蓝色 |
| 部分收货 | PARTIALLY_RECEIVED | 部分行收货完成 | 橙色 |
| 全部收货 | FULLY_RECEIVED | 所有行收货完成 | 绿色 |
| 超收 | OVER_RECEIVED | 超收（异常） | 红色 |

### 状态流转逻辑
```
NOT_RECEIVED → IN_RECEIVING → PARTIALLY_RECEIVED → FULLY_RECEIVED
                    ↓
               OVER_RECEIVED (异常分支)
```

## 系统更新内容

### 1. 状态配置更新
- 更新了 `shippingStatusConfig` 和 `receivingStatusConfig`
- 添加了状态描述信息，便于用户理解每个状态的含义
- 调整了颜色标识，使其更直观地反映状态的重要性

### 2. 筛选器更新
- 更新了筛选器选项，包含所有新状态
- 保持了筛选功能的完整性

### 3. Mock数据更新
- 调整了示例数据中的状态组合，使其更符合实际业务场景
- 确保状态之间的逻辑一致性

### 4. 国际化支持
- 添加了所有新状态的中英文翻译
- 增加了状态描述的翻译，帮助用户理解触发条件

## 业务价值

### 1. 更精确的状态跟踪
- 每个状态都有明确的触发条件
- 避免了状态的模糊性和歧义

### 2. 更好的用户体验
- 用户可以清楚地了解货物当前的确切状态
- 状态描述帮助用户理解下一步操作

### 3. 更强的可操作性
- 基于明确的触发事件，系统可以自动化状态更新
- 便于与外部系统（如承运商API）集成

### 4. 更完善的异常处理
- 明确区分了正常流程和异常情况（如超收）
- 便于异常监控和处理

## 实际应用场景

### 运输状态应用
1. **NOT_SHIPPED**: 采购员可以催促供应商创建ASN
2. **ASN_CREATED**: 等待供应商确认发货
3. **SHIPPED**: 开始跟踪物流信息
4. **IN_TRANSIT**: 监控运输进度
5. **ARRIVED_AT_WAREHOUSE**: 通知仓库准备收货
6. **SHIPMENT_COMPLETED**: 可以进行下一步业务流程

### 收货状态应用
1. **NOT_RECEIVED**: 等待货物到达
2. **IN_RECEIVING**: 仓库正在处理
3. **PARTIALLY_RECEIVED**: 需要跟进剩余货物
4. **FULLY_RECEIVED**: 可以关闭PO或进行后续处理
5. **OVER_RECEIVED**: 需要异常处理流程

## 技术实现

### 状态配置结构
```typescript
const shippingStatusConfig = {
  STATUS_NAME: {
    label: t('STATUS_LABEL'),
    color: "tailwind-classes",
    description: t('STATUS_DESCRIPTION')
  }
}
```

### 筛选器集成
- 所有新状态都已集成到筛选器中
- 支持多选筛选
- 保持了向后兼容性

### 国际化支持
- 完整的中英文翻译
- 状态描述的本地化
- 便于后续扩展其他语言

这次更新使PO系统的状态管理更加精确和实用，为后续的自动化和集成奠定了坚实的基础。