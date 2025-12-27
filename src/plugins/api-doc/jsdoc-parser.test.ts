/**
 * JSDoc 解析器属性测试
 * Feature: doc-system-enhancement, Property 12: JSDoc comment parsing
 * Validates: Requirements 3.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { JSDocParser } from './jsdoc-parser'

/**
 * Property 12: JSDoc comment parsing
 * For any exported symbol with JSDoc comments, the generated documentation SHALL include
 * the description, parameters, and return type from the comments.
 */
describe('JSDoc Parser - Property Tests', () => {
  it('Property 12: should parse description from JSDoc comments', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('*/') && !s.includes('/*')),
        (description) => {
          // Generate source with JSDoc comment
          const source = `
/**
 * ${description}
 */
export function testFunction(): void {}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify description is extracted
          expect(result).not.toBeNull()
          expect(result!.description).toContain(description)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse @param tags with descriptions', () => {
    fc.assert(
      fc.property(
        fc.record({
          paramName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          paramType: fc.constantFrom('string', 'number', 'boolean'),
          paramDesc: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('*/') && !s.includes('/*'))
        }),
        ({ paramName, paramType, paramDesc }) => {
          // Generate source with @param tag
          const source = `
/**
 * Test function
 * @param ${paramName} - ${paramDesc}
 */
export function testFunction(${paramName}: ${paramType}): void {}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify param is extracted
          expect(result).not.toBeNull()
          expect(result!.params.has(paramName)).toBe(true)

          const param = result!.params.get(paramName)
          expect(param).toBeDefined()
          expect(param!.description).toContain(paramDesc)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse @returns tag with description', () => {
    fc.assert(
      fc.property(
        fc.record({
          returnType: fc.constantFrom('string', 'number', 'boolean', 'void'),
          returnDesc: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('*/') && !s.includes('/*'))
        }),
        ({ returnType, returnDesc }) => {
          // Generate source with @returns tag
          const source = `
/**
 * Test function
 * @returns ${returnDesc}
 */
export function testFunction(): ${returnType} {
  return ${returnType === 'void' ? '' : returnType === 'string' ? '""' : returnType === 'number' ? '0' : 'false'}
}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify returns is extracted
          expect(result).not.toBeNull()
          expect(result!.returns).toBeDefined()
          expect(result!.returns!.description).toContain(returnDesc)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse @example tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('*/') && !s.includes('/*')),
        (exampleCode) => {
          // Generate source with @example tag
          const source = `
/**
 * Test function
 * @example
 * ${exampleCode}
 */
export function testFunction(): void {}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify example is extracted
          expect(result).not.toBeNull()
          expect(result!.examples.length).toBeGreaterThan(0)
          expect(result!.examples[0]).toContain(exampleCode)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse multiple @param tags', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
            type: fc.constantFrom('string', 'number', 'boolean'),
            desc: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('*/') && !s.includes('/*'))
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (params) => {
          // Generate source with multiple @param tags
          const paramDocs = params.map(p => ` * @param ${p.name} - ${p.desc}`).join('\n')
          const paramList = params.map(p => `${p.name}: ${p.type}`).join(', ')

          const source = `
/**
 * Test function
${paramDocs}
 */
export function testFunction(${paramList}): void {}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify all params are extracted
          expect(result).not.toBeNull()
          expect(result!.params.size).toBe(params.length)

          for (const param of params) {
            expect(result!.params.has(param.name)).toBe(true)
            const parsedParam = result!.params.get(param.name)
            expect(parsedParam).toBeDefined()
            expect(parsedParam!.description).toContain(param.desc)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse custom tags', () => {
    fc.assert(
      fc.property(
        fc.record({
          tagName: fc.constantFrom('deprecated', 'internal', 'beta', 'since'),
          tagValue: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('*/') && !s.includes('/*'))
        }),
        ({ tagName, tagValue }) => {
          // Generate source with custom tag
          const source = `
/**
 * Test function
 * @${tagName} ${tagValue}
 */
export function testFunction(): void {}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify custom tag is extracted
          expect(result).not.toBeNull()
          expect(result!.otherTags.has(tagName)).toBe(true)
          expect(result!.otherTags.get(tagName)).toContain(tagValue)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 12: should parse complete JSDoc with all elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          description: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('*/') && !s.includes('/*')),
          paramName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          paramDesc: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('*/') && !s.includes('/*')),
          returnDesc: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('*/') && !s.includes('/*')),
          example: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('*/') && !s.includes('/*'))
        }),
        ({ description, paramName, paramDesc, returnDesc, example }) => {
          // Generate source with complete JSDoc
          const source = `
/**
 * ${description}
 * @param ${paramName} - ${paramDesc}
 * @returns ${returnDesc}
 * @example
 * ${example}
 */
export function testFunction(${paramName}: string): string {
  return ""
}
`

          // Parse JSDoc
          const result = JSDocParser.parseFromSource(source)

          // Verify all elements are extracted
          expect(result).not.toBeNull()
          expect(result!.description).toContain(description)
          expect(result!.params.has(paramName)).toBe(true)
          expect(result!.params.get(paramName)!.description).toContain(paramDesc)
          expect(result!.returns).toBeDefined()
          expect(result!.returns!.description).toContain(returnDesc)
          expect(result!.examples.length).toBeGreaterThan(0)
          expect(result!.examples[0]).toContain(example)
        }
      ),
      { numRuns: 100 }
    )
  })
})

