import type { KnowledgeService } from '@/lib/knowledge-store/knowledge-service'
import type {
  RepairFeedbackInput, LearningEvent, LearningResult,
  PatternBuffer, KnowledgeChange,
} from './types'

const CONFIDENCE_INCREASE = 0.05
const CONFIDENCE_DECREASE = 0.10
const MAX_CONFIDENCE = 0.99
const MIN_CONFIDENCE = 0.10
const EXPLORATORY_INITIAL_CONFIDENCE = 0.6
const DEFAULT_INITIAL_CONFIDENCE = 0.5

export class LearningService {
  private patternBuffers: Map<string, PatternBuffer> = new Map()
  private eventLog: LearningEvent[] = []

  constructor(private knowledgeService: KnowledgeService) {}

  async processRepairFeedback(feedback: RepairFeedbackInput): Promise<LearningResult> {
    const events: LearningEvent[] = []
    let atomsUpdated = 0
    let atomsCreated = 0
    let atomsDeprecated = 0
    let patternsBuffered = 0

    // 快速通道: 探索性推理 + 修复成功 → 直接入库
    if (feedback.is_exploratory && feedback.exploratory_hypothesis) {
      const hasEffective = feedback.actions_effective.some(a => a.was_effective)
      const statusChanged = feedback.actions_effective.some(
        a => a.order_status_after !== null && a.order_status_after !== a.order_status_before
      )

      if (hasEffective || statusChanged) {
        const event = await this.createFromExploratory(feedback)
        if (event) {
          events.push(event)
          atomsCreated++
        }
      } else {
        // 探索性推理修复失败 → PatternBuffer (threshold=2)
        this.addToPatternBuffer(
          feedback.exploratory_hypothesis.proposed_symptom_signals,
          feedback.exploratory_hypothesis.proposed_domain,
          feedback.exploratory_hypothesis.proposed_root_cause,
          feedback.exploratory_hypothesis.proposed_actions,
          feedback.repair_id,
          2
        )
        patternsBuffered++
      }
    }

    // 通道 A: 常规修复反馈 → 调整置信度
    if (feedback.diagnosis_was_correct === true) {
      // 正向反馈: confidence +0.05
      const event = await this.adjustConfidence(feedback, CONFIDENCE_INCREASE, '诊断正确，修复成功')
      if (event) {
        events.push(event)
        atomsUpdated++
      }
    } else if (feedback.diagnosis_was_correct === false) {
      // 负向反馈: confidence -0.10
      const event = await this.adjustConfidence(feedback, -CONFIDENCE_DECREASE, '诊断错误')
      if (event) {
        events.push(event)
        atomsUpdated++
      }
    }

    // 检查 PatternBuffer 是否有达标的
    const readyBuffers = this.getReadyBuffers()
    for (const buffer of readyBuffers) {
      const event = await this.createFromBuffer(buffer)
      if (event) {
        events.push(event)
        atomsCreated++
      }
    }

    this.eventLog.push(...events)

    return {
      events,
      atoms_updated: atomsUpdated,
      atoms_created: atomsCreated,
      atoms_deprecated: atomsDeprecated,
      patterns_buffered: patternsBuffered,
    }
  }

  async processManualReport(report: {
    domain: string
    symptom_signals: string[]
    root_cause: string
    actions: string[]
    author: string
  }): Promise<LearningResult> {
    const events: LearningEvent[] = []

    try {
      const result = await this.knowledgeService.upsertAtom(
        {
          domain: report.domain as Parameters<typeof this.knowledgeService.upsertAtom>[0]['domain'],
          symptom_signals: report.symptom_signals,
          likely_root_causes: [{
            description: report.root_cause,
            description_en: report.root_cause,
            probability: 0.5,
          }],
          recommended_actions: report.actions as Parameters<typeof this.knowledgeService.upsertAtom>[0]['recommended_actions'],
          confidence: DEFAULT_INITIAL_CONFIDENCE,
        },
        { type: 'manual', author: report.author }
      )

      events.push(this.createEvent(
        'manual_report',
        result.isNew ? 'new_atom_created' : 'atom_merged',
        result.atomId,
        `人工报告: ${report.root_cause}`,
        `domain=${report.domain}, signals=${report.symptom_signals.length}`,
        [{ field: 'atom_id', old_value: null, new_value: result.atomId }]
      ))
    } catch (err) {
      console.error('[Learning] Manual report processing failed:', err)
    }

    this.eventLog.push(...events)
    return {
      events,
      atoms_updated: 0,
      atoms_created: events.length,
      atoms_deprecated: 0,
      patterns_buffered: 0,
    }
  }

  getEventLog(): LearningEvent[] {
    return [...this.eventLog]
  }

  getPatternBuffers(): PatternBuffer[] {
    return Array.from(this.patternBuffers.values())
  }

  // ─── 内部方法 ───

