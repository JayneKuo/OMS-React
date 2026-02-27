// Condition field definitions for routing rules
// Organized by rule type for better UX

import type { ConditionField, ConditionOperator, RuleType } from "@/lib/types/routing-rule"

export interface FieldDefinition {
    id: ConditionField
    label: string
    labelZh: string
    type: "text" | "number" | "select" | "multiSelect" | "boolean" | "date" | "dateRange"
    category: string
    categoryZh: string
    options?: { value: string; label: string; labelZh: string }[]
    operators: ConditionOperator[]
    placeholder?: string
    applicableRuleTypes?: RuleType[]
}

// ============================================================================
// SALES ORDER FIELDS (销售订单字段)
// For: HOLD_ORDER, SPLIT_ORDER, MERGE_ORDER, LOGISTICS_MERGE
// ============================================================================

const salesOrderFields: FieldDefinition[] = [
    // 基础信息
    {
        id: "orderSource",
        label: "Order Source",
        labelZh: "订单来源",
        type: "text",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter order source",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderType",
        label: "Order Type",
        labelZh: "订单类型",
        type: "select",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        options: [
            { value: "RETAIL", label: "Retail", labelZh: "零售" },
            { value: "WHOLESALE", label: "Wholesale", labelZh: "批发" },
            { value: "B2B", label: "B2B", labelZh: "B2B" },
            { value: "B2C", label: "B2C", labelZh: "B2C" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderPlatform",
        label: "Order Platform",
        labelZh: "订单平台",
        type: "text",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter platform",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderStation",
        label: "Order Station",
        labelZh: "订单站点",
        type: "text",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter station",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderStore",
        label: "Order Store",
        labelZh: "订单店铺",
        type: "text",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter store",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "shippingTime",
        label: "Shipping Time",
        labelZh: "发货时间",
        type: "date",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["before", "after", "between"],
        placeholder: "Select date",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER"]
    },
    {
        id: "expectedShippingTime",
        label: "Expected Shipping Time",
        labelZh: "剩余发货时间",
        type: "number",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter hours",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER"]
    },
    {
        id: "paymentTime",
        label: "Payment Time",
        labelZh: "付款时间",
        type: "date",
        category: "Sales Order Basic",
        categoryZh: "基础信息",
        operators: ["before", "after", "between"],
        placeholder: "Select date",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER"]
    },
    // 仓储物流
    {
        id: "shippingWarehouse",
        label: "Shipping Warehouse",
        labelZh: "发货仓库",
        type: "select",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        options: [
            { value: "US-EAST", label: "US East", labelZh: "美国东部" },
            { value: "US-WEST", label: "US West", labelZh: "美国西部" },
            { value: "CN-SH", label: "Shanghai", labelZh: "上海" },
            { value: "BR-SP", label: "Brazil", labelZh: "巴西" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "carrier",
        label: "Carrier",
        labelZh: "物流商",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter carrier",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "shippingMethod",
        label: "Shipping Method",
        labelZh: "物流方式",
        type: "select",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        options: [
            { value: "STANDARD", label: "Standard", labelZh: "标准" },
            { value: "EXPRESS", label: "Express", labelZh: "快递" },
            { value: "ECONOMY", label: "Economy", labelZh: "经济" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "recipientCountry",
        label: "Recipient Country",
        labelZh: "收货国家/地区",
        type: "select",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        options: [
            { value: "US", label: "United States", labelZh: "美国" },
            { value: "CN", label: "China", labelZh: "中国" },
            { value: "BR", label: "Brazil", labelZh: "巴西" },
            { value: "MX", label: "Mexico", labelZh: "墨西哥" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "recipientState",
        label: "Recipient State/Province",
        labelZh: "收货省/州",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter state/province",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "recipientCity",
        label: "Recipient City",
        labelZh: "收货城市",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter city",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "recipientPostalCode",
        label: "Recipient Postal Code",
        labelZh: "收货邮编",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter postal code",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "addressType",
        label: "Address Type",
        labelZh: "地址类型",
        type: "select",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        options: [
            { value: "RESIDENTIAL", label: "Residential", labelZh: "住宅" },
            { value: "COMMERCIAL", label: "Commercial", labelZh: "商业" },
        ],
        operators: ["equals", "notEquals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "isEncryptedAddress",
        label: "Is Encrypted Address",
        labelZh: "地址是否加密",
        type: "boolean",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "detailedAddress",
        label: "Detailed Address",
        labelZh: "详细地址字符",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter address",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "addressLength",
        label: "Address Length",
        labelZh: "地址字段长度",
        type: "number",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter length",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "doorNumber",
        label: "Door Number",
        labelZh: "门牌号",
        type: "text",
        category: "Shipping & Logistics",
        categoryZh: "仓储物流",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter door number",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    // 订单信息
    {
        id: "orderMSKU",
        label: "Order MSKU",
        labelZh: "订单MSKU",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter MSKU",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderProduct",
        label: "Order Product",
        labelZh: "订单产品",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter product",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "productCategory",
        label: "Product Category",
        labelZh: "产品分类",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter category",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "productCount",
        label: "Product Count",
        labelZh: "产品件数",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter count",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderTotalAmount",
        label: "Order Total Amount",
        labelZh: "订单总金额",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter amount",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "productQuantity",
        label: "Product Quantity",
        labelZh: "产品数量",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter quantity",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "estimatedSize",
        label: "Estimated Size",
        labelZh: "估算尺寸",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter size",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "estimatedWeight",
        label: "Estimated Weight",
        labelZh: "估算重量",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter weight",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "estimatedVolume",
        label: "Estimated Volume",
        labelZh: "估算体积",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter volume",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "customerSelectedCarrier",
        label: "Customer Selected Carrier",
        labelZh: "客选物流",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter carrier",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "customerPaidShipping",
        label: "Customer Paid Shipping",
        labelZh: "客付运费",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter amount",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "specialAttribute",
        label: "Special Attribute",
        labelZh: "特殊属性",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter attribute",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "grossProfit",
        label: "Gross Profit",
        labelZh: "毛利润率",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter percentage",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "longestSide",
        label: "Longest Side",
        labelZh: "长宽高",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter length",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "secondLongestSide",
        label: "Second Longest Side",
        labelZh: "次长边",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter length",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "lengthPlusGirth",
        label: "Length + Girth",
        labelZh: "长+(宽+高)×2",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter value",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "productTag",
        label: "Product Tag",
        labelZh: "产品标签",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains"],
        placeholder: "Enter tag",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "productStatus",
        label: "Product Status",
        labelZh: "产品状态",
        type: "select",
        category: "Order Info",
        categoryZh: "订单信息",
        options: [
            { value: "ACTIVE", label: "Active", labelZh: "激活" },
            { value: "INACTIVE", label: "Inactive", labelZh: "停用" },
            { value: "DISCONTINUED", label: "Discontinued", labelZh: "停产" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "shippingDeadline",
        label: "Shipping Deadline",
        labelZh: "发货截止时间",
        type: "date",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["before", "after", "between"],
        placeholder: "Select date",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderTaxNumber",
        label: "Order Tax Number",
        labelZh: "订单税号",
        type: "text",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter tax number",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "estimatedShipping",
        label: "Estimated Shipping",
        labelZh: "预估运费",
        type: "number",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter amount",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "isGift",
        label: "Is Gift",
        labelZh: "是否赠品",
        type: "boolean",
        category: "Order Info",
        categoryZh: "订单信息",
        operators: ["equals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    // 风险控制
    {
        id: "riskScore",
        label: "Risk Score",
        labelZh: "风险评分",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter score (0-100)",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "riskRecommendation",
        label: "Risk Recommendation",
        labelZh: "建议策略",
        type: "select",
        category: "Risk Control",
        categoryZh: "风险控制",
        options: [
            { value: "ACCEPT", label: "Accept", labelZh: "接受" },
            { value: "INVESTIGATE", label: "Investigate", labelZh: "调查" },
            { value: "CANCEL", label: "Cancel", labelZh: "取消" },
            { value: "NONE", label: "None", labelZh: "无" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "riskLevel",
        label: "Risk Level",
        labelZh: "风险等级",
        type: "select",
        category: "Risk Control",
        categoryZh: "风险控制",
        options: [
            { value: "LOW", label: "Low", labelZh: "低" },
            { value: "MEDIUM", label: "Medium", labelZh: "中" },
            { value: "HIGH", label: "High", labelZh: "高" },
            { value: "CRITICAL", label: "Critical", labelZh: "紧急" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "riskCategory",
        label: "Risk Category",
        labelZh: "风险类别",
        type: "select",
        category: "Risk Control",
        categoryZh: "风险控制",
        options: [
            { value: "FRAUD", label: "Fraud", labelZh: "欺诈" },
            { value: "CREDIT", label: "Credit", labelZh: "信用" },
            { value: "COMPLIANCE", label: "Compliance", labelZh: "合规" },
            { value: "QUALITY", label: "Quality", labelZh: "质量" },
            { value: "PAYMENT", label: "Payment", labelZh: "支付" },
            { value: "ADDRESS", label: "Address", labelZh: "地址" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "fraudScore",
        label: "Fraud Score",
        labelZh: "欺诈评分",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter score (0-100)",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "creditScore",
        label: "Credit Score",
        labelZh: "信用评分",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter score",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "blacklistMatch",
        label: "Blacklist Match",
        labelZh: "黑名单匹配",
        type: "boolean",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["equals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "suspiciousActivity",
        label: "Suspicious Activity",
        labelZh: "可疑活动",
        type: "boolean",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["equals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "orderFrequency",
        label: "Order Frequency (per day)",
        labelZh: "订单频率（每天）",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter count",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "addressChangeCount",
        label: "Address Change Count",
        labelZh: "地址变更次数",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter count",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "paymentAttempts",
        label: "Payment Attempts",
        labelZh: "支付尝试次数",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter count",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "returnRate",
        label: "Return Rate (%)",
        labelZh: "退货率（%）",
        type: "number",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter percentage",
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
    {
        id: "chargebackHistory",
        label: "Chargeback History",
        labelZh: "拒付历史",
        type: "boolean",
        category: "Risk Control",
        categoryZh: "风险控制",
        operators: ["equals"],
        applicableRuleTypes: ["HOLD_ORDER", "SPLIT_ORDER", "MERGE_ORDER", "LOGISTICS_MERGE"]
    },
]

// ============================================================================
// PURCHASE ORDER FIELDS (采购订单字段)
// For: SPLIT_PR, SPLIT_PO, PO_ROUTING
// ============================================================================

const purchaseOrderFields: FieldDefinition[] = [
    // 采购订单基础
    {
        id: "poType",
        label: "PO Type",
        labelZh: "采购类型",
        type: "select",
        category: "PO Basic",
        categoryZh: "采购订单基础",
        options: [
            { value: "STANDARD", label: "Standard", labelZh: "标准采购" },
            { value: "BLANKET", label: "Blanket PO", labelZh: "一揽子采购" },
            { value: "PLANNED", label: "Planned", labelZh: "计划采购" },
            { value: "CONTRACT", label: "Contract", labelZh: "合同采购" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "poStatus",
        label: "PO Status",
        labelZh: "采购状态",
        type: "select",
        category: "PO Basic",
        categoryZh: "采购订单基础",
        options: [
            { value: "DRAFT", label: "Draft", labelZh: "草稿" },
            { value: "PENDING_APPROVAL", label: "Pending Approval", labelZh: "待审批" },
            { value: "APPROVED", label: "Approved", labelZh: "已审批" },
            { value: "SENT", label: "Sent to Supplier", labelZh: "已发送" },
            { value: "CONFIRMED", label: "Confirmed", labelZh: "已确认" },
            { value: "IN_TRANSIT", label: "In Transit", labelZh: "运输中" },
            { value: "PARTIAL_RECEIVED", label: "Partial Received", labelZh: "部分收货" },
            { value: "RECEIVED", label: "Received", labelZh: "已收货" },
            { value: "COMPLETED", label: "Completed", labelZh: "已完成" },
            { value: "CANCELLED", label: "Cancelled", labelZh: "已取消" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "priority",
        label: "Priority",
        labelZh: "优先级",
        type: "select",
        category: "PO Basic",
        categoryZh: "采购订单基础",
        options: [
            { value: "CRITICAL", label: "Critical", labelZh: "紧急" },
            { value: "HIGH", label: "High", labelZh: "高" },
            { value: "MEDIUM", label: "Medium", labelZh: "中" },
            { value: "LOW", label: "Low", labelZh: "低" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 供应商
    {
        id: "supplier",
        label: "Supplier",
        labelZh: "供应商",
        type: "text",
        category: "Supplier",
        categoryZh: "供应商",
        operators: ["equals", "notEquals", "contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter supplier name",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "supplierType",
        label: "Supplier Type",
        labelZh: "供应商类型",
        type: "select",
        category: "Supplier",
        categoryZh: "供应商",
        options: [
            { value: "DOMESTIC", label: "Domestic", labelZh: "国内" },
            { value: "INTERNATIONAL", label: "International", labelZh: "国际" },
            { value: "PREFERRED", label: "Preferred", labelZh: "优选" },
            { value: "APPROVED", label: "Approved", labelZh: "已认证" },
            { value: "STRATEGIC", label: "Strategic", labelZh: "战略" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "supplierCountry",
        label: "Supplier Country",
        labelZh: "供应商国家",
        type: "select",
        category: "Supplier",
        categoryZh: "供应商",
        options: [
            { value: "US", label: "United States", labelZh: "美国" },
            { value: "CN", label: "China", labelZh: "中国" },
            { value: "MX", label: "Mexico", labelZh: "墨西哥" },
            { value: "CA", label: "Canada", labelZh: "加拿大" },
            { value: "DE", label: "Germany", labelZh: "德国" },
            { value: "JP", label: "Japan", labelZh: "日本" },
            { value: "KR", label: "South Korea", labelZh: "韩国" },
            { value: "VN", label: "Vietnam", labelZh: "越南" },
            { value: "TW", label: "Taiwan", labelZh: "台湾" },
            { value: "BR", label: "Brazil", labelZh: "巴西" },
        ],
        operators: ["equals", "notEquals", "contains", "notContains"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 目标仓库
    {
        id: "destinationWarehouse",
        label: "Destination Warehouse",
        labelZh: "目标仓库",
        type: "select",
        category: "Warehouse",
        categoryZh: "目标仓库",
        options: [
            { value: "US-EAST", label: "US East Coast", labelZh: "美国东海岸" },
            { value: "US-WEST", label: "US West Coast", labelZh: "美国西海岸" },
            { value: "US-CENTRAL", label: "US Central", labelZh: "美国中部" },
            { value: "CN-SH", label: "Shanghai", labelZh: "上海" },
            { value: "CN-SZ", label: "Shenzhen", labelZh: "深圳" },
            { value: "EU-DE", label: "Germany", labelZh: "德国" },
            { value: "BR-SP", label: "Brazil", labelZh: "巴西" },
            { value: "FG-STAGING", label: "FG Staging", labelZh: "成品暂存仓" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"],
        applicableRuleTypes: ["PO_ROUTING"]
    },
    {
        id: "warehouseType",
        label: "Warehouse Type",
        labelZh: "仓库类型",
        type: "select",
        category: "Warehouse",
        categoryZh: "目标仓库",
        options: [
            { value: "LOCAL", label: "Local (Owned)", labelZh: "自有仓库" },
            { value: "3PL", label: "3PL", labelZh: "第三方物流" },
            { value: "FG_STAGING", label: "FG Staging", labelZh: "成品暂存" },
            { value: "CROSS_DOCK", label: "Cross-Dock", labelZh: "越库" },
            { value: "CONSIGNMENT", label: "Consignment", labelZh: "寄售仓" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 产品
    {
        id: "sku",
        label: "SKU",
        labelZh: "SKU",
        type: "text",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "notEquals", "contains", "in"],
        placeholder: "Enter SKU",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "category",
        label: "Product Category",
        labelZh: "产品分类",
        type: "text",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "notEquals", "contains", "in"],
        placeholder: "Enter category",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "productType",
        label: "Product Type",
        labelZh: "产品类型",
        type: "select",
        category: "Product",
        categoryZh: "产品",
        options: [
            { value: "FINISHED_GOODS", label: "Finished Goods", labelZh: "成品" },
            { value: "RAW_MATERIAL", label: "Raw Material", labelZh: "原材料" },
            { value: "COMPONENT", label: "Component", labelZh: "部件" },
            { value: "PACKAGING", label: "Packaging", labelZh: "包装材料" },
            { value: "MRO", label: "MRO Supplies", labelZh: "MRO耗材" },
        ],
        operators: ["equals", "notEquals", "in"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "brand",
        label: "Brand",
        labelZh: "品牌",
        type: "text",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "notEquals", "contains", "in"],
        placeholder: "Enter brand",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "itemCount",
        label: "Line Item Count",
        labelZh: "明细行数",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter count",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "totalQuantity",
        label: "Total Quantity",
        labelZh: "总数量",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "between"],
        placeholder: "Enter quantity",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "quantity",
        label: "Quantity",
        labelZh: "数量",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter quantity",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "weight",
        label: "Weight",
        labelZh: "重量",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["greaterThan", "lessThan", "between"],
        placeholder: "Enter weight",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 标记
    {
        id: "hasSerialNumber",
        label: "Has Serial Number",
        labelZh: "含序列号",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "hasLotNumber",
        label: "Has Lot Number",
        labelZh: "含批次号",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "requiresInspection",
        label: "Requires Inspection",
        labelZh: "需要检验",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "isUrgent",
        label: "Is Urgent",
        labelZh: "是否紧急",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 金额与付款
    {
        id: "totalAmount",
        label: "Total Amount",
        labelZh: "订单总额",
        type: "number",
        category: "Financial",
        categoryZh: "金额与付款",
        operators: ["equals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "between"],
        placeholder: "Enter amount",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "amount",
        label: "Amount",
        labelZh: "金额",
        type: "number",
        category: "Financial",
        categoryZh: "金额与付款",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter amount",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "currency",
        label: "Currency",
        labelZh: "币种",
        type: "select",
        category: "Financial",
        categoryZh: "金额与付款",
        options: [
            { value: "USD", label: "USD", labelZh: "美元" },
            { value: "CNY", label: "CNY", labelZh: "人民币" },
            { value: "EUR", label: "EUR", labelZh: "欧元" },
            { value: "GBP", label: "GBP", labelZh: "英镑" },
            { value: "JPY", label: "JPY", labelZh: "日元" },
            { value: "BRL", label: "BRL", labelZh: "巴西雷亚尔" },
        ],
        operators: ["equals", "notEquals", "in"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "paymentTerm",
        label: "Payment Term",
        labelZh: "付款条款",
        type: "select",
        category: "Financial",
        categoryZh: "金额与付款",
        options: [
            { value: "PREPAID", label: "Prepaid", labelZh: "预付" },
            { value: "COD", label: "Cash on Delivery", labelZh: "货到付款" },
            { value: "NET15", label: "Net 15", labelZh: "15天账期" },
            { value: "NET30", label: "Net 30", labelZh: "30天账期" },
            { value: "NET45", label: "Net 45", labelZh: "45天账期" },
            { value: "NET60", label: "Net 60", labelZh: "60天账期" },
            { value: "NET90", label: "Net 90", labelZh: "90天账期" },
        ],
        operators: ["equals", "notEquals", "in"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "paymentMethod",
        label: "Payment Method",
        labelZh: "付款方式",
        type: "select",
        category: "Financial",
        categoryZh: "金额与付款",
        options: [
            { value: "WIRE_TRANSFER", label: "Wire Transfer", labelZh: "电汇" },
            { value: "CREDIT_CARD", label: "Credit Card", labelZh: "信用卡" },
            { value: "CHECK", label: "Check", labelZh: "支票" },
            { value: "LC", label: "Letter of Credit", labelZh: "信用证" },
        ],
        operators: ["equals", "notEquals", "in"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 物流
    {
        id: "incoterm",
        label: "Incoterm",
        labelZh: "贸易术语",
        type: "select",
        category: "Logistics",
        categoryZh: "物流",
        options: [
            { value: "EXW", label: "EXW - Ex Works", labelZh: "EXW 工厂交货" },
            { value: "FOB", label: "FOB - Free on Board", labelZh: "FOB 离岸价" },
            { value: "CIF", label: "CIF - Cost, Insurance & Freight", labelZh: "CIF 到岸价" },
            { value: "DDP", label: "DDP - Delivered Duty Paid", labelZh: "DDP 完税交货" },
            { value: "DAP", label: "DAP - Delivered at Place", labelZh: "DAP 目的地交货" },
            { value: "FCA", label: "FCA - Free Carrier", labelZh: "FCA 货交承运人" },
        ],
        operators: ["equals", "notEquals", "in"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "leadTime",
        label: "Lead Time (Days)",
        labelZh: "交期(天)",
        type: "number",
        category: "Logistics",
        categoryZh: "物流",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter days",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "country",
        label: "Country",
        labelZh: "国家",
        type: "select",
        category: "Logistics",
        categoryZh: "物流",
        options: [
            { value: "US", label: "United States", labelZh: "美国" },
            { value: "CN", label: "China", labelZh: "中国" },
            { value: "BR", label: "Brazil", labelZh: "巴西" },
            { value: "MX", label: "Mexico", labelZh: "墨西哥" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"],
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "region",
        label: "Region",
        labelZh: "地区",
        type: "text",
        category: "Logistics",
        categoryZh: "物流",
        operators: ["equals", "notEquals", "contains", "in"],
        placeholder: "Enter region",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "location",
        label: "Location",
        labelZh: "位置",
        type: "text",
        category: "Logistics",
        categoryZh: "物流",
        operators: ["equals", "notEquals", "contains"],
        placeholder: "Enter location",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    // 元数据
    {
        id: "tags",
        label: "Tags",
        labelZh: "标签",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter tag",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "customField",
        label: "Custom Field",
        labelZh: "自定义字段",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["equals", "notEquals", "contains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter value",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "createdBy",
        label: "Created By",
        labelZh: "创建人",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["equals", "notEquals", "contains"],
        placeholder: "Enter user",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
    {
        id: "department",
        label: "Department",
        labelZh: "部门",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["equals", "notEquals", "in"],
        placeholder: "Enter department",
        applicableRuleTypes: ["SPLIT_PR", "SPLIT_PO", "PO_ROUTING"]
    },
]

// Combine all fields
export const fieldDefinitions: FieldDefinition[] = [
    ...salesOrderFields,
    ...purchaseOrderFields
]
