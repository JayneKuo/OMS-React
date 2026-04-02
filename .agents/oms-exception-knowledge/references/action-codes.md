# 标准动作编码 (Recommended Action Codes)

诊断结果中的建议动作必须使用以下标准编码。

## 自动可执行动作

这些动作可以由 agent 自动调度执行。

| 编码 | 说明 | 典型触发场景 | 下游 Agent |
|------|------|-------------|-----------|
| `RETRY_WITH_BACKOFF` | 指数退避重试 | 临时网络错误、HTTP 5xx、超时 | self |
| `RETRY_IMMEDIATE` | 立即重试 | 偶发性失败、幂等操作 | self |
| `MAP_ITEM_ID` | 建立 OMS-WMS 商品映射 | SKU 在 WMS 找不到 | inventory-sync-agent |
| `SYNC_ITEM_MASTER` | 同步 Item Master 到 WMS | 新商品未同步 | inventory-sync-agent |
| `RESYNC_ORDER` | 重新推送订单到 WMS | 推单失败、数据不完整 | order-sync-agent |
| `RESYNC_INVENTORY` | 重新同步库存 | 库存数量不一致 | inventory-sync-agent |
| `RECALCULATE_INVENTORY` | 重新计算可用库存 | 库存锁定/释放异常 | inventory-sync-agent |
| `REFRESH_CHANNEL_TOKEN` | 刷新渠道 API 授权 | Token 过期、401 错误 | channel-integration-agent |
| `REPUBLISH_TO_CHANNEL` | 重新发布商品到渠道 | Listing 同步失败 | publish-product-agent |
| `NOTIFY_MERCHANT` | 通知商户 | 需要商户介入处理 | notification-agent |
| `CANCEL_AND_RECREATE` | 取消并重建订单 | 订单数据严重错误 | order-sync-agent |

## 需人工介入动作

这些动作无法自动执行，需要人工处理。

| 编码 | 说明 | 典型触发场景 |
|------|------|-------------|
| `ESCALATE_TO_ENGINEERING` | 升级到工程团队 | 系统 Bug、数据库异常 |
| `ESCALATE_TO_OPS` | 升级到运营团队 | 业务规则冲突、特殊订单处理 |
| `MANUAL_DATA_FIX` | 手动修数据 | 数据不一致且无法自动修复 |
| `CONTACT_CHANNEL_SUPPORT` | 联系渠道方客服 | 渠道侧 Bug、政策变更 |
| `REVIEW_BUSINESS_RULE` | 审查业务规则 | 规则配置错误导致的异常 |
| `CHECK_THIRD_PARTY_STATUS` | 检查第三方服务状态 | 外部服务宕机 |

## 编码命名规范

新增动作编码时遵循：
- 全大写 + 下划线分隔
- 动词开头（RETRY, SYNC, MAP, NOTIFY, ESCALATE, CHECK）
- 尽量复用已有编码，避免语义重复
