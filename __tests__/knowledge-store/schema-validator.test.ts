import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { SchemaValidator } from '@/lib/knowledge-store/schema-validator'
import { VALID_DOMAINS, VALID_ACTION_CODES } from '@/lib/knowledge-store/constants'

const validator = new SchemaValidator(VALID_DOMAINS, VALID_ACTION_CODES)

describe('SchemaValidator', () => {
  // ─── Property 1: 必填字段校验拒绝无效输入 ───
  describe('Property 1: 必填字段校验拒绝无效输入', () => {
    it('缺少 domain 时返回 valid: false', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          (signals) => {
            const result = validator.validate({ symptom_signals: signals })
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.field === 'domain')).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('缺少 symptom_signals 时返回 valid: false', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DOMAINS),
          (domain) => {
            const result = validator.validate({ domain })
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.field === 'symptom_signals')).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('symptom_signals 为空数组时返回 valid: false', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DOMAINS),
          (domain) => {
            const result = validator.validate({ domain, symptom_signals: [] })
            expect(result.valid).toBe(false)
            expect(result.errors.some(e => e.field === 'symptom_signals')).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // ─── Property 2: Domain 编码校验 ───
  describe('Property 2: Domain 编码校验', () => {
    it('有效 domain 返回 true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VALID_DOMAINS),
          (domain) => {
            expect(validator.validateDomain(domain)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('无效 domain 返回 false', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !(VALID_DOMAINS as readonly string[]).includes(s)),
          (domain) => {
            expect(validator.validateDomain(domain)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // ─── Property 3: Action Code 编码校验 ───
  describe('Property 3: Action Code 编码校验', () => {
    it('全部有效 action codes 返回 valid: true', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...VALID_ACTION_CODES), { minLength: 1, maxLength: 5 }),
          (actions) => {
            const result = validator.validateActionCodes(actions)
            expect(result.valid).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('包含无效 action code 返回 valid: false', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter(s => !(VALID_ACTION_CODES as readonly string[]).includes(s)),
          (invalidCode) => {
            const result = validator.validateActionCodes([invalidCode])
            expect(result.valid).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // ─── Property 4: 数值范围校验 ───
  describe('Property 4: 数值范围校验', () => {
    it('0.0-1.0 范围内的值返回 true', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.0, max: 1.0, noNaN: true }),
          (n) => {
            expect(validator.validateConfidence(n)).toBe(true)
            expect(validator.validateProbability(n)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('超出范围的值返回 false', () => {
      fc.assert(
        fc.property(
          fc.double({ noNaN: true }).filter(n => n < 0.0 || n > 1.0),
          (n) => {
            expect(validator.validateConfidence(n)).toBe(false)
            expect(validator.validateProbability(n)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('NaN 返回 false', () => {
      expect(validator.validateConfidence(NaN)).toBe(false)
      expect(validator.validateProbability(NaN)).toBe(false)
    })
  })
})
