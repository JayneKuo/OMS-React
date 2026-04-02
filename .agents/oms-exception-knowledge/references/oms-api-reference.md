# Linker OMS API 参考文档

> 供 Agent 调用 OMS 系统接口使用。所有接口已在 staging 环境验证通过。
> 最后更新: 2026-03-25

---

## 环境配置

| 环境 | Base URL | 状态 |
|------|----------|------|
| staging | `https://oms-stage.item.com` | ✅ 已验证 |
| dev | `https://omsv2-dev.item.pub` | 可用 |
| preview | `https://omsv2-preview.item.com` | 可用 |
| production | `https://oms.item.com` | 生产环境，谨慎使用 |

**API 路由前缀**: `/api/linker-oms/opc/app-api/`

完整 URL = `{Base URL}` + `/api/linker-oms/opc/app-api/` + `{接口路径}`

---

## 认证

### 获取 Token

```
POST {Base URL}/api/linker-oms/opc/iam/token
Content-Type: application/json

{
  "grantType": "password",
  "username": "用户邮箱",
  "password": "密码"
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "access_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 86399
  }
}
```

**后续请求**: 所有接口请求头需携带 `Authorization: Bearer {access_token}`

---

## 销售订单接口

### 查询订单详情

```
GET /sale-order/{orderNo}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "orderNo": "SO00523262",
    "merchantNo": "BATEST0001",
    "channelName": "eddieShopify",
    "dataChannel": "SHOPIFY",
    "status": "ALLOCATED",
    "accountingCode": "仓库编码"
  }
}
```

**订单状态值**:
| 状态码 | 含义 |
|--------|------|
| 10 / EXCEPTION | 异常 |
| 0 / NEW | 新建 |
| 1 / ALLOCATED | 已分配仓库 |
| 2 / PROCESSING | 处理中 |
| 3 / SHIPPED | 已发货 |
| 9 / CANCELLED | 已取消 |

### 更新订单

```
PUT /sale-order
Content-Type: application/json

{
  "orderNo": "SO00384603",
  "shipToAddress": {
    "address1": "12345 Neverland Lane",
    "city": "Beverly Hills",
    "state": "CA",
    "country": "US",
    "zipCode": "90210",
    "name": "Customer Name"
  }
}
```

> **⚠️ 重要**: PUT /sale-order 是全量更新接口，后端校验要求所有必填字段（包括 channelSalesOrderNo、订单日期等）。
> **正确做法**: 先 `GET /sale-order/{orderNo}` 获取完整订单数据，合并需要修改的字段后再 PUT 回去。
> 不要只传部分字段，否则会报 "Invalid request parameters: 订单渠道销售订单号不能为空" 等校验错误。
>
> ```
> 1. GET /sale-order/{orderNo}           ← 获取完整订单
> 2. 合并修改字段到完整订单对象
> 3. PUT /sale-order                     ← 用完整对象更新
> ```

### 重新打开订单（从异常恢复）

```
POST /sale-order/reopen/{orderNo}
```

无 Body。将异常订单重新打开，触发自动分派流程。

**成功响应**: `{"code": 0, "data": null, "msg": null}`
**已非异常**: `{"code": -1, "msg": "reopen dispatch exception:Order not exception"}`

### 取消订单

```
POST /sale-order/cancel
Content-Type: application/json

{
  "orderNos": ["SO00384603"],
  "merchantNo": "BATEST0001"
}
```

---

## 商品接口

### 创建商品（Item Master）

```
POST /item
Content-Type: application/json

[{
  "sku": "IP11PM-256-MDG",
  "customerCode": "BATEST0001",
  "uom": "EA",
  "description": "商品描述",
  "status": "Active"
}]
```

**注意**: Body 是数组，支持批量创建。

**ItemCreateVO 完整字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sku | String | 是 | 商品 SKU |
| customerCode | String | 是 | 商户编码（merchantNo） |
| uom | String | 是 | 计量单位（EA, CS 等） |
| description | String | 否 | 商品描述 |
| status | String | 否 | 状态，默认 Active |
| weight | BigDecimal | 否 | 重量 |
| length | BigDecimal | 否 | 长度 |
| width | BigDecimal | 否 | 宽度 |
| height | BigDecimal | 否 | 高度 |
| volume | BigDecimal | 否 | 体积 |
| weightUom | String | 否 | 重量单位 |
| lengthUom | String | 否 | 长度单位 |

**成功响应**: `{"code": 0, "data": true, "msg": ""}`

### 查询商品

```
GET /item/product?sku={sku}
```

---

## 商品映射接口

### 创建渠道商品映射

```
POST /product-mapping
Content-Type: application/json

{
  "originalSku": "渠道侧SKU",
  "newSku": "OMS内部SKU",
  "applyToChannel": "渠道名称",
  "channelId": 渠道ID
}
```

