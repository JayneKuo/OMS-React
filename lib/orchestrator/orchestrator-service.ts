import type { DiagnosisService } from '@/lib/diagnosis/diagnosis-service'
import type { RepairService } from '@/lib/repair/repair-service'
import type { LearningService } from '@/lib/learning/learning-service'
import type { OrchestratorInput, OrchestratorResult, PipelineResult } from './types'

export class OrchestratorService {
  constructor(
    private diagnosisService: DiagnosisService,
    private repairService: RepairService,
    private learningService: LearningService,
  ) {}

  async run(input: OrchestratorInput): Promise<OrchestratorResult> {
    const startTime = Date.now()
    const runId = `RUN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const autoRepair = input.auto_repair !== false

    let results: PipelineResult[]

    if (input.merchant_no && !input.order_no) {
      // 批量模式：先查该商户所有异常订单，逐个走管线
      const diagResults = await this.diagnosisService.batchDiagnose(input.merchant_no)
      results = []
      for (const diag of diagResults) {
        const pipeline = await this.runPipeline(diag, autoRepair)
        results.push(pipeline)
      }
    } else {
      // 单次模式
      const diag = await this.diagnosisService.diagnose({
        order_no: input.order_no,
        symptom_text: input.symptom_text,
        error_message: input.error_message,
        requested_by: input.requested_by || 'user',
      })
      const pipeline = await this.runPipeline(diag, autoRepair)
      results = [pipeline]
    }

    const summary = {
      total: results.length,
      diagnosed: results.filter(r => r.diagnosis !== null).length,
      repaired: results.filter(r => r.repair !== null && r.repair.overall_status === 'success').length,
      learned: results.filter(r => r.learning !== null && r.learning.events.length > 0).length,
      failed: results.filter(r => r.stage_reached === 'error').length,
    }

    return {
      run_id: runId,
      mode: input.merchant_no && !input.order_no ? 'batch' : 'single',
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      results,
      summary,
    }
  }

  private async runPipeline(
    diagnosis: import('@/lib/diagnosis/types').DiagnosisResult,
    autoRepair: boolean
  ): Promise<PipelineResult> {
    const result: PipelineResult = {
      order_no: diagnosis.order_context?.order_no || null,
      stage_reached: 'diagnosis',
      diagnosis,
      repair: null,
      learning: null,
    }

    try {
      // 检查是否需要用户输入（如地址缺失）
      const addressMissing = diagnosis.root_causes.some(rc => {
        const code = rc.cause_code.toUpperCase()
        const desc = rc.cause_description.toLowerCase()
        return code.includes('ADDRESS') || code.includes('SHIP_TO') ||
          desc.includes('地址') || desc.includes('address') ||
          desc.includes('缺少收货') || desc.includes('ship to')
      })

      if (addressMissing) {
        result.needs_user_input = true
        result.user_input_type = 'address'
        // 不执行修复，等用户提供地址
        return result
      }

      // Step 2: 修复（仅在 handoff_ready 且 autoRepair 时）
      if (autoRepair && diagnosis.handoff_ready) {
        const repairResult = await this.repairService.repair(diagnosis)
        result.repair = repairResult
        result.stage_reached = 'repair'

        // Step 3: 学习（将修复反馈传给学习 Agent）
        try {
          const learningResult = await this.learningService.processRepairFeedback(repairResult.feedback)
          result.learning = learningResult
          result.stage_reached = 'learning'
        } catch (err) {
          // 学习失败不阻塞整体流程
          console.error('[Orchestrator] Learning failed:', err)
        }
      }
    } catch (err) {
      result.stage_reached = 'error'
      result.error = err instanceof Error ? err.message : String(err)
    }

    return result
  }
}
