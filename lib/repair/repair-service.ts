import type { DiagnosisResult, RecommendedAction } from '@/lib/diagnosis/types'
import type {
  RepairResult, ActionResult, Escalation, RepairFeedback,
} from './types'
import { DESTRUCTIVE_ACTIONS, ACTION_DEPENDENCIES, ESCALATION_MAPPING } from './types'
import { ActionExecutor } from './action-executor'

const TOTAL_TIMEOUT_MS = 120_000
const SINGLE_ACTION_TIMEOUT_MS = 30_000

export class RepairService {
  private processedDiagnoses = new Map<string, RepairResult>()

  constructor(private executor: ActionExecutor) {}

  async repair(diagnosis: DiagnosisResult): Promise<RepairResult> {
    const startTime = Date.now()

    // Step 1: Handoff 验收
    const validationError = this.validateHandoff(diagnosis)
    if (validationError) {
      return this.buildSkippedResult(diagnosis, validationError)
    }

    // 幂等检查
    const existing = this.processedDiagnoses.get(diagnosis.diagnosis_id)
    if (existing) return existing

    const orderNo = diagnosis.order_context!.order_no
    const merchantNo = diagnosis.order_context!.merchant_no

    // Step 2: 动作编排
    const autoActions = diagnosis.recommended_actions
      .filter(a => a.auto_executable)
      .sort((a, b) => a.priority - b.priority)

    const manualActions = diagnosis.recommended_actions
      .filter(a => !a.auto_executable)

    // Step 3: 逐个执行
    const actionResults: ActionResult[] = []
    const failedActions = new Set<string>()

    for (const action of autoActions) {
      // 总超时检查
      if (Date.now() - startTime > TOTAL_TIMEOUT_MS) {
        actionResults.push(this.buildSkippedAction(action, 'total_timeout'))
        continue
      }

      // 依赖检查
      const depFailed = this.checkDependencyFailed(action.action_code, failedActions)
      if (depFailed) {
        actionResults.push(this.buildSkippedAction(action, `dependency_failed: ${depFailed}`))
        continue
      }

      // 破坏性动作检查
      if (DESTRUCTIVE_ACTIONS.has(action.action_code)) {
        actionResults.push({
          action_code: action.action_code,
          priority: action.priority,
          status: 'pending_confirmation',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          duration_ms: 0,
          executor: `${action.action_code}Executor`,
          retry_count: 0,
          max_retries: 0,
          skip_reason: '破坏性动作需要人工确认',
        })
        continue
      }

      // 执行
      const result = await this.executeAction(action)
      actionResults.push(result)

      if (result.status === 'failed' || result.status === 'timeout') {
        failedActions.add(action.action_code)
      }
    }

    // Step 4: 人工升级
    const escalations: Escalation[] = []

    for (const action of manualActions) {
      escalations.push(this.buildEscalation(action, orderNo, merchantNo, diagnosis))
    }

    // 失败的自动动作也升级
    for (const result of actionResults) {
      if (result.status === 'failed' && result.retry_count >= result.max_retries) {
        escalations.push({
          action_code: result.action_code,
          reason: `自动修复失败，已重试 ${result.retry_count} 次: ${result.error || '未知错误'}`,
          severity: diagnosis.severity === 'critical' ? 'critical' : 'high',
          assigned_to: 'engineering',
          context: { order_no: orderNo, diagnosis_id: diagnosis.diagnosis_id },
          created_at: new Date().toISOString(),
        })
      }
    }

    // Step 5: 结果汇总
    const overallStatus = this.judgeOverallStatus(actionResults)
    const needsConfirmation = diagnosis.overall_confidence < 0.8

    const feedback: RepairFeedback = {
      diagnosis_id: diagnosis.diagnosis_id,
      repair_id: '',
      diagnosis_was_correct: null,
      actions_effective: actionResults
        .filter(r => r.status !== 'skipped' && r.status !== 'pending_confirmation')
        .map(r => ({
          action_code: r.action_code,
          was_effective: r.status === 'success',
          order_status_before: diagnosis.order_context!.status,
          order_status_after: null,
        })),
      new_pattern_detected: false,
      is_exploratory: diagnosis.is_exploratory,
      exploratory_hypothesis: diagnosis.exploratory_hypothesis
        ? {
            proposed_domain: diagnosis.exploratory_hypothesis.proposed_domain,
            proposed_symptom_signals: diagnosis.exploratory_hypothesis.proposed_symptom_signals,
            proposed_root_cause: diagnosis.exploratory_hypothesis.proposed_root_cause,
            proposed_actions: diagnosis.exploratory_hypothesis.proposed_actions,
            auto_create_knowledge: diagnosis.exploratory_hypothesis.auto_create_knowledge,
          }
        : undefined,
    }

    const repairId = this.generateRepairId()
    feedback.repair_id = repairId

    const repairResult: RepairResult = {
      repair_id: repairId,
      diagnosis_id: diagnosis.diagnosis_id,
      repaired_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      order_no: orderNo,
      merchant_no: merchantNo,
      overall_status: overallStatus,
      action_results: actionResults,
      escalations,
      needs_confirmation: needsConfirmation,
      feedback,
    }

    this.processedDiagnoses.set(diagnosis.diagnosis_id, repairResult)
    return repairResult
  }

  // ─── 内部方法 ───

