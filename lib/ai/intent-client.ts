import type { IntentClassification, IntentContext } from './types'

/**
 * 前端调用意图识别 API
 * 带超时和 fallback 到本地正则分类
 */
export async function classifyIntent(context: IntentContext): Promise<IntentClassification> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s 超时

  try {
    const res = await fetch('/api/ai/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Intent API error: ${res.status}`)
    }

    return await res.json()
  } catch {
    // LLM 不可用时 fallback 到本地规则
    console.warn('[Intent] LLM unavailable, falling back to local rules')
    return classifyIntentLocal(context)
  } finally {
    clearTimeout(timeoutId)
  }
}

/** 本地正则 fallback（保留原有逻辑作为降级方案） */
function classifyIntentLocal(context: IntentContext): IntentClassification {
  const t = context.user_input.trim()

  // 地址输入
  if (context.pending_address_order) {
    const hasCommas = (t.match(/[,，]/g) || []).length >= 4
    const hasKeyValue = t.includes(':') && /收件|name|地址|address/i.test(t)
    if (hasCommas || hasKeyValue) {
      return { intent: 'address_input', confidence: 0.9, entities: {} }
    }
  }

  // 教学/学习知识
  if (/记住|学习|记录一下|以后遇到|这种情况应该|告诉你一个经验|学一下/i.test(t)) {
    // 尝试从文本中提取知识结构
    const knowledge = extractKnowledgeLocal(t)
    return { intent: 'teach_knowledge', confidence: 0.8, entities: {}, knowledge }
  }

  // 订单号
  const orderMatch = t.match(/SO\d{5,}/i)
  if (orderMatch) {
    return {
      intent: 'order_query',
      confidence: 0.95,
      entities: { order_no: orderMatch[0].toUpperCase() },
    }
  }

  // 修复命令
  if (/^(修复|修|重试|retry|fix|repair|帮我修|给我修|执行修复|触发修复|重新分派|reopen)/i.test(t)) {
    return { intent: 'repair_command', confidence: 0.9, entities: {} }
  }

  // 商户号
  if (/^[A-Z]{2,}[\dA-Z]+$/i.test(t) && t.length >= 6) {
    return {
      intent: 'merchant_batch',
      confidence: 0.7,
      entities: { merchant_no: t },
    }
  }

  // 对话
  if (/^(谢谢|好的|ok|知道了|明白)$/i.test(t)) {
    return {
      intent: 'conversation',
      confidence: 0.9,
      entities: {},
      reply: '有其他需要处理的订单可以随时告诉我。',
    }
  }

  // 默认当作症状描述
  return { intent: 'symptom', confidence: 0.6, entities: {} }
}

/** 本地知识提取 — 无 LLM 时从用户文本中尽力提取结构化知识 */
function extractKnowledgeLocal(text: string): IntentClassification['knowledge'] {
  // 域名关键词映射
  const domainKeywords: Record<string, string[]> = {
    ORDER_DISPATCH: ['地址', 'address', '分派', 'dispatch', '仓库', 'warehouse', '分仓'],
    ORDER_WMS_SYNC: ['WMS', 'SKU', 'item master', '商品', '同步', 'sync', 'mapping', '映射'],
    ORDER_CREATE: ['创建', 'create', '订单创建', '必填字段'],
    ORDER_FULFILLMENT: ['发货', 'ship', '履约', 'fulfillment', '物流', '快递'],
    CHANNEL_INTEGRATION: ['渠道', 'channel', 'token', '授权', 'shopify', 'webhook'],
    INVENTORY_SYNC: ['库存', 'inventory', '缺货', '库存不足'],
    ORDER_CANCEL: ['取消', 'cancel'],
    ORDER_HOLD: ['hold', '锁定', '风控'],
  }

  // 动作关键词映射
  const actionKeywords: Record<string, string[]> = {
    MANUAL_DATA_FIX: ['数据库', '直接更新', '直接写', '手动修', '写数据库', '更新数据库', '操作数据库'],
    SYNC_ITEM_MASTER: ['创建商品', 'item master', '商品主数据'],
    MAP_ITEM_ID: ['映射', 'mapping', 'SKU映射'],
    RESYNC_ORDER: ['reopen', '重新打开', '重新分派', '重新推送'],
    RETRY_WITH_BACKOFF: ['重试', 'retry'],
    REFRESH_CHANNEL_TOKEN: ['刷新token', '刷新授权', 'refresh token'],
    RECALCULATE_INVENTORY: ['重新计算库存', '库存重算'],
    NOTIFY_MERCHANT: ['通知商户', '告知商户'],
  }

  // 症状关键词映射
  const symptomKeywords: Record<string, string[]> = {
    'shipping address missing': ['地址缺失', '缺少地址', '地址缺少', '没有地址', '地址为空', '更新地址', '地址信息'],
    'SKU not found': ['SKU找不到', 'SKU不存在', 'SKU not found', '商品不存在', '商品找不到'],
    'dispatch failure': ['分派失败', '分仓失败', 'dispatch fail'],
    'inventory shortage': ['库存不足', '缺货', '库存为零'],
    'WMS sync failed': ['WMS同步失败', 'WMS拒绝', 'WMS rejection'],
    'channel token expired': ['token过期', '授权过期', '授权失败', 'token expired'],
  }

  const lower = text.toLowerCase()

  // 提取 domain
  let domain = 'UNKNOWN'
  for (const [d, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      domain = d
      break
    }
  }

  // 提取 symptom_signals
  const signals: string[] = []
  for (const [signal, keywords] of Object.entries(symptomKeywords)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      signals.push(signal)
    }
  }

  // 提取 recommended_actions
  const actions: string[] = []
  for (const [action, keywords] of Object.entries(actionKeywords)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      actions.push(action)
    }
  }

  // 提取 root_cause — 去掉"记住"等前缀，用剩余文本作为根因
  const rootCause = text
    .replace(/^(记住|学习|记录一下|以后遇到|这种情况应该|告诉你一个经验|学一下)[，,：:\s]*/i, '')
    .trim()

  // 如果没提取到症状信号，尝试从文本中生成一个
  if (signals.length === 0 && rootCause) {
    signals.push(rootCause.slice(0, 50))
  }

  if (!rootCause) return undefined

  return {
    domain,
    symptom_signals: signals,
    root_cause: rootCause,
    recommended_actions: actions,
  }
}
