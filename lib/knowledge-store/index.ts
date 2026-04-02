// 类型导出
export type {
  KnowledgeAtom,
  RootCause,
  AtomContext,
  AtomSource,
  ValidationResult,
  ValidationError,
  MatchResult,
  QueryResult,
  UpsertResult,
  ErrorResponse,
  KnowledgeStoreFile,
} from './types'

// 常量导出
export { VALID_DOMAINS, VALID_ACTION_CODES } from './constants'
export type { DomainCode, ActionCode } from './constants'

// 组件导出
export { SchemaValidator } from './schema-validator'
export { SemanticMatcher } from './semantic-matcher'
export { KnowledgeService, ValidationError as KnowledgeValidationError } from './knowledge-service'
export { SeedLoader } from './seed-loader'
export { JsonFileRepository } from './repository/json-file-repository'
export type { KnowledgeRepository } from './repository/interface'

// 单例工厂
export { getKnowledgeService } from './instance'
