import type {
  DiagnosisInput, DiagnosisResult, ReasoningStep,
  OrderContext, ExploratoryResult,
} from './types'
import { ORDER_STATUS_MAP } from './types'
import { SymptomExtractor } from './symptom-extractor'
import { KnowledgeClient } from './knowledge-client'
import { DbEvidenceCollector } from './db-evidence-collector'
import { ExploratoryReasoner } from './exploratory-reasoner'
import { RootCauseReasoner } from './root-cause-reasoner'

export class DiagnosisService {
  constructor(
    private symptomExtractor: SymptomExtractor,
    private knowledgeClient: KnowledgeClient,
    private dbCollector: DbEvidenceCollector,
    private exploratoryReasoner: ExploratoryReasoner,
    private rootCauseReasoner: RootCauseReasoner,
  ) {}

  async diagnose(input: DiagnosisInput): Promise<DiagnosisResult> {
    const startTime = Date.now()
    const trace: ReasoningStep[] = []

    // Step 1: 症状提取
    const t1 = Date.now()
    const symptom = this.symptomExtractor.extract(input)
    trace.push({
      step: 1, name: '症状提取',
      input_summary: JSON.stringify(input).slice(0, 200),
      output_summary: `symptom_text="${symptom.symptom_text.slice(0, 100)}", domain_hint=${symptom.domain_hint}`,
      duration_ms: Date.now() - t1,
    })

    // 如果只有 order_no 没有 symptom_text，先查 order context
    let orderContext: OrderContext | null = null
    if (symptom.order_no) {
      orderContext = await this.dbCollector.collectEvidence(symptom.order_no)
      if (orderContext && !symptom.symptom_text) {
        // 从 order_msg 获取症状
        if (orderContext.recent_messages.length > 0) {
          symptom.symptom_text = orderContext.recent_messages[0].remark
        } else {
          // 没有 remark，用订单状态生成症状描述
          symptom.symptom_text = `订单 ${orderContext.order_no} 状态异常: ${orderContext.status_label}`
          if (orderContext.channel_name) {
            symptom.symptom_text += `, 渠道: ${orderContext.channel_name}`
          }
        }
        symptom.domain_hint = this.symptomExtractor.inferDomainHint(symptom.symptom_text)
      }
    }

    // Step 2: 知识匹配
    const t2 = Date.now()
    const knowledge = await this.knowledgeClient.matchKnowledge(symptom)
    trace.push({
      step: 2, name: '知识匹配',
      input_summary: `symptom_text="${symptom.symptom_text.slice(0, 80)}"`,
      output_summary: `matched=${knowledge.matched}, atoms=${knowledge.atoms.length}, attempts=${knowledge.attempts}`,
      duration_ms: Date.now() - t2,
    })

    // Step 3: 数据库取证
    const t3 = Date.now()
    if (!orderContext && symptom.order_no) {
      orderContext = await this.dbCollector.collectEvidence(symptom.order_no)
    }
    trace.push({
      step: 3, name: '数据库取证',
      input_summary: `order_no=${symptom.order_no || 'null'}`,
      output_summary: orderContext
        ? `status=${orderContext.status}(${orderContext.status_label}), dispatches=${orderContext.dispatches.length}, messages=${orderContext.recent_messages.length}`
        : 'order_context=null',
      duration_ms: Date.now() - t3,
    })

    // Step 3.5: 探索性推理（仅在知识匹配失败时）
    let exploratory: ExploratoryResult | null = null
    if (!knowledge.matched) {
      const t35 = Date.now()
      exploratory = this.exploratoryReasoner.reason(symptom, orderContext)
      trace.push({
        step: 3.5, name: '探索性推理',
        input_summary: `knowledge_match_failed=true, has_context=${!!orderContext}`,
        output_summary: `activated=${exploratory.activated}, hypotheses=${exploratory.hypotheses.length}`,
        duration_ms: Date.now() - t35,
        notes: '知识库无匹配，激活探索性推理',
      })
    }

    // Step 4: 根因推理
    const t4 = Date.now()
    const { rootCauses, domain, actions } = this.rootCauseReasoner.reason({
      knowledge, evidence: orderContext, exploratory, symptom,
    })
    const overallConfidence = rootCauses.length > 0 ? rootCauses[0].confidence : 0
    trace.push({
      step: 4, name: '根因推理',
      input_summary: `knowledge.matched=${knowledge.matched}, evidence=${!!orderContext}, exploratory=${exploratory?.activated}`,
      output_summary: `domain=${domain}, confidence=${overallConfidence.toFixed(2)}, causes=${rootCauses.length}`,
      duration_ms: Date.now() - t4,
    })

    // Step 5: 结果组装
    const t5 = Date.now()
    const severity = this.judgeSeverity(orderContext)
    const isExploratory = !knowledge.matched && (exploratory?.activated ?? false)
    const handoffReady = overallConfidence >= 0.5
      && actions.some(a => a.auto_executable)
      && orderContext !== null
    const handoffBlockedReason = !handoffReady
      ? this.buildHandoffBlockedReason(overallConfidence, actions, orderContext)
      : undefined

    const result: DiagnosisResult = {
      diagnosis_id: this.generateDiagnosisId(),
      diagnosed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      input,
      order_context: orderContext,
      root_causes: rootCauses,
      overall_confidence: overallConfidence,
      domain,
      severity,
      recommended_actions: actions,
      handoff_ready: handoffReady,
      handoff_blocked_reason: handoffBlockedReason,
      is_exploratory: isExploratory,
      exploratory_hypothesis: isExploratory ? exploratory?.hypotheses[0] : undefined,
      reasoning_trace: trace,
    }

    trace.push({
      step: 5, name: '结果组装',
      input_summary: `causes=${rootCauses.length}, actions=${actions.length}`,
      output_summary: `handoff_ready=${handoffReady}, severity=${severity}, is_exploratory=${isExploratory}`,
      duration_ms: Date.now() - t5,
    })

    return result
  }

  async batchDiagnose(merchantNo: string): Promise<DiagnosisResult[]> {
    const orders = await this.dbCollector.queryExceptionOrders(merchantNo)
    const results: DiagnosisResult[] = []

    for (const order of orders) {
      const result = await this.diagnose({
        order_no: order.order_no,
        error_message: order.latest_error ?? undefined,
        requested_by: 'system',
      })
      results.push(result)
    }

    return results
  }

  private judgeSeverity(ctx: OrderContext | null): 'critical' | 'high' | 'medium' | 'low' {
    if (!ctx) return 'medium'
    if (ctx.status === 10) return 'critical'
    if (ctx.status === 8 || ctx.status === 1) return 'medium'
    return 'low'
  }

  private generateDiagnosisId(): string {
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const rand = Math.random().toString(36).slice(2, 6)
    return `DIAG-${ts}-${rand}`
  }

  private buildHandoffBlockedReason(
    confidence: number,
    actions: Array<{ auto_executable: boolean }>,
    context: OrderContext | null
  ): string {
    const reasons: string[] = []
    if (confidence < 0.5) reasons.push(`置信度不足 (${confidence.toFixed(2)} < 0.5)`)
    if (!actions.some(a => a.auto_executable)) reasons.push('无自动可执行动作')
    if (!context) reasons.push('缺少订单上下文')
    return reasons.join('; ')
  }
}
