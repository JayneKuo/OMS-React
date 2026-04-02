import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeLowConfidence = searchParams.get('include_low_confidence') === 'true'

    const service = await getKnowledgeService()
    const atoms = await service.listByDomain(params.domain, includeLowConfidence)

    return NextResponse.json({ domain: params.domain, atoms, count: atoms.length })
  } catch (err) {
    console.error('[API] /api/knowledge/domains/[domain] error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '列举失败' },
      { status: 500 }
    )
  }
}