  private async createFromExploratory(feedback: RepairFeedbackInput): Promise<LearningEvent | null> {
    const hyp = feedback.exploratory_hypothesis!
    const effectiveActions = feedback.actions_effective
      .filter(a => a.was_effective)
      .map(a => a.action_code)
    const actions = effectiveActions.length > 0 ? effectiveActions : hyp.proposed_actions

    try {
      const result = await this.knowledgeService.upsertAtom(
        {
          domain: hyp.proposed_domain as Parameters<typeof this.knowledgeService.upsertAtom>[0]['domain'],
          symptom_signals: hyp.proposed_symptom_signals,
          likely_root_causes: [{
            description: hyp.proposed_root_cause,
            description_en: hyp.proposed_root_cause,
            probability: 0.6,
          }],
          recommended_actions: actions as Parameters<typeof this.knowledgeService.upsertAtom>[0]['recommended_actions'],
          confidence: EXPLORATORY_INITIAL_CONFIDENCE,
        },
        { type: 'runtime_learning', incident_id: feedback.diagnosis_id }
      )

      return this.createEvent(
        'exploratory_verified',
        result.isNew ? 'new_atom_created' : 'atom_merged',
        result.atomId,
        `探索性推理验证成功: ${hyp.proposed_root_cause}`,
        `diagnosis_id=${feedback.diagnosis_id}, repair_id=${feedback.repair_id}`,
        [{ field: 'atom_id', old_value: null, new_value: result.atomId }],
        feedback.repair_id,
        feedback.diagnosis_id
      )
    } catch (err) {
      console.error('[Learning] Exploratory knowledge creation failed:', err)
      return null
    }
  }

  private async adjustConfidence(
    feedback: RepairFeedbackInput,
    delta: number,
    reason: string
  ): Promise<LearningEvent | null> {
    // 尝试从 diagnosis_id 推断关联的知识原子
    // 原型阶段：简化处理，不做精确关联
    // 生产阶段：DiagnosisResult 中应携带 matched_knowledge_atom_id
    return null // 原型阶段跳过，需要诊断结果中携带 atom_id
  }

  private addToPatternBuffer(
    signals: string[],
    domain: string | null,
    rootCause: string | null,
    actions: string[],
    feedbackId: string,
    threshold = 3
  ): void {
    // 查找相似的 buffer
    for (const [, buffer] of this.patternBuffers) {
      if (buffer.status !== 'accumulating') continue
      const overlap = this.jaccardSimilarity(buffer.symptom_signals, signals)
      if (overlap > 0.6) {
        buffer.occurrence_count++
        buffer.last_seen = new Date().toISOString()
        buffer.related_feedback_ids.push(feedbackId)
        // 合并新信号
        for (const s of signals) {
          if (!buffer.symptom_signals.includes(s)) buffer.symptom_signals.push(s)
        }
        if (buffer.occurrence_count >= buffer.threshold) {
          buffer.status = 'ready'
        }
        return
      }
    }

    // 创建新 buffer
    const bufferId = `BUF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    this.patternBuffers.set(bufferId, {
      buffer_id: bufferId,
      symptom_signals: [...signals],
      domain_hint: domain,
      proposed_root_cause: rootCause,
      proposed_actions: actions,
      occurrence_count: 1,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      related_feedback_ids: [feedbackId],
      threshold,
      status: 'accumulating',
    })
  }

  private getReadyBuffers(): PatternBuffer[] {
    return Array.from(this.patternBuffers.values()).filter(b => b.status === 'ready')
  }

  private async createFromBuffer(buffer: PatternBuffer): Promise<LearningEvent | null> {
    try {
      const domain = (buffer.domain_hint || 'UNKNOWN') as Parameters<typeof this.knowledgeService.upsertAtom>[0]['domain']
      const result = await this.knowledgeService.upsertAtom(
        {
          domain,
          symptom_signals: buffer.symptom_signals,
          likely_root_causes: buffer.proposed_root_cause
            ? [{ description: buffer.proposed_root_cause, description_en: buffer.proposed_root_cause, probability: 0.5 }]
            : [],
          recommended_actions: buffer.proposed_actions as Parameters<typeof this.knowledgeService.upsertAtom>[0]['recommended_actions'],
          confidence: DEFAULT_INITIAL_CONFIDENCE,
        },
        { type: 'runtime_learning', incident_id: buffer.related_feedback_ids[0] }
      )

      buffer.status = 'created'

      return this.createEvent(
        'pattern_accumulation',
        'new_atom_created',
        result.atomId,
        `模式累积达标 (${buffer.occurrence_count}/${buffer.threshold}): ${buffer.symptom_signals.join(', ')}`,
        `buffer_id=${buffer.buffer_id}, feedbacks=${buffer.related_feedback_ids.length}`,
        [{ field: 'atom_id', old_value: null, new_value: result.atomId }]
      )
    } catch (err) {
      console.error('[Learning] Buffer knowledge creation failed:', err)
      return null
    }
  }

  private createEvent(
    sourceType: LearningEvent['source_type'],
    eventType: LearningEvent['event_type'],
    atomId: string | undefined,
    reason: string,
    evidenceSummary: string,
    changes: KnowledgeChange[],
    repairId?: string,
    diagnosisId?: string
  ): LearningEvent {
    return {
      event_id: `LEARN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      source_type: sourceType,
      repair_id: repairId,
      diagnosis_id: diagnosisId,
      event_type: eventType,
      target_atom_id: atomId,
      changes,
      reason,
      evidence_summary: evidenceSummary,
    }
  }

  private jaccardSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a.map(s => s.toLowerCase()))
    const setB = new Set(b.map(s => s.toLowerCase()))
    let intersection = 0
    for (const s of setA) { if (setB.has(s)) intersection++ }
    const union = setA.size + setB.size - intersection
    return union === 0 ? 0 : intersection / union
  }
}