  private validateHandoff(d: DiagnosisResult): string | null {
    if (!d.diagnosis_id) return '缺少 diagnosis_id'
    if (!d.handoff_ready) return 'handoff_ready 为 false'
    if (d.overall_confidence < 0.5) return `置信度不足 (${d.overall_confidence} < 0.5)`
    if (!d.recommended_actions || d.recommended_actions.length === 0) return '无建议动作'
    if (!d.recommended_actions.some(a => a.auto_executable)) return '无自动可执行动作'
    if (!d.order_context) return '缺少订单上下文'
    if (!d.order_context.order_no) return '缺少 order_no'
    return null
  }

  private checkDependencyFailed(actionCode: string, failedActions: Set<string>): string | null {
    for (const [downstream, upstreams] of Object.entries(ACTION_DEPENDENCIES)) {
      if (actionCode === downstream) {
        const deps = upstreams.split('|')
        for (const dep of deps) {
          if (failedActions.has(dep)) return dep
        }
      }
    }
    return null
  }

  private async executeAction(action: RecommendedAction): Promise<ActionResult> {
    const maxRetries = this.getMaxRetries(action.action_code)
    const started = new Date().toISOString()
    const startMs = Date.now()

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (Date.now() - startMs > SINGLE_ACTION_TIMEOUT_MS) {
        return {
          action_code: action.action_code,
          priority: action.priority,
          status: 'timeout',
          started_at: started,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startMs,
          executor: `${action.action_code}Executor`,
          retry_count: attempt,
          max_retries: maxRetries,
          error: '单个动作超时 (30s)',
        }
      }

      const result = await this.executor.execute(action.action_code, action.parameters || {})

      if (result.success) {
        return {
          action_code: action.action_code,
          priority: action.priority,
          status: 'success',
          started_at: started,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startMs,
          executor: `${action.action_code}Executor`,
          request: action.parameters,
          response: result.response,
          retry_count: attempt,
          max_retries: maxRetries,
        }
      }

      if (attempt < maxRetries) {
        // 退避等待
        await this.backoff(attempt, action.action_code)
      }
    }

    return {
      action_code: action.action_code,
      priority: action.priority,
      status: 'failed',
      started_at: started,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startMs,
      executor: `${action.action_code}Executor`,
      retry_count: maxRetries,
      max_retries: maxRetries,
      error: '所有重试均失败',
    }
  }

  private buildSkippedAction(action: RecommendedAction, reason: string): ActionResult {
    const now = new Date().toISOString()
    return {
      action_code: action.action_code,
      priority: action.priority,
      status: 'skipped',
      started_at: now,
      completed_at: now,
      duration_ms: 0,
      executor: `${action.action_code}Executor`,
      retry_count: 0,
      max_retries: 0,
      skip_reason: reason,
    }
  }

  private buildEscalation(
    action: RecommendedAction,
    orderNo: string,
    merchantNo: string,
    diagnosis: DiagnosisResult
  ): Escalation {
    const mapping = ESCALATION_MAPPING[action.action_code] || { assigned_to: 'ops' as const, severity: 'medium' as const }
    return {
      action_code: action.action_code,
      reason: `需要人工处理: ${action.description}`,
      severity: mapping.severity,
      assigned_to: mapping.assigned_to,
      context: {
        order_no: orderNo,
        merchant_no: merchantNo,
        diagnosis_id: diagnosis.diagnosis_id,
        domain: diagnosis.domain,
      },
      created_at: new Date().toISOString(),
    }
  }

  private buildSkippedResult(diagnosis: DiagnosisResult, reason: string): RepairResult {
    const repairId = this.generateRepairId()
    return {
      repair_id: repairId,
      diagnosis_id: diagnosis.diagnosis_id || 'unknown',
      repaired_at: new Date().toISOString(),
      duration_ms: 0,
      order_no: diagnosis.order_context?.order_no || 'unknown',
      merchant_no: diagnosis.order_context?.merchant_no || 'unknown',
      overall_status: 'skipped',
      action_results: [],
      escalations: [],
      needs_confirmation: false,
      feedback: {
        diagnosis_id: diagnosis.diagnosis_id || 'unknown',
        repair_id: repairId,
        diagnosis_was_correct: null,
        actions_effective: [],
        new_pattern_detected: false,
        notes: `Handoff 验收失败: ${reason}`,
        is_exploratory: diagnosis.is_exploratory || false,
      },
    }
  }

  private judgeOverallStatus(results: ActionResult[]): RepairResult['overall_status'] {
    const executed = results.filter(r => r.status !== 'skipped' && r.status !== 'pending_confirmation')
    if (executed.length === 0) return 'skipped'
    if (executed.every(r => r.status === 'success')) return 'success'
    if (executed.every(r => r.status === 'failed' || r.status === 'timeout')) return 'failed'
    return 'partial'
  }

  private getMaxRetries(actionCode: string): number {
    const retryMap: Record<string, number> = {
      RETRY_WITH_BACKOFF: 3,
      RETRY_IMMEDIATE: 1,
      MAP_ITEM_ID: 2,
      SYNC_ITEM_MASTER: 2,
      RESYNC_ORDER: 2,
      RESYNC_INVENTORY: 1,
      RECALCULATE_INVENTORY: 2,
      REFRESH_CHANNEL_TOKEN: 2,
      REPUBLISH_TO_CHANNEL: 2,
      NOTIFY_MERCHANT: 3,
      CANCEL_AND_RECREATE: 0,
    }
    return retryMap[actionCode] ?? 1
  }

  private async backoff(attempt: number, actionCode: string): Promise<void> {
    // 原型阶段：极短等待
    const ms = Math.min(100 * Math.pow(2, attempt), 1000)
    await new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateRepairId(): string {
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const rand = Math.random().toString(36).slice(2, 6)
    return `REPAIR-${ts}-${rand}`
  }
}
