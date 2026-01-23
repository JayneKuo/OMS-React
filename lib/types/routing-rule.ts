// Routing Rule Types for PO Order Routing
// Based on US OMS systems (Pipe17, Oracle OMS, ShipStation, etc.)
// Uses IF-THEN (Condition-Action) pattern

export type RuleType = "FACTORY_DIRECT" | "SKU_BASED" | "SUPPLIER_BASED" | "WAREHOUSE_BASED" | "CUSTOM"

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

// Condition fields
export type ConditionField = 
  | "purchaseType"
  | "supplier"
  | "supplierId"
  | "sku"
  | "category"
  | "brand"
  | "warehouse"
  | "destinationWarehouse"
  | "amount"
  | "quantity"
  | "weight"
  | "country"
  | "region"
  | "paymentMethod"
  | "shippingMethod"
  | "tags"
  | "customField"

// Condition logic
export type ConditionLogic = "AND" | "OR"

export interface RoutingRuleCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string | number | string[] | number[]
  logic?: ConditionLogic // How to combine with next condition (default: AND)
}

// Action types
export type ActionType =
  | "SET_WORKFLOW" // Set fulfillment workflow
  | "ASSIGN_WAREHOUSE" // Assign to specific warehouse
  | "SEND_NOTIFICATION" // Send email/webhook notification
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

export interface TagAction {
  type: "ADD_TAG"
  tags: string[]
}

export interface PriorityAction {
  type: "SET_PRIORITY"
  priority: "HIGH" | "MEDIUM" | "LOW"
}

export interface HoldAction {
  type: "HOLD_ORDER"
  reason: string
  requiresApproval: boolean
}

export interface SplitAction {
  type: "SPLIT_ORDER"
  splitBy: "SKU" | "WAREHOUSE" | "SUPPLIER"
}

export interface CustomAction {
  type: "CUSTOM"
  actionName: string
  parameters: Record<string, any>
}

export type RuleAction = 
  | WorkflowAction
  | WarehouseAction
  | NotificationAction
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
