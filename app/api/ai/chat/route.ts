import { NextRequest, NextResponse } from 'next/server'
import { buildChatSystemPrompt } from '@/lib/ai/chat-system-prompt'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

const BRIDGE_PATH = path.join(
  process.cwd(),
  '.kiro/skills/oms-agent/tool_bridge.py'
)

interface ChatMessage { role: 'user' | 'ai'; content: string }
interface ChatRequest { message: string; history?: ChatMessage[] }

// ─── Tool definitions ───
const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'oms_query',
      description: 'OMS 全域查询。查询订单状态、详情、发运、仓库、分仓、规则、库存、Hold、时间线等。用户提到订单号时必须调用。',
      parameters: {
        type: 'object',
        properties: {
          identifier: { type: 'string', description: '订单号(SO开头)、发运单号(SH开头)、追踪号等' },
          intent: { type: 'string', enum: ['status','shipment','warehouse','rule','inventory','hold','timeline','fulfillment','sync','integration','panorama'], default: 'panorama' },
          force_refresh: { type: 'boolean', default: false },
        },
        required: ['identifier'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_batch_query',
      description: '批量查询订单状态统计或订单列表。用户问"有多少订单""各状态数量""订单列表"时调用。',
      parameters: {
        type: 'object',
        properties: {
          query_type: { type: 'string', enum: ['status_count', 'order_list'] },
          status_filter: { type: 'integer', description: '9=待处理,10=异常,16=暂停,3=已发货' },
        },
        required: ['query_type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_warehouse_list',
      description: '查询所有仓库列表。用户问"有哪些仓库""仓库列表""仓库状态"时调用。不需要订单号。',
      parameters: {
        type: 'object',
        properties: {
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_inventory_list',
      description: '查询库存列表。用户问"库存""有多少货""SKU库存"时调用。',
      parameters: {
        type: 'object',
        properties: {
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_rule_list',
      description: '查询分仓规则配置。用户问"分仓规则""路由规则"时调用。',
      parameters: {
        type: 'object',
        properties: {
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_hold_rules',
      description: '查询 Hold（暂停履约）规则。用户问"Hold规则""暂停规则"时调用。',
      parameters: {
        type: 'object',
        properties: {
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_channel_list',
      description: '查询已连接的渠道/连接器列表。用户问"渠道""连接器""集成"时调用。',
      parameters: {
        type: 'object',
        properties: {
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_order_timeline',
      description: '查询订单时间线。用户问"订单时间线""什么时候下单/发货"时调用。',
      parameters: {
        type: 'object',
        properties: {
          order_no: { type: 'string' },
        },
        required: ['order_no'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_order_logs',
      description: '查询订单日志（含异常事件、拆单事件）。用户问"订单日志""发生了什么"时调用。',
      parameters: {
        type: 'object',
        properties: {
          order_no: { type: 'string' },
          merchant_no: { type: 'string', default: 'LAN0000002' },
        },
        required: ['order_no'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'oms_shipment_tracking',
      description: '查询订单发运和物流追踪信息。用户问"物流""快递""到哪了"时调用。',
      parameters: {
        type: 'object',
        properties: {
          order_no: { type: 'string' },
        },
        required: ['order_no'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cartonize',
      description: '装箱计算。用户提供了商品尺寸+重量+箱型+承运商限重时调用。缺少外箱尺寸/箱重/包装成本用默认值。不要手动计算，直接调用。',
      parameters: {
        type: 'object',
        properties: {
          input_json: { type: 'string', description: '装箱计算输入 JSON 字符串' },
        },
        required: ['input_json'],
      },
    },
  },
]

// ─── Execute any tool via Python bridge ───
async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const argsJson = JSON.stringify(args)
  try {
    const { stdout, stderr } = await execAsync(
      `python "${BRIDGE_PATH}" "${name}" "${argsJson.replace(/"/g, '\\"')}"`,
      {
        timeout: 30000,
        maxBuffer: 2 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      }
    )
    if (stderr && !stdout) {
      console.error(`[Tool ${name}] Error:`, stderr.slice(0, 300))
      return JSON.stringify({ error: `工具执行失败: ${stderr.slice(0, 200)}` })
    }
    return stdout || JSON.stringify({ error: '工具返回空结果' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '工具执行异常'
    console.error(`[Tool ${name}] Exception:`, msg)
    return JSON.stringify({ error: msg.slice(0, 200) })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest

    if (!body.message?.trim()) {
      return NextResponse.json({ error: '缺少消息内容' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json({ error: 'OPENAI_API_KEY 未配置' }, { status: 500 })
    }

    const model = process.env.OPENAI_CHAT_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com'
    const systemPrompt = buildChatSystemPrompt()

    const messages: Array<Record<string, unknown>> = [
      { role: 'system', content: systemPrompt },
    ]

    if (body.history?.length) {
      for (const msg of body.history.slice(-20)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })
      }
    }

    messages.push({ role: 'user', content: body.message })

    const MAX_TOOL_ROUNDS = 3
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const reqBody: Record<string, unknown> = {
        model, messages, temperature: 0.3, max_tokens: 3000,
      }
      if (round < MAX_TOOL_ROUNDS) {
        reqBody.tools = TOOLS
      }

      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(reqBody),
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('[AI Chat] LLM error:', response.status, err.slice(0, 300))
        return NextResponse.json({ error: `AI 服务异常 (${response.status})` }, { status: 502 })
      }

      const data = await response.json()
      const choice = data.choices?.[0]
      if (!choice) {
        return NextResponse.json({ error: 'AI 返回空回复' }, { status: 502 })
      }

      const assistantMessage = choice.message

      if (assistantMessage.tool_calls?.length) {
        messages.push(assistantMessage)

        for (const toolCall of assistantMessage.tool_calls) {
          const fnName = toolCall.function.name
          const fnArgs = JSON.parse(toolCall.function.arguments)
          console.log(`[AI Chat] Tool: ${fnName}`, JSON.stringify(fnArgs).slice(0, 200))

          const toolResult = await executeTool(fnName, fnArgs)
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult,
          })
        }
        continue
      }

      const content = assistantMessage.content
      if (!content) {
        return NextResponse.json({ error: 'AI 返回空回复' }, { status: 502 })
      }
      return NextResponse.json({ content })
    }

    return NextResponse.json({ error: '处理超时，请简化问题后重试' }, { status: 500 })
  } catch (err) {
    console.error('[AI Chat] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 对话失败' },
      { status: 500 }
    )
  }
}
