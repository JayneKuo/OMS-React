import { NextRequest, NextResponse } from 'next/server'
import { classifyIntentWithLLM } from '@/lib/ai/intent-service'
import type { IntentContext } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as IntentContext

    if (!body.user_input?.trim()) {
      return NextResponse.json(
        { error: '缺少用户输入' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY 未配置' },
        { status: 500 }
      )
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const result = await classifyIntentWithLLM(body, apiKey, model)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[AI Intent] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '意图识别失败' },
      { status: 500 }
    )
  }
}
