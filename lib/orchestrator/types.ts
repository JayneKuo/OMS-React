import type { DiagnosisResult } from '@/lib/diagnosis/types'
import type { RepairResult } from '@/lib/repair/types'
import type { LearningResult } from '@/lib/learning/types'

export interface OrchestratorInput {
  order_no?: string
  error_message?: string
  symptom_text?: string
  merchant_no?: string          // 批量模式
  requested_by?: 'user' | 'system' | 'scheduler'
  auto_repair?: boolean         // 默认 true，false 则只诊断不修复
}

export interface OrchestratorResult {
  run_id: string
  mode: 'single' | 'batch'
  started_at: string
  completed_at: string
  duration_ms: number
  results: PipelineResult[]
  summary: {
    total: number
    diagnosed: number
    repaired: number
    learned: number
    failed: number
  }
}

export interface PipelineResult {
  order_no: string | null
  stage_reached: 'diagnosis' | 'repair' | 'learning' | 'error'
  diagnosis: DiagnosisResult | null
  repair: RepairResult | null
  learning: LearningResult | null
  error?: string
  /** 当诊断发现需要用户提供额外信息（如地址）时为 true，此时不执行修复 */
  needs_user_input?: boolean
  /** 需要用户提供的输入类型 */
  user_input_type?: 'address' | 'confirmation'
}
