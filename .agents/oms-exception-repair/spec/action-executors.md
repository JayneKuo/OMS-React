# 动作执行器定义 (Action Executors)

每个 action_code 对应一个执行器，定义了调用方式、参数、超时和重试策略。

---

## 自动执行器

### RETRY_WITH_BACKOFF — 指数退避重试

```yaml
executor: RetryWithBackoffExecutor
description: 对失败的操作进行指数退避重试
parameters:
  order_no: string          # 必填
  dispatch_no?: string      # 可选，指定重试哪个拆单
  target_operation: string  # 重试的目标操作（如 "wms_push", "channel_callback"）
timeout: 30s
retry:
  max_retries: 3
  backoff: exponential      # 1s → 2s → 4s
  retry_on: [HTTP_5xx, TIMEOUT, CONNECTION_ERROR]
success_condition: HTTP 2xx 或目标系统确认接收
side_effects: 可能触发下游系统重新处理
```

### RETRY_IMMEDIATE — 立即重试

```yaml
executor: RetryImmediateExecutor
description: 立即重试一次失败的操作
parameters:
  order_no: string
  dispatch_no?: string
  target_operation: string
timeout: 15s
retry:
  max_retries: 1
  backoff: none
success_condition: HTTP 2xx
```

### MAP_ITEM_ID — 建立商品映射

```yaml
executor: MapItemIdExecutor
description: 在渠道 SKU 和 OMS 内部 SKU 之间建立映射关系
parameters:
  order_no: string
  original_sku: string      # 渠道侧原始 SKU
  new_sku: string           # OMS 内部 SKU
  channel_name: string      # 渠道名称
  channel_id?: number       # 渠道 ID
timeout: 15s
retry:
  max_retries: 2
  backoff: fixed(2s)
api_call: POST {BASE_URL}/api/linker-oms/opc/app-api/product-mapping
request_body: |
  {
    "originalSku": "{original_sku}",
    "newSku": "{new_sku}",
    "applyToChannel": "{channel_name}",
    "channelId": {channel_id}
  }
success_condition: response.code === 0
post_action: 映射成功后自动触发 RESYNC_ORDER
```

### SYNC_ITEM_MASTER — 创建商品主数据

```yaml
executor: SyncItemMasterExecutor
description: 在 OMS 中创建缺失的商品主数据
parameters:
  sku: string
  merchant_no: string       # 对应 API 的 customerCode
  uom: string               # 计量单位，默认 "EA"
  description?: string
timeout: 20s
retry:
  max_retries: 2
  backoff: fixed(3s)
api_call: POST {BASE_URL}/api/linker-oms/opc/app-api/item
request_body: |
  [{
    "sku": "{sku}",
    "customerCode": "{merchant_no}",
    "uom": "{uom}",
    "status": "Active"
  }]
success_condition: response.code === 0 && response.data === true
note: Body 是数组，支持批量创建
```

### UPDATE_ADDRESS — 补充/更新收货地址

```yaml
executor: UpdateAddressExecutor
description: 补充或更新订单的收货地址
parameters:
  order_no: string          # 必填
  name: string              # 收件人
  address1: string          # 地址
  city: string              # 城市
  state: string             # 州/省
  country: string           # 国家代码
  zipCode: string           # 邮编
  phone?: string            # 电话（可选）
timeout: 20s
retry:
  max_retries: 1
  backoff: fixed(3s)
api_call_sequence:
  1. GET {BASE_URL}/api/linker-oms/opc/app-api/sale-order/{order_no}  ← 获取完整订单
  2. PUT {BASE_URL}/api/linker-oms/opc/app-api/sale-order             ← 全量更新
  3. POST {BASE_URL}/api/linker-oms/opc/app-api/sale-order/reopen/{order_no}  ← 重新分派
critical_rule: |
  PUT /sale-order 是全量更新接口，后端校验所有必填字段。
  绝对不能只传 orderNo + shipToAddress，必须先 GET 完整订单数据，
  合并 shipToAddress 后再 PUT 回去。否则会报校验错误（如"订单日期不能为空"、"渠道销售订单号不能为空"）。
success_condition: PUT response.code === 0 && reopen response.code === 0
needs_user_input: true      # 地址信息需要用户提供，不能自动执行
note: |
  此动作需要用户提供地址信息，诊断出地址缺失时应阻断自动修复流程，
  等待用户通过聊天输入地址后再执行。
```

### RESYNC_ORDER — 重新打开订单（触发自动分派）

```yaml
executor: ResyncOrderExecutor
description: 将异常订单重新打开，触发自动分派流程
parameters:
  order_no: string
timeout: 20s
retry:
  max_retries: 2
  backoff: fixed(3s)
api_call: POST {BASE_URL}/api/linker-oms/opc/app-api/sale-order/reopen/{order_no}
request_body: 无（空 Body）
success_condition: response.code === 0
error_handling: |
  response.code === -1 且 msg 包含 "not exception" → 订单已非异常状态，视为成功
precondition: 订单状态必须为 Exception(10)
note: 已验证 — SO00523262 通过此接口从 Exception 变为 ALLOCATED
```

### RESYNC_INVENTORY — 重新同步库存

```yaml
executor: ResyncInventoryExecutor
description: 触发 OMS-WMS 库存全量同步
parameters:
  merchant_no: string
  accounting_code: string
  sku?: string              # 可选，指定 SKU；不指定则全量
timeout: 30s
retry:
  max_retries: 1
  backoff: none
api_call: POST /api/inventory/sync
success_condition: 同步任务创建成功
note: 全量同步是异步操作，success 仅表示任务已提交
```

