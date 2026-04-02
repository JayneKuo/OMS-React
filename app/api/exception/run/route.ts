import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import type { OrchestratorInput } from '@/lib/orchestrator/types'
import { OrchestratorService } from '@/lib/orchestrator/orchestrator-service'
import { DiagnosisService } from '@/lib/diagnosis/diagnosis-service'
import { SymptomExtractor } from '@/lib/diagnosis/symptom-extractor'
import { KnowledgeClient } from '@/lib/diagnosis/knowledge-client'
import { DbEvidenceCollector } from '@/lib/diagnosis/db-evidence-collector'
import { ExploratoryReasoner } from '@/lib/diagnosis/exploratory-reasoner'
import { RootCauseReasoner } from '@/lib/diagnosis/root-cause-reasoner'
import { RepairService } from '@/lib/repair/repair-service'
import { ActionExecutor } from '@/lib/repair/action-executor'
import { LearningService } from '@/lib/learning/learning-service'
import { KnowledgeService } from '@/lib/knowledge-store/knowledge-service'
import { JsonFileRepository } from '@/lib/knowledge-store/repository/json-file-repository'
import { SemanticMatcher } from '@/lib/knowledge-store/semantic-matcher'
import { SchemaValidator } from '@/lib/knowledge-store/schema-validator'
import { SeedLoader } from '@/lib/knowledge-store/seed-loader'
import { VALID_DOMAINS, VALID_ACTION_CODES } from '@/lib/knowledge-store/constants'

/** 单例：避免每次请求重建服务 */
let orchestrator: OrchestratorService | null = null
let initialized = false

async function getOrchestrator(): Promise<OrchestratorService> {
  if (orchestrator && initialized) return orchestrator

  // 知识层
  const knowledgePath = path.join(process.cwd(), 'data', 'knowledge-store.json')
  const repo = new JsonFileRepository(knowledgePath)
  await repo.initialize()
  const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)
  const matcher = new SemanticMatcher()
  const knowledgeService = new KnowledgeService(repo, validator, matcher)

  // 加载种子知识
  const seedPath = path.join(process.cwd(), '.agents', 'oms-exception-knowledge', 'references', 'known-exceptions.md')
  const seedResult = await SeedLoader.loadSeeds(repo, seedPath)
  if (seedResult.loaded > 0) {
    console.log(`[API] 已加载 ${seedResult.loaded} 条种子知识`)
  }
  if (seedResult.errors.length > 0) {
    console.warn('[API] 种子加载警告:', seedResult.errors)
  }

  // 诊断层
  const symptomExtractor = new SymptomExtractor()
  const knowledgeClient = new KnowledgeClient(knowledgeService)
  const dbCollector = new DbEvidenceCollector()
  const exploratoryReasoner = new ExploratoryReasoner()
  const rootCauseReasoner = new RootCauseReasoner()
  const diagnosisService = new DiagnosisService(
    symptomExtractor, knowledgeClient, dbCollector, exploratoryReasoner, rootCauseReasoner
  )

  // 修复层
  const actionExecutor = new ActionExecutor()
  const repairService = new RepairService(actionExecutor)

  // 学习层
  const learningService = new LearningService(knowledgeService)

  orchestrator = new OrchestratorService(diagnosisService, repairService, learningService)
  initialized = true
  return orchestrator
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as OrchestratorInput

    // 基本校验
    if (!body.symptom_text && !body.order_no && !body.merchant_no) {
      return NextResponse.json(
        { message: '请提供 symptom_text、order_no 或 merchant_no 中的至少一个' },
        { status: 400 }
      )
    }

    const service = await getOrchestrator()
    const result = await service.run(body)

    return NextResponse.json(result)
  } catch (err) {
    console.error('[API /exception/run] Error:', err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : '异常处理管线执行失败' },
      { status: 500 }
    )
  }
}
