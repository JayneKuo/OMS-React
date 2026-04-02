import path from 'path'
import { JsonFileRepository } from './repository/json-file-repository'
import { SchemaValidator } from './schema-validator'
import { SemanticMatcher } from './semantic-matcher'
import { KnowledgeService } from './knowledge-service'
import { VALID_DOMAINS, VALID_ACTION_CODES } from './constants'

let instance: KnowledgeService | null = null
let initialized = false

const DATA_FILE = path.join(process.cwd(), 'data', 'knowledge-store.json')
const SEED_FILE = path.join(
  process.cwd(),
  '.agents',
  'oms-exception-knowledge',
  'references',
  'known-exceptions.md'
)

export async function getKnowledgeService(): Promise<KnowledgeService> {
  if (instance && initialized) return instance

  const repo = new JsonFileRepository(DATA_FILE)
  await repo.initialize()

  const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)
  const matcher = new SemanticMatcher()
  instance = new KnowledgeService(repo, validator, matcher, SEED_FILE)

  if (!initialized) {
    const result = await instance.initializeSeedKnowledge()
    if (result.errors.length > 0) {
      console.warn('[KnowledgeStore] 种子知识加载警告:', result.errors)
    } else if (result.loaded > 0) {
      console.log(`[KnowledgeStore] 已加载 ${result.loaded} 条种子知识`)
    }
    initialized = true
  }

  return instance
}
