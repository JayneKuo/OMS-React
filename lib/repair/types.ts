// ─── 修复结果 ───

export interface RepairResult {
  repair_id: string
  diagnosis_id: string
  repaired_at: string
  duration_ms: number
  order_no: string
  merchant_no: string
  overall_status: 'success' | 'partial' | 'failed' | 'skipped'
  action_results: ActionResult[]
  escalations: Escalation[]
  needs_confirmation: boolean
  confirmed_by?: string
  confirmed_at?: string
  feedback: RepairFeedback
}

export interface ActionResult {
  action_code: string
  priority: number
  status: 'success' | 'failed' | 'timeout' | 'skipped' | 'pending_confirmation'
  started_at: string
  completed_at: string
  duration_ms: number
  executor: string
  request?: unknown
  response?: unknown
  error?: string
  retry_count: number
  max_retries: number
  skip_reason?: string
}

export interface Escalation {
  action_code: string
  reason: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  assigned_to: 'engineering' | 'ops' | 'merchant' | 'channel_support'
  context: Record<string, unknown>
  created_at: string
}

export interface RepairFeedback {
  diagnosis_id: string
  repair_id: string
  diagnosis_was_correct: boolean | null
  actions_effective: ActionEffectiveness[]
  new_pattern_detected: boolean
  notes?: string
  is_exploratory: boolean
  exploratory_hypothesis?: {
    proposed_domain: string
    proposed_symptom_signals: string[]
    proposed_root_cause: string
    proposed_actions: string[]
    auto_create_knowledge: boolean
  }
}

export interface ActionEffectiveness {
  action_code: string
  was_effective: boolean
  order_status_before: number
  order_status_after: number | null
}

// ─── 执行器接口 ───

export interface ExecutorResult {
  success: boolean
  response?: unknown
  error?: string
}

// ─── 动作依赖关系 ───

export const ACTION_DEPENDENCIES: Record<string, string> = {
  // 上游 → 下游: 如果上游失败，下游 skip
  RESYNC_ORDER: 'MAP_ITEM_ID|SYNC_ITEM_MASTER|RECALCULATE_INVENTORY',
  REPUBLISH_TO_CHANNEL: 'REFRESH_CHANNEL_TOKEN',
}

// ─── 破坏性动作 ───

export const DESTRUCTIVE_ACTIONS = new Set(['CANCEL_AND_RECREATE', 'MANUAL_DATA_FIX'])

// ─── 人工升级映射 ───

export const ESCALATION_MAPPING: Record<string, { assigned_to: Escalation['assigned_to']; severity: Escalation['severity'] }> = {
  ESCALATE_TO_ENGINEERING: { assigned_to: 'engineering', severity: 'high' },
  ESCALATE_TO_OPS: { assigned_to: 'ops', severity: 'medium' },
  MANUAL_DATA_FIX: { assigned_to: 'ops', severity: 'high' },
  CONTACT_CHANNEL_SUPPORT: { assigned_to: 'channel_support', severity: 'medium' },
  REVIEW_BUSINESS_RULE: { assigned_to: 'ops', severity: 'low' },
  CHECK_THIRD_PARTY_STATUS: { assigned_to: 'engineering', severity: 'medium' },
}
