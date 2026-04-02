import type { IntentClassification } from './types'

/**
 * 当 LLM 意图识别返回 teach_knowledge 但 knowledge 字段不完整时，
 * 用第二次 LLM 调用专门提取知识结构。
 * 在服务端 API route 中调用。
 */
export async function extractKnowledgeFromText(
  userInput: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<IntentClassification['knowledge']> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: EXTRACT_PROMPT },
        { role: 'user', content: userInput },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) return undefined

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) return undefined

  try {
    const parsed = JSON.parse(content)
    if (parsed.domain && parsed.symptom_signals?.length && parsed.root_cause) {
      return parsed
    }
  } catch { /* ignore parse errors */ }

  return undefined
}

const EXTRACT_PROMPT = `你是 OMS 知识提取引擎。用户正在用自然语言描述一条异常处理经验/知识，你需要从中提取结构化知识。

**必须输出 JSON**，包含以下字段：

1. domain（必填）: 从以下选一个最匹配的业务域：
   ORDER_CREATE, ORDER_DISPATCH, ORDER_UPDATE, ORDER_CANCEL, ORDER_HOLD, ORDER_WMS_SYNC, ORDER_FULFILLMENT, ORDER_DELIVERY, ORDER_RETURN, ORDER_EXCHANGE, ORDER_MERGE, ORDER_PO, ORDER_WORK_ORDER, SHIPMENT, INVENTORY_SYNC, INVENTORY_ALLOCATION, ITEM_SYNC, ITEM_PUBLISH, CHANNEL_INTEGRATION, NOTIFICATION, RATE_SHOPPING, CUSTOMS, SYSTEM, UNKNOWN

2. symptom_signals（必填，数组）: 提取症状关键词，中英文均可，至少 1 个。
   例如: ["shipping address missing", "地址缺失"]

3. root_cause（必填）: 用户描述的根因或处理方法，直接用用户原话整理。

4. recommended_actions（可选，数组）: 从标准动作中选匹配的，不确定就留空数组。
   可选值: RETRY_WITH_BACKOFF, RETRY_IMMEDIATE, MAP_ITEM_ID, SYNC_ITEM_MASTER, RESYNC_ORDER, RESYNC_INVENTORY, RECALCULATE_INVENTORY, REFRESH_CHANNEL_TOKEN, REPUBLISH_TO_CHANNEL, NOTIFY_MERCHANT, CANCEL_AND_RECREATE, ESCALATE_TO_ENGINEERING, ESCALATE_TO_OPS, MANUAL_DATA_FIX, CONTACT_CHANNEL_SUPPORT, REVIEW_BUSINESS_RULE, CHECK_THIRD_PARTY_STATUS

示例输入: "记住当订单缺少地址时，用户给出了地址后可直接操作数据库更新地址"
示例输出:
{
  "domain": "ORDER_DISPATCH",
  "symptom_signals": ["shipping address missing", "订单缺少地址"],
  "root_cause": "用户给出地址后可直接操作数据库更新地址",
  "recommended_actions": ["MANUAL_DATA_FIX"]
}`
