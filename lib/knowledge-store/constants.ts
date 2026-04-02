/**
 * 24 个标准业务域编码
 * 来源: references/business-domains.md
 */
export const VALID_DOMAINS = [
  'ORDER_CREATE',
  'ORDER_DISPATCH',
  'ORDER_UPDATE',
  'ORDER_CANCEL',
  'ORDER_HOLD',
  'ORDER_WMS_SYNC',
  'ORDER_FULFILLMENT',
  'ORDER_DELIVERY',
  'ORDER_RETURN',
  'ORDER_EXCHANGE',
  'ORDER_MERGE',
  'ORDER_PO',
  'ORDER_WORK_ORDER',
  'SHIPMENT',
  'INVENTORY_SYNC',
  'INVENTORY_ALLOCATION',
  'ITEM_SYNC',
  'ITEM_PUBLISH',
  'CHANNEL_INTEGRATION',
  'NOTIFICATION',
  'RATE_SHOPPING',
  'CUSTOMS',
  'SYSTEM',
  'UNKNOWN',
] as const

export type DomainCode = (typeof VALID_DOMAINS)[number]

/**
 * 17 个标准动作编码
 * 来源: references/action-codes.md
 */
export const VALID_ACTION_CODES = [
  'RETRY_WITH_BACKOFF',
  'RETRY_IMMEDIATE',
  'MAP_ITEM_ID',
  'SYNC_ITEM_MASTER',
  'RESYNC_ORDER',
  'RESYNC_INVENTORY',
  'RECALCULATE_INVENTORY',
  'REFRESH_CHANNEL_TOKEN',
  'REPUBLISH_TO_CHANNEL',
  'NOTIFY_MERCHANT',
  'CANCEL_AND_RECREATE',
  'ESCALATE_TO_ENGINEERING',
  'ESCALATE_TO_OPS',
  'MANUAL_DATA_FIX',
  'CONTACT_CHANNEL_SUPPORT',
  'REVIEW_BUSINESS_RULE',
  'CHECK_THIRD_PARTY_STATUS',
] as const

export type ActionCode = (typeof VALID_ACTION_CODES)[number]
