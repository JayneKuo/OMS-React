import type { IntentClassification, IntentContext } from './types'

const SYSTEM_PROMPT = `你是 OMS（订单管理系统）异常处理 AI 助手的意图识别引擎。

你的任务是分析用户输入，识别意图并提取关键实体。

## 可用意图类型

1. **order_query** — 用户想查询/诊断某个订单的异常。通常包含订单号（如 SO00523347）或提到"查一下"、"看看"等。
2. **merchant_batch** — 用户想按商户批量诊断。通常包含商户号（如 MERCH001）或提到"批量"、"商户"等。
3. **repair_command** — 用户想触发修复操作。关键词：修复、修、重试、fix、repair、重新分派等。
4. **address_input** — 用户正在提供收货地址信息（当系统等待地址输入时）。
5. **knowledge_query** — 用户想了解某类异常的处理模式、历史案例。关键词：有没有类似的、以前怎么处理、知识库等。
6. **teach_knowledge** — 用户想教系统学习新的异常知识/处理模式。关键词：记住、学习、记录、以后遇到...就...、这种情况应该...、告诉你一个经验等。用户在描述一个异常模式和对应的处理方法。
7. **explain** — 用户想让你解释上次的诊断结果。关键词：为什么、怎么回事、什么意思、解释一下等。
8. **conversation** — 闲聊、确认、感谢等非业务输入。如：谢谢、好的、知道了等。
9. **symptom** — 用户描述了一个异常症状但没有明确订单号。如："SKU 找不到"、"发货失败"、"库存同步异常"等。

## 实体提取规则

- order_no: 匹配 SO 开头的订单号（如 SO00523347）
- merchant_no: 匹配商户编号（通常是大写字母+数字组合，6位以上）
- sku: 匹配 SKU 编号
- error_message: 提取用户描述中的错误信息

## teach_knowledge 意图的知识提取

当识别为 teach_knowledge 时，**必须**额外提取 knowledge 字段，即使用户描述比较口语化也要尽力提取：

- domain: 从以下 24 个标准域中选择最匹配的（必填，不确定就用 UNKNOWN）：ORDER_CREATE, ORDER_DISPATCH, ORDER_UPDATE, ORDER_CANCEL, ORDER_HOLD, ORDER_WMS_SYNC, ORDER_FULFILLMENT, ORDER_DELIVERY, ORDER_RETURN, ORDER_EXCHANGE, ORDER_MERGE, ORDER_PO, ORDER_WORK_ORDER, SHIPMENT, INVENTORY_SYNC, INVENTORY_ALLOCATION, ITEM_SYNC, ITEM_PUBLISH, CHANNEL_INTEGRATION, NOTIFICATION, RATE_SHOPPING, CUSTOMS, SYSTEM, UNKNOWN
- symptom_signals: 提取症状信号关键词（必填，可以用中文或英文，至少提取 1 个）。例如用户说"订单缺少地址"→ ["shipping address missing", "地址缺失"]；用户说"SKU 找不到"→ ["SKU not found"]
- root_cause: 用户描述的根因或处理方法（必填，直接用用户的原话或稍加整理即可）
- recommended_actions: 从标准动作中选择最匹配的（可选，不确定可以留空数组 []）：RETRY_WITH_BACKOFF, RETRY_IMMEDIATE, MAP_ITEM_ID, SYNC_ITEM_MASTER, RESYNC_ORDER, RESYNC_INVENTORY, RECALCULATE_INVENTORY, REFRESH_CHANNEL_TOKEN, REPUBLISH_TO_CHANNEL, NOTIFY_MERCHANT, CANCEL_AND_RECREATE, ESCALATE_TO_ENGINEERING, ESCALATE_TO_OPS, MANUAL_DATA_FIX, CONTACT_CHANNEL_SUPPORT, REVIEW_BUSINESS_RULE, CHECK_THIRD_PARTY_STATUS

**重要**：用户用自然语言教学时，你必须尽力提取 knowledge 字段。不要因为用户没有使用标准术语就放弃提取。举例：
- 用户说"记住，更新地址的问题直接可以写数据库" → knowledge: { domain: "ORDER_DISPATCH", symptom_signals: ["shipping address missing", "地址缺失"], root_cause: "更新地址的问题直接可以写数据库", recommended_actions: ["MANUAL_DATA_FIX"] }
- 用户说"记住当订单缺少地址时，用户给出了地址后可直接操作数据库更新地址" → knowledge: { domain: "ORDER_DISPATCH", symptom_signals: ["shipping address missing", "订单缺少地址"], root_cause: "用户给出地址后可直接操作数据库更新地址", recommended_actions: ["MANUAL_DATA_FIX"] }

## 输出格式

严格输出 JSON，不要包含其他文字：
{
  "intent": "意图类型",
  "confidence": 0.0-1.0,
  "entities": { "order_no": "...", "merchant_no": "...", "sku": "...", "error_message": "..." },
  "reply": "仅 conversation/explain 意图时填写回复内容",
  "reasoning": "简要说明判断理由",
  "knowledge": { "domain": "...", "symptom_signals": [...], "root_cause": "...", "recommended_actions": [...] }
}

注意：knowledge 字段在 intent 为 teach_knowledge 时**必须填写**，且 domain、symptom_signals、root_cause 三个子字段都必须有值。`

/**
 * 调用 LLM 进行意图识别
 * 在服务端运行（API route 中调用）
 */
export async function classifyIntentWithLLM(
  context: IntentContext,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<IntentClassification> {
  const userMessage = buildUserMessage(context)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('LLM returned empty response')
  }

  const parsed = JSON.parse(content) as IntentClassification

  // 基本校验
  if (!parsed.intent || typeof parsed.confidence !== 'number') {
    throw new Error('LLM response missing required fields')
  }

  return parsed
}

function buildUserMessage(context: IntentContext): string {
  let msg = `用户输入: "${context.user_input}"\n`

  if (context.pending_address_order) {
    msg += `\n[系统状态] 当前正在等待订单 ${context.pending_address_order} 的收货地址输入。\n`
  }

  if (context.last_diagnosis_summary) {
    msg += `\n[上次诊断摘要] ${context.last_diagnosis_summary}\n`
  }

  if (context.recent_messages?.length) {
    msg += '\n[最近对话]\n'
    for (const m of context.recent_messages.slice(-5)) {
      msg += `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}\n`
    }
  }

  msg += '\n请分析用户意图并输出 JSON。'
  return msg
}
