export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "processing"
  | "warehouse_processing"
  | "partially_shipped"
  | "shipped"
  | "delivered"
  | "on_hold"
  | "exception"
  | "backorder"
  | "cancelled"
  | "payment_failed"

export type DropShipStatus = "none" | "pending" | "sent" | "confirmed"

export type LineItemIssue =
  | "sku_not_exist"
  | "oms_not_matched"
  | "no_warehouse"
  | "out_of_stock"
  | "insufficient_stock"
  | "backorder"

export interface OrderLineItem {
  id: string
  channelSku: string
  channelProductName: string
  qty: number
  unitPrice: number
  omsSku: string | null
  omsProductName: string | null
  omsMatched: boolean
  warehouseId: string | null
  warehouseName: string | null
  warehouseSku: string | null
  availQty: number
  backorderQty: number
  location: string | null
  defaultVendor: string | null
  warehouseMapped: boolean
  issues: LineItemIssue[]
}

export interface Order {
  id: string
  channelOrderNo: string
  referenceNo: string
  channel: string
  channelName: string
  status: OrderStatus
  dropShipStatus: DropShipStatus
  isExpedited: boolean
  isPaid: boolean
  hasShipment: boolean
  isDomestic: boolean
  holdReason: string | null
  customer: { name: string; country: string }
  lineItems: OrderLineItem[]
  grandTotal: number
  totalQty: number
  warehouseName: string | null
  orderDate: string
  shipDate: string | null
  ingestedAt: string
  company: string
  hasExceptions: boolean
}
