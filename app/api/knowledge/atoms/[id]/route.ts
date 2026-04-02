import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getKnowledgeService()
    const atom = await service.getAtom(params.id)

    if (!atom) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `知识原子 ${params.id} 不存在` },
        { status: 404 }
      )
    }

    return NextResponse.json(atom)
  } catch (err) {
    console.error('[API] /api/knowledge/atoms/[id] error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '获取失败' },
      { status: 500 }
    )
  }
}
