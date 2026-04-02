import { describe, it, expect, beforeEach } from 'vitest'
import { RepairService } from '@/lib/repair/repair-service'
import { ActionExecutor } from '@/lib/repair/action-executor'
import type { DiagnosisResult } from '@/lib/diagnosis/types'

function makeDiagnosis(overrides: Partial<DiagnosisResult> = {}): DiagnosisResult {
  return {
    diagnosis_id: `DIAG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    diagnosed_at: new Date().toISOString(),
    duration_ms: 100,
    input: { requested_by: 'system' },
    order_context: {
      order_no: 'SO001',
      channel_sales_order_no: null,
      merchant_no: 'test_merchant',
      channel_name: null,
      status: 10,
      status_label: 'Exception',
      order_type: 1,
      create_time: new Date().toISOString(),
      accounting_code: 'WH001',
      dispatches: [],
      recent_messages: [],
      items: [],
    },
    root_causes: [],
    overall_confidence: 0.9,
    domain: 'ORDER_WMS_SYNC',
    severity: 'critical',
    recommended_actions: [
      { action_code: 'MAP_ITEM_ID', priority: 1, description: '建立映射', auto_executable: true },
      { action_code: 'RESYNC_ORDER', priority: 2, description: '重推订单', auto_executable: true },
    ],
    handoff_ready: true,
    is_exploratory: false,
    reasoning_trace: [],
    ...overrides,
  } as DiagnosisResult
}

let service: RepairService

beforeEach(() => {
  service = new RepairService(new ActionExecutor())
})

describe('RepairService', () => {
  it('高置信度全自动执行 — overall_status=success', async () => {
    const result = await service.repair(makeDiagnosis())
    expect(result.overall_status).toBe('success')
    expect(result.action_results).toHaveLength(2)
    expect(result.action_results[0].action_code).toBe('MAP_ITEM_ID')
    expect(result.action_results[1].action_code).toBe('RESYNC_ORDER')
    expect(result.needs_confirmation).toBe(false)
    expect(result.escalations).toHaveLength(0)
  })

  it('中置信度 — needs_confirmation=true', async () => {
    const result = await service.repair(makeDiagnosis({ overall_confidence: 0.65 }))
    expect(result.needs_confirmation).toBe(true)
  })

  it('Handoff 验收失败 — overall_status=skipped', async () => {
    const result = await service.repair(makeDiagnosis({
      handoff_ready: false,
      overall_confidence: 0.3,
    }))
    expect(result.overall_status).toBe('skipped')
    expect(result.action_results).toHaveLength(0)
    expect(result.feedback.notes).toContain('验收失败')
  })

  it('破坏性动作 — pending_confirmation', async () => {
    const result = await service.repair(makeDiagnosis({
      recommended_actions: [
        { action_code: 'CANCEL_AND_RECREATE', priority: 1, description: '取消重建', auto_executable: true },
      ],
    }))
    expect(result.action_results[0].status).toBe('pending_confirmation')
  })

  it('混合动作 — 自动执行 + 人工升级', async () => {
    const result = await service.repair(makeDiagnosis({
      recommended_actions: [
        { action_code: 'RETRY_WITH_BACKOFF', priority: 1, description: '重试', auto_executable: true },
        { action_code: 'ESCALATE_TO_OPS', priority: 2, description: '升级运营', auto_executable: false },
        { action_code: 'REVIEW_BUSINESS_RULE', priority: 3, description: '审查规则', auto_executable: false },
      ],
    }))
    expect(result.action_results).toHaveLength(1)
    expect(result.action_results[0].status).toBe('success')
    expect(result.escalations).toHaveLength(2)
    expect(result.escalations[0].assigned_to).toBe('ops')
  })

  it('幂等性 — 重复 handoff 返回相同结果', async () => {
    const diag = makeDiagnosis()
    const r1 = await service.repair(diag)
    const r2 = await service.repair(diag)
    expect(r1.repair_id).toBe(r2.repair_id)
  })

  it('feedback 结构完整', async () => {
    const result = await service.repair(makeDiagnosis())
    expect(result.feedback.diagnosis_id).toBe(result.diagnosis_id)
    expect(result.feedback.repair_id).toBe(result.repair_id)
    expect(result.feedback.diagnosis_was_correct).toBeNull()
    expect(result.feedback.actions_effective.length).toBeGreaterThan(0)
    expect(result.feedback.actions_effective[0].order_status_before).toBe(10)
  })

  it('探索性推理标记透传', async () => {
    const result = await service.repair(makeDiagnosis({
      is_exploratory: true,
      exploratory_hypothesis: {
        reasoning_method: 'rule_based_fallback',
        reasoning_input: { symptom_text: 'test', order_context_summary: 'test', domain_model_used: [] },
        proposed_domain: 'ORDER_WMS_SYNC',
        proposed_symptom_signals: ['test signal'],
        proposed_root_cause: 'test cause',
        proposed_actions: ['MAP_ITEM_ID'],
        needs_verification: true,
        auto_create_knowledge: true,
      },
    }))
    expect(result.feedback.is_exploratory).toBe(true)
    expect(result.feedback.exploratory_hypothesis).toBeDefined()
    expect(result.feedback.exploratory_hypothesis!.proposed_domain).toBe('ORDER_WMS_SYNC')
  })

  it('缺少 order_context — 验收失败', async () => {
    const result = await service.repair(makeDiagnosis({ order_context: null }))
    expect(result.overall_status).toBe('skipped')
  })
})
