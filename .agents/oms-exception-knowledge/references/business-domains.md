# OMS 标准业务域定义

基于 Linker OMS 知识图谱（176 nodes / 333 relationships）中的实际业务对象和模块结构。

## 核心业务域

| 域编码 | 中文名 | 图谱对应 | 覆盖范围 |
|--------|--------|----------|----------|
| `ORDER_CREATE` | 订单创建 | BP: Create Sales Order → State: New | 渠道订单拉取、OMS 订单生成、字段校验失败 |
| `ORDER_DISPATCH` | 订单分派 | BP: Dispatch Sales Order → State: Allocated/Exception | 路由规则评估、仓库分配、分派失败 |
| `ORDER_UPDATE` | 订单更新 | BP: Update Sales Order | 订单修改（地址、商品、数量等 7 种子类型） |
| `ORDER_CANCEL` | 订单取消 | BP: Cancel Sales Order → State: Cancelled | 客户取消、手动取消、超时取消 |
| `ORDER_HOLD` | 订单锁定 | BP: Hold Sales Order → State: OnHold, Rule: Order Hold Rule | Hold Rule 触发、手动锁定、释放 |
| `ORDER_WMS_SYNC` | 订单同步 WMS | BO: Shipping Request → WMS | 推单到 WMS、WMS 接单/拒绝、推单超时 |
| `ORDER_FULFILLMENT` | 订单履约 | BP: Ship Sales Order → State: Shipped/ShortShipped | 拣货、打包、发货、短发 |
| `ORDER_DELIVERY` | 物流配送 | BO: Delivery Order → States: DO * | 提货、干线、末端配送、签收、配送失败 |
| `ORDER_RETURN` | 退货退款 | BO: Return Order, BP: Create Return Order | 退货申请、退货收货、库存调整 |
| `ORDER_EXCHANGE` | 换货 | BO: Exchange Order, BP: Create Exchange Order | 换货创建、关联退货和新订单 |
| `ORDER_MERGE` | 订单合并 | BO: Order Merge Window, Rule: Order Merge Rule | 合并窗口、合并执行、合并取消 |
| `ORDER_PO` | 采购单 | BO: Purchase Order → States: PO * | PO 创建、推仓、收货、PO 异常 |
| `ORDER_WORK_ORDER` | 工单 | BO: Work Order → States: WO * | 工单创建、分派、处理、异常 |
| `SHIPMENT` | 发货单 | BO: Shipment → States: Shipment * | 发货创建、面单生成、发货异常 |
| `INVENTORY_SYNC` | 库存同步 | BO: Inventory, Module: Inventory Module | OMS-WMS 库存对账、同步延迟 |
| `INVENTORY_ALLOCATION` | 库存分配 | BP: Allocate Inventory | 库存锁定、释放、超卖 |
| `ITEM_SYNC` | 商品同步 | BO: Item Master, Module: Item Master Module | SKU 映射、Item Master 同步 |
| `ITEM_PUBLISH` | 商品发布 | Module: Channel Integration Module | 商品发布到渠道、Listing 更新 |
| `CHANNEL_INTEGRATION` | 渠道集成 | BO: Channel Integration, Webhook Event | API 授权、Token 过期、Webhook 失败 |
| `NOTIFICATION` | 通知 | BO: Email Notification Setting, Notification Category | 邮件通知、Webhook 通知 |
| `RATE_SHOPPING` | 运费比价 | BO: Rate Shopping Config, BP: Execute Rate Shopping | 运费计算、承运商比价 |
| `CUSTOMS` | 海关合规 | BO: Customs Duty Record | 关税计算、单证处理 |
| `SYSTEM` | 系统级 | 无直接图谱节点 | 数据库异常、队列堆积、服务不可用 |
| `UNKNOWN` | 未分类 | — | 无法归类的异常，待人工分类 |

## 图谱中的异常状态节点映射

| 图谱 State 节点 | 所属 BusinessObject | 域编码 |
|-----------------|-------------------|--------|
| Exception (id:13) | Sales Order | `ORDER_DISPATCH` / `ORDER_WMS_SYNC` / `ORDER_FULFILLMENT` |
| PO Exception (id:45) | Purchase Order | `ORDER_PO` |
| WO Exception (id:58) | Work Order | `ORDER_WORK_ORDER` |
| Shipment Exception (id:161) | Shipment | `SHIPMENT` |
| Push To Warehouse Fail (id:40) | Purchase Order | `ORDER_PO` |
| DO DeliveryFailed (id:51) | Delivery Order | `ORDER_DELIVERY` |
| Rate Shopping Failed | Rate Shopping Request | `RATE_SHOPPING` |
| Webhook Event Failed | Webhook Event | `CHANNEL_INTEGRATION` |

## 域选择规则

1. 优先选择最具体的域（如 `ORDER_DISPATCH` 优于 `ORDER_CREATE`）
2. Sales Order 的 Exception 状态可能来自多个域（分派失败、WMS 拒绝、履约异常），根据进入条件判断
3. 如果异常跨多个域，选择根因所在的域
4. 如果无法判断，使用 `UNKNOWN` 并标记待分类
