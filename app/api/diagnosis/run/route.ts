import { NextRequest, NextResponse } from 'next/server'
import { getDiagnosisService } from '@/lib/diagnosis/instance'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_no, channel_sales_order_no, symptom_text, error_message, requested_by } = body

    if (!order_no && !symptom_text && !error_message) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '至少提供 order_no、symptom_text 或 error_message 之一' },
        { status: 400 }
      )
    }

    const service = await getDiagnosisService()
    const result = await service.diagnose({
      order_no,
      channel_sales_order_no,
      symptom_text,
      error_message,
      requested_by: requested_by || 'user',
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/diagnosis/run error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '诊断失败' },
      { status: 500 }
    )
  }
}
