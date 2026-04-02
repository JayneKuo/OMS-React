import { NextRequest, NextResponse } from 'next/server'
import { getDiagnosisService } from '@/lib/diagnosis/instance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchant_no } = body

    if (!merchant_no) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少必填参数 merchant_no' },
        { status: 400 }
      )
    }

    const service = await getDiagnosisService()
    const results = await service.batchDiagnose(merchant_no)

    return NextResponse.json({
      merchant_no,
      total: results.length,
      results,
    })
  } catch (err) {
    console.error('[API] /api/diagnosis/batch error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '批量诊断失败' },
      { status: 500 }
    )
  }
}
