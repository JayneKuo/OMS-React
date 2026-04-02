import type { DomainCode, ActionCode } from './constants'

// ─── 知识原子核心 Schema ───

export interface RootCause {
  description: string       // 中文描述
  description_en: string    // 英文 OMS 术语
  probability: number       // [0.0, 1.0]
}

export interface AtomContext {
  related_modules: string[]
  related_processes: string[]
  related_rules: string[]
  state_transitions: string[]
  entry_conditions: string[]
  recovery_paths: string[]
}

export type AtomSource =
  | { type: 'knowledge_graph'; node_ids: string[] }
  | { type: 'codebase'; file_paths: string[] }
  | { type: 'document'; doc_name: string }
  | { type: 'runtime_learning'; incident_id: string }
  | { type: 'manual'; author: string }

export interface KnowledgeAtom {
  // 标识
  atom_id: string                     // "KA-{domain}-{seq}"
  version: number                     // 从 1 开始
  created_at: string                  // ISO 8601
  updated_at: string                  // ISO 8601
  source: AtomSource

  // 核心三要素
  domain: DomainCode
  symptom_signals: string[]           // 英文 OMS 术语
  likely_root_causes: RootCause[]
  recommended_actions: ActionCode[]

  // 语义上下文
  context: AtomContext

  // 元数据
  confidence: number                  // [0.0, 1.0]
  hit_count: number
  last_hit_at: string | null
  tags: string[]

  // 废弃标记
  deprecated: boolean
  deprecated_at?: string
  deprecated_reason?: string
}

// ─── 校验相关 ───

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// ─── 查询/写入结果 ───

export interface MatchResult {
  atom: KnowledgeAtom
  score: number
}

export interface QueryResult {
  atoms: KnowledgeAtom[]
  matchScores: number[]
}

export interface UpsertResult {
  atomId: string
  isNew: boolean
  version: number
}

// ─── 错误响应 ───

export interface ErrorResponse {
  error: string
  message: string
  details?: unknown
}

// ─── JSON 存储文件格式 ───

export interface KnowledgeStoreFile {
  version: number
  updated_at: string
  atoms: KnowledgeAtom[]
  metadata: {
    total_count: number
    domain_counts: Record<string, number>
  }
}
