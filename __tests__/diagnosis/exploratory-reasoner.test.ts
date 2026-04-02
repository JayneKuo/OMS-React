import { describe, it, expect } from 'vitest'
import { ExploratoryReasoner } from '@/lib/diagnosis/exploratory-reasoner'
import type { ExtractedSymptom, OrderContext } from '@/lib/diagnosis/types'

const reasoner = new ExploratoryReasoner()

function makeSymptom(text: string): ExtractedSymptom {
  return { order_no: 'SO001', symptom_text: text, extracted_entities: {}, domain_hint: null }
}

function makeContext(overrides: Partial<OrderContext> = {}): OrderContext {
  return {
    order_no: 'SO001',
    channel_sales_order_no: null,
    merchant_no: 'test',
    channel_name: null,
    status: 10,
    status_label: 'Exception',
    order_type: 1,
    create_time: new Date().toISOString(),
    accounting_code: null,
    dispatches: [],
    recent_messages: [],
    items: [],
    ...overrides,
  }
}

describe('ExploratoryReasoner', () => {
  it('规则 1: status=10 + "not found" → ORDER_WMS_SYNC', () => {
    const ctx = makeContext({
      status: 10,
      recent_messages: [{ remark: 'SKU 123 not found in WMS', type: 1, create_time: '' }],
    })
    const result = reasoner.reason(makeSymptom('SKU not found'), ctx)
    expect(result.activated).toBe(true)
    expect(result.hypotheses[0].proposed_domain).toBe('ORDER_WMS_SYNC')
  })

  it('规则 2: status=10 + "out of stock" → INVENTORY_ALLOCATION', () => {
    const ctx = makeContext({
      status: 10,
      recent_messages: [{ remark: 'Product out of stock', type: 1, create_time: '' }],
    })
    const result = reasoner.reason(makeSymptom('out of stock'), ctx)
    expect(result.activated).toBe(true)
    expect(result.hypotheses[0].proposed_domain).toBe('INVENTORY_ALLOCATION')
  })

  it('规则 3: status=1 + send_kafka=0 → ORDER_DISPATCH', () => {
    const ctx = makeContext({
      status: 1,
      dispatches: [{ dispatch_no: 'D1', status: 1, accounting_code: null, warehouse_name: null, send_kafka: 0, shipment_no: null, shipment_status: null, tracking_number: null }],
    })
    const result = reasoner.reason(makeSymptom('stuck in allocated'), ctx)
    expect(result.activated).toBe(true)
    expect(result.hypotheses[0].proposed_domain).toBe('ORDER_DISPATCH')
  })

  it('规则 6: "add new product error" → ORDER_CREATE', () => {
    const ctx = makeContext({
      status: 10,
      recent_messages: [{ remark: 'add new product error for SKU ABC', type: 1, create_time: '' }],
    })
    const result = reasoner.reason(makeSymptom('add new product error'), ctx)
    expect(result.activated).toBe(true)
    // 规则 1 的 "not found" 不匹配，但规则 6 的 "add new product error" 匹配
    const hasOrderCreate = result.hypotheses.some(h => h.proposed_domain === 'ORDER_CREATE')
    expect(hasOrderCreate).toBe(true)
  })

  it('无匹配规则时 activated=false', () => {
    const ctx = makeContext({ status: 7 }) // Delivered
    const result = reasoner.reason(makeSymptom('random text'), ctx)
    expect(result.activated).toBe(false)
    expect(result.hypotheses).toHaveLength(0)
  })

  it('最多返回 2 个假设', () => {
    const ctx = makeContext({
      status: 10,
      recent_messages: [{ remark: 'not found and out of stock and add new product error', type: 1, create_time: '' }],
    })
    const result = reasoner.reason(makeSymptom('multiple issues'), ctx)
    expect(result.hypotheses.length).toBeLessThanOrEqual(2)
  })
})
