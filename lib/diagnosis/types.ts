// ─── 诊断输入 ───

export interface DiagnosisInput {
  order_no?: string
  channel_sales_order_no?: string
  symptom_text?: string
  error_message?: string
  requested_by: 'user' | 'system' | 'scheduler'
}

// ─── 症状提取结果 ───

export interface ExtractedSymptom {
  order_no: string | null
  symptom_text: string
  extracted_entities: Record<string, string[]>
  domain_hint: string | null
}

// ─── 订单上下文 ───

export interface OrderContext {
  order_no: string
  channel_sales_order_no: string | null
  merchant_no: string
  channel_name: string | null
  status: number
  status_label: string
  order_type: number
  create_time: string
  accounting_code: string | null
  dispatches: DispatchInfo[]
  recent_messages: OrderMessage[]
  items: OrderItemInfo[]
}

export interface DispatchInfo {
  dispatch_no: string
  status: number
  accounting_code: string | null
  warehouse_name: string | null
  send_kafka: number
  shipment_no: string | null
  shipment_status: number | null
  tracking_number: string | null
}

export interface OrderMessage {
  remark: string
  type: number
  create_time: string
}

export interface OrderItemInfo {
  sku: string
  qty: number
  title: string | null
  reference_no: string | null
}

// ─── 知识匹配结果 ───

export interface KnowledgeMatchResult {
  matched: boolean
  atoms: Array<{ atom_id: string; domain: string; symptom_signals: string[]; recommended_actions: string[]; confidence: number }>
  scores: number[]
  attempts: number
}

// ─── 根因 ───

export interface Evidence {
  source: 'knowledge_base' | 'database' | 'symptom_text' | 'exploratory_reasoning'
  description: string
  raw_data?: unknown
}

export interface RootCause {
  cause_id: string
  cause_code: string
  cause_description: string
  confidence: number
  evidence: Evidence[]
  matched_knowledge_atom?: string
  match_score?: number
}

// ─── 建议动作 ───

export interface RecommendedAction {
  action_code: string
  priority: number
  description: string
  auto_executable: boolean
  parameters?: Record<string, unknown>
  estimated_success_rate?: number
}

// ─── 推理痕迹 ───

export interface ReasoningStep {
  step: number
  name: string
  input_summary: string
  output_summary: string
  duration_ms: number
  notes?: string
}

// ─── 探索性假设 ───

export interface ExploratoryHypothesis {
  reasoning_method: 'llm_chain_of_thought' | 'rule_based_fallback'
  reasoning_input: {
    symptom_text: string
    order_context_summary: string
    domain_model_used: string[]
  }
  proposed_domain: string
  proposed_symptom_signals: string[]
  proposed_root_cause: string
  proposed_actions: string[]
  needs_verification: boolean
  auto_create_knowledge: boolean
}

export interface ExploratoryResult {
  activated: boolean
  hypotheses: ExploratoryHypothesis[]
  reasoning_method: 'rule_based_fallback' | 'llm_chain_of_thought'
}

// ─── 诊断结果 ───

export interface DiagnosisResult {
  diagnosis_id: string
  diagnosed_at: string
  duration_ms: number
  input: DiagnosisInput
  order_context: OrderContext | null
  root_causes: RootCause[]
  overall_confidence: number
  domain: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  recommended_actions: RecommendedAction[]
  handoff_ready: boolean
  handoff_blocked_reason?: string
  is_exploratory: boolean
  exploratory_hypothesis?: ExploratoryHypothesis
  reasoning_trace: ReasoningStep[]
}

// ─── 状态映射 ───

export const ORDER_STATUS_MAP: Record<number, string> = {
  0: 'New',
  1: 'Allocated',
  2: 'Processing',
  3: 'Shipped',
  5: 'Cancelled',
  7: 'Delivered',
  8: 'OnHold',
  9: 'Pending',
  10: 'Exception',
}

// ─── 自动可执行动作列表 ───

export const AUTO_EXECUTABLE_ACTIONS = new Set([
  'RETRY_WITH_BACKOFF', 'RETRY_IMMEDIATE', 'MAP_ITEM_ID',
  'SYNC_ITEM_MASTER', 'RESYNC_ORDER', 'RESYNC_INVENTORY',
  'RECALCULATE_INVENTORY', 'REFRESH_CHANNEL_TOKEN',
  'REPUBLISH_TO_CHANNEL', 'NOTIFY_MERCHANT', 'CANCEL_AND_RECREATE',
  'MANUAL_DATA_FIX',
])
