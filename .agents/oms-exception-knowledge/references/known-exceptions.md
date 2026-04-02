# 已知异常模式 (Known Exception Patterns)

以下数据从 Linker OMS 知识图谱（Neo4j, 176 nodes / 333 relationships）中提取，
基于图谱中的 State、BusinessProcess、Rule、Module 节点及其关系。

数据来源：`OMS-ontology-work/ontology-work/docs/_graph_data.json`

---

## ORDER_CREATE — 订单创建异常

### Exception: Order Creation Failed

- **图谱节点**: BusinessProcess `Create Sales Order` → State `Exception`
- **Symptom Signals**: `"Order creation failed notification"`, `"Required fields missing"`, `"Product not found in Item Master"`, `"Address validation failure"`
- **Entry Conditions** (from graph): API callback from channel integration, manual Excel upload, or re-import action
- **Likely Root Causes**:
  - 渠道推送的订单数据缺少必填字段（merchant context, required fields）
  - SKU 在 Item Master 中不存在（product existence validation failed）
  - 地址格式校验失败（address format validation）
  - 库存可用性检查失败（inventory availability check）
- **Recommended Actions**: `REVIEW_BUSINESS_RULE`, `MAP_ITEM_ID`, `MANUAL_DATA_FIX`
- **Related Modules**: Sales Order Module
- **Related Artifacts**: Order Notification（Types: Order Creation Failed）, Order Timeline Event

---

## ORDER_DISPATCH — 订单分派异常

### Exception: Dispatch Failure → Sales Order Exception State

- **图谱节点**: BusinessProcess `Dispatch Sales Order` → State `Exception` (id:13)
- **图谱路径**: Sales Order (Pending) → Dispatch Sales Order → Exception
- **Symptom Signals**: `"Dispatch failure"`, `"No matching warehouse"`, `"Routing rule evaluation failed"`, `"Inventory shortage during dispatch"`
- **Entry Conditions** (from graph): dispatch failure, WMS rejection, inventory shortage, address validation failure, or system error
- **Likely Root Causes**:
  - 路由规则未匹配到任何仓库（zipcode range / country match / custom rules 全部未命中）
  - 目标仓库库存不足（inventory availability check failed）
  - 分派规则配置错误（Order Dispatch Routing Rule misconfigured）
  - 备用分派策略也失败（backup dispatch strategy exhausted）
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `RESYNC_ORDER`, `RECALCULATE_INVENTORY`, `REVIEW_BUSINESS_RULE`
- **Allowed Recovery** (from graph): Exception → Pending, Exception → Allocated, Exception → Cancelled
- **Related Modules**: Order Dispatch Module, OAS Dispatch Engine Module
- **Related Rules**: Order Dispatch Routing Rule, Evaluate Dispatch Rules
- **Related Artifacts**: Dispatch Record, Dispatch Log, Order Notification（Types: Dispatch Failed）

### Exception: Inventory Allocation Failure During Dispatch

- **图谱节点**: BusinessProcess `Allocate Inventory` → failure path
- **Symptom Signals**: `"Insufficient inventory"`, `"Inventory allocation failed"`, `"Cannot lock inventory position"`
- **Likely Root Causes**:
  - 可用库存不足（open_order position insufficient）
  - 库存已被其他订单锁定（concurrent allocation conflict）
  - OMS 与 WMS 库存数据不一致（inventory sync lag）
- **Recommended Actions**: `RECALCULATE_INVENTORY`, `RESYNC_INVENTORY`, `RETRY_WITH_BACKOFF`
- **Related Modules**: Inventory Module


---

## ORDER_WMS_SYNC — 订单同步 WMS 异常

### Exception: Sales Order → Processing → Exception (WMS Rejection)

- **图谱节点**: State `Processing` (id:10) → State `Exception` (id:13)
- **Symptom Signals**: `"WMS rejection"`, `"Shipping request rejected"`, `"WMS sync failed"`, `"SKU not found in WMS"`
- **Entry Conditions** (from graph): WMS accepts the shipping request → report exceptions
- **Likely Root Causes**:
  - WMS 拒绝接收 Shipping Request（数据格式不符、SKU 未在 WMS 注册）
  - Item ID 在 OMS 和 WMS 之间未建立映射（Item ID Not Mapped）
  - WMS 系统异常或不可用
- **Recommended Actions**: `MAP_ITEM_ID`, `SYNC_ITEM_MASTER`, `RESYNC_ORDER`, `RETRY_WITH_BACKOFF`
- **Allowed Recovery** (from graph): Exception → Pending（重新分派）, Exception → Allocated（重新推送）
- **Related Modules**: Sales Order Module, Order Dispatch Module
- **Related Artifacts**: Shipping Request, Order Notification

---

## ORDER_FULFILLMENT — 订单履约异常

### Exception: Short Shipment

