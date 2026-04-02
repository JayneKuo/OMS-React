import { NextRequest, NextResponse } from 'next/server'
import { getLearningService } from '@/lib/learning/instance'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()

    if (!report.domain || !report.symptom_signals || !report.root_cause) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少必填字段 domain, symptom_signals, root_cause' },
        { status: 400 }
      )
    }

    const service = await getLearningService()
    const result = await service.processManualReport(report)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/learning/report error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '人工报告处理失败' },
      { status: 500 }
    )
  }
}
