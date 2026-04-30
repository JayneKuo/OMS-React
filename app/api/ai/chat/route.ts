import { NextRequest, NextResponse } from 'next/server'

const AGENTFORCE_BASE = 'https://agentforce.item.pub'
const AGENTFORCE_AGENT_ID = process.env.AGENTFORCE_AGENT_ID || ''
const AGENTFORCE_API_KEY = process.env.AGENTFORCE_API_KEY || ''

interface ChatRequest {
  message: string
  sessionId?: string | null
  /** 前端登录后获得的 OMS 凭证，首次创建会话时注入 */
  omsContext?: {
    token: string
    merchantNo: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest

    if (!body.message?.trim()) {
      return NextResponse.json({ error: '缺少消息内容' }, { status: 400 })
    }

    const agentforceBody: Record<string, unknown> = {
      message: body.message,
      stream: false,
    }

    // 传入 session_id 以支持多轮对话
    if (body.sessionId) {
      agentforceBody.session_id = body.sessionId
    }

    // 首次创建会话时，把前端的 OMS 凭证通过 env 注入给 Agent
    // AgentForce 的 env 仅在不带 session_id 创建新会话时生效
    // baseUrl 和 tenantId 是固定的，从服务端环境变量读取
    if (!body.sessionId && body.omsContext?.token) {
      agentforceBody.env = {
        OMS_TOKEN: body.omsContext.token,
        OMS_MERCHANT_NO: body.omsContext.merchantNo,
        OMS_BASE_URL: process.env.OMS_API_BASE_URL || 'https://omsv2-staging.item.com',
        OMS_TENANT_ID: process.env.OMS_TENANT_ID || 'LT',
      }
    }

    const response = await fetch(
      `${AGENTFORCE_BASE}/api/v1/open/agents/${AGENTFORCE_AGENT_ID}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AGENTFORCE_API_KEY}`,
        },
        body: JSON.stringify(agentforceBody),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('[AI Chat] AgentForce error:', response.status, errText.slice(0, 300))
      return NextResponse.json(
        { error: `AI 服务异常 (${response.status})` },
        { status: 502 }
      )
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'AI 回复失败' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      content: data.data.content || '',
      sessionId: data.data.session_id || null,
    })
  } catch (err) {
    console.error('[AI Chat] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI 对话失败' },
      { status: 500 }
    )
  }
}
