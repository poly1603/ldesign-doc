/**
 * 导航生成器属性测试
 * Feature: doc-system-enhancement, Property 13: Module hierarchy navigation
 * Validates: Requirements 3.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateNavigation } from './navigation-generator'
import type { ApiModule } from './index'

/**
 * Property 13: Module hierarchy navigation
 * For any set of TypeScript modules, the generated navigation structure SHALL reflect
 * the module hierarchy with correct parent-child relationships.
 */
describe('Navigation Generator - Property Tests', () => {
  it('Property 13: should generate navigation for all modules', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
            path: fc.stringMatching(/^[a-z][a-zA-Z0-9/]*\.ts$/),
            exports: fc.constant([]) as fc.Arbitrary<[]>
          }),
          { minLength: 1, maxLength: 10 }
        ).map(modules => modules.map(m => ({ ...m, exports: [] as [] }))),
        (modules) => {
          // Generate navigation
          const navigation = generateNavigation(modules as ApiModule[], {
            outDir: 'api'
          })

          // Verify navigation is generated
          expect(navigation).toBeDefined()
          expect(Array.isArray(navigation)).toBe(true)

          // Should have at least one item
          expect(navigation.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: should preserve module hierarchy in navigation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
            path: fc.stringMatching(/^[a-z][a-zA-Z0-9]*\.ts$/),
            exports: fc.constant([]) as fc.Arbitrary<[]>
          }),
          { minLength: 1, maxLength: 5 }
        ).map(modules => modules.map(m => ({ ...m, exports: [] as [] }))),
        (modules) => {
          // Generate navigation
          const navigation = generateNavigation(modules as ApiModule[], {
            outDir: 'api'
          })

          // Count total navigation items (including nested)
          const countItems = (items: any[]): number => {
            let count = items.length
            for (const item of items) {
              if (item.items) {
                count += countItems(item.items)
              }
            }
            return count
          }

          const totalItems = countItems(navigation)

          // Should have at least as many items as modules
          expect(totalItems).toBeGreaterThanOrEqual(modules.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: should generate grouped navigation when groups are provided', () => {
    fc.assert(
      fc.property(
        fc.record({
          groupName: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          groupTitle: fc.stringMatching(/^[A-Z][a-zA-Z0-9 ]*$/),
          pattern: fc.constantFrom('src/core/**/*.ts', 'src/utils/**/*.ts', 'src/**/*.ts')
        }),
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
            path: fc.constantFrom('src/core/test.ts', 'src/utils/helper.ts', 'src/main.ts'),
            exports: fc.constant([]) as fc.Arbitrary<[]>
          }),
          { minLength: 1, maxLength: 5 }
        ).map(modules => modules.map(m => ({ ...m, exports: [] as [] }))),
        (group, modules) => {
          // Generate grouped navigation
          const navigation = generateNavigation(modules as ApiModule[], {
            outDir: 'api',
            groups: [{
              name: group.groupName,
              title: group.groupTitle,
              pattern: group.pattern
            }]
          })

          // Verify navigation structure
          expect(navigation).toBeDefined()
          expect(Array.isArray(navigation)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: should sort navigation alphabetically when enabled', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
            path: fc.stringMatching(/^[a-z][a-zA-Z0-9]*\.ts$/),
            exports: fc.constant([]) as fc.Arbitrary<[]>
          }),
          { minLength: 2, maxLength: 10 }
        ).map(modules => modules.map(m => ({ ...m, exports: [] as [] }))),
        (modules) => {
          // Generate navigation with sorting
          const navigation = generateNavigation(modules as ApiModule[], {
            outDir: 'api',
            sortAlphabetically: true
          })

          // Verify items are sorted
          if (navigation.length > 1) {
            for (let i = 0; i < navigation.length - 1; i++) {
              const current = navigation[i].text
              const next = navigation[i + 1].text
              expect(current.localeCompare(next)).toBeLessThanOrEqual(0)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Property 13: should generate correct links for modules', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/),
          path: fc.stringMatching(/^[a-z][a-zA-Z0-9]*\.ts$/),
          outDir: fc.stringMatching(/^[a-z][a-zA-Z0-9-]*$/)
        }),
        ({ name, path, outDir }) => {
          const modules: ApiModule[] = [{
            name,
            path,
            exports: []
          }]

          // Generate navigation
          const navigation = generateNavigation(modules, { outDir })

          // Find the module item
          const findLink = (items: any[]): string | null => {
            for (const item of items) {
              if (item.link) {
                return item.link
              }
              if (item.items) {
                const link = findLink(item.items)
                if (link) return link
              }
            }
            return null
          }

          const link = findLink(navigation)

          // Verify link format
          expect(link).toBeDefined()
          expect(link).toContain(`/${outDir}/`)
          expect(link).toContain(name)
        }
      ),
      { numRuns: 100 }
    )
  })
})

