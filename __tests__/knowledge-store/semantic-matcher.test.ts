import { describe, it, expect } from 'vitest'
import { SemanticMatcher } from '@/lib/knowledge-store/semantic-matcher'
import type { KnowledgeAtom } from '@/lib/knowledge-store/types'

const matcher = new SemanticMatcher()

function makeAtom(id: string, domain: string, signals: string[]): KnowledgeAtom {
  const now = new Date().toISOString()
  return {
    atom_id: id,
    version: 1,
    created_at: now,
    updated_at: now,
    source: { type: 'knowledge_graph', node_ids: [] },
    domain: domain as KnowledgeAtom['domain'],
    symptom_signals: signals,
    likely_root_causes: [],
    recommended_actions: [],
    context: { related_modules: [], related_processes: [], related_rules: [], state_transitions: [], entry_conditions: [], recovery_paths: [] },
    confidence: 0.8,
    hit_count: 0,
    last_hit_at: null,
    tags: [],
    deprecated: false,
  }
}

describe('SemanticMatcher', () => {
  const atoms = [
    makeAtom('KA-ORDER_DISPATCH-001', 'ORDER_DISPATCH', ['Dispatch failure', 'No matching warehouse', 'Routing rule evaluation failed']),
    makeAtom('KA-ORDER_WMS_SYNC-001', 'ORDER_WMS_SYNC', ['WMS rejection', 'SKU not found in WMS', 'Item ID Not Mapped']),
    makeAtom('KA-ORDER_CREATE-001', 'ORDER_CREATE', ['Order creation failed', 'Required fields missing', 'Product not found in Item Master']),
  ]

  it('Dispatch failure 应匹配 ORDER_DISPATCH 域的原子', () => {
    const results = matcher.computeMatchScores('Dispatch failure no matching warehouse', atoms)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].atom.domain).toBe('ORDER_DISPATCH')
  })

  it('SKU not found 应匹配 ORDER_WMS_SYNC 域的原子', () => {
    const results = matcher.computeMatchScores('SKU not found in WMS system', atoms)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].atom.domain).toBe('ORDER_WMS_SYNC')
  })

  it('空输入返回空结果', () => {
    expect(matcher.computeMatchScores('', atoms)).toEqual([])
    expect(matcher.computeMatchScores('   ', atoms)).toEqual([])
  })

  it('空原子列表返回空结果', () => {
    expect(matcher.computeMatchScores('test query', [])).toEqual([])
  })

  it('computeSimilarity 相同信号返回高分', () => {
    const score = matcher.computeSimilarity(
      ['Dispatch failure', 'No matching warehouse'],
      ['Dispatch failure', 'No matching warehouse']
    )
    expect(score).toBeGreaterThan(0.9)
  })

  it('computeSimilarity 不同信号返回低分', () => {
    const score = matcher.computeSimilarity(
      ['Dispatch failure', 'No matching warehouse'],
      ['Email send failed', 'SMTP error']
    )
    expect(score).toBeLessThan(0.5)
  })

  it('findSimilar 阈值 0.85 — 相同信号应匹配', () => {
    const result = matcher.findSimilar(
      ['Dispatch failure', 'No matching warehouse', 'Routing rule evaluation failed'],
      atoms,
      0.85
    )
    expect(result).not.toBeNull()
    expect(result!.atom_id).toBe('KA-ORDER_DISPATCH-001')
  })

  it('findSimilar 阈值 0.85 — 不同信号不应匹配', () => {
    const result = matcher.findSimilar(
      ['Email send failed', 'SMTP error'],
      atoms,
      0.85
    )
    expect(result).toBeNull()
  })
})
