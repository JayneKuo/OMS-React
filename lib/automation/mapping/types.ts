export type MappingStatus = "complete" | "partial" | "unmapped" | "invalid"

export interface MappingValidationIssue {
  code:
    | "PRODUCT_CODE_REQUIRED"
    | "PRODUCT_NAME_REQUIRED"
    | "OMS_PRODUCT_ASSIGNED"
    | "CHANNEL_ROW_REQUIRED"
    | "DUPLICATE_CHANNEL_IN_PRODUCT"
    | "CHANNEL_ASSIGNED_ELSEWHERE"
    | "WAREHOUSE_REQUIRED"
    | "DUPLICATE_WAREHOUSE_IN_PRODUCT"
  severity: "error" | "warning"
}

export interface ChannelSkuMapping {
  id: string
  channel: string
  store: string
  channelSkus: string[]
  enabled: boolean
}

export interface WarehouseSkuMapping {
  id: string
  warehouse: string
  warehouseSku: string
  itemMasterId: string
  itemCode: string
  itemName: string
  enabled: boolean
}

export interface OmsProductMapping {
  id: string
  omsProductId: string
  omsProductCode: string
  omsProductName: string
  notes: string
  channelMappings: ChannelSkuMapping[]
  warehouseMappings: WarehouseSkuMapping[]
  updatedAt: string
  updatedBy: string
  status: MappingStatus
  issues: MappingValidationIssue[]
  changeHistory: MappingChangeRecord[]
}

export interface OmsProductMappingDraft {
  id?: string
  omsProductId: string
  omsProductCode: string
  omsProductName: string
  notes: string
  channelMappings: ChannelSkuMapping[]
  warehouseMappings: WarehouseSkuMapping[]
}

export interface OmsProductOption {
  id: string
  code: string
  name: string
}

export interface WarehouseTargetOption {
  id: string
  warehouse: string
  warehouseSku: string
  itemMasterId: string
  itemCode: string
  itemName: string
}

export interface MappingOptions {
  omsProducts: OmsProductOption[]
  channels: string[]
  stores: string[]
  warehouses: string[]
  warehouseTargets: WarehouseTargetOption[]
  authorizedStores: Record<string, string[]>
}

export interface MappingSummary {
  total: number
  complete: number
  partial: number
  unmapped: number
  invalid: number
}

export interface MappingChangeEntry {
  field: "mapping" | "product" | "notes" | "channel" | "warehouse"
  action: "created" | "added" | "removed" | "modified" | "enabled" | "disabled"
  description: string
}

export interface MappingChangeRecord {
  id: string
  timestamp: string
  operator: string
  action: "created" | "updated"
  entries: MappingChangeEntry[]
}
