import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { LearningService } from '@/lib/learning/learning-service'
import { KnowledgeService } from '@/lib/knowledge-store/knowledge-service'
import { SchemaValidator } from '@/lib/knowledge-store/schema-validator'
import { SemanticMatcher } from '@/lib/knowledge-store/semantic-matcher'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'
import { VALID_DOMAINS, VALID_ACTION_CODES } from '@/lib/knowledge-store/constants'
import type { RepairFeedbackInput } from '@/lib/learning/types'

let tmpDir: string
let learningService: LearningService
let knowledgeService: KnowledgeService

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ks-learn-'))
  const repo = new JsonFileRepository(path.join(tmpDir, 'store.json'))
  await repo.initialize()
  const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)
  const matcher = new SemanticMatcher()
  knowledgeService = new KnowledgeService(repo, validator, matcher)
  learningService = new LearningService(knowledgeService)
})

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true })
})

describe('LearningService', () => {
  it('探索性推理 + 修复成功 → 直接入库', async () => {
    const feedback: RepairFeedbackInput = {
      diagnosis_id: 'DIAG-001',
      repair_id: 'REPAIR-001',
      diagnosis_was_correct: null,
      actions_effective: [
        { action_code: 'MAP_ITEM_ID', was_effective: true, order_status_before: 10, order_status_after: 1 },
      ],
      new_pattern_detected: false,
      is_exploratory: true,
      exploratory_hypothesis: {
        proposed_domain: 'ORDER_WMS_SYNC',
        proposed_symptom_signals: ['Custom validation failed', 'inco_term required'],
        proposed_root_cause: '国际订单缺少 inco_term 字段',
        proposed_actions: ['MAP_ITEM_ID', 'MANUAL_DATA_FIX'],
        auto_create_knowledge: true,
      },
    }

    const result = await learningService.processRepairFeedback(feedback)
    expect(result.atoms_created).toBe(1)
    expect(result.events.length).toBeGreaterThan(0)
    expect(result.events[0].source_type).toBe('exploratory_verified')
    expect(result.events[0].event_type).toBe('new_atom_created')

    // 验证知识已入库
    const atoms = await knowledgeService.listByDomain('ORDER_WMS_SYNC')
    expect(atoms.length).toBeGreaterThan(0)
  })

  it('探索性推理 + 修复失败 → PatternBuffer', async () => {
    const feedback: RepairFeedbackInput = {
      diagnosis_id: 'DIAG-002',
      repair_id: 'REPAIR-002',
      diagnosis_was_correct: null,
      actions_effective: [
        { action_code: 'RETRY_WITH_BACKOFF', was_effective: false, order_status_before: 10, order_status_after: 10 },
      ],
      new_pattern_detected: false,
      is_exploratory: true,
      exploratory_hypothesis: {
        proposed_domain: 'SYSTEM',
        proposed_symptom_signals: ['Unknown system error XYZ'],
        proposed_root_cause: '未知系统错误',
        proposed_actions: ['RETRY_WITH_BACKOFF'],
        auto_create_knowledge: true,
      },
    }

    const result = await learningService.processRepairFeedback(feedback)
    expect(result.patterns_buffered).toBe(1)
    expect(result.atoms_created).toBe(0)

    const buffers = learningService.getPatternBuffers()
    expect(buffers.length).toBe(1)
    expect(buffers[0].threshold).toBe(2) // 探索性失败 threshold=2
    expect(buffers[0].status).toBe('accumulating')
  })

  it('PatternBuffer 累积达标 → 自动创建知识', async () => {
    // 第一次: 创建 buffer (threshold=2)
    await learningService.processRepairFeedback({
      diagnosis_id: 'DIAG-003a',
      repair_id: 'REPAIR-003a',
      diagnosis_was_correct: null,
      actions_effective: [{ action_code: 'RETRY_WITH_BACKOFF', was_effective: false, order_status_before: 10, order_status_after: 10 }],
      new_pattern_detected: false,
      is_exploratory: true,
      exploratory_hypothesis: {
        proposed_domain: 'CHANNEL_INTEGRATION',
        proposed_symptom_signals: ['Webhook timeout', 'endpoint unreachable'],
        proposed_root_cause: 'Webhook 端点不可达',
        proposed_actions: ['CHECK_THIRD_PARTY_STATUS'],
        auto_create_knowledge: true,
      },
    })

    // 第二次: 相似信号，应触发 buffer ready → 创建知识
    const result = await learningService.processRepairFeedback({
      diagnosis_id: 'DIAG-003b',
      repair_id: 'REPAIR-003b',
      diagnosis_was_correct: null,
      actions_effective: [{ action_code: 'CHECK_THIRD_PARTY_STATUS', was_effective: false, order_status_before: 10, order_status_after: 10 }],
      new_pattern_detected: false,
      is_exploratory: true,
      exploratory_hypothesis: {
        proposed_domain: 'CHANNEL_INTEGRATION',
        proposed_symptom_signals: ['Webhook timeout', 'endpoint unreachable'],
        proposed_root_cause: 'Webhook 端点不可达',
        proposed_actions: ['CHECK_THIRD_PARTY_STATUS'],
        auto_create_knowledge: true,
      },
    })

    expect(result.atoms_created).toBe(1)
    const buffers = learningService.getPatternBuffers()
    const created = buffers.find(b => b.status === 'created')
    expect(created).toBeDefined()
  })

  it('人工报告 → 直接入库', async () => {
    const result = await learningService.processManualReport({
      domain: 'ORDER_DISPATCH',
      symptom_signals: ['Manual dispatch failure', 'Custom routing error'],
      root_cause: '自定义路由规则配置错误',
      actions: ['REVIEW_BUSINESS_RULE'],
      author: 'ops_team',
    })

    expect(result.atoms_created).toBe(1)
    expect(result.events[0].source_type).toBe('manual_report')

    const atoms = await knowledgeService.listByDomain('ORDER_DISPATCH')
    expect(atoms.length).toBeGreaterThan(0)
  })

  it('事件日志完整', async () => {
    await learningService.processManualReport({
      domain: 'NOTIFICATION',
      symptom_signals: ['Email bounce'],
      root_cause: '邮件地址无效',
      actions: ['NOTIFY_MERCHANT'],
      author: 'test',
    })

    const log = learningService.getEventLog()
    expect(log.length).toBe(1)
    expect(log[0].event_id).toMatch(/^LEARN-/)
    expect(log[0].reason).toContain('邮件地址无效')
  })
})
