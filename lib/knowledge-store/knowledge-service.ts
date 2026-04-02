import type { KnowledgeAtom, QueryResult, UpsertResult, AtomSource } from './types'
import type { DomainCode, ActionCode } from './constants'
import type { KnowledgeRepository } from './repository/interface'
import type { SchemaValidator } from './schema-validator'
import type { SemanticMatcher } from './semantic-matcher'
import { SeedLoader } from './seed-loader'

const DEFAULT_TOP_K = 5
const MERGE_THRESHOLD = 0.85
const LOW_CONFIDENCE_THRESHOLD = 0.3

export class KnowledgeService {
  constructor(
    private repository: KnowledgeRepository,
    private validator: SchemaValidator,
    private matcher: SemanticMatcher,
    private seedFilePath?: string
  ) {}

  // ─── 读接口 ───

  async queryKnowledge(
    symptomText: string,
    domainHint?: string,
    topK: number = DEFAULT_TOP_K
  ): Promise<QueryResult> {
    if (!symptomText.trim()) {
      return { atoms: [], matchScores: [] }
    }

    let candidates = domainHint
      ? await this.repository.getAtomsByDomain(domainHint)
      : await this.repository.getAllAtoms()

    // 排除 deprecated
    candidates = candidates.filter(a => !a.deprecated)

    const matchResults = this.matcher.computeMatchScores(symptomText, candidates)

    // 按 confidence × matchScore 综合排序
    const sorted = matchResults
      .map(r => ({
        atom: r.atom,
        matchScore: r.score,
        compositeScore: r.atom.confidence * r.score,
      }))
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, topK)

    // 更新命中统计
    const now = new Date().toISOString()
    for (const item of sorted) {
      const updated = {
        ...item.atom,
        hit_count: item.atom.hit_count + 1,
        last_hit_at: now,
      }
      await this.repository.updateAtom(updated)
      item.atom = updated
    }

    return {
      atoms: sorted.map(s => s.atom),
      matchScores: sorted.map(s => s.matchScore),
    }
  }

  async getAtom(atomId: string): Promise<KnowledgeAtom | null> {
    return this.repository.getAtomById(atomId)
  }

  async listByDomain(
    domain: string,
    includeLowConfidence = false
  ): Promise<KnowledgeAtom[]> {
    const atoms = await this.repository.getAtomsByDomain(domain)
    // 默认过滤 deprecated（repository 已处理）和低置信度
    if (includeLowConfidence) {
      return atoms
    }
    return atoms.filter(a => a.confidence >= LOW_CONFIDENCE_THRESHOLD)
  }

  // ─── 写接口 ───

  async upsertAtom(
    atom: Partial<KnowledgeAtom>,
    source: AtomSource
  ): Promise<UpsertResult> {
    // Schema 校验
    const validation = this.validator.validate(atom)
    if (!validation.valid) {
      throw new ValidationError('Schema 校验失败', validation.errors)
    }

    const domain = atom.domain as DomainCode

    // 语义去重
    const existingAtoms = await this.repository.getAtomsByDomain(domain, true)
    const similar = this.matcher.findSimilar(
      atom.symptom_signals!,
      existingAtoms,
      MERGE_THRESHOLD
    )

    if (similar) {
      // 合并到已有原子
      const merged = this.mergeAtoms(similar, atom, source)
      await this.repository.updateAtom(merged)
      return {
        atomId: merged.atom_id,
        isNew: false,
        version: merged.version,
      }
    }

    // 新建原子
    const atomId = await this.generateAtomId(domain)
    const now = new Date().toISOString()
    const newAtom: KnowledgeAtom = {
      atom_id: atomId,
      version: 1,
      created_at: now,
      updated_at: now,
      source,
      domain,
      symptom_signals: atom.symptom_signals!,
      likely_root_causes: atom.likely_root_causes || [],
      recommended_actions: (atom.recommended_actions || []) as ActionCode[],
      context: atom.context || {
        related_modules: [],
        related_processes: [],
        related_rules: [],
        state_transitions: [],
        entry_conditions: [],
        recovery_paths: [],
      },
      confidence: atom.confidence ?? 0.5,
      hit_count: 0,
      last_hit_at: null,
      tags: atom.tags || [],
      deprecated: false,
    }

    await this.repository.createAtom(newAtom)
    return {
      atomId,
      isNew: true,
      version: 1,
    }
  }

  async deprecateAtom(atomId: string, reason: string): Promise<boolean> {
    const atom = await this.repository.getAtomById(atomId)
    if (!atom) return false

    const updated: KnowledgeAtom = {
      ...atom,
      deprecated: true,
      deprecated_at: new Date().toISOString(),
      deprecated_reason: reason,
      updated_at: new Date().toISOString(),
    }
    await this.repository.updateAtom(updated)
    return true
  }

  // ─── 初始化 ───

  async initializeSeedKnowledge(): Promise<{ loaded: number; errors: string[] }> {
    if (!this.seedFilePath) {
      return { loaded: 0, errors: ['未配置种子知识文件路径'] }
    }
    return SeedLoader.loadSeeds(this.repository, this.seedFilePath)
  }

  // ─── 内部方法 ───

  private mergeAtoms(
    existing: KnowledgeAtom,
    incoming: Partial<KnowledgeAtom>,
    source: AtomSource
  ): KnowledgeAtom {
    // 合并 root_causes（去重 by description_en）
    const existingCauseKeys = new Set(existing.likely_root_causes.map(c => c.description_en))
    const newCauses = (incoming.likely_root_causes || []).filter(
      c => !existingCauseKeys.has(c.description_en)
    )

    // 合并 actions（去重）
    const existingActions = new Set(existing.recommended_actions)
    const newActions = (incoming.recommended_actions || []).filter(
      a => !existingActions.has(a as ActionCode)
    ) as ActionCode[]

    // 合并 symptom_signals（去重）
    const existingSignals = new Set(existing.symptom_signals)
    const newSignals = (incoming.symptom_signals || []).filter(
      s => !existingSignals.has(s)
    )

    return {
      ...existing,
      symptom_signals: [...existing.symptom_signals, ...newSignals],
      likely_root_causes: [...existing.likely_root_causes, ...newCauses],
      recommended_actions: [...existing.recommended_actions, ...newActions],
      confidence: Math.max(existing.confidence, incoming.confidence ?? 0),
      version: existing.version + 1,
      updated_at: new Date().toISOString(),
      source, // 更新为最新来源
    }
  }

  private async generateAtomId(domain: DomainCode): Promise<string> {
    const existing = await this.repository.getAtomsByDomain(domain, true)
    let maxSeq = 0
    for (const atom of existing) {
      const match = atom.atom_id.match(/(\d+)$/)
      if (match) {
        const seq = parseInt(match[1], 10)
        if (seq > maxSeq) maxSeq = seq
      }
    }
    const nextSeq = String(maxSeq + 1).padStart(3, '0')
    return `KA-${domain}-${nextSeq}`
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: { field: string; message: string; code: string }[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
