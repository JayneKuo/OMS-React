import type { OrchestratorResult } from '@/lib/orchestrator/types'

/** LLM 识别出的用户意图类型 */
export type IntentType =
  | 'order_query'        // 查询特定订单异常
  | 'merchant_batch'     // 按商户批量诊断
  | 'repair_command'     // 触发修复
  | 'address_input'      // 用户提供地址信息
  | 'knowledge_query'    // 查询知识库/异常模式
  | 'teach_knowledge'    // 用户想教系统学习新知识/异常模式
  | 'explain'            // 解释上次诊断结果
  | 'conversation'       // 闲聊/确认/感谢等
  | 'symptom'            // 异常症状描述

/** LLM 意图识别结果 */
export interface IntentClassification {
  intent: IntentType
  confidence: number
  /** 提取的实体 */
  entities: {
    order_no?: string
    merchant_no?: string
    sku?: string
    error_message?: string
  }
  /** 对话类意图时的回复 */
  reply?: string
  /** LLM 对意图的简要说明 */
  reasoning?: string
  /** teach_knowledge 意图时，LLM 提取的知识结构 */
  knowledge?: {
    domain?: string
    symptom_signals?: string[]
    root_cause?: string
    recommended_actions?: string[]
  }
}

/** 发送给 LLM 的上下文 */
export interface IntentContext {
  user_input: string
  /** 上一次诊断结果摘要（如果有） */
  last_diagnosis_summary?: string
  /** 是否正在等待用户输入地址 */
  pending_address_order?: string
  /** 最近的对话历史（最多5条） */
  recent_messages?: Array<{ role: 'user' | 'ai'; content: string }>
}
