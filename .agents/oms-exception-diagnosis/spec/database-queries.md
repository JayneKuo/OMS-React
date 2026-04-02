# SQL 查询模式库 (Database Query Patterns)

诊断 Agent 只执行以下预定义的查询模式。禁止执行模式库之外的 SQL。

## 连接信息

- Host: `ec2-54-189-142-24.us-west-2.compute.amazonaws.com`
- Port: `3306`
- Database: `linker_oms_opc`
- User: `linker` (只读操作)
- 所有查询必须加 `AND deleted = 0`

---

## Q1: 订单基本信息

根据订单号查询 sales_order 主表。

```sql
SELECT
  order_no, channel_sales_order_no, merchant_no,
  channel_name, channel_code, data_channel,
  status, type, qty, total_amount,
  carrier_scac, carrier_name, delivery_service,
  accounting_code, create_time, ship_date, remark
FROM sales_order
WHERE (order_no = :order_no OR channel_sales_order_no = :order_no)
  AND deleted = 0
LIMIT 1;
```

**用途**: 获取订单状态、渠道、仓库等基本信息，决定后续查询分支。

---

## Q2: 拆单信息

查询订单的拆单记录和关联的履约单。

```sql
SELECT
  od.dispatch_no, od.status AS dispatch_status,
  od.accounting_code, od.warehouse_name,
  od.send_kafka, od.merchant_no,
  od.carrier_s_c_a_c, od.carrier_name,
  os.shipment_no, os.status AS shipment_status,
  os.master_tracking_number, os.tracking_numbers
FROM order_dispatch od
LEFT JOIN order_shipment os
  ON od.dispatch_no = os.dispatch_no AND os.deleted = 0
WHERE od.order_no = :order_no AND od.deleted = 0;
```

**用途**: 判断拆单状态、是否已推送 Kafka、是否有履约单。

---

## Q3: 异常消息

查询最近的异常消息记录。

```sql
SELECT remark, type, create_time
FROM order_msg
WHERE order_no = :order_no AND deleted = 0
ORDER BY create_time DESC
LIMIT 5;
```

**用途**: 获取系统记录的错误信息，作为症状信号的补充。

---

## Q4: 商品行信息

查询订单的商品明细。

```sql
SELECT sku, original_sku, qty, title, reference_no, uom
FROM sales_order_item
WHERE order_no = :order_no AND deleted = 0;
```

**用途**: 获取 SKU 列表，用于判断商品相关异常（SKU 不存在、库存不足等）。

---

## Q5: Kafka 发送状态（ALLOCATED 订单专用）

检查 ALLOCATED 状态订单的推单情况。

```sql
SELECT
  od.dispatch_no, od.status, od.send_kafka,
  od.accounting_code, od.merchant_no
FROM order_dispatch od
WHERE od.order_no = :order_no AND od.deleted = 0;
```

**用途**: 判断 ALLOCATED 订单是否已发送 Kafka 消息到 WMS。
- `send_kafka = 0` → 未推送，排查推单 Flow
- `send_kafka = 1` → 已推送，需查 WMS 侧

---

## Q6: 履约单详情（SHIPPED 订单专用）

查询发货单的详细信息。

```sql
SELECT
  os.shipment_no, os.status, os.ship_date,
  os.master_tracking_number, os.tracking_numbers,
  os.carrier_scac, os.carrier_name,
  os.accounting_code, os.warehouse_name
FROM order_shipment os
JOIN order_dispatch od ON os.dispatch_no = od.dispatch_no AND od.deleted = 0
WHERE od.order_no = :order_no AND os.deleted = 0;
```

**用途**: 获取发货状态和 tracking number。

---

## Q7: 包裹和发货数量对比（SHIPPED 订单专用）

对比订单数量和实际发货数量。

```sql
SELECT
  soi.sku, soi.reference_no, soi.qty AS ordered_qty,
  IFNULL(SUM(ospi.shipped_qty), 0) AS shipped_qty,
  CASE
    WHEN soi.qty = IFNULL(SUM(ospi.shipped_qty), 0) THEN 'MATCH'
    ELSE 'MISMATCH'
  END AS qty_status
FROM sales_order_item soi
LEFT JOIN order_shipment_package_item ospi
  ON soi.order_no = ospi.order_no
  AND soi.sku = ospi.sku
  AND soi.reference_no = ospi.po_line_no
  AND ospi.deleted = 0
WHERE soi.order_no = :order_no AND soi.deleted = 0
GROUP BY soi.sku, soi.reference_no, soi.qty;
```

**用途**: 检测短发（short shipment）或超发。

---

## Q8: 批量查询异常订单

按商户查询最近的异常订单列表。

```sql
SELECT
  so.order_no, so.channel_sales_order_no,
  so.merchant_no, so.create_time,
  om.remark AS latest_error
FROM sales_order so
LEFT JOIN (
  SELECT order_no, remark,
    ROW_NUMBER() OVER (PARTITION BY order_no ORDER BY create_time DESC) AS rn
  FROM order_msg
  WHERE deleted = 0
) om ON so.order_no = om.order_no AND om.rn = 1
WHERE so.merchant_no = :merchant_no
  AND so.status = 10
  AND so.deleted = 0
ORDER BY so.create_time DESC
LIMIT 50;
```

**用途**: 批量诊断某商户的所有异常订单。

---

## Q9: 订单完整链路

查询订单从创建到发货的完整链路。

```sql
SELECT
  so.order_no, so.channel_sales_order_no,
  so.status AS so_status, so.create_time,
  od.dispatch_no, od.status AS dispatch_status, od.send_kafka,
  os.shipment_no, os.status AS shipment_status,
  os.master_tracking_number
FROM sales_order so
LEFT JOIN order_dispatch od
  ON so.order_no = od.order_no AND od.deleted = 0
LEFT JOIN order_shipment os
  ON od.dispatch_no = os.dispatch_no AND os.deleted = 0
WHERE so.order_no = :order_no AND so.deleted = 0;
```

**用途**: 一次查询获取订单全链路状态，快速定位卡在哪个环节。

---

## 查询安全规则

1. **参数化**: 所有 `:order_no`、`:merchant_no` 必须参数化传入，禁止字符串拼接
2. **LIMIT**: 所有查询必须有 LIMIT（单条 LIMIT 1，列表 LIMIT 50-100）
3. **deleted 过滤**: 所有查询必须包含 `AND deleted = 0`
4. **只读**: 禁止 INSERT / UPDATE / DELETE / ALTER / DROP
5. **超时**: 单个查询超时 5 秒，总查询超时 10 秒
6. **禁止全表扫描**: 必须有 WHERE 条件命中索引
