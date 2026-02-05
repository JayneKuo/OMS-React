# 完整的条件字段定义

## 概述

现在 `condition-fields.ts` 包含了完整的条件字段定义，涵盖销售订单和采购订单的所有业务场景。

## 销售订单字段 (Sales Order Fields)

适用规则类型：`HOLD_ORDER`, `SPLIT_ORDER`, `MERGE_ORDER`, `LOGISTICS_MERGE`

### 1. 基础信息 (8个字段)
- **orderSource** - 订单来源
- **orderType** - 订单类型 (零售/批发/B2B/B2C)
- **orderPlatform** - 订单平台
- **orderStation** - 订单站点
- **orderStore** - 订单店铺
- **shippingTime** - 发货时间
- **expectedShippingTime** - 剩余发货时间
- **paymentTime** - 付款时间

### 2. 仓储物流 (13个字段)
- **shippingWarehouse** - 发货仓库
- **carrier** - 物流商
- **shippingMethod** - 物流方式 (标准/快递/经济)
- **recipientCountry** - 收货国家/地区
- **recipientState** - 收货省/州
- **recipientCity** - 收货城市
- **recipientPostalCode** - 收货邮编
- **addressType** - 地址类型 (住宅/商业)
- **isEncryptedAddress** - 地址是否加密
- **detailedAddress** - 详细地址字符
- **addressLength** - 地址字段长度
- **doorNumber** - 门牌号

### 3. 订单信息 (25个字段)
- **orderMSKU** - 订单MSKU
- **orderProduct** - 订单产品
- **productCategory** - 产品分类
- **productCount** - 产品件数
- **orderTotalAmount** - 订单总金额
- **productQuantity** - 产品数量
- **estimatedSize** - 估算尺寸
- **estimatedWeight** - 估算重量
- **estimatedVolume** - 估算体积
- **customerSelectedCarrier** - 客选物流
- **customerPaidShipping** - 客付运费
- **specialAttribute** - 特殊属性
- **grossProfit** - 毛利润率
- **longestSide** - 长宽高
- **secondLongestSide** - 次长边
- **lengthPlusGirth** - 长+(宽+高)×2
- **productTag** - 产品标签
- **productStatus** - 产品状态 (激活/停用/停产)
- **shippingDeadline** - 发货截止时间
- **orderTaxNumber** - 订单税号
- **estimatedShipping** - 预估运费
- **isGift** - 是否赠品

### 4. 风险控制 (12个字段)
- **riskScore** - 风险评分 (0-100)
- **riskLevel** - 风险等级 (低/中/高/紧急)
- **riskCategory** - 风险类别 (欺诈/信用/合规/质量/支付/地址)
- **fraudScore** - 欺诈评分
- **creditScore** - 信用评分
- **blacklistMatch** - 黑名单匹配
- **suspiciousActivity** - 可疑活动
- **orderFrequency** - 订单频率（每天）
- **addressChangeCount** - 地址变更次数
- **paymentAttempts** - 支付尝试次数
- **returnRate** - 退货率（%）
- **chargebackHistory** - 拒付历史

**销售订单字段总计：58个**

---

## 采购订单字段 (Purchase Order Fields)

适用规则类型：`SPLIT_PR`, `SPLIT_PO`, `PO_ROUTING`

### 1. 采购订单基础 (3个字段)
- **poType** - 采购类型 (标准/一揽子/计划/合同)
- **poStatus** - 采购状态 (草稿/待审批/已审批/已发送/已确认/运输中/部分收货/已收货/已完成/已取消)
- **priority** - 优先级 (紧急/高/中/低)

### 2. 供应商 (3个字段)
- **supplier** - 供应商
- **supplierType** - 供应商类型 (国内/国际/优选/已认证/战略)
- **supplierCountry** - 供应商国家

### 3. 目标仓库 (2个字段)
- **destinationWarehouse** - 目标仓库
- **warehouseType** - 仓库类型 (自有/3PL/成品暂存/越库/寄售仓)

### 4. 产品 (8个字段)
- **sku** - SKU
- **category** - 产品分类
- **productType** - 产品类型 (成品/原材料/部件/包装材料/MRO耗材)
- **brand** - 品牌
- **itemCount** - 明细行数
- **totalQuantity** - 总数量
- **quantity** - 数量
- **weight** - 重量

### 5. 标记 (4个字段)
- **hasSerialNumber** - 含序列号
- **hasLotNumber** - 含批次号
- **requiresInspection** - 需要检验
- **isUrgent** - 是否紧急

