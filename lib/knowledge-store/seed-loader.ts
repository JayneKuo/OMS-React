import fs from 'fs/promises'
import type { KnowledgeAtom, RootCause, AtomContext } from './types'
import type { DomainCode, ActionCode } from './constants'
import { VALID_DOMAINS, VALID_ACTION_CODES } from './constants'
import type { KnowledgeRepository } from './repository/interface'

interface ParsedSection {
  domain: string
  title: string
  symptomSignals: string[]
  rootCauses: RootCause[]
  actions: string[]
  relatedModules: string[]
  relatedProcesses: string[]
  relatedRules: string[]
  entryConditions: string[]
  recoveryPaths: string[]
}

export class SeedLoader {
  static parseKnownExceptions(markdownContent: string): KnowledgeAtom[] {
    const atoms: KnowledgeAtom[] = []
    const sections = this.parseSections(markdownContent)
    const domainSeq: Record<string, number> = {}

    for (const section of sections) {
      if (!this.isValidDomain(section.domain)) continue
      if (section.symptomSignals.length === 0) continue

      const domain = section.domain as DomainCode
      domainSeq[domain] = (domainSeq[domain] || 0) + 1
      const seq = String(domainSeq[domain]).padStart(3, '0')
      const now = new Date().toISOString()

      const validActions = section.actions.filter(a =>
        (VALID_ACTION_CODES as readonly string[]).includes(a)
      ) as ActionCode[]

      const atom: KnowledgeAtom = {
        atom_id: `KA-${domain}-${seq}`,
        version: 1,
        created_at: now,
        updated_at: now,
        source: { type: 'knowledge_graph', node_ids: [] },
        domain,
        symptom_signals: section.symptomSignals,
        likely_root_causes: section.rootCauses,
        recommended_actions: validActions,
        context: {
          related_modules: section.relatedModules,
          related_processes: section.relatedProcesses,
          related_rules: section.relatedRules,
          state_transitions: [],
          entry_conditions: section.entryConditions,
          recovery_paths: section.recoveryPaths,
        },
        confidence: 0.8,
        hit_count: 0,
        last_hit_at: null,
        tags: [],
        deprecated: false,
      }
      atoms.push(atom)
    }

    return atoms
  }

  static async loadSeeds(
    repository: KnowledgeRepository,
    seedFilePath: string
  ): Promise<{ loaded: number; errors: string[] }> {
    const errors: string[] = []
    let loaded = 0

    try {
      const content = await fs.readFile(seedFilePath, 'utf-8')
      const atoms = this.parseKnownExceptions(content)

      for (const atom of atoms) {
        try {
          const existing = await repository.getAtomById(atom.atom_id)
          if (!existing) {
            await repository.createAtom(atom)
            loaded++
          }
        } catch (err) {
          errors.push(`加载 ${atom.atom_id} 失败: ${err}`)
        }
      }
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException
      if (error.code === 'ENOENT') {
        errors.push(`种子知识文件不存在: ${seedFilePath}`)
      } else {
        errors.push(`种子知识文件读取失败: ${err}`)
      }
    }

    return { loaded, errors }
  }

  // ─── 内部解析方法 ───

