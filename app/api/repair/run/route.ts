import { NextRequest, NextResponse } from 'next/server'
import { getRepairService } from '@/lib/repair/instance'

export async function POST(request: NextRequest) {
  try {
    const diagnosisResult = await request.json()

    if (!diagnosisResult.diagnosis_id) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少 diagnosis_id' },
        { status: 400 }
      )
    }

    const service = getRepairService()
    const result = await service.repair(diagnosisResult)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/repair/run error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '修复执行失败' },
      { status: 500 }
    )
  }
}