- **图谱节点**: BusinessProcess `Ship Sales Order` → State `ShortShipped`
- **Symptom Signals**: `"Partial shipment"`, `"Short shipped"`, `"Not all items shipped"`
- **Likely Root Causes**:
  - 仓库实际库存少于系统记录（inventory discrepancy）
  - 部分商品损坏无法发货
  - 拣货过程中发现缺货
- **Recommended Actions**: `RECALCULATE_INVENTORY`, `NOTIFY_MERCHANT`, `RESYNC_INVENTORY`
- **Related Modules**: Sales Order Module, Shipment Module

### Exception: Shipment Exception

- **图谱节点**: State `Shipment Exception` (from batch5)
- **Symptom Signals**: `"Label generation failure"`, `"Packing error"`, `"Carrier rejection"`, `"Shipment exception"`
- **Entry Conditions** (from graph): label generation failure, packing error, carrier rejection
- **Likely Root Causes**:
  - 承运商面单生成失败（carrier API error, invalid address）
  - 包装过程出错（weight/dimension mismatch）
  - 承运商拒绝接收（restricted item, service unavailable for destination）
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `REVIEW_BUSINESS_RULE`, `CONTACT_CHANNEL_SUPPORT`
- **Allowed Recovery** (from graph): Shipment Exception → Shipment Processing（重试）, → Shipment Void（作废）, → Shipment Force Close（强制关闭）
- **Related Modules**: Shipment Module

---

## ORDER_PO — 采购单异常

### Exception: Push To Warehouse Fail

- **图谱节点**: State `Push To Warehouse Fail` (id:40)
- **图谱路径**: PO Created → Push To Warehouse → Push To Warehouse Fail
- **Symptom Signals**: `"PO push to warehouse failed"`, `"WMS rejects PO"`, `"Push to warehouse fail"`
- **Entry Conditions** (from graph): WMS rejects or fails to process the PO push
- **Likely Root Causes**:
  - WMS 拒绝接收采购单（数据校验失败）
  - WMS 服务不可用
  - 仓库 ID 无效或未配置
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `CHECK_THIRD_PARTY_STATUS`, `MANUAL_DATA_FIX`
- **Allowed Recovery** (from graph): Push To Warehouse Fail → Push To Warehouse（重试）, → PO Cancelled
- **Related Modules**: Purchase Order Module

### Exception: PO Exception

- **图谱节点**: State `PO Exception` (id:45)
- **Symptom Signals**: `"PO exception"`, `"Receipt mismatch"`, `"WMS reports PO exception"`, `"PO processing error"`
- **Entry Conditions** (from graph): WMS reports exception, receipt mismatch, or system error
- **Likely Root Causes**:
  - 收货数量与预期不符（receipt mismatch — over-receipt or under-receipt）
  - WMS 处理过程中报错
  - 系统级错误
- **Recommended Actions**: `MANUAL_DATA_FIX`, `RETRY_WITH_BACKOFF`, `ESCALATE_TO_OPS`
- **Allowed Recovery** (from graph): PO Exception → PO Processing（修复后继续）, → PO Cancelled
- **Related Modules**: Purchase Order Module
- **Related Processes**: Receive Purchase Order Goods（LiteFlow pipeline）

---

## ORDER_WORK_ORDER — 工单异常

### Exception: WO Exception

- **图谱节点**: State `WO Exception` (id:58)
- **Symptom Signals**: `"Work order exception"`, `"WMS reports WO processing failure"`, `"WO exception"`
- **Entry Conditions** (from graph): WMS reports exception or processing failure
- **Likely Root Causes**:
  - WMS 处理工单时遇到异常（退货处理失败、合并操作失败）
  - 工单关联的商品信息不完整
  - 仓库操作异常
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `MANUAL_DATA_FIX`, `ESCALATE_TO_OPS`
- **Allowed Recovery** (from graph): WO Exception → WO Processing（修复后继续）, → WO Cancelled
- **Related Modules**: Work Order Module (within OPC)

---

## ORDER_DELIVERY — 物流配送异常

### Exception: Delivery Failed

- **图谱节点**: State `DO DeliveryFailed` (id:51)
- **Symptom Signals**: `"Delivery failed"`, `"Consignee refusal"`, `"Address issue"`, `"Carrier delivery problem"`
- **Entry Conditions** (from graph): carrier reports delivery failure
- **Likely Root Causes**:
  - 收件人拒收
  - 地址不正确或不完整
  - 承运商配送问题（车辆故障、天气等）
- **Recommended Actions**: `NOTIFY_MERCHANT`, `MANUAL_DATA_FIX`, `CONTACT_CHANNEL_SUPPORT`
- **Allowed Recovery** (from graph): DO DeliveryFailed → DO PendingDelivery（重新安排配送）, → DO ReturnToShipper（退回发件人）
- **Related Modules**: Delivery Order Module (within OTM)

---

