import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'
import { ValidationError } from '@/lib/knowledge-store/knowledge-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { atom, source } = body

    if (!atom || !source) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少必填参数 atom 或 source' },
        { status: 400 }
      )
    }

    const service = await getKnowledgeService()
    const result = await service.upsertAtom(atom, source)

    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: err.message, details: err.errors },
        { status: 400 }
      )
    }
    console.error('[API] /api/knowledge/upsert error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '写入失败' },
      { status: 500 }
    )
  }
}
