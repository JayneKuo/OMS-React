import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptomText, domainHint, topK } = body

    if (!symptomText || typeof symptomText !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少必填参数 symptomText' },
        { status: 400 }
      )
    }

    const service = await getKnowledgeService()
    const result = await service.queryKnowledge(symptomText, domainHint, topK)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/knowledge/query error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '查询失败' },
      { status: 500 }
    )
  }
}
