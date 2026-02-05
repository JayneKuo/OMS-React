// Routing Rule Types for PO Order Routing
// Based on US OMS systems (Pipe17, Oracle OMS, ShipStation, etc.)
// Uses IF-THEN (Condition-Action) pattern

export type RuleType =
  | "HOLD_ORDER"          // 暂停订单
  | "SPLIT_ORDER"         // 订单拆分
  | "MERGE_ORDER"         // 订单合并
  | "LOGISTICS_MERGE"     // 设定物流合并
  | "SPLIT_PR"            // 采购请求拆分
  | "SPLIT_PO"            // 采购订单拆分
  | "PO_ROUTING"          // 采购订单路由
  | "CUSTOM"              // 自定义规则

// Rule execution mode
export type ExecutionMode = "FIRST_MATCH" | "CHAIN" | "ALL_MATCH"

// Condition operators
export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "in"
  | "notIn"
  | "startsWith"
  | "endsWith"
  | "matches"
  | "between"
  | "isEmpty"
  | "isNotEmpty"
  | "before"
  | "after"
  | "withinDays"

// Condition fields
export type ConditionField =
  // 基础信息
  | "orderSource"           // 订单来源
  | "orderType"             // 订单类型
  | "orderPlatform"         // 订单平台
  | "orderStation"          // 订单站点
  | "orderStore"            // 订单店铺
  | "shippingTime"          // 发货时间
  | "expectedShippingTime"  // 剩余发货时间
  | "paymentTime"           // 付款时间

  // 仓储物流
  | "shippingWarehouse"     // 发货仓库
  | "carrier"               // 物流商
  | "shippingMethod"        // 物流方式
  | "recipientCountry"      // 收货国家/地区
  | "recipientState"        // 收货省/州
  | "recipientCity"         // 收货城市
  | "recipientPostalCode"   // 收货邮编
  | "addressType"           // 地址类型
  | "isEncryptedAddress"    // 地址是否加密
  | "detailedAddress"       // 详细地址字符
  | "addressLength"         // 地址字段长度
  | "doorNumber"            // 门牌号

  // 订单信息
  | "orderMSKU"             // 订单MSKU
  | "orderProduct"          // 订单产品
  | "productCategory"       // 产品分类
  | "productCount"          // 产品件数
  | "orderTotalAmount"      // 订单总金额
  | "productQuantity"       // 产品数量
  | "estimatedSize"         // 估算尺寸
  | "estimatedWeight"       // 估算重量
  | "estimatedVolume"       // 估算体积
  | "customerSelectedCarrier" // 客选物流
  | "customerPaidShipping"  // 客付运费
  | "specialAttribute"      // 特殊属性
  | "grossProfit"           // 毛利润率
  | "longestSide"           // 长宽高
  | "secondLongestSide"     // 次长边
  | "lengthPlusGirth"       // 长+(宽+高)×2
  | "productTag"            // 产品标签
  | "productStatus"         // 产品状态
  | "shippingDeadline"      // 发货截止时间
  | "orderTaxNumber"        // 订单税号
  | "estimatedShipping"     // 预估运费
  | "isGift"                // 是否赠品

  // 风险控制 (Risk Control)
  | "riskScore"             // 风险评分
  | "riskLevel"             // 风险等级
  | "riskCategory"          // 风险类别
  | "fraudScore"            // 欺诈评分
  | "creditScore"           // 信用评分
  | "blacklistMatch"        // 黑名单匹配
  | "suspiciousActivity"    // 可疑活动
  | "orderFrequency"        // 订单频率
  | "addressChangeCount"    // 地址变更次数
  | "paymentAttempts"       // 支付尝试次数
  | "returnRate"            // 退货率
  | "chargebackHistory"     // 拒付历史

  // Legacy fields (保留兼容)
  | "purchaseType"
  | "poType"
  | "poStatus"
  | "priority"
  | "supplier"
  | "supplierId"
  | "supplierType"
  | "supplierCountry"
  | "sku"
  | "category"
  | "productType"
  | "brand"
  | "itemCount"
  | "totalQuantity"
  | "warehouse"
  | "destinationWarehouse"
  | "warehouseType"
  | "amount"
  | "totalAmount"
  | "currency"
  | "paymentTerm"
  | "quantity"
  | "weight"
  | "country"
  | "region"
  | "location"
  | "paymentMethod"
  | "incoterm"
  | "leadTime"
  | "tags"
  | "customField"
  | "hasSerialNumber"
  | "hasLotNumber"
  | "requiresInspection"
  | "isUrgent"
  | "createdBy"
  | "department"

// Condition logic
export type ConditionLogic = "AND" | "OR"

export interface RoutingRuleCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string | number | boolean | string[] | number[]
  logic?: ConditionLogic // How to combine with next condition (default: AND)
}

