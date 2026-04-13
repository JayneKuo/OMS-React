import { NextRequest, NextResponse } from 'next/server'

const AGENTFORCE_BASE = 'https://agentforce.item.pub'
const AGENTFORCE_AGENT_ID = process.env.AGENTFORCE_AGENT_ID || '01744ffc-3613-4eba-bf28-3d32891b9028'
const AGENTFORCE_API_KEY = process.env.AGENTFORCE_API_KEY || 'laf_87c2fd49e3b16b11abe0eff733bd17c1'

interface ChatRequest {
  message: string
  sessionId?: string | null
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
