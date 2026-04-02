import type { KnowledgeAtom, ValidationResult, ValidationError } from './types'

export class SchemaValidator {
  private validDomains: Set<string>
  private validActionCodes: Set<string>

  constructor(validDomains: readonly string[], validActionCodes: readonly string[]) {
    this.validDomains = new Set(validDomains)
    this.validActionCodes = new Set(validActionCodes)
  }

  validate(atom: Partial<KnowledgeAtom>): ValidationResult {
    const errors: ValidationError[] = []

    // 必填字段: domain
    if (!atom.domain) {
      errors.push({
        field: 'domain',
        message: '缺少必填字段 domain',
        code: 'REQUIRED_FIELD',
      })
    } else if (!this.validateDomain(atom.domain)) {
      errors.push({
        field: 'domain',
        message: `无效的 Domain_Code: ${atom.domain}`,
        code: 'INVALID_DOMAIN',
      })
    }

    // 必填字段: symptom_signals
    if (!atom.symptom_signals) {
      errors.push({
        field: 'symptom_signals',
        message: '缺少必填字段 symptom_signals',
        code: 'REQUIRED_FIELD',
      })
    } else if (!Array.isArray(atom.symptom_signals) || atom.symptom_signals.length === 0) {
      errors.push({
        field: 'symptom_signals',
        message: 'symptom_signals 不能为空数组',
        code: 'EMPTY_ARRAY',
      })
    }

    // 可选字段: recommended_actions
    if (atom.recommended_actions && atom.recommended_actions.length > 0) {
      const actionResult = this.validateActionCodes(atom.recommended_actions)
      errors.push(...actionResult.errors)
    }

    // 可选字段: confidence
    if (atom.confidence !== undefined && !this.validateConfidence(atom.confidence)) {
      errors.push({
        field: 'confidence',
        message: `confidence 必须在 [0.0, 1.0] 范围内，当前值: ${atom.confidence}`,
        code: 'OUT_OF_RANGE',
      })
    }

    // 可选字段: likely_root_causes.probability
    if (atom.likely_root_causes && Array.isArray(atom.likely_root_causes)) {
      for (let i = 0; i < atom.likely_root_causes.length; i++) {
        const rc = atom.likely_root_causes[i]
        if (rc.probability !== undefined && !this.validateProbability(rc.probability)) {
          errors.push({
            field: `likely_root_causes[${i}].probability`,
            message: `probability 必须在 [0.0, 1.0] 范围内，当前值: ${rc.probability}`,
            code: 'OUT_OF_RANGE',
          })
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  validateDomain(domain: string): boolean {
    return this.validDomains.has(domain)
  }

  validateActionCodes(actions: string[]): ValidationResult {
    const errors: ValidationError[] = []
    for (const code of actions) {
      if (!this.validActionCodes.has(code)) {
        errors.push({
          field: 'recommended_actions',
          message: `无效的 Action_Code: ${code}`,
          code: 'INVALID_ACTION_CODE',
        })
      }
    }
    return { valid: errors.length === 0, errors }
  }

  validateConfidence(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0.0 && value <= 1.0
  }

  validateProbability(value: number): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0.0 && value <= 1.0
  }
}
