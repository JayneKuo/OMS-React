import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import { SeedLoader } from '@/lib/knowledge-store/seed-loader'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'

const SEED_FILE = path.resolve(
  __dirname,
  '../../.agents/oms-exception-knowledge/references/known-exceptions.md'
)

describe('SeedLoader', () => {
  describe('parseKnownExceptions', () => {
    it('应解析出至少 11 个异常模式', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      // 实际有 15 个 H3 section（含子异常），但至少 11 个 domain 覆盖
      expect(atoms.length).toBeGreaterThanOrEqual(11)
    })

    it('所有种子知识 source.type 应为 knowledge_graph', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      for (const atom of atoms) {
        expect(atom.source.type).toBe('knowledge_graph')
      }
    })

    it('所有种子知识 confidence 应为 0.8', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      for (const atom of atoms) {
        expect(atom.confidence).toBe(0.8)
      }
    })

    it('应覆盖 11 个 Domain_Code', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      const domains = new Set(atoms.map(a => a.domain))
      const expectedDomains = [
        'ORDER_CREATE', 'ORDER_DISPATCH', 'ORDER_WMS_SYNC',
        'ORDER_FULFILLMENT', 'ORDER_PO', 'ORDER_WORK_ORDER',
        'ORDER_DELIVERY', 'CHANNEL_INTEGRATION', 'NOTIFICATION',
        'RATE_SHOPPING', 'ORDER_HOLD',
      ]
      for (const d of expectedDomains) {
        expect(domains.has(d)).toBe(true)
      }
    })

    it('每条种子知识 atom_id 格式正确', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      for (const atom of atoms) {
        expect(atom.atom_id).toMatch(/^KA-[A-Z_]+-\d{3}$/)
      }
    })

    it('每条种子知识 version=1, hit_count=0, last_hit_at=null', async () => {
      const content = await fs.readFile(SEED_FILE, 'utf-8')
      const atoms = SeedLoader.parseKnownExceptions(content)
      for (const atom of atoms) {
        expect(atom.version).toBe(1)
        expect(atom.hit_count).toBe(0)
        expect(atom.last_hit_at).toBeNull()
      }
    })
  })

  describe('loadSeeds', () => {
    it('应成功加载种子知识到 repository', async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-seed-'))
      const filePath = path.join(tmpDir, 'store.json')
      const repo = new JsonFileRepository(filePath)
      await repo.initialize()

      const result = await SeedLoader.loadSeeds(repo, SEED_FILE)
      expect(result.loaded).toBeGreaterThanOrEqual(11)
      expect(result.errors).toHaveLength(0)

      const all = await repo.getAllAtoms()
      expect(all.length).toBe(result.loaded)

      await fs.rm(tmpDir, { recursive: true, force: true })
    })

    it('种子文件不存在时返回错误', async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-seed-'))
      const filePath = path.join(tmpDir, 'store.json')
      const repo = new JsonFileRepository(filePath)
      await repo.initialize()

      const result = await SeedLoader.loadSeeds(repo, '/nonexistent/file.md')
      expect(result.loaded).toBe(0)
      expect(result.errors.length).toBeGreaterThan(0)

      await fs.rm(tmpDir, { recursive: true, force: true })
    })

    it('重复加载不会创建重复原子', async () => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-seed-'))
      const filePath = path.join(tmpDir, 'store.json')
      const repo = new JsonFileRepository(filePath)
      await repo.initialize()

      const result1 = await SeedLoader.loadSeeds(repo, SEED_FILE)
      const result2 = await SeedLoader.loadSeeds(repo, SEED_FILE)

      expect(result2.loaded).toBe(0) // 全部已存在，不重复创建
      const all = await repo.getAllAtoms()
      expect(all.length).toBe(result1.loaded)

      await fs.rm(tmpDir, { recursive: true, force: true })
    })
  })
})
