/**
 * Transfer Order - Generic data model
 * Replaces the old "supplyAllocationOrders" / VendorAllocationDraft with a universal transfer order model.
 */

// ─── Transfer Order Type (调拨类型) ─────────────────────────────────────
export type TransferOrderType =
  | "PURCHASE_INBOUND"       // 采购入库调拨 - PO 驱动
  | "SALES_OUTBOUND"         // 销售出库调拨 - SO 驱动
  | "WAREHOUSE_TRANSFER"     // 仓间调拨 - 库存再平衡
  | "RETURN_TRANSFER"        // 退货调拨 - 退件转仓
  | "REPLENISHMENT"          // 补货调拨 - 按需补仓
  | "CROSS_DOCK"             // 越库调拨 - 中转不入库
  | "MANUAL"                 // 手动创建

export const TRANSFER_ORDER_TYPE_OPTIONS: { value: TransferOrderType; label: string; labelEn: string; description: string }[] = [
  { value: "PURCHASE_INBOUND", label: "采购入库调拨", labelEn: "Purchase Inbound", description: "由 PO 驱动，从工厂/供应商仓到目标仓" },
  { value: "SALES_OUTBOUND", label: "销售出库调拨", labelEn: "Sales Outbound", description: "由 SO 驱动，从发货仓到客户/渠道目标仓" },
  { value: "WAREHOUSE_TRANSFER", label: "仓间调拨", labelEn: "Warehouse Transfer", description: "库存再平衡，仓与仓之间的货物转移" },
  { value: "RETURN_TRANSFER", label: "退货调拨", labelEn: "Return Transfer", description: "退件转仓，从退货仓转移到目标仓" },
  { value: "REPLENISHMENT", label: "补货调拨", labelEn: "Replenishment", description: "按需补仓，从中心仓向分仓补货" },
  { value: "CROSS_DOCK", label: "越库调拨", labelEn: "Cross Dock", description: "中转不入库，货物直接从源仓发往目标仓" },
  { value: "MANUAL", label: "手动创建", labelEn: "Manual", description: "手动创建的调拨单" },
]

// ─── Transfer Order Status ───────────────────────────────────────────
export type TransferOrderStatus =
  | "DRAFT"
  | "CREATED"
  | "PROCESSING"
  | "INBOUND_AT_SOURCE"   // 源仓已入库
  | "IN_TRANSIT"          // 在途/已出库
  | "RECEIVED"            // 目标仓已收货
  | "CLOSED"
  | "VOIDED"
  | "CANCELLED"

export type ExecutionDocumentCreationStatus =
  | "PENDING"
  | "CREATING"
  | "FAILED"
  | "PARTIAL_SUCCESS"
  | "SUCCESS"
  | "CANCELLED"

// ─── Push/Sync Status (for downstream integration) ───────────────────
export type PushStatus =
  | "NOT_PUSHED"
  | "PUSHED"
  | "PUSH_FAILED"
  | "WAITING_ACCEPT"
  | "REJECTED"
  | "ACCEPTED"
  | "CANCELLED"

// ─── Transfer Order Line ─────────────────────────────────────────────
export interface TransferOrderLine {
  lineNo: number
  skuCode: string
  productName: string
  plannedQty: number
  transferredQty: number
  receivedQty: number
  uom: string
}

// ─── Transfer Order (the final entity) ───────────────────────────────
export interface TransferOrder {
  id: string
  transferNo: string
  transferType: TransferOrderType
  status: TransferOrderStatus

  // Source (from warehouse)
  fromWarehouseName: string
  fromWarehouseCode: string

  // Optional via/intermediate warehouse
  viaWarehouseName?: string
  viaWarehouseCode?: string

  // Destination (to warehouse)
  toWarehouseName: string
  toWarehouseCode: string

  // Lines
  lines: TransferOrderLine[]

  // Related documents
  sourceDocumentType?: "PO" | "SO" | "MANUAL" | "CUSTOM"
  sourceDocumentNo?: string
  referenceNo?: string
  sourceInboundNo?: string      // was: vendorReceiptNo
  outboundOrderNo?: string      // SO / outbound
  targetInboundNo?: string      // was: finalReceiptNo

  // Execution document creation
  executionDocCreationStatus: ExecutionDocumentCreationStatus
  executionDocCreationError?: string
  executionDocCreatedCount?: number
  executionDocTargetCount?: number
  executionDocLastUpdatedAt?: string | null
  executionDocRetryCount?: number

  // Push/sync details
  pushStatus: PushStatus
  pushError?: string
  pushMessageId?: string
  lastPushedAt?: string | null
  pushRetryCount?: number

  // Flags
  canRevise: boolean

  // Legacy compat (keep until fully migrated)
  allocationNo?: string
  allocationName?: string
}

