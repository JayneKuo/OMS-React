
# OMS 订单问题排查手册

## 1. 异常订单（status=10 EXCEPTION）

### 查询某客户的异常订单及错误信息

```sql
-- Step 1: 查异常订单列表
SELECT order_no, channel_sales_order_no, create_time
FROM sales_order
WHERE merchant_no = '{merchant_no}' AND status = 10 AND deleted = 0
ORDER BY create_time DESC;

-- Step 2: 根据 order_no 查 order_msg 最新一条错误信息
SELECT order_no, remark, create_time
FROM order_msg
WHERE order_no = '{order_no}' AND deleted = 0
ORDER BY create_time DESC
LIMIT 1;
```

根据 `remark` 内容分析异常原因（见下方常见错误类型）。

### 常见错误类型

| 错误信息 | 原因 | 处理方式 |
|----------|------|----------|
| `Product XXX is currently out of stock` | 商品库存不足 | 补货后订单自动恢复处理 |
| `add new product error` | 商品在 OMS 中不存在 | 需在 OMS 中创建该商品 |

### order_msg 表关键字段

| 字段 | 说明 |
|------|------|
| order_no | 关联 sales_order.order_no |
| type | 消息类型（1=异常）|
| remark | 错误详情 |

---

## 2. 已发货但渠道未回传（status=3 SHIPPED，渠道未更新）

### Step 1：找出 SHIPPED 订单，同时判断有无 shipment

```sql
-- 支持用 OMS 订单号或三方单号查询，批量查时去掉订单号条件
-- shipment_no 为 NULL → 场景二（无 shipment，需查 WMS）
-- shipment_no 有值 → 场景一（有 shipment，查 package/item）
SELECT so.order_no, so.channel_sales_order_no, so.create_time,
       od.dispatch_no, od.accounting_code, od.merchant_no,
       os.shipment_no
FROM sales_order so
JOIN order_dispatch od ON so.order_no = od.order_no AND od.deleted = 0
LEFT JOIN order_shipment os ON od.dispatch_no = os.dispatch_no AND os.deleted = 0
WHERE so.merchant_no = '{merchant_no}' AND so.status = 3 AND so.deleted = 0
AND (so.order_no = '{order_no}' OR so.channel_sales_order_no = '{order_no}')
ORDER BY so.create_time DESC;
```

---

### 场景一：OMS 有 shipment 记录

```sql
-- 1. 查 package：tracking_number 和发货数量
SELECT package_no, tracking_number, ship_qty, qty
FROM order_shipment_package
WHERE shipment_no = '{shipment_no}' AND deleted = 0;

-- 2. 查 package_item：各包裹内商品发货数量和 po_line_no
SELECT package_no, sku, po_line_no, shipped_qty, order_qty
FROM order_shipment_package_item
WHERE shipment_no = '{shipment_no}' AND deleted = 0;

-- 3. 对比 sales_order_item 和 order_shipment_package_item 数量是否一致
-- 用 reference_no = po_line_no 关联，避免同 SKU 多行混淆
SELECT soi.sku, soi.reference_no, soi.qty as ordered_qty,
       IFNULL(SUM(ospi.shipped_qty), 0) as shipped_qty,
       CASE WHEN soi.qty = IFNULL(SUM(ospi.shipped_qty), 0)
            THEN '一致' ELSE '不一致' END as qty_match
FROM sales_order_item soi
LEFT JOIN order_shipment_package_item ospi
    ON soi.order_no = ospi.order_no
    AND soi.sku = ospi.sku
    AND soi.reference_no = ospi.po_line_no
    AND ospi.deleted = 0
WHERE soi.order_no = '{order_no}' AND soi.deleted = 0
GROUP BY soi.sku, soi.reference_no, soi.qty;
```

**判断逻辑：**

