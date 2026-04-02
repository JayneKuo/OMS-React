import type {
  KnowledgeMatchResult, OrderContext, ExploratoryResult,
  ExtractedSymptom, RootCause, Evidence, RecommendedAction,
} from './types'
import { AUTO_EXECUTABLE_ACTIONS } from './types'

// 动作描述映射
const ACTION_DESCRIPTIONS: Record<string, string> = {
  RETRY_WITH_BACKOFF: '指数退避重试',
  RETRY_IMMEDIATE: '立即重试',
  MAP_ITEM_ID: '建立 OMS-WMS 商品映射',
  SYNC_ITEM_MASTER: '同步 Item Master 到 WMS',
  RESYNC_ORDER: '重新推送订单到 WMS',
  RESYNC_INVENTORY: '重新同步库存',
  RECALCULATE_INVENTORY: '重新计算可用库存',
  REFRESH_CHANNEL_TOKEN: '刷新渠道 API 授权',
  REPUBLISH_TO_CHANNEL: '重新发布商品到渠道',
  NOTIFY_MERCHANT: '通知商户',
  CANCEL_AND_RECREATE: '取消并重建订单',
  ESCALATE_TO_ENGINEERING: '升级到工程团队',
  ESCALATE_TO_OPS: '升级到运营团队',
  MANUAL_DATA_FIX: '手动修数据',
  CONTACT_CHANNEL_SUPPORT: '联系渠道方客服',
  REVIEW_BUSINESS_RULE: '审查业务规则',
  CHECK_THIRD_PARTY_STATUS: '检查第三方服务状态',
}

export class RootCauseReasoner {
  reason(params: {
    knowledge: KnowledgeMatchResult
    evidence: OrderContext | null
    exploratory: ExploratoryResult | null
    symptom: ExtractedSymptom
  }): { rootCauses: RootCause[]; domain: string; actions: RecommendedAction[] } {
    const { knowledge, evidence, exploratory, symptom } = params

    if (knowledge.matched && evidence) {
      return this.scenarioA(knowledge, evidence, symptom)
    }
    if (knowledge.matched && !evidence) {
      return this.scenarioB(knowledge, symptom)
    }
    if (!knowledge.matched && evidence && exploratory?.activated) {
      return this.scenarioC(exploratory, evidence, symptom)
    }
    if (!knowledge.matched && exploratory?.activated) {
      return this.scenarioC(exploratory, evidence, symptom)
    }
    return this.scenarioD(symptom)
  }

  // 场景 A: 知识匹配成功 + 数据库证据充分
  private scenarioA(knowledge: KnowledgeMatchResult, evidence: OrderContext, symptom: ExtractedSymptom) {
    const rootCauses: RootCause[] = []
    const allActions: string[] = []

    for (let i = 0; i < Math.min(knowledge.atoms.length, 3); i++) {
      const atom = knowledge.atoms[i]
      const score = knowledge.scores[i]
      let confidence = score

      // 调整因子
      const evidenceList: Evidence[] = [
        { source: 'knowledge_base', description: `知识匹配 score=${score.toFixed(2)}` },
      ]

      // remark 精确匹配
      if (evidence.recent_messages.some(m =>
        atom.symptom_signals.some(s => m.remark.toLowerCase().includes(s.toLowerCase()))
      )) {
        confidence += 0.15
        evidenceList.push({ source: 'database', description: 'order_msg remark 与症状信号精确匹配' })
      }

      // domain 一致
      if (atom.domain === symptom.domain_hint) {
        confidence += 0.05
      }

      // 状态一致性
      if (evidence.status === 10) {
        confidence += 0.10
        evidenceList.push({ source: 'database', description: `订单状态为 Exception (${evidence.status})` })
      }

      confidence = clamp(confidence * atom.confidence, 0, 1)

      rootCauses.push({
        cause_id: atom.atom_id,
        cause_code: atom.domain,
        cause_description: `知识匹配: ${atom.symptom_signals.join(', ')}`,
        confidence,
        evidence: evidenceList,
        matched_knowledge_atom: atom.atom_id,
        match_score: score,
      })

      allActions.push(...atom.recommended_actions)
    }

    rootCauses.sort((a, b) => b.confidence - a.confidence)
    const domain = rootCauses[0]?.cause_code || 'UNKNOWN'
    const actions = this.buildActions(allActions, evidence, rootCauses)

    return { rootCauses, domain, actions }
  }

