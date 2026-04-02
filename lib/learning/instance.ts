import { LearningService } from './learning-service'
import { getKnowledgeService } from '@/lib/knowledge-store/instance'

let instance: LearningService | null = null

export async function getLearningService(): Promise<LearningService> {
  if (instance) return instance
  const knowledgeService = await getKnowledgeService()
  instance = new LearningService(knowledgeService)
  return instance
}
