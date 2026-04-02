import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'
import type { KnowledgeAtom } from '@/lib/knowledge-store/types'

function makeAtom(overrides: Partial<KnowledgeAtom> = {}): KnowledgeAtom {
  const now = new Date().toISOString()
  return {
    atom_id: overrides.atom_id ?? 'KA-ORDER_DISPATCH-001',
    version: 1,
    created_at: now,
    updated_at: now,
    source: { type: 'knowledge_graph', node_ids: ['n1'] },
    domain: 'ORDER_DISPATCH',
    symptom_signals: ['Dispatch failure'],
    likely_root_causes: [
      { description: '路由规则未匹配', description_en: 'No matching warehouse', probability: 0.8 },
    ],
    recommended_actions: ['RETRY_WITH_BACKOFF'],
    context: {
      related_modules: ['Order Dispatch Module'],
      related_processes: [],
      related_rules: [],
      state_transitions: [],
      entry_conditions: [],
      recovery_paths: [],
    },
    confidence: 0.8,
    hit_count: 0,
    last_hit_at: null,
    tags: [],
    deprecated: false,
    ...overrides,
  }
}

let tmpDir: string

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-test-'))
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('JsonFileRepository', () => {
  // ─── Property 20: 持久化往返 ───
  describe('Property 20: 持久化往返', () => {
    it('写入后重新加载，数据一致', async () => {
      const filePath = path.join(tmpDir, 'store.json')
      const repo1 = new JsonFileRepository(filePath)
      await repo1.initialize()

      const atom1 = makeAtom({ atom_id: 'KA-ORDER_DISPATCH-001' })
      const atom2 = makeAtom({ atom_id: 'KA-ORDER_CREATE-001', domain: 'ORDER_CREATE', symptom_signals: ['Order creation failed'] })
      await repo1.createAtom(atom1)
      await repo1.createAtom(atom2)

      // 重新加载
      const repo2 = new JsonFileRepository(filePath)
      await repo2.initialize()

      const loaded1 = await repo2.getAtomById('KA-ORDER_DISPATCH-001')
      const loaded2 = await repo2.getAtomById('KA-ORDER_CREATE-001')

      expect(loaded1).toEqual(atom1)
      expect(loaded2).toEqual(atom2)

      const all = await repo2.getAllAtoms()
      expect(all).toHaveLength(2)
    })

    it('updateAtom 后重新加载，数据一致', async () => {
      const filePath = path.join(tmpDir, 'store.json')
      const repo1 = new JsonFileRepository(filePath)
      await repo1.initialize()

      const atom = makeAtom()
      await repo1.createAtom(atom)

      const updated = { ...atom, version: 2, confidence: 0.9, hit_count: 5 }
      await repo1.updateAtom(updated)

      const repo2 = new JsonFileRepository(filePath)
      await repo2.initialize()
      const loaded = await repo2.getAtomById(atom.atom_id)
      expect(loaded).toEqual(updated)
    })
  })

  it('文件不存在时以空知识库启动', async () => {
    const filePath = path.join(tmpDir, 'nonexistent', 'store.json')
    const repo = new JsonFileRepository(filePath)
    await repo.initialize()

    const all = await repo.getAllAtoms()
    expect(all).toHaveLength(0)
  })

  it('getAtomsByDomain 过滤正确', async () => {
    const filePath = path.join(tmpDir, 'store.json')
    const repo = new JsonFileRepository(filePath)
    await repo.initialize()

    await repo.createAtom(makeAtom({ atom_id: 'KA-ORDER_DISPATCH-001', domain: 'ORDER_DISPATCH' }))
    await repo.createAtom(makeAtom({ atom_id: 'KA-ORDER_CREATE-001', domain: 'ORDER_CREATE' }))
    await repo.createAtom(makeAtom({ atom_id: 'KA-ORDER_DISPATCH-002', domain: 'ORDER_DISPATCH', deprecated: true }))

    const dispatches = await repo.getAtomsByDomain('ORDER_DISPATCH')
    expect(dispatches).toHaveLength(1)
    expect(dispatches[0].atom_id).toBe('KA-ORDER_DISPATCH-001')

    const withDeprecated = await repo.getAtomsByDomain('ORDER_DISPATCH', true)
    expect(withDeprecated).toHaveLength(2)
  })
})
