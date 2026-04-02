import { describe, it, expect } from 'vitest'
import { SymptomExtractor } from '@/lib/diagnosis/symptom-extractor'

const extractor = new SymptomExtractor()

describe('SymptomExtractor', () => {
  it('从 error_message 提取 symptom_text', () => {
    const result = extractor.extract({
      error_message: 'SKU 1823810 not found in item master data.',
      requested_by: 'user',
    })
    expect(result.symptom_text).toBe('SKU 1823810 not found in item master data.')
    expect(result.order_no).toBeNull()
  })

  it('从 order_no 设置 order_no', () => {
    const result = extractor.extract({
      order_no: 'SO00522427',
      error_message: 'test error',
      requested_by: 'user',
    })
    expect(result.order_no).toBe('SO00522427')
  })

  it('提取 SKU 实体', () => {
    const entities = extractor.extractEntities('SKU 1823810 not found in item master')
    expect(entities.sku).toContain('1823810')
  })

  it('提取 HTTP 状态码', () => {
    const entities = extractor.extractEntities('HTTP 401 Unauthorized')
    expect(entities.http_code).toBeDefined()
    expect(entities.http_code!.some(c => c.includes('401'))).toBe(true)
  })

  it('推断 domain_hint: SKU not found → ORDER_WMS_SYNC', () => {
    expect(extractor.inferDomainHint('SKU not found in WMS')).toBe('ORDER_WMS_SYNC')
  })

  it('推断 domain_hint: dispatch fail → ORDER_DISPATCH', () => {
    expect(extractor.inferDomainHint('Dispatch failure no matching warehouse')).toBe('ORDER_DISPATCH')
  })

  it('推断 domain_hint: out of stock → INVENTORY_ALLOCATION', () => {
    expect(extractor.inferDomainHint('Product is out of stock')).toBe('INVENTORY_ALLOCATION')
  })

  it('推断 domain_hint: HTTP 401 → CHANNEL_INTEGRATION', () => {
    expect(extractor.inferDomainHint('HTTP 401 token expired')).toBe('CHANNEL_INTEGRATION')
  })

  it('推断 domain_hint: rate shopping → RATE_SHOPPING', () => {
    expect(extractor.inferDomainHint('Rate shopping failed')).toBe('RATE_SHOPPING')
  })

  it('推断 domain_hint: add new product error → ORDER_CREATE', () => {
    expect(extractor.inferDomainHint('add new product error')).toBe('ORDER_CREATE')
  })

  it('无法推断时返回 null', () => {
    expect(extractor.inferDomainHint('some random text')).toBeNull()
  })

  it('空输入返回空 symptom_text', () => {
    const result = extractor.extract({ requested_by: 'user' })
    expect(result.symptom_text).toBe('')
    expect(result.domain_hint).toBeNull()
  })
})
