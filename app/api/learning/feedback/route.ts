import { NextRequest, NextResponse } from 'next/server'
import { getLearningService } from '@/lib/learning/instance'

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json()

    if (!feedback.diagnosis_id || !feedback.repair_id) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: '缺少 diagnosis_id 或 repair_id' },
        { status: 400 }
      )
    }

    const service = await getLearningService()
    const result = await service.processRepairFeedback(feedback)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/learning/feedback error:', err)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '学习处理失败' },
      { status: 500 }
    )
  }
}
