/**
 * TypeScript 提取器属性测试
 * Feature: doc-system-enhancement, Property 11: TypeScript extraction completeness
 * Validates: Requirements 3.1
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { extractTypeScriptApi } from './typescript-extractor'

/**
 * 生成临时 TypeScript 文件
 */
async function createTempTsFile(content: string): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'api-doc-test-'))
  const filePath = path.join(tmpDir, 'test.ts')
  await fs.writeFile(filePath, content, 'utf-8')
  return filePath
}

/**
 * 清理临时文件
 */
async function cleanupTempFile(filePath: string): Promise<void> {
  const dir = path.dirname(filePath)
  await fs.rm(dir, { recursive: true, force: true })
}

/**
 * Property 11: TypeScript extraction completeness
 * For any TypeScript source file, the API documentation generator SHALL extract
 * all exported types, functions, classes, and interfaces.
 */
describe('TypeScript Extractor - Property Tests', () => {
  it('Property 11: should extract all exported functions', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/),
            params: fc.array(
              fc.record({
                name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
                type: fc.constantFrom('string', 'number', 'boolean', 'any')
              }),
              { maxLength: 3 }
            ),
            returnType: fc.constantFrom('string', 'number', 'boolean', 'void')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (functions) => {
          // Generate TypeScript source with exported functions
          const functionDeclarations = functions.map(fn => {
            const params = fn.params.map(p => `${p.name}: ${p.type}`).join(', ')
            return `export function ${fn.name}(${params}): ${fn.returnType} {
  return ${fn.returnType === 'void' ? '' : fn.returnType === 'string' ? '""' : fn.returnType === 'number' ? '0' : 'false'}
}`
          }).join('\n\n')

          const filePath = await createTempTsFile(functionDeclarations)

          try {
            // Extract API
            const modules = extractTypeScriptApi([filePath])

            // Verify extraction
            expect(modules.length).toBeGreaterThan(0)
            const module = modules[0]

            // All exported functions should be extracted
            const extractedFunctions = module.exports.filter(e => e.kind === 'function')
            expect(extractedFunctions.length).toBe(functions.length)

            // Each function should have correct name
            const extractedNames = extractedFunctions.map(f => f.name).sort()
            const expectedNames = functions.map(f => f.name).sort()
            expect(extractedNames).toEqual(expectedNames)

            // Each function should have parameters
            for (const fn of extractedFunctions) {
              expect(fn.params).toBeDefined()
            }
          } finally {
            await cleanupTempFile(filePath)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('Property 11: should extract all exported classes', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
            properties: fc.array(
              fc.record({
                name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
                type: fc.constantFrom('string', 'number', 'boolean')
              }),
              { maxLength: 3 }
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (classes) => {
          // Generate TypeScript source with exported classes
          const classDeclarations = classes.map(cls => {
            const properties = cls.properties.map(p => `  ${p.name}: ${p.type}`).join('\n')
            return `export class ${cls.name} {
${properties}
}`
          }).join('\n\n')

          const filePath = await createTempTsFile(classDeclarations)

          try {
            // Extract API
            const modules = extractTypeScriptApi([filePath])

            // Verify extraction
            expect(modules.length).toBeGreaterThan(0)
            const module = modules[0]

            // All exported classes should be extracted
            const extractedClasses = module.exports.filter(e => e.kind === 'class')
            expect(extractedClasses.length).toBe(classes.length)

            // Each class should have correct name
            const extractedNames = extractedClasses.map(c => c.name).sort()
            const expectedNames = classes.map(c => c.name).sort()
            expect(extractedNames).toEqual(expectedNames)

            // Each class should have members
            for (const cls of extractedClasses) {
              expect(cls.members).toBeDefined()
            }
          } finally {
            await cleanupTempFile(filePath)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('Property 11: should extract all exported interfaces', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
            properties: fc.array(
              fc.record({
                name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
                type: fc.constantFrom('string', 'number', 'boolean'),
                optional: fc.boolean()
              }),
              { maxLength: 3 }
            )
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (interfaces) => {
          // Generate TypeScript source with exported interfaces
          const interfaceDeclarations = interfaces.map(iface => {
            const properties = iface.properties.map(p =>
              `  ${p.name}${p.optional ? '?' : ''}: ${p.type}`
            ).join('\n')
            return `export interface ${iface.name} {
${properties}
}`
          }).join('\n\n')

          const filePath = await createTempTsFile(interfaceDeclarations)

          try {
            // Extract API
            const modules = extractTypeScriptApi([filePath])

            // Verify extraction
            expect(modules.length).toBeGreaterThan(0)
            const module = modules[0]

            // All exported interfaces should be extracted
            const extractedInterfaces = module.exports.filter(e => e.kind === 'interface')
            expect(extractedInterfaces.length).toBe(interfaces.length)

            // Each interface should have correct name
            const extractedNames = extractedInterfaces.map(i => i.name).sort()
            const expectedNames = interfaces.map(i => i.name).sort()
            expect(extractedNames).toEqual(expectedNames)

            // Each interface should have members
            for (const iface of extractedInterfaces) {
              expect(iface.members).toBeDefined()
            }
          } finally {
            await cleanupTempFile(filePath)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('Property 11: should extract all exported type aliases', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
            type: fc.constantFrom('string', 'number', 'boolean', 'string | number')
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (types) => {
          // Generate TypeScript source with exported type aliases
          const typeDeclarations = types.map(t =>
            `export type ${t.name} = ${t.type}`
          ).join('\n\n')

          const filePath = await createTempTsFile(typeDeclarations)

          try {
            // Extract API
            const modules = extractTypeScriptApi([filePath])

            // Verify extraction
            expect(modules.length).toBeGreaterThan(0)
            const module = modules[0]

            // All exported types should be extracted
            const extractedTypes = module.exports.filter(e => e.kind === 'type')
            expect(extractedTypes.length).toBe(types.length)

            // Each type should have correct name
            const extractedNames = extractedTypes.map(t => t.name).sort()
            const expectedNames = types.map(t => t.name).sort()
            expect(extractedNames).toEqual(expectedNames)
          } finally {
            await cleanupTempFile(filePath)
          }
        }
      ),
      { numRuns: 25 }
    )
  })

  it('Property 11: should extract mixed exports (functions, classes, interfaces, types)', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          functionName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          className: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          interfaceName: fc.stringMatching(/^I[A-Z][a-zA-Z0-9]*$/),
          typeName: fc.stringMatching(/^T[A-Z][a-zA-Z0-9]*$/)
        }),
        async ({ functionName, className, interfaceName, typeName }) => {
          // Generate TypeScript source with mixed exports
          const source = `
export function ${functionName}(): void {}

export class ${className} {
  value: string
}

export interface ${interfaceName} {
  id: number
}

export type ${typeName} = string | number
`

          const filePath = await createTempTsFile(source)

          try {
            // Extract API
            const modules = extractTypeScriptApi([filePath])

            // Verify extraction
            expect(modules.length).toBeGreaterThan(0)
            const module = modules[0]

            // Should extract all 4 exports
            expect(module.exports.length).toBe(4)

            // Should have one of each kind
            const kinds = module.exports.map(e => e.kind).sort()
            expect(kinds).toContain('function')
            expect(kinds).toContain('class')
            expect(kinds).toContain('interface')
            expect(kinds).toContain('type')

            // Should have correct names
            const names = module.exports.map(e => e.name)
            expect(names).toContain(functionName)
            expect(names).toContain(className)
            expect(names).toContain(interfaceName)
            expect(names).toContain(typeName)
          } finally {
            await cleanupTempFile(filePath)
          }
        }
      ),
      { numRuns: 25 }
    )
  })
})

