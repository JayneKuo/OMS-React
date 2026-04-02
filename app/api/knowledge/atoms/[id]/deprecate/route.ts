import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { reason } = body

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少必填参数 reason' },
        { status: 400 }
      )
    }

    const service = await getKnowledgeService()
    const success = await service.deprecateAtom(params.id, reason)

    if (!success) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `知识原子 ${params.id} 不存在` },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, atomId: params.id })
  } catch (err) {
    console.error('[API] /api/knowledge/atoms/[id]/deprecate error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '废弃操作失败' },
      { status: 500 }
    )
  }
}
