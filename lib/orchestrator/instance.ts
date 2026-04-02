import { OrchestratorService } from './orchestrator-service'
import { getDiagnosisService } from '@/lib/diagnosis/instance'
import { getRepairService } from '@/lib/repair/instance'
import { getLearningService } from '@/lib/learning/instance'

let instance: OrchestratorService | null = null

export async function getOrchestratorService(): Promise<OrchestratorService> {
  if (instance) return instance

  const [diagnosisService, learningService] = await Promise.all([
    getDiagnosisService(),
    getLearningService(),
  ])
  const repairService = getRepairService()

  instance = new OrchestratorService(diagnosisService, repairService, learningService)
  return instance
}