**ProductMappingReqVO 字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| originalSku | String | 是 | 渠道侧原始 SKU（max 50） |
| newSku | String | 否 | 映射后的 OMS SKU |
| applyToChannel | String | 否 | 适用渠道名称 |
| channelId | Long | 否 | 渠道 ID |
| merchantId | Long | 否 | 商户 ID |

---

## 订单日志接口

### 查询订单日志（报错信息）

```
GET /orderLog/list?omsOrderNo={orderNo}&merchantNo={merchantNo}&pageSize=5&pageNum=1
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "eventId": "xxx",
        "eventType": "EXCEPTION",
        "eventSubType": "DISPATCH_FAILED",
        "eventTime": "2026-03-25T10:00:00Z",
        "description": "add new product error: SKU IP11PM-256-MDG not found",
        "suggestion": "请在 Item Master 中创建该商品",
        "eventOccurProcess": "DISPATCH"
      }
    ],
    "total": 1
  }
}
```

**用途**: 获取订单的异常报错信息，用于诊断根因。`description` 字段包含具体的错误描述。

---

## 分派接口

### 检查订单是否可手动分派

```
GET /dispatch/hand/check/{orderNo}
```

### 获取可分派商品列表

```
GET /dispatch/hand/item/{orderNo}
```

### 手动分派

```
POST /dispatch/hand
Content-Type: application/json

{
  "orderNo": "SO00384603",
  "warehouseCode": "仓库编码",
  "items": [...]
}
```

### 解除分仓（整单）

```
POST /dispatch/recover/dispatch
Content-Type: application/json

{
  "orderNo": "SO00384603"
}
```

将已分仓订单恢复到未分仓状态（Allocated → Pending）。

### 部分解除分仓

```
POST /dispatch/recover/dispatch/part
```

---

## 异常处理调用链

### 场景 1: SKU 不存在 → 创建商品 → 重新分派

```
1. POST /item                              ← 创建缺失的商品
   Body: [{"sku":"xxx","customerCode":"xxx","uom":"EA","status":"Active"}]

2. POST /sale-order/reopen/{orderNo}       ← 重新打开订单
   → 自动触发分派，订单状态: Exception → Pending → Allocated
```

**已验证**: SO00523262 (BATEST0001) 通过此链路从 Exception 变为 ALLOCATED。

### 场景 2: 地址缺失 → 补充地址 → 重新分派

```
1. GET /sale-order/{orderNo}             ← 获取完整订单数据（必须！PUT 是全量更新）

2. PUT /sale-order                       ← 用完整订单数据 + 新地址更新
   Body: { ...existingOrder, shipToAddress: { name, address1, city, state, country, zipCode } }

3. POST /sale-order/reopen/{orderNo}     ← 重新打开订单
   → 自动触发分派
```

> **教训**: 不能只传 orderNo + shipToAddress，后端校验要求 channelSalesOrderNo、订单日期等必填字段。
> 必须先 GET 完整数据再合并修改。

### 场景 3: 仓库未配置 → CRM 配置 → 重新分派

```
1. (CRM 外部操作)                           ← 人工在 CRM 配置仓库关联

2. POST /sale-order/reopen/{orderNo}       ← 重新打开订单
   → 自动触发分派
```

### 场景 4: 库存不足 → 补货 → 重新分派

```
1. (补货操作)                               ← 通过采购单或库存调整补货

2. POST /sale-order/reopen/{orderNo}       ← 重新打开订单
   → 自动触发分派
```

---

## 通用响应格式

```json
{
  "code": 0,        // 0=成功, -1=业务错误, 其他=系统错误
  "data": {},       // 业务数据
  "msg": ""         // 错误信息（code≠0时）
}
```

---

## ⚠️ API 调用黄金规则

这些规则从实际错误中总结，必须严格遵守：

1. **PUT 接口 = 全量更新**: 所有 PUT 接口都是全量更新，后端会校验所有必填字段。
   永远先 `GET` 完整数据，合并修改后再 `PUT` 回去。不要只传部分字段。

2. **不要猜测必填字段**: 如果 API 文档不完整，先调 GET 接口看实际返回的完整对象结构，
   以此为准构造 PUT 请求体。

3. **利用已有上下文**: 诊断阶段已经通过 `GET /sale-order/{orderNo}` 获取了完整订单数据
   （存在 `order_context` 中），修复阶段应直接复用，不要重复请求或让用户提供系统已知的信息。

4. **错误自愈优先**: API 返回校验错误（如"字段不能为空"）时，先分析错误信息，
   尝试从已有数据中补充缺失字段后重试。只有自愈失败才报告给用户。

5. **错误是学习材料**: 每次 API 错误（无论是否自愈成功）都应记录并反馈给学习 Agent，
   避免同类错误重复发生。

---

## 数据来源

- Java Controller: `linker-module-oms-opc/.../controller/app/`
- 前端 API 定义: `Linker前端/src/lib/api/oms/sales-orders/index.ts`
- 前端 Item API: `Linker前端/src/lib/api/item/index.ts`
- 本体 BusinessProcess: Neo4j `bolt://localhost:7687` (database: neo4j)
