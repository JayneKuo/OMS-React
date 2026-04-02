// ─── 学习事件 ───

export type LearningEventType =
  | 'confidence_increase'
  | 'confidence_decrease'
  | 'new_atom_created'
  | 'atom_merged'
  | 'atom_deprecated'
  | 'action_weight_adjusted'
  | 'symptom_signal_added'

export interface KnowledgeChange {
  field: string
  old_value: unknown
  new_value: unknown
}

export interface LearningEvent {
  event_id: string
  created_at: string
  source_type: 'repair_feedback' | 'manual_report' | 'pattern_accumulation' | 'exploratory_verified' | 'human_intervention_observed'
  repair_id?: string
  diagnosis_id?: string
  event_type: LearningEventType
  target_atom_id?: string
  changes: KnowledgeChange[]
  reason: string
  evidence_summary: string
}

// ─── 模式累积缓冲区 ───

export interface PatternBuffer {
  buffer_id: string
  symptom_signals: string[]
  domain_hint: string | null
  proposed_root_cause: string | null
  proposed_actions: string[]
  occurrence_count: number
  first_seen: string
  last_seen: string
  related_feedback_ids: string[]
  threshold: number
  status: 'accumulating' | 'ready' | 'created' | 'discarded'
}

// ─── RepairFeedback (从 repair 模块导入的类型) ───

export interface RepairFeedbackInput {
  diagnosis_id: string
  repair_id: string
  diagnosis_was_correct: boolean | null
  actions_effective: Array<{
    action_code: string
    was_effective: boolean
    order_status_before: number
    order_status_after: number | null
  }>
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

// ─── 学习结果 ───

export interface LearningResult {
  events: LearningEvent[]
  atoms_updated: number
  atoms_created: number
  atoms_deprecated: number
  patterns_buffered: number
}