  private static parseSections(content: string): ParsedSection[] {
    const sections: ParsedSection[] = []
    const lines = content.split('\n')

    let currentDomain = ''
    let currentTitle = ''
    let currentField = ''
    let symptomSignals: string[] = []
    let rootCauses: RootCause[] = []
    let actions: string[] = []
    let relatedModules: string[] = []
    let relatedProcesses: string[] = []
    let relatedRules: string[] = []
    let entryConditions: string[] = []
    let recoveryPaths: string[] = []

    const flushSection = () => {
      if (currentDomain && symptomSignals.length > 0) {
        sections.push({
          domain: currentDomain,
          title: currentTitle,
          symptomSignals: [...symptomSignals],
          rootCauses: [...rootCauses],
          actions: [...actions],
          relatedModules: [...relatedModules],
          relatedProcesses: [...relatedProcesses],
          relatedRules: [...relatedRules],
          entryConditions: [...entryConditions],
          recoveryPaths: [...recoveryPaths],
        })
      }
      symptomSignals = []
      rootCauses = []
      actions = []
      relatedModules = []
      relatedProcesses = []
      relatedRules = []
      entryConditions = []
      recoveryPaths = []
      currentField = ''
    }

    for (const line of lines) {
      const trimmed = line.trim()

      // H2: domain header (## ORDER_CREATE — ...)
      const h2Match = trimmed.match(/^## ([A-Z_]+)\s*[—-]/)
      if (h2Match) {
        flushSection()
        currentDomain = h2Match[1]
        continue
      }

      // H3: exception title (### Exception: ...)
      const h3Match = trimmed.match(/^### (?:Exception|Pattern):\s*(.+)/)
      if (h3Match) {
        flushSection()
        currentTitle = h3Match[1]
        continue
      }

      // Field labels
      if (trimmed.startsWith('- **Symptom Signals**:')) {
        currentField = 'symptoms'
        const inline = this.extractQuotedStrings(trimmed)
        symptomSignals.push(...inline)
        continue
      }
      if (trimmed.startsWith('- **Likely Root Causes**:')) {
        currentField = 'causes'
        continue
      }
      if (trimmed.startsWith('- **Recommended Actions**:')) {
        currentField = 'actions'
        const inline = this.extractBacktickStrings(trimmed)
        actions.push(...inline)
        continue
      }
      if (trimmed.startsWith('- **Related Modules**:')) {
        currentField = 'modules'
        const val = trimmed.replace(/^- \*\*Related Modules\*\*:\s*/, '')
        if (val) relatedModules.push(...val.split(',').map(s => s.trim()).filter(Boolean))
        continue
      }
      if (trimmed.startsWith('- **Related Processes**:')) {
        currentField = 'processes'
        const val = trimmed.replace(/^- \*\*Related Processes\*\*:\s*/, '')
        if (val) relatedProcesses.push(...val.split(',').map(s => s.trim()).filter(Boolean))
        continue
      }
      if (trimmed.startsWith('- **Related Rules**:')) {
        currentField = 'rules'
        const val = trimmed.replace(/^- \*\*Related Rules\*\*:\s*/, '')
        if (val) relatedRules.push(...val.split(',').map(s => s.trim()).filter(Boolean))
        continue
      }
      if (trimmed.startsWith('- **Entry Conditions**')) {
        currentField = 'entry'
        const val = trimmed.replace(/^- \*\*Entry Conditions\*\*[^:]*:\s*/, '')
        if (val) entryConditions.push(val)
        continue
      }
      if (trimmed.startsWith('- **Allowed Recovery**')) {
        currentField = 'recovery'
        const val = trimmed.replace(/^- \*\*Allowed Recovery\*\*[^:]*:\s*/, '')
        if (val) recoveryPaths.push(val)
        continue
      }

      // Other field labels reset current field
      if (trimmed.startsWith('- **')) {
        currentField = ''
        continue
      }

      // Sub-items under current field
      if (trimmed.startsWith('- ') && currentField === 'causes') {
        const desc = trimmed.replace(/^- /, '')
        // 中文描述（英文术语在括号中）
        const enMatch = desc.match(/[（(]([^)）]+)[)）]/)
        rootCauses.push({
          description: desc.replace(/[（(][^)）]+[)）]/, '').trim(),
          description_en: enMatch ? enMatch[1] : desc,
          probability: 0.5,
        })
      }
    }

    flushSection()
    return sections
  }

  private static extractQuotedStrings(text: string): string[] {
    const matches = text.match(/`"([^"]+)"`/g) || []
    return matches.map(m => m.replace(/`"|"`/g, ''))
  }

  private static extractBacktickStrings(text: string): string[] {
    const matches = text.match(/`([^`]+)`/g) || []
    return matches.map(m => m.replace(/`/g, ''))
  }

  private static isValidDomain(domain: string): boolean {
    return (VALID_DOMAINS as readonly string[]).includes(domain)
  }
}