### RECALCULATE_INVENTORY — 重新计算库存

```yaml
executor: RecalculateInventoryExecutor
description: 重新计算指定 SKU 的可用库存
parameters:
  merchant_no: string
  accounting_code: string
  sku: string
timeout: 15s
retry:
  max_retries: 2
  backoff: fixed(2s)
api_call: POST /api/inventory/recalculate
success_condition: 库存重算完成，返回新的可用数量
```

### REFRESH_CHANNEL_TOKEN — 刷新渠道授权

```yaml
executor: RefreshChannelTokenExecutor
description: 刷新渠道 API 的 OAuth Token
parameters:
  merchant_no: string
  channel_no: string
  channel_code: string
timeout: 15s
retry:
  max_retries: 2
  backoff: fixed(5s)
api_call: POST /api/channels/{channel_no}/refresh-token
success_condition: 新 Token 获取成功且已更新
note: 如果 OAuth 授权已被商户撤销，此操作会失败，需升级为 NOTIFY_MERCHANT
```

### REPUBLISH_TO_CHANNEL — 重新发布商品

```yaml
executor: RepublishToChannelExecutor
description: 重新将商品 Listing 发布到渠道
parameters:
  merchant_no: string
  channel_no: string
  sku: string
timeout: 20s
retry:
  max_retries: 2
  backoff: fixed(3s)
api_call: POST /api/channels/{channel_no}/publish
success_condition: 渠道确认接收 Listing 数据
```

### NOTIFY_MERCHANT — 通知商户

```yaml
executor: NotifyMerchantExecutor
description: 向商户发送异常通知（邮件/Webhook）
parameters:
  merchant_no: string
  order_no: string
  notification_type: 'email' | 'webhook' | 'both'
  subject: string
  body: string              # 通知内容（中文）
timeout: 10s
retry:
  max_retries: 3
  backoff: fixed(2s)
api_call: POST /api/notifications/send
success_condition: 通知发送成功（邮件已投递或 Webhook 返回 2xx）
note: 通知失败不阻塞后续动作执行
```

### CANCEL_AND_RECREATE — 取消并重建

```yaml
executor: CancelAndRecreateExecutor
description: 取消当前异常订单，可选重新打开
parameters:
  order_no: string
  merchant_no: string
  reason: string
  recreate: boolean         # true = 取消后 reopen，false = 仅取消
timeout: 30s
retry:
  max_retries: 0            # 不重试，破坏性操作
api_call_cancel: POST {BASE_URL}/api/linker-oms/opc/app-api/sale-order/cancel
request_body_cancel: |
  {
    "orderNos": ["{order_no}"],
    "merchantNo": "{merchant_no}"
  }
api_call_reopen: POST {BASE_URL}/api/linker-oms/opc/app-api/sale-order/reopen/{order_no}
success_condition: cancel response.code === 0，reopen response.code === 0（如果 recreate=true）
precondition: 必须人工确认后才能执行
destructive: true
```

---

## 人工升级处理器

这些动作不自动执行，而是生成升级通知。

### ESCALATE_TO_ENGINEERING

```yaml
handler: CreateEscalationHandler
assigned_to: engineering
notification: 创建工程团队工单（Jira/Slack）
context_includes: [order_no, error_message, diagnosis_id, reasoning_trace]
```

### ESCALATE_TO_OPS

```yaml
handler: CreateEscalationHandler
assigned_to: ops
notification: 创建运营团队工单
context_includes: [order_no, merchant_no, root_cause, recommended_actions]
```

### MANUAL_DATA_FIX

```yaml
handler: CreateEscalationHandler
assigned_to: ops
notification: 创建数据修复工单，附带修复建议
context_includes: [order_no, affected_tables, suggested_fix]
destructive: true
```

### CONTACT_CHANNEL_SUPPORT

```yaml
handler: CreateEscalationHandler
assigned_to: channel_support
notification: 生成渠道支持请求模板
context_includes: [merchant_no, channel_name, error_details]
```

### REVIEW_BUSINESS_RULE

```yaml
handler: CreateEscalationHandler
assigned_to: ops
notification: 标记需要审查的业务规则
context_includes: [rule_type, current_config, suggested_change]
```

### CHECK_THIRD_PARTY_STATUS

```yaml
handler: CheckThirdPartyHandler
action: 检查第三方服务健康状态
api_call: GET /api/health/{service_name}
auto_check: true            # 先自动检查，如果确认宕机再升级
fallback: 如果健康检查也失败，升级到 engineering
```

---

## 执行顺序规则

1. 先执行所有 auto_executable 动作，按 priority 升序（1 = 最高优先）
2. 如果某个动作有 `post_action`（如 MAP_ITEM_ID → RESYNC_ORDER），自动追加
3. 如果某个动作的 `precondition` 不满足，status = skipped
4. 如果某个动作失败且后续动作依赖它，后续动作 status = skipped，skip_reason = "dependency_failed"
5. 人工升级动作在所有自动动作完成后统一处理

## 动作依赖关系

```
MAP_ITEM_ID ──→ RESYNC_ORDER        (映射后需要重推)
SYNC_ITEM_MASTER ──→ RESYNC_ORDER   (同步后需要重推)
REFRESH_CHANNEL_TOKEN ──→ REPUBLISH_TO_CHANNEL  (刷新后重发布)
RECALCULATE_INVENTORY ──→ RESYNC_ORDER  (库存重算后重推)
```

如果上游动作失败，下游动作自动 skip。
