import { SymptomExtractor } from './symptom-extractor'
import { KnowledgeClient } from './knowledge-client'
import { DbEvidenceCollector } from './db-evidence-collector'
import { ExploratoryReasoner } from './exploratory-reasoner'
import { RootCauseReasoner } from './root-cause-reasoner'
import { DiagnosisService } from './diagnosis-service'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

let instance: DiagnosisService | null = null

export async function getDiagnosisService(): Promise<DiagnosisService> {
  if (instance) return instance

  const knowledgeService = await getKnowledgeService()

  instance = new DiagnosisService(
    new SymptomExtractor(),
    new KnowledgeClient(knowledgeService),
    new DbEvidenceCollector(),
    new ExploratoryReasoner(),
    new RootCauseReasoner(),
  )

  return instance
}