### 6. 金额与付款 (5个字段)
- **totalAmount** - 订单总额
- **amount** - 金额
- **currency** - 币种 (美元/人民币/欧元/英镑/日元/巴西雷亚尔)
- **paymentTerm** - 付款条款 (预付/货到付款/15天/30天/45天/60天/90天账期)
- **paymentMethod** - 付款方式 (电汇/信用卡/支票/信用证)

### 7. 物流 (5个字段)
- **incoterm** - 贸易术语 (EXW/FOB/CIF/DDP/DAP/FCA)
- **leadTime** - 交期(天)
- **country** - 国家
- **region** - 地区
- **location** - 位置

### 8. 元数据 (4个字段)
- **tags** - 标签
- **customField** - 自定义字段
- **createdBy** - 创建人
- **department** - 部门

**采购订单字段总计：34个**

---

## 字段总计

- **销售订单字段**：58个
- **采购订单字段**：34个
- **总计**：92个条件字段

## 字段类型分布

### 输入类型
- **text**: 文本输入 (约40个)
- **number**: 数字输入 (约25个)
- **select**: 下拉选择 (约20个)
- **boolean**: 布尔值 (约7个)
- **date**: 日期选择 (约4个)

### 操作符支持
- **equals/notEquals**: 等于/不等于
- **contains/notContains**: 包含/不包含
- **greaterThan/lessThan**: 大于/小于
- **greaterThanOrEqual/lessThanOrEqual**: 大于等于/小于等于
- **between**: 介于
- **in/notIn**: 属于/不属于
- **startsWith/endsWith**: 开头是/结尾是
- **isEmpty/isNotEmpty**: 为空/不为空
- **before/after**: 早于/晚于

## 使用示例

### 销售订单规则示例
```typescript
// 暂停高风险订单
{
  ruleType: "HOLD_ORDER",
  conditions: [
    { field: "riskScore", operator: "greaterThan", value: 80 },
    { field: "orderTotalAmount", operator: "greaterThan", value: 1000 }
  ]
}

// 拆分巴西订单
{
  ruleType: "SPLIT_ORDER",
  conditions: [
    { field: "recipientCountry", operator: "equals", value: "BR" },
    { field: "productCount", operator: "greaterThan", value: 5 }
  ]
}
```

### 采购订单规则示例
```typescript
// 路由紧急采购订单
{
  ruleType: "PO_ROUTING",
  conditions: [
    { field: "isUrgent", operator: "equals", value: true },
    { field: "supplierCountry", operator: "equals", value: "CN" }
  ]
}

// 拆分大额采购订单
{
  ruleType: "SPLIT_PO",
  conditions: [
    { field: "totalAmount", operator: "greaterThan", value: 50000 },
    { field: "itemCount", operator: "greaterThan", value: 10 }
  ]
}
```

## 字段分类逻辑

### 销售订单字段分类
1. **基础信息** - 订单的基本属性和时间信息
2. **仓储物流** - 发货仓库、物流商、收货地址相关
3. **订单信息** - 产品、金额、尺寸、重量等详细信息
4. **风险控制** - 风险评估和欺诈检测相关

### 采购订单字段分类
1. **采购订单基础** - PO类型、状态、优先级
2. **供应商** - 供应商信息和类型
3. **目标仓库** - 收货仓库和类型
4. **产品** - SKU、分类、数量、重量等
5. **标记** - 序列号、批次号、检验、紧急等标志
6. **金额与付款** - 金额、币种、付款条款和方式
7. **物流** - 贸易术语、交期、地理位置
8. **元数据** - 标签、自定义字段、创建人、部门

## 扩展性

如需添加新字段：

1. 在 `routing-rule.ts` 的 `ConditionField` 类型中添加新字段ID
2. 在 `condition-fields.ts` 中添加字段定义
3. 指定 `applicableRuleTypes` 来控制字段在哪些规则类型中显示
4. 选择合适的 `category` 进行分组
5. 定义支持的 `operators`

## 维护建议

1. **保持字段命名一致性** - 使用驼峰命名法
2. **提供双语标签** - label (英文) 和 labelZh (中文)
3. **合理分类** - 将相关字段放在同一个 category
4. **选择合适的类型** - text/number/select/boolean/date
5. **定义适当的操作符** - 根据字段类型选择合理的操作符
6. **添加占位符** - 为文本和数字输入提供 placeholder
7. **指定适用规则** - 使用 applicableRuleTypes 控制字段可见性
