import type { DiagnosisInput, ExtractedSymptom } from './types'

const DOMAIN_HINT_RULES: Array<{ patterns: RegExp[]; domain: string }> = [
  { patterns: [/SKU\s*not\s*found/i, /item\s*master/i, /product\s*not\s*found/i, /WMS\s*reject/i], domain: 'ORDER_WMS_SYNC' },
  { patterns: [/dispatch\s*fail/i, /no\s*matching\s*warehouse/i, /routing\s*rule/i], domain: 'ORDER_DISPATCH' },
  { patterns: [/out\s*of\s*stock/i, /inventory\s*shortage/i, /insufficient\s*inventory/i], domain: 'INVENTORY_ALLOCATION' },
  { patterns: [/short\s*ship/i, /partial\s*shipment/i, /label\s*generation/i, /shipment\s*exception/i], domain: 'ORDER_FULFILLMENT' },
  { patterns: [/webhook/i, /HTTP\s*401/i, /token\s*expired/i, /unauthorized/i, /channel\s*auth/i], domain: 'CHANNEL_INTEGRATION' },
  { patterns: [/rate\s*shopping/i, /no\s*suitable\s*quote/i, /carrier\s*API\s*error/i], domain: 'RATE_SHOPPING' },
  { patterns: [/PO\s*push/i, /purchase\s*order/i, /push\s*to\s*warehouse\s*fail/i], domain: 'ORDER_PO' },
  { patterns: [/delivery\s*failed/i, /consignee\s*refus/i], domain: 'ORDER_DELIVERY' },
  { patterns: [/on\s*hold/i, /order\s*held/i, /hold\s*rule/i], domain: 'ORDER_HOLD' },
  { patterns: [/email\s*send\s*fail/i, /SMTP/i, /notification\s*fail/i], domain: 'NOTIFICATION' },
  { patterns: [/add\s*new\s*product\s*error/i, /creation\s*failed/i, /required\s*fields\s*missing/i], domain: 'ORDER_CREATE' },
  { patterns: [/tracking/i, /shipment\s*confirm/i], domain: 'SHIPMENT' },
  { patterns: [/work\s*order\s*exception/i, /WO\s*exception/i], domain: 'ORDER_WORK_ORDER' },
]

export class SymptomExtractor {
  extract(input: DiagnosisInput): ExtractedSymptom {
    const symptomText = this.buildSymptomText(input)
    const entities = this.extractEntities(symptomText)
    const domainHint = this.inferDomainHint(symptomText)
    const orderNo = input.order_no || entities.order_no?.[0] || null

    return {
      order_no: orderNo,
      symptom_text: symptomText,
      extracted_entities: entities,
      domain_hint: domainHint,
    }
  }

  private buildSymptomText(input: DiagnosisInput): string {
    const parts: string[] = []
    if (input.error_message) parts.push(input.error_message)
    if (input.symptom_text) parts.push(input.symptom_text)
    return parts.join(' ').trim()
  }

  extractEntities(text: string): Record<string, string[]> {
    const entities: Record<string, string[]> = {}

    // SKU
    const skuMatches = text.match(/SKU\s*([\d\w-]+)/gi)
    if (skuMatches) {
      entities.sku = skuMatches.map(m => m.replace(/SKU\s*/i, ''))
    }

    // 订单号
    const orderMatches = text.match(/SO\d{8}/g)
    if (orderMatches) {
      entities.order_no = orderMatches
    }

    // HTTP 状态码
    const httpMatches = text.match(/(?:HTTP\s*)?([45]\d{2})/g)
    if (httpMatches) {
      entities.http_code = httpMatches.map(m => m.replace(/HTTP\s*/i, ''))
    }

    // 仓库代码
    const whMatches = text.match(/accounting_code\s*=\s*(\w+)/gi)
    if (whMatches) {
      entities.warehouse_code = whMatches.map(m => m.replace(/accounting_code\s*=\s*/i, ''))
    }

    return entities
  }

  inferDomainHint(text: string): string | null {
    for (const rule of DOMAIN_HINT_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(text)) {
          return rule.domain
        }
      }
    }
    return null
  }
}
