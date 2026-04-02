import type { KnowledgeService } from '@/lib/knowledge-store/knowledge-service'
import type { ExtractedSymptom, KnowledgeMatchResult } from './types'

export class KnowledgeClient {
  constructor(private knowledgeService: KnowledgeService) {}

  async matchKnowledge(symptom: ExtractedSymptom): Promise<KnowledgeMatchResult> {
    const empty: KnowledgeMatchResult = { matched: false, atoms: [], scores: [], attempts: 0 }

    if (!symptom.symptom_text.trim()) return empty

    // 尝试 1: 带 domain_hint
    let attempts = 1
    let result = await this.knowledgeService.queryKnowledge(
      symptom.symptom_text,
      symptom.domain_hint ?? undefined,
      5
    )

    if (result.atoms.length === 0 && symptom.domain_hint) {
      // 尝试 2: 去掉 domain_hint
      attempts = 2
      result = await this.knowledgeService.queryKnowledge(symptom.symptom_text, undefined, 5)
    }

    if (result.atoms.length === 0) {
      // 尝试 3: 用实体关键词
      const entityKeywords = this.buildEntityKeywords(symptom)
      if (entityKeywords) {
        attempts = 3
        result = await this.knowledgeService.queryKnowledge(entityKeywords, undefined, 3)
      }
    }

    // 过滤 score < 0.35（低于此分数视为未匹配，交给探索性推理）
    const filtered = result.atoms
      .map((atom, i) => ({ atom, score: result.matchScores[i] }))
      .filter(r => r.score >= 0.35)

    return {
      matched: filtered.length > 0,
      atoms: filtered.map(r => ({
        atom_id: r.atom.atom_id,
        domain: r.atom.domain,
        symptom_signals: r.atom.symptom_signals,
        recommended_actions: r.atom.recommended_actions,
        confidence: r.atom.confidence,
      })),
      scores: filtered.map(r => r.score),
      attempts,
    }
  }

  private buildEntityKeywords(symptom: ExtractedSymptom): string | null {
    const parts: string[] = []
    for (const [, values] of Object.entries(symptom.extracted_entities)) {
      parts.push(...values)
    }
    return parts.length > 0 ? parts.join(' ') : null
  }
}
