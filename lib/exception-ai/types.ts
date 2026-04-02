import type { OrchestratorResult } from '@/lib/orchestrator/types'

/** 历史记录条目 */
export interface HistoryRecord {
  id: string                        // 使用 run_id
  timestamp: string                 // ISO 时间戳
  inputSummary: string              // 输入摘要（前50字符）
  mode: 'single' | 'batch'
  overallStatus: 'success' | 'partial' | 'failed' | 'error'
  result: OrchestratorResult        // 完整结果快照
}

/** API 错误 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** 面板状态 */
export type PanelStatus = 'idle' | 'loading' | 'success' | 'error'
