import { NextRequest, NextResponse } from 'next/server'
import { extractKnowledgeFromText } from '@/lib/ai/knowledge-extractor'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: '缺少文本输入' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY 未配置' }, { status: 500 })
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    const knowledge = await extractKnowledgeFromText(text, apiKey, model)

    if (!knowledge) {
      return NextResponse.json({ error: '无法从文本中提取知识结构' }, { status: 422 })
    }

    return NextResponse.json(knowledge)
  } catch (err) {
    console.error('[AI Extract Knowledge] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '知识提取失败' },
      { status: 500 }
    )
  }
}