| 检查项 | 正常 | 异常 |
|--------|------|------|
| `order_shipment_package.tracking_number` | 有值 | 为空 → WMS 未回传 tracking |
| `order_shipment_package.ship_qty` | > 0 | = 0 → 包裹未发货 |
| `order_shipment_package_item.po_line_no` | 有值 | 为空 → 缺少 PO 行号，可能导致回传失败 |
| `sales_order_item.qty` vs `shipped_qty` 合计 | 相等 | 不等 → 发货数量与订单数量不符 |

---

### 场景二：OMS 无 shipment 记录

WMS 发货回调未触发或未写入 OMS，通过 `wms-order` skill 查询 WMS 侧是否已发货：
- WMS 状态为 SHIPPED → WMS 已发货但回调未触发，排查 DI DC-Ship Flow
- WMS 状态为 OPEN/PROCESSING → WMS 尚未发货，正常等待

---

## 3. 订单未推送到 WMS

### 判断逻辑

OMS 订单状态为 **ALLOCATED（status=1）** 时，需先查 `order_dispatch.send_kafka` 判断是否已发送 Kafka 消息，再决定是否查询 WMS。

```
sales_order.status = 1 (ALLOCATED)
  → 查 order_dispatch.send_kafka
  → send_kafka = 1 → 已发送 Kafka，调用 wms-order skill 查询 WMS 侧是否收到订单
      → WMS 无记录 → Kafka 消费失败或 WMS 未处理，排查 WMS 侧
      → WMS 有记录 → 查看 WMS 状态，判断是否卡单
  → send_kafka = 0 → 未发送 Kafka，查看服务器日志排查推单 Flow（di-stron skill）
```

### 排查步骤

```sql
-- 查 OMS 订单和拆单信息，重点看 send_kafka
SELECT so.order_no, so.channel_sales_order_no, so.status as so_status,
       od.dispatch_no, od.status as dispatch_status,
       od.accounting_code, od.merchant_no, od.send_kafka
FROM sales_order so
LEFT JOIN order_dispatch od ON so.order_no = od.order_no AND od.deleted = 0
WHERE (so.order_no = '{order_no}' OR so.channel_sales_order_no = '{order_no}')
AND so.deleted = 0;

-- 若 send_kafka = 1，用 dispatch_no、merchant_no、accounting_code 调用 wms-order skill 查 WMS 状态

-- 批量查询某客户 ALLOCATED 的订单
SELECT so.order_no, so.channel_sales_order_no, so.create_time,
       od.dispatch_no, od.accounting_code, od.merchant_no, od.send_kafka
FROM sales_order so
LEFT JOIN order_dispatch od ON so.order_no = od.order_no AND od.deleted = 0
WHERE so.merchant_no = '{merchant_no}' AND so.status = 1 AND so.deleted = 0
ORDER BY so.create_time DESC;
```

---

## 4. 其他常见查询

```sql
-- 查询某客户的 merchant_no
SELECT DISTINCT merchant_no FROM sales_order
WHERE channel_name LIKE '%{keyword}%' OR merchant_no LIKE '%{keyword}%'
LIMIT 10;

-- 按渠道订单号查询
SELECT order_no, channel_sales_order_no, status, merchant_no, create_time
FROM sales_order
WHERE channel_sales_order_no = '{channel_order_no}' AND deleted = 0;

-- 查询订单完整链路（sales_order → order_dispatch → order_shipment）
SELECT so.order_no, so.channel_sales_order_no, so.status as so_status,
       od.dispatch_no, od.status as dispatch_status,
       os.shipment_no, os.status as shipment_status
FROM sales_order so
LEFT JOIN order_dispatch od ON so.order_no = od.order_no AND od.deleted = 0
LEFT JOIN order_shipment os ON od.dispatch_no = os.dispatch_no AND os.deleted = 0
WHERE so.order_no = '{order_no}' AND so.deleted = 0;
```

### 注意事项

- MySQL 不支持 `LIMIT` 在 `IN` 子查询中，需先查出 order_no 列表再分批查
- 查询时始终加 `deleted = 0` 过滤逻辑删除数据
- 生产环境只读账号 `ro_oms`，无法执行写操作
