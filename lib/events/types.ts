export type EventStatus = 'success' | 'failed' | 'warning' | 'pending'

export type EventCategory = 'order' | 'purchase' | 'inventory' | 'api' | 'automation' | 'system'

export interface SystemEvent {
  id: string
  eventType: string
  category: EventCategory
  entityType: string
  entityId: string
  status: EventStatus
  source: string
  triggeredBy: string
  timestamp: string
  durationMs: number
  requestPayload: Record<string, unknown>
  responsePayload: Record<string, unknown>
  errorMessage?: string
  errorCode?: string
  tags: string[]
}