## CHANNEL_INTEGRATION — 渠道集成异常

### Exception: Webhook Event Delivery Failed

- **图谱节点**: BusinessObject `Webhook Event` → State `Failed`
- **Symptom Signals**: `"Webhook delivery failed"`, `"HTTP POST failed"`, `"Webhook endpoint unreachable"`
- **Likely Root Causes**:
  - 外部系统 Webhook 端点不可达
  - 目标系统返回错误（5xx, timeout）
  - Webhook 配置错误（URL 无效）
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `CHECK_THIRD_PARTY_STATUS`, `REVIEW_BUSINESS_RULE`
- **Related Modules**: Channel Integration Module
- **Related Processes**: Send Webhook Event（serialize payload, send HTTP POST, log result, retry on failure）

### Exception: Channel Token / Authorization Failure

- **图谱节点**: BusinessObject `Channel Integration` 相关
- **Symptom Signals**: `"HTTP 401"`, `"Unauthorized"`, `"Invalid access token"`, `"Channel auth expired"`
- **Likely Root Causes**:
  - 渠道 API Token 过期
  - 商户在渠道后台撤销了授权
  - OAuth 刷新失败
- **Recommended Actions**: `REFRESH_CHANNEL_TOKEN`, `NOTIFY_MERCHANT`
- **Related Modules**: Channel Integration Module

---

## NOTIFICATION — 通知异常

### Exception: Email Notification Delivery Failed

- **图谱节点**: BusinessObject `Email Notification Setting`, `Notification Category`
- **Symptom Signals**: `"Email send failed"`, `"Notification delivery failed"`, `"SMTP error"`
- **Likely Root Causes**:
  - 邮件服务配置错误
  - 收件人地址无效
  - SMTP 服务不可用
- **Recommended Actions**: `RETRY_WITH_BACKOFF`, `REVIEW_BUSINESS_RULE`, `CHECK_THIRD_PARTY_STATUS`
- **Related Modules**: Notification Module
- **Notification Categories** (from graph): Order Created, Dispatch Failed, Shipment Confirmed, Exception

---

## RATE_SHOPPING — 运费比价异常

### Exception: Rate Shopping Failed

- **图谱节点**: BusinessObject `Rate Shopping Request` → State `Failed`
- **Symptom Signals**: `"Rate shopping failed"`, `"No suitable quote"`, `"Carrier API error"`, `"Rule not match"`, `"Rate request timeout"`
- **Entry Conditions** (from graph): rule mismatch, no suitable quote from carriers, carrier API error or timeout
- **Likely Root Causes**:
  - 运费比价规则未匹配（fail-rule-not-match）
  - 所有承运商均无合适报价（fail-no-suitable-quote）
  - 承运商 API 调用失败或超时
  - Shipping Account 配置错误或过期
  - 包裹尺寸/重量超出承运商限制
- **Recommended Actions**: `REVIEW_BUSINESS_RULE`, `CHECK_THIRD_PARTY_STATUS`, `RETRY_WITH_BACKOFF`
- **Related Modules**: Rate Shopping Module
- **Related Rules**: Rate Shopping Selection Rule
- **Related Objects**: Rate Shopping Request, Shipping Account, Carrier Service

---

## ORDER_HOLD — 订单锁定相关

### Pattern: Order Held by Rule (非异常，但常被误报为异常)

- **图谱节点**: BusinessProcess `Hold Sales Order` → State `OnHold` (id:8)
- **图谱规则**: Rule `Order Hold Rule` (id:21)
- **Symptom Signals**: `"Order stuck in OnHold"`, `"Order not processing"`, `"Order held"`
- **Entry Conditions** (from graph): hold rule engine match during order processing, or manual hold by operator
- **Likely Root Causes**:
  - 这不是异常，是正常的风控拦截（high-value threshold, restricted SKU, prohibited destination）
  - 但用户经常误以为是系统故障
- **Recommended Actions**: `REVIEW_BUSINESS_RULE`（检查 Hold Rule 配置是否合理）
- **Allowed Recovery** (from graph): OnHold → Pending（释放）, → Allocated, → Cancelled
- **Related Rules**: Order Hold Rule — configurable filters on order fields

---

## 图谱元数据

| 指标 | 值 |
|------|-----|
| 总节点数 | 176 |
| 总关系数 | 333 |
| Exception 状态节点 | 4（Exception, PO Exception, WO Exception, Shipment Exception） |
| 失败状态节点 | 2（Push To Warehouse Fail, DO DeliveryFailed） |
| 异常通知类型 | Order Creation Failed, Order Update Failed, Dispatch Failed, System Error, Hold Notification |
| 审计日志事件类型 | Exception, CreatedFailed, ShipmentFailed |
| 相关模块 | Sales Order Module, Order Dispatch Module, Purchase Order Module, Shipment Module, Channel Integration Module, Notification Module |