// Action types
export type ActionType =
  | "SET_WORKFLOW" // Set fulfillment workflow
  | "ASSIGN_WAREHOUSE" // Assign to specific warehouse
  | "SEND_NOTIFICATION" // Send email/webhook notification
  | "TRIGGER_WEBHOOK" // Trigger external webhook
  | "ADD_TAG" // Add tag to order
  | "SET_PRIORITY" // Set order priority
  | "HOLD_ORDER" // Put order on hold
  | "SPLIT_ORDER" // Split order by criteria
  | "CUSTOM" // Custom action

export interface WorkflowAction {
  type: "SET_WORKFLOW"
  workflow: "FACTORY_DIRECT" | "STANDARD" | "DROPSHIP" | "CROSS_DOCK"
  config: {
    enableFGStaging?: boolean
    generateFGReceipt?: boolean
    generateSaleOrder?: boolean
    waitForFGReceipt?: boolean
    autoCreateFinalReceipt?: boolean
    fgWarehouse?: string
    destinationWarehouse?: string
    dropshipSupplier?: string
    crossDockWarehouse?: string
  }
}

export interface WarehouseAction {
  type: "ASSIGN_WAREHOUSE"
  warehouseId: string
  warehouseName: string
}

export interface NotificationAction {
  type: "SEND_NOTIFICATION"
  channel: "EMAIL" | "WEBHOOK" | "SMS"
  recipients: string[]
  template?: string
  message?: string
}

export interface WebhookAction {
  type: "TRIGGER_WEBHOOK"
  url: string
  method: "GET" | "POST"
  headers?: Record<string, string>
  payload?: string
}

export interface TagAction {
  type: "ADD_TAG"
  tags: string[]
}

export interface PriorityAction {
  type: "SET_PRIORITY"
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
}

export interface HoldAction {
  type: "HOLD_ORDER"
  reason: string
  holdType: "CREDIT" | "COMPLIANCE" | "REVIEW" | "CAPACITY" | "RISK" | "CUSTOM"

  // Hold Duration (暂停时长)
  durationType: "HOURS" | "DAYS" | "DATE_RANGE" | "MANUAL"
  durationValue?: number  // For HOURS/DAYS
  durationStartDate?: string  // For DATE_RANGE
  durationEndDate?: string    // For DATE_RANGE

  // Release Conditions (释放条件)
  autoRelease: boolean
  releaseConditions?: {
    type: "TIME_BASED" | "APPROVAL_BASED" | "CONDITION_BASED"
    approvers?: string[]  // Required approvers
    conditions?: string[] // Conditions that must be met
  }

  // Risk Control (风险控制)
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  riskCategory?: "FRAUD" | "CREDIT" | "COMPLIANCE" | "QUALITY" | "PAYMENT" | "OTHER"

  // Approval & Notification
  requiresApproval?: boolean
  notifyUsers?: string[]
}

export interface SplitAction {
  type: "SPLIT_ORDER"
  splitBy: "WAREHOUSE" | "SUPPLIER" | "CATEGORY" | "LINE_ITEM"
}

export interface CustomAction {
  type: "CUSTOM"
  actionId: string
  config: Record<string, any>
}

export type RuleAction =
  | WorkflowAction
  | WarehouseAction
  | NotificationAction
  | WebhookAction
  | TagAction
  | PriorityAction
  | HoldAction
  | SplitAction
  | CustomAction


export interface RoutingRule {
  id: string
  name: string
  description: string
  type: RuleType
  enabled: boolean
  priority: number
  executionMode?: ExecutionMode // Optional: defaults to FIRST_MATCH

  // IF (Conditions)
  conditions: RoutingRuleCondition[]
  conditionLogic: ConditionLogic // How to combine all conditions (default: AND)

  // THEN (Actions)
  actions: RuleAction[]

  createdAt: string
  updatedAt: string
}

/**
 * Execution Mode Explanation:
 * 
 * FIRST_MATCH (Default):
 * - Evaluate rules in priority order
 * - Stop at first matching rule
 * - Use that rule's actions
 * 
 * CHAIN:
 * - Evaluate all rules in priority order
 * - Apply matching rules sequentially
 * - Later rules can override earlier rules
 * - Useful for layered configuration
 * 
 * ALL_MATCH:
 * - Evaluate all rules
 * - Merge all matching rules' actions
 * - Conflict resolution based on priority
 * - Useful for additive configuration
 */

// Legacy type for backward compatibility
export interface FactoryDirectActions {
  enableFGStaging: boolean
  generateFGReceipt: boolean
  generateSaleOrder: boolean
  waitForFGReceipt: boolean
  autoCreateFinalReceipt: boolean
}
