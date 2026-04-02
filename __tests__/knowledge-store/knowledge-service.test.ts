import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { KnowledgeService, ValidationError } from '@/lib/knowledge-store/knowledge-service'
import { SchemaValidator } from '@/lib/knowledge-store/schema-validator'
import { SemanticMatcher } from '@/lib/knowledge-store/semantic-matcher'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'
import { VALID_DOMAINS, VALID_ACTION_CODES } from '@/lib/knowledge-store/constants'
import type { KnowledgeAtom, AtomSource } from '@/lib/knowledge-store/types'
import type { DomainCode, ActionCode } from '@/lib/knowledge-store/constants'

let tmpDir: string
let service: KnowledgeService
let repo: JsonFileRepository

const validSource: AtomSource = { type: 'manual', author: 'test' }

async function createService(): Promise<{
  service: KnowledgeService
  repo: JsonFileRepository
}> {
  const filePath = path.join(tmpDir, 'store.json')
  const repo = new JsonFileRepository(filePath)
  await repo.initialize()
  const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)
  const matcher = new SemanticMatcher()
  const service = new KnowledgeService(repo, validator, matcher)
  return { service, repo }
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-svc-'))
  const result = await createService()
  service = result.service
  repo = result.repo
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('KnowledgeService', () => {
  // ─── Property 5: 新建原子初始化不变量 ───
  describe('Property 5: 新建原子初始化不变量', () => {
    it('新建原子 atom_id 格式正确, version=1, hit_count=0, last_hit_at=null', async () => {
      const domains: DomainCode[] = ['ORDER_DISPATCH', 'ORDER_CREATE', 'ORDER_WMS_SYNC']
      for (const domain of domains) {
        const result = await service.upsertAtom(
          {
            domain,
            symptom_signals: [`Test signal for ${domain}`],
            likely_root_causes: [],
            recommended_actions: [],
          },
          validSource
        )
        expect(result.isNew).toBe(true)
        expect(result.version).toBe(1)
        expect(result.atomId).toMatch(new RegExp(`^KA-${domain}-\\d{3,}$`))

        const atom = await service.getAtom(result.atomId)
        expect(atom).not.toBeNull()
        expect(atom!.hit_count).toBe(0)
        expect(atom!.last_hit_at).toBeNull()
      }
    })
  })

  // ─── Property 7 & 9: 查询排序和 top_k ───
  describe('Property 7 & 9: 查询排序和 top_k', () => {
    it('查询结果按 confidence × matchScore 降序排列', async () => {
      // 插入多个原子
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure', 'No matching warehouse'], confidence: 0.9 },
        validSource
      )
      await service.upsertAtom(
        { domain: 'ORDER_CREATE', symptom_signals: ['Order creation failed', 'Required fields missing'], confidence: 0.7 },
        validSource
      )
      await service.upsertAtom(
        { domain: 'ORDER_WMS_SYNC', symptom_signals: ['WMS rejection', 'SKU not found'], confidence: 0.8 },
        validSource
      )

      const result = await service.queryKnowledge('Dispatch failure warehouse')
      for (let i = 0; i < result.atoms.length - 1; i++) {
        const scoreA = result.atoms[i].confidence * result.matchScores[i]
        const scoreB = result.atoms[i + 1].confidence * result.matchScores[i + 1]
        expect(scoreA).toBeGreaterThanOrEqual(scoreB)
      }
    })

    it('top_k 限制返回数量', async () => {
      // 插入 10 个不同的原子
      for (let i = 0; i < 10; i++) {
        await service.upsertAtom(
          { domain: 'ORDER_DISPATCH', symptom_signals: [`Signal variant ${i} dispatch failure`], confidence: 0.5 + i * 0.05 },
          validSource
        )
      }

      const result3 = await service.queryKnowledge('dispatch failure', undefined, 3)
      expect(result3.atoms.length).toBeLessThanOrEqual(3)

      const resultDefault = await service.queryKnowledge('dispatch failure')
      expect(resultDefault.atoms.length).toBeLessThanOrEqual(5)
    })
  })

  // ─── Property 8: domain_hint 过滤 ───
  describe('Property 8: domain_hint 过滤', () => {
    it('带 domainHint 的查询只返回该域的原子', async () => {
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure'] },
        validSource
      )
      await service.upsertAtom(
        { domain: 'ORDER_CREATE', symptom_signals: ['Order creation failure'] },
        validSource
      )

      const result = await service.queryKnowledge('failure', 'ORDER_DISPATCH')
      for (const atom of result.atoms) {
        expect(atom.domain).toBe('ORDER_DISPATCH')
      }
    })
  })

  // ─── Property 10 & 12: 统计更新行为 ───
  describe('Property 10 & 12: 统计更新行为', () => {
    it('queryKnowledge 命中后 hit_count +1', async () => {
      const { atomId } = await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure', 'No matching warehouse'] },
        validSource
      )

      const before = await service.getAtom(atomId)
      expect(before!.hit_count).toBe(0)

      await service.queryKnowledge('Dispatch failure')

      const after = await service.getAtom(atomId)
      expect(after!.hit_count).toBe(1)
      expect(after!.last_hit_at).not.toBeNull()
    })

    it('getAtom 不更新统计', async () => {
      const { atomId } = await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure'] },
        validSource
      )

      await service.getAtom(atomId)
      await service.getAtom(atomId)
      await service.getAtom(atomId)

      const atom = await service.getAtom(atomId)
      expect(atom!.hit_count).toBe(0)
      expect(atom!.last_hit_at).toBeNull()
    })
  })

  // ─── Property 13-15: list_by_domain 过滤行为 ───
  describe('Property 13-15: list_by_domain 过滤行为', () => {
    it('默认过滤低置信度和 deprecated 原子', async () => {
      // 正常原子
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Normal signal'], confidence: 0.8 },
        validSource
      )
      // 低置信度原子
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Low confidence signal unique'], confidence: 0.1 },
        validSource
      )

      const result = await service.listByDomain('ORDER_DISPATCH')
      for (const atom of result) {
        expect(atom.confidence).toBeGreaterThanOrEqual(0.3)
        expect(atom.deprecated).toBe(false)
      }
    })

    it('includeLowConfidence=true 包含低置信度原子', async () => {
      await service.upsertAtom(
        { domain: 'ORDER_CREATE', symptom_signals: ['High conf signal'], confidence: 0.8 },
        validSource
      )
      await service.upsertAtom(
        { domain: 'ORDER_CREATE', symptom_signals: ['Low conf signal unique xyz'], confidence: 0.1 },
        validSource
      )

      const withLow = await service.listByDomain('ORDER_CREATE', true)
      const hasLow = withLow.some(a => a.confidence < 0.3)
      expect(hasLow).toBe(true)
    })

    it('域过滤正确', async () => {
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch signal'] },
        validSource
      )
      await service.upsertAtom(
        { domain: 'ORDER_CREATE', symptom_signals: ['Create signal'] },
        validSource
      )

      const result = await service.listByDomain('ORDER_DISPATCH')
      for (const atom of result) {
        expect(atom.domain).toBe('ORDER_DISPATCH')
      }
    })
  })

  // ─── Property 16-17: 新建 vs 合并 ───
  describe('Property 16-17: 新建 vs 合并', () => {
    it('相似信号触发合并 (is_new=false)', async () => {
      const r1 = await service.upsertAtom(
        {
          domain: 'ORDER_DISPATCH',
          symptom_signals: ['Dispatch failure', 'No matching warehouse', 'Routing rule evaluation failed'],
          likely_root_causes: [{ description: '原因A', description_en: 'Cause A', probability: 0.5 }],
          recommended_actions: ['RETRY_WITH_BACKOFF'],
          confidence: 0.7,
        },
        validSource
      )
      expect(r1.isNew).toBe(true)

      // 写入几乎相同的信号
      const r2 = await service.upsertAtom(
        {
          domain: 'ORDER_DISPATCH',
          symptom_signals: ['Dispatch failure', 'No matching warehouse', 'Routing rule evaluation failed'],
          likely_root_causes: [{ description: '原因B', description_en: 'Cause B', probability: 0.6 }],
          recommended_actions: ['RESYNC_ORDER'],
          confidence: 0.9,
        },
        validSource
      )
      expect(r2.isNew).toBe(false)
      expect(r2.atomId).toBe(r1.atomId)
      expect(r2.version).toBe(2)

      // 验证合并结果
      const merged = await service.getAtom(r1.atomId)
      expect(merged!.likely_root_causes.length).toBe(2)
      expect(merged!.recommended_actions).toContain('RETRY_WITH_BACKOFF')
      expect(merged!.recommended_actions).toContain('RESYNC_ORDER')
      expect(merged!.confidence).toBe(0.9) // max(0.7, 0.9)
    })

    it('不同信号创建新原子 (is_new=true)', async () => {
      await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure', 'No matching warehouse'] },
        validSource
      )
      const r2 = await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Email send failed', 'SMTP error'] },
        validSource
      )
      expect(r2.isNew).toBe(true)
    })
  })

  // ─── Property 18-19: 废弃行为 ───
  describe('Property 18-19: 废弃行为', () => {
    it('废弃标记保留数据', async () => {
      const { atomId } = await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure'] },
        validSource
      )

      const success = await service.deprecateAtom(atomId, '已过时')
      expect(success).toBe(true)

      const atom = await service.getAtom(atomId)
      expect(atom).not.toBeNull()
      expect(atom!.deprecated).toBe(true)
      expect(atom!.deprecated_reason).toBe('已过时')
    })

    it('废弃原子从默认查询中排除', async () => {
      const { atomId } = await service.upsertAtom(
        { domain: 'ORDER_DISPATCH', symptom_signals: ['Dispatch failure unique test'] },
        validSource
      )
      await service.deprecateAtom(atomId, '已过时')

      const queryResult = await service.queryKnowledge('Dispatch failure unique test')
      const found = queryResult.atoms.find(a => a.atom_id === atomId)
      expect(found).toBeUndefined()

      const listResult = await service.listByDomain('ORDER_DISPATCH')
      const foundInList = listResult.find(a => a.atom_id === atomId)
      expect(foundInList).toBeUndefined()
    })

    it('不存在的 atomId 返回 false', async () => {
      const success = await service.deprecateAtom('KA-NONEXISTENT-999', '测试')
      expect(success).toBe(false)
    })
  })

  // ─── Property 11 & 21: 读写往返 & ID 唯一性 ───
  describe('Property 11 & 21: 读写往返 & ID 唯一性', () => {
    it('get_atom 读写往返一致', async () => {
      const { atomId } = await service.upsertAtom(
        {
          domain: 'ORDER_DISPATCH',
          symptom_signals: ['Dispatch failure'],
          likely_root_causes: [{ description: '测试', description_en: 'Test', probability: 0.5 }],
          recommended_actions: ['RETRY_WITH_BACKOFF'],
          confidence: 0.8,
        },
        validSource
      )

      const atom = await service.getAtom(atomId)
      expect(atom).not.toBeNull()
      expect(atom!.atom_id).toBe(atomId)
      expect(atom!.domain).toBe('ORDER_DISPATCH')
      expect(atom!.symptom_signals).toEqual(['Dispatch failure'])
    })

    it('多次写入 atom_id 全局唯一', async () => {
      const ids = new Set<string>()
      for (let i = 0; i < 5; i++) {
        const { atomId } = await service.upsertAtom(
          { domain: 'ORDER_DISPATCH', symptom_signals: [`Unique signal ${i} ${Date.now()}`] },
          validSource
        )
        expect(ids.has(atomId)).toBe(false)
        ids.add(atomId)
      }
    })
  })

  // ─── Schema 校验拒绝 ───
  describe('Schema 校验拒绝', () => {
    it('缺少 domain 抛出 ValidationError', async () => {
      await expect(
        service.upsertAtom({ symptom_signals: ['test'] }, validSource)
      ).rejects.toThrow(ValidationError)
    })

    it('缺少 symptom_signals 抛出 ValidationError', async () => {
      await expect(
        service.upsertAtom({ domain: 'ORDER_DISPATCH' }, validSource)
      ).rejects.toThrow(ValidationError)
    })

    it('空查询返回空结果', async () => {
      const result = await service.queryKnowledge('')
      expect(result.atoms).toHaveLength(0)
    })
  })
})