  // 场景 B: 知识匹配成功 + 无数据库证据
  private scenarioB(knowledge: KnowledgeMatchResult, symptom: ExtractedSymptom) {
    const rootCauses: RootCause[] = []
    const allActions: string[] = []

    for (let i = 0; i < Math.min(knowledge.atoms.length, 3); i++) {
      const atom = knowledge.atoms[i]
      const score = knowledge.scores[i]
      const confidence = clamp(score * atom.confidence * 0.7, 0, 1)

      rootCauses.push({
        cause_id: atom.atom_id,
        cause_code: atom.domain,
        cause_description: `知识匹配 (无数据库佐证): ${atom.symptom_signals.join(', ')}`,
        confidence,
        evidence: [
          { source: 'knowledge_base', description: `知识匹配 score=${score.toFixed(2)}, 无数据库证据打折` },
        ],
        matched_knowledge_atom: atom.atom_id,
        match_score: score,
      })

      allActions.push(...atom.recommended_actions)
    }

    rootCauses.sort((a, b) => b.confidence - a.confidence)
    const domain = rootCauses[0]?.cause_code || 'UNKNOWN'
    const actions = this.buildActions(allActions, null, rootCauses)

    return { rootCauses, domain, actions }
  }

  // 场景 C: 知识匹配失败 + 探索性推理
  private scenarioC(exploratory: ExploratoryResult, evidence: OrderContext | null, symptom: ExtractedSymptom) {
    const rootCauses: RootCause[] = []
    const allActions: string[] = []

    for (const hyp of exploratory.hypotheses) {
      let confidence = evidence ? 0.55 : 0.30
      if (hyp.reasoning_method === 'rule_based_fallback' && evidence) {
        confidence = 0.60
      }

      rootCauses.push({
        cause_id: `exploratory-${Date.now()}`,
        cause_code: hyp.proposed_domain,
        cause_description: `探索性推理: ${hyp.proposed_root_cause}`,
        confidence,
        evidence: [
          { source: 'exploratory_reasoning', description: `${hyp.reasoning_method}: ${hyp.proposed_root_cause}` },
          ...(evidence ? [{ source: 'database' as const, description: `订单状态: ${evidence.status_label}` }] : []),
        ],
      })

      allActions.push(...hyp.proposed_actions)
    }

    rootCauses.sort((a, b) => b.confidence - a.confidence)
    const domain = rootCauses[0]?.cause_code || 'UNKNOWN'
    const actions = this.buildActions(allActions, evidence, rootCauses)

    return { rootCauses, domain, actions }
  }

  // 场景 D: 全部失败
  private scenarioD(symptom: ExtractedSymptom) {
    return {
      rootCauses: [{
        cause_id: 'unknown',
        cause_code: 'UNKNOWN',
        cause_description: '无法确定根因，证据不足',
        confidence: 0.15,
        evidence: [{ source: 'symptom_text' as const, description: symptom.symptom_text || '无症状信息' }],
      }],
      domain: 'UNKNOWN',
      actions: [{
        action_code: 'ESCALATE_TO_OPS',
        priority: 1,
        description: '升级到运营团队',
        auto_executable: false,
      }],
    }
  }

  private buildActions(actionCodes: string[], evidence: OrderContext | null, rootCauses?: RootCause[]): RecommendedAction[] {
    const unique = [...new Set(actionCodes)]
    const topCause = rootCauses?.[0]
    const actions: RecommendedAction[] = unique.map((code, i) => {
      const baseParams: Record<string, unknown> = evidence
        ? { order_no: evidence.order_no, merchant_no: evidence.merchant_no }
        : {}

      // MANUAL_DATA_FIX 需要额外的上下文来决定具体修复操作
      if (code === 'MANUAL_DATA_FIX' && topCause) {
        baseParams.domain = topCause.cause_code
        baseParams.root_cause = topCause.cause_description
      }

      return {
        action_code: code,
        priority: i + 1,
        description: ACTION_DESCRIPTIONS[code] || code,
        auto_executable: AUTO_EXECUTABLE_ACTIONS.has(code),
        parameters: Object.keys(baseParams).length > 0 ? baseParams : undefined,
      }
    })

    // auto_executable 优先
    actions.sort((a, b) => {
      if (a.auto_executable !== b.auto_executable) return a.auto_executable ? -1 : 1
      return a.priority - b.priority
    })

    // 重新编号
    actions.forEach((a, i) => { a.priority = i + 1 })
    return actions
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
