import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { OrchestratorService } from '@/lib/orchestrator/orchestrator-service'
import { DiagnosisService } from '@/lib/diagnosis/diagnosis-service'
import { SymptomExtractor } from '@/lib/diagnosis/symptom-extractor'
import { KnowledgeClient } from '@/lib/diagnosis/knowledge-client'
import { ExploratoryReasoner } from '@/lib/diagnosis/exploratory-reasoner'
import { RootCauseReasoner } from '@/lib/diagnosis/root-cause-reasoner'
import { DbEvidenceCollector } from '@/lib/diagnosis/db-evidence-collector'
import { RepairService } from '@/lib/repair/repair-service'
import { ActionExecutor } from '@/lib/repair/action-executor'
import { LearningService } from '@/lib/learning/learning-service'
import { KnowledgeService } from '@/lib/knowledge-store/knowledge-service'
import { SchemaValidator } from '@/lib/knowledge-store/schema-validator'
import { SemanticMatcher } from '@/lib/knowledge-store/semantic-matcher'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'
import { SeedLoader } from '@/lib/knowledge-store/seed-loader'
import { VALID_DOMAINS, VALID_ACTION_CODES } from '@/lib/knowledge-store/constants'

let tmpDir: string
let orchestrator: OrchestratorService
let knowledgeService: KnowledgeService

const SEED_FILE = path.resolve(__dirname, '../../.agents/oms-exception-knowledge/references/known-exceptions.md')

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-orch-'))

  // 知识层
  const repo = new JsonFileRepository(path.join(tmpDir, 'store.json'))
  await repo.initialize()
  const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)
  const matcher = new SemanticMatcher()
  knowledgeService = new KnowledgeService(repo, validator, matcher, SEED_FILE)
  await knowledgeService.initializeSeedKnowledge()

  // 诊断层（用 mock DbEvidenceCollector 避免真实数据库连接）
  const mockDbCollector = {
    collectEvidence: async () => null,
    queryExceptionOrders: async () => [],
    destroy: async () => {},
  } as unknown as DbEvidenceCollector

  const diagnosisService = new DiagnosisService(
    new SymptomExtractor(),
    new KnowledgeClient(knowledgeService),
    mockDbCollector,
    new ExploratoryReasoner(),
    new RootCauseReasoner(),
  )

  // 修复层
  const repairService = new RepairService(new ActionExecutor())

  // 学习层
  const learningService = new LearningService(knowledgeService)

  orchestrator = new OrchestratorService(diagnosisService, repairService, learningService)
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('OrchestratorService — 端到端', () => {
  it('SKU not found → 诊断完成（无 DB 时 handoff 被阻断是正常的）', async () => {
    const result = await orchestrator.run({
      error_message: 'SKU 1823810 not found in item master data.',
      requested_by: 'user',
    })

    expect(result.mode).toBe('single')
    expect(result.results).toHaveLength(1)

    const pipeline = result.results[0]

    // 诊断阶段一定完成
    expect(pipeline.diagnosis).not.toBeNull()
    expect(pipeline.diagnosis!.recommended_actions.length).toBeGreaterThan(0)

    // 无 DB 证据时 order_context=null → handoff_ready=false → 只到诊断阶段
    // 这是正确行为：没有订单上下文不应该盲目修复
    if (!pipeline.diagnosis!.handoff_ready) {
      expect(pipeline.stage_reached).toBe('diagnosis')
      expect(pipeline.repair).toBeNull()
    }

    expect(result.summary.total).toBe(1)
    expect(result.summary.diagnosed).toBe(1)
  })

  it('Dispatch failure → 知识匹配 + 诊断', async () => {
    const result = await orchestrator.run({
      error_message: 'Dispatch failure: No matching warehouse for routing rule',
    })

    const diag = result.results[0].diagnosis!
    expect(diag.domain).toBe('ORDER_DISPATCH')
    expect(diag.recommended_actions.some(a => a.action_code === 'RETRY_WITH_BACKOFF' || a.action_code === 'REVIEW_BUSINESS_RULE')).toBe(true)
  })

  it('auto_repair=false → 只诊断不修复', async () => {
    const result = await orchestrator.run({
      error_message: 'WMS rejection: SKU not found in WMS',
      auto_repair: false,
    })

    const pipeline = result.results[0]
    expect(pipeline.diagnosis).not.toBeNull()
    expect(pipeline.repair).toBeNull()
    expect(pipeline.learning).toBeNull()
    expect(pipeline.stage_reached).toBe('diagnosis')
  })

  it('完全未知异常 → 低置信度，不 handoff', async () => {
    const result = await orchestrator.run({
      symptom_text: '系统报了一个从没见过的错误码 XYZ-999',
    })

    const pipeline = result.results[0]
    expect(pipeline.diagnosis).not.toBeNull()
    // 无数据库证据 + 可能无知识匹配 → 低置信度
    expect(pipeline.diagnosis!.overall_confidence).toBeLessThan(0.8)
  })

  it('HTTP 401 → CHANNEL_INTEGRATION 域', async () => {
    const result = await orchestrator.run({
      error_message: 'HTTP 401 Unauthorized - Channel API token expired',
    })

    const diag = result.results[0].diagnosis!
    expect(diag.domain).toBe('CHANNEL_INTEGRATION')
  })

  it('run_id 格式正确', async () => {
    const result = await orchestrator.run({
      error_message: 'test error',
    })
    expect(result.run_id).toMatch(/^RUN-\d+-\w+$/)
    expect(result.duration_ms).toBeGreaterThanOrEqual(0)
  })
})