// ─── Transfer Order Draft (for creation dialog) ──────────────────────
export interface TransferOrderDraft {
  id: string
  transferType: TransferOrderType
  fromWarehouseCode: string
  fromWarehouseName: string
  viaWarehouseCode?: string
  viaWarehouseName?: string
  toWarehouseCode: string
  toWarehouseName: string
  lineQtys: Record<string, number>   // skuCode → qty
  sourceDocumentType?: "PO" | "SO" | "MANUAL" | "CUSTOM"
  sourceDocumentNo?: string
  referenceNo?: string
}

// ─── Warehouse option for picker ─────────────────────────────────────
export interface WarehouseOption {
  code: string
  name: string
  type: "OWN" | "VENDOR" | "3PL"
  city?: string
}

// ─── Mock warehouses (replace with API call in production) ────────────
export const WAREHOUSE_OPTIONS: WarehouseOption[] = [
  { code: "FAC-WH-SZ01", name: "Shenzhen Smart Factory Warehouse", type: "VENDOR", city: "Shenzhen" },
  { code: "FAC-WH-DG01", name: "Dongguan Factory Warehouse", type: "VENDOR", city: "Dongguan" },
  { code: "VFG-SZ01", name: "Shenzhen Vendor FG Warehouse", type: "VENDOR", city: "Shenzhen" },
  { code: "VFG-DG01", name: "Dongguan Vendor FG Warehouse", type: "VENDOR", city: "Dongguan" },
  { code: "WH001", name: "Main Warehouse - Los Angeles", type: "OWN", city: "Los Angeles" },
  { code: "WH002", name: "East Coast Warehouse - New York", type: "OWN", city: "New York" },
]

// ─── Supply line (PO demand lines available for transfer) ────────────
export interface SupplyDemandLine {
  sourceLineNo: number
  skuCode: string
  productName: string
  quantity: number
  allocatedQty: number
  uom: string
}

// ─── Helper: map legacy supplyAllocationOrder → TransferOrder ────────
export function legacyToTransferOrder(legacy: any): TransferOrder {
  return {
    id: legacy.id,
    transferNo: legacy.allocationNo || "",
    transferType: legacy.transferType || "PURCHASE_INBOUND",
    status: mapLegacyStatus(legacy.status),
    fromWarehouseName: legacy.sourceWarehouseName || "",
    fromWarehouseCode: legacy.sourceWarehouseCode || "",
    viaWarehouseName: legacy.intermediateWarehouseName || undefined,
    viaWarehouseCode: legacy.routeType === "VIA_FG" ? `VFG-${(legacy.sourceCode || "").replace("FAC-", "")}` : undefined,
    toWarehouseName: legacy.destinationWarehouseName || "",
    toWarehouseCode: legacy.destinationWarehouseCode || "",
    lines: (legacy.lines || []).map((line: any, idx: number) => ({
      lineNo: line.sourceLineNo || idx + 1,
      skuCode: line.skuCode,
      productName: line.productName,
      plannedQty: line.quantity,
      transferredQty: line.allocatedQty,
      receivedQty: 0,
      uom: line.uom,
    })),
    sourceDocumentType: "PO",
    sourceDocumentNo: undefined,
    referenceNo: legacy.referenceNo || undefined,
    sourceInboundNo: legacy.vendorReceiptNo || undefined,
    outboundOrderNo: legacy.outboundOrderNo || undefined,
    targetInboundNo: legacy.finalReceiptNo || undefined,
    executionDocCreationStatus: "PENDING",
    executionDocCreationError: undefined,
    executionDocCreatedCount: 0,
    executionDocTargetCount: undefined,
    executionDocLastUpdatedAt: null,
    executionDocRetryCount: 0,
    pushStatus: mapLegacyPushStatus(legacy.vendorRnStatus),
    pushError: legacy.vendorRnError || undefined,
    pushMessageId: legacy.vendorRnMessageId || undefined,
    lastPushedAt: legacy.vendorRnLastPushedAt || null,
    pushRetryCount: legacy.vendorRnRetryCount || 0,
    canRevise: legacy.canChangeVendor ?? true,
    allocationNo: legacy.allocationNo,
    allocationName: legacy.allocationName,
  }
}

function mapLegacyStatus(status: string): TransferOrderStatus {
  const map: Record<string, TransferOrderStatus> = {
    PENDING_ALLOCATION: "DRAFT",
    ALLOCATED: "CREATED",
    RELEASED: "IN_TRANSIT",
    VOIDED: "VOIDED",
  }
  return map[status] || "CREATED"
}

function mapLegacyPushStatus(status: string | undefined): PushStatus {
  if (!status) return "NOT_PUSHED"
  const map: Record<string, PushStatus> = {
    NO_RN: "NOT_PUSHED",
    RN_CREATED: "PUSHED",
    PUSH_FAILED: "PUSH_FAILED",
    WAITING_ACCEPT: "WAITING_ACCEPT",
    REJECTED: "REJECTED",
    ACCEPTED: "ACCEPTED",
    RN_CANCELLED: "CANCELLED",
  }
  return map[status] || "NOT_PUSHED"
}
