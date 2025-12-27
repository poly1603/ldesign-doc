/**
 * 类型链接器属性测试
 * Feature: doc-system-enhancement, Property 14: Type reference linking
 * Validates: Requirements 3.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { createTypeLinker, enrichModulesWithTypeLinks } from './type-linker'
import type { ApiModule, ApiExport } from './index'

/**
 * Property 14: Type reference linking
 * For any type reference in API documentation, if the referenced type is documented,
 * a valid link to that type's documentation SHALL be generated.
 */
describe('Type Linker - Property Tests', () => {
  it('Property 14: should generate links for documented types', () => {
    fc.assert(
      fc.property(
        fc.record({
          typeName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          moduleName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          outDir: fc.stringMatching(/^[a-z][a-zA-Z0-9-]*$/)
        }),
        ({ typeName, moduleName, outDir }) => {
          // Create a module with a type export
          const modules: ApiModule[] = [{
            name: moduleName,
            path: `${moduleName}.ts`,
            exports: [{
              name: typeName,
              kind: 'interface',
              signature: `interface ${typeName} {}`
            }]
          }]

          // Create type linker
          const linker = createTypeLinker(modules, { outDir, enabled: true })

          // Get link for the type
          const link = linker.getTypeLink(typeName)

          // Verify link is generated
          expect(link).toBeDefined()
          expect(link).toContain(`/${outDir}/`)
          expect(link).toContain(moduleName)
          expect(link).toContain(typeName)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: should detect type references in type strings', () => {
    fc.assert(
      fc.property(
        fc.record({
          typeName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          moduleName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/)
        }),
        ({ typeName, moduleName }) => {
          // Create a module with a type export
          const modules: ApiModule[] = [{
            name: moduleName,
            path: `${moduleName}.ts`,
            exports: [{
              name: typeName,
              kind: 'interface',
              signature: `interface ${typeName} {}`
            }]
          }]

          // Create type linker
          const linker = createTypeLinker(modules, { outDir: 'api', enabled: true })

          // Parse type references
          const typeString = `Promise<${typeName}>`
          const references = linker.parseTypeReferences(typeString)

          // Verify type is detected
          expect(references.length).toBeGreaterThan(0)
          const typeRef = references.find(r => r.name === typeName)
          expect(typeRef).toBeDefined()
          expect(typeRef!.found).toBe(true)
          expect(typeRef!.link).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: should linkify type strings with documented types', () => {
    fc.assert(
      fc.property(
        fc.record({
          typeName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          moduleName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/)
        }),
        ({ typeName, moduleName }) => {
          // Create a module with a type export
          const modules: ApiModule[] = [{
            name: moduleName,
            path: `${moduleName}.ts`,
            exports: [{
              name: typeName,
              kind: 'interface',
              signature: `interface ${typeName} {}`
            }]
          }]

          // Create type linker
          const linker = createTypeLinker(modules, { outDir: 'api', enabled: true })

          // Linkify type string
          const typeString = `Promise<${typeName}>`
          const linkedType = linker.linkifyType(typeString)

          // Verify type is linked
          expect(linkedType).toContain('[')
          expect(linkedType).toContain(']')
          expect(linkedType).toContain('(')
          expect(linkedType).toContain(')')
          expect(linkedType).toContain(typeName)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: should enrich export items with type links', () => {
    fc.assert(
      fc.property(
        fc.record({
          typeName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          functionName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          moduleName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/)
        }),
        ({ typeName, functionName, moduleName }) => {
          // Create modules with type and function
          const modules: ApiModule[] = [
            {
              name: moduleName,
              path: `${moduleName}.ts`,
              exports: [
                {
                  name: typeName,
                  kind: 'interface',
                  signature: `interface ${typeName} {}`
                },
                {
                  name: functionName,
                  kind: 'function',
                  signature: `function ${functionName}(): ${typeName}`,
                  returns: {
                    type: typeName
                  }
                }
              ]
            }
          ]

          // Enrich with type links
          enrichModulesWithTypeLinks(modules, { outDir: 'api', enabled: true })

          // Find the function export
          const functionExport = modules[0].exports.find(e => e.name === functionName)
          expect(functionExport).toBeDefined()

          // Verify return type is linked
          expect(functionExport!.returns).toBeDefined()
          expect(functionExport!.returns!.type).toContain('[')
          expect(functionExport!.returns!.type).toContain(typeName)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: should not generate links when disabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          typeName: fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          moduleName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/)
        }),
        ({ typeName, moduleName }) => {
          // Create a module with a type export
          const modules: ApiModule[] = [{
            name: moduleName,
            path: `${moduleName}.ts`,
            exports: [{
              name: typeName,
              kind: 'interface',
              signature: `interface ${typeName} {}`
            }]
          }]

          // Create type linker with linking disabled
          const linker = createTypeLinker(modules, { outDir: 'api', enabled: false })

          // Try to linkify type string
          const typeString = `Promise<${typeName}>`
          const linkedType = linker.linkifyType(typeString)

          // Verify type is NOT linked
          expect(linkedType).toBe(typeString)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 14: should handle multiple type references', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.stringMatching(/^[A-Z][a-zA-Z0-9]*$/),
          { minLength: 2, maxLength: 5 }
        ),
        fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
        (typeNames, moduleName) => {
          // Create a module with multiple type exports
          const modules: ApiModule[] = [{
            name: moduleName,
            path: `${moduleName}.ts`,
            exports: typeNames.map(name => ({
              name,
              kind: 'interface' as const,
              signature: `interface ${name} {}`
            }))
          }]

          // Create type linker
          const linker = createTypeLinker(modules, { outDir: 'api', enabled: true })

          // Create type string with multiple references
          const typeString = typeNames.join(' | ')
          const references = linker.parseTypeReferences(typeString)

          // Verify all types are detected
          expect(references.length).toBeGreaterThanOrEqual(typeNames.length)

          for (const typeName of typeNames) {
            const ref = references.find(r => r.name === typeName)
            expect(ref).toBeDefined()
            expect(ref!.found).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

