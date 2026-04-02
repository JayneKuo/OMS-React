import type { ExtractedSymptom, OrderContext, ExploratoryResult, ExploratoryHypothesis } from './types'

interface Rule {
  condition: (symptom: ExtractedSymptom, ctx: OrderContext | null) => boolean
  hypothesis: (symptom: ExtractedSymptom, ctx: OrderContext | null) => ExploratoryHypothesis
  confidence: number
}

const RULES: Rule[] = [
  // 规则 1: status=10 且 remark 包含 "not found"
  {
    condition: (_, ctx) =>
      ctx?.status === 10 && ctx.recent_messages.some(m => /not\s*found/i.test(m.remark)),
    hypothesis: (s, ctx) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Exception, remark contains "not found"`,
        domain_model_used: ['OMS Item Master 校验流程'],
      },
      proposed_domain: 'ORDER_WMS_SYNC',
      proposed_symptom_signals: ['Item not found', 'SKU not found in WMS'],
      proposed_root_cause: 'SKU 在 Item Master 或 WMS 中不存在',
      proposed_actions: ['MAP_ITEM_ID', 'SYNC_ITEM_MASTER'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.6,
  },
  // 规则 2: status=10 且 remark 包含 "out of stock"
  {
    condition: (_, ctx) =>
      ctx?.status === 10 && ctx.recent_messages.some(m => /out\s*of\s*stock/i.test(m.remark)),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Exception, remark contains "out of stock"`,
        domain_model_used: ['OMS 库存分配流程'],
      },
      proposed_domain: 'INVENTORY_ALLOCATION',
      proposed_symptom_signals: ['Product out of stock', 'Insufficient inventory'],
      proposed_root_cause: '商品库存不足',
      proposed_actions: ['RECALCULATE_INVENTORY', 'RESYNC_INVENTORY'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.6,
  },
  // 规则 3: status=1 且 send_kafka=0
  {
    condition: (_, ctx) =>
      ctx?.status === 1 && ctx.dispatches.some(d => d.send_kafka === 0),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Allocated, send_kafka=0`,
        domain_model_used: ['OMS 推单流程', 'Kafka 消息发送'],
      },
      proposed_domain: 'ORDER_DISPATCH',
      proposed_symptom_signals: ['Order stuck in Allocated', 'Kafka message not sent'],
      proposed_root_cause: '推单 Kafka 消息未发送',
      proposed_actions: ['RESYNC_ORDER', 'RETRY_WITH_BACKOFF'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.7,
  },
  // 规则 4: status=1 且 send_kafka=1 且无 shipment
  {
    condition: (_, ctx) =>
      ctx?.status === 1 &&
      ctx.dispatches.some(d => d.send_kafka === 1) &&
      ctx.dispatches.every(d => !d.shipment_no),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Allocated, send_kafka=1, no shipment`,
        domain_model_used: ['OMS-WMS 推单交互', 'WMS 接单流程'],
      },
      proposed_domain: 'ORDER_WMS_SYNC',
      proposed_symptom_signals: ['WMS not responding', 'Shipment not created after Kafka sent'],
      proposed_root_cause: 'WMS 未响应推单请求',
      proposed_actions: ['RESYNC_ORDER', 'CHECK_THIRD_PARTY_STATUS'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.5,
  },
  // 规则 5: status=3 且无 tracking_number
  {
    condition: (_, ctx) =>
      ctx?.status === 3 && ctx.dispatches.every(d => !d.tracking_number),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Shipped, no tracking number`,
        domain_model_used: ['WMS 发货回调流程'],
      },
      proposed_domain: 'ORDER_FULFILLMENT',
      proposed_symptom_signals: ['Shipped without tracking', 'WMS callback incomplete'],
      proposed_root_cause: 'WMS 发货回调未包含 tracking number',
      proposed_actions: ['RESYNC_ORDER', 'CHECK_THIRD_PARTY_STATUS'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.5,
  },
  // 规则 6: remark 包含 "add new product error"
  {
    condition: (_, ctx) =>
      ctx?.status === 10 && ctx.recent_messages.some(m => /add\s*new\s*product\s*error/i.test(m.remark)),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Exception, remark contains "add new product error"`,
        domain_model_used: ['OMS Item Master 自动创建流程'],
      },
      proposed_domain: 'ORDER_CREATE',
      proposed_symptom_signals: ['Add new product error', 'Product not found in Item Master'],
      proposed_root_cause: '商品在 OMS Item Master 中不存在，自动创建失败',
      proposed_actions: ['SYNC_ITEM_MASTER', 'RESYNC_ORDER'],
      needs_verification: true,
      auto_create_knowledge: true,
    }),
    confidence: 0.65,
  },
  // 规则 6.5: remark 包含 "SKU ... not found in item master"
  {
    condition: (_, ctx) =>
      ctx?.status === 10 && ctx.recent_messages.some(m => /SKU\s+\S+\s+not\s+found\s+in\s+item\s+master/i.test(m.remark)),
    hypothesis: (s, ctx) => {
      const msg = ctx?.recent_messages.find(m => /SKU\s+\S+\s+not\s+found/i.test(m.remark))
      const skuMatch = msg?.remark.match(/SKU\s+(\S+)\s+not\s+found/i)
      const sku = skuMatch?.[1] || 'unknown'
      return {
        reasoning_method: 'rule_based_fallback',
        reasoning_input: {
          symptom_text: s.symptom_text || msg?.remark || '',
          order_context_summary: `status=Exception, SKU ${sku} not found in item master`,
          domain_model_used: ['OMS Item Master 校验', 'API: POST /item 创建商品', 'API: POST /sale-order/reopen 重新分派'],
        },
        proposed_domain: 'ORDER_WMS_SYNC',
        proposed_symptom_signals: ['SKU not found in item master', `SKU ${sku} not found`, 'Product not found in Item Master'],
        proposed_root_cause: `SKU ${sku} 在 Item Master 中不存在，需要先创建商品再重新打开订单`,
        proposed_actions: ['SYNC_ITEM_MASTER', 'RESYNC_ORDER'],
        needs_verification: false,
        auto_create_knowledge: true,
      }
    },
    confidence: 0.85,
  },
  // 规则 6.6: remark 包含 "shipping address is missing" / "address"
  {
    condition: (_, ctx) =>
      ctx?.status === 10 && ctx.recent_messages.some(m =>
        /shipping\s*address\s*(is\s*)?missing/i.test(m.remark) ||
        /address\s*validation\s*fail/i.test(m.remark) ||
        /please\s*add\s*the\s*shipping\s*details/i.test(m.remark)
      ),
    hypothesis: (s) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text,
        order_context_summary: `status=Exception, shipping address missing`,
        domain_model_used: ['OMS 订单地址校验', 'API: PUT /sale-order 更新地址', 'API: POST /sale-order/reopen 重新分派'],
      },
      proposed_domain: 'ORDER_DISPATCH',
      proposed_symptom_signals: ['Shipping address missing', 'Address validation failure', 'Please add the shipping details'],
      proposed_root_cause: '订单收货地址缺失或不完整，无法完成分派',
      proposed_actions: ['MANUAL_DATA_FIX', 'NOTIFY_MERCHANT'],
      needs_verification: false,
      auto_create_knowledge: true,
    }),
    confidence: 0.90,
  },
  // 规则 7: status=10 兜底 — 异常订单但无具体 remark，尝试 reopen 修复
  {
    condition: (_, ctx) => ctx?.status === 10,
    hypothesis: (s, ctx) => ({
      reasoning_method: 'rule_based_fallback',
      reasoning_input: {
        symptom_text: s.symptom_text || `订单 ${ctx?.order_no} 处于异常状态`,
        order_context_summary: `status=Exception(10), merchant=${ctx?.merchant_no}, channel=${ctx?.channel_name}`,
        domain_model_used: ['OMS 异常恢复流程', 'Reopen → 自动分派'],
      },
      proposed_domain: 'ORDER_DISPATCH',
      proposed_symptom_signals: ['Order in Exception state', 'Dispatch failure'],
      proposed_root_cause: '订单处于异常状态，需要重新打开触发自动分派',
      proposed_actions: ['RESYNC_ORDER', 'RETRY_WITH_BACKOFF'],
      needs_verification: true,
      auto_create_knowledge: false,
    }),
    confidence: 0.65,
  },
]

export class ExploratoryReasoner {
  reason(symptom: ExtractedSymptom, context: OrderContext | null): ExploratoryResult {
    const hypotheses: ExploratoryHypothesis[] = []

    for (const rule of RULES) {
      if (rule.condition(symptom, context)) {
        hypotheses.push(rule.hypothesis(symptom, context))
        if (hypotheses.length >= 2) break // 最多 2 个假设
      }
    }

    return {
      activated: hypotheses.length > 0,
      hypotheses,
      reasoning_method: 'rule_based_fallback',
    }
  }
}
