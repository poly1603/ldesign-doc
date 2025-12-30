/**
 * Property-based tests for code splitting
 * Feature: doc-system-enhancement, Property 40: Code splitting
 * Validates: Requirements 10.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { codeSplitting, calculateOptimalChunks } from './codeSplitting'
import type { SiteConfig } from '../../shared/types'

describe('Code Splitting - Property Tests', () => {
  /**
   * Property 40: Code splitting
   * For any build, the output SHALL contain multiple chunks with shared dependencies
   * extracted into common chunks.
   */
  describe('Property 40: Code splitting', () => {
    it('should configure manual chunks for common dependencies', () => {
      fc.assert(
        fc.property(
          fc.record({
            minChunks: fc.integer({ min: 1, max: 10 }),
            maxParallelRequests: fc.integer({ min: 5, max: 50 })
          }),
          (options) => {
            const config: Partial<SiteConfig> = {
              vite: {}
            }

            codeSplitting(config as SiteConfig, options)

            // Verify vite config was created
            expect(config.vite).toBeDefined()
            expect(config.vite!.build).toBeDefined()
            expect(config.vite!.build!.rollupOptions).toBeDefined()
            expect(config.vite!.build!.rollupOptions!.output).toBeDefined()

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              // Verify manualChunks function exists
              expect(output.manualChunks).toBeDefined()
              expect(typeof output.manualChunks).toBe('function')

              return true
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract Vue dependencies into vendor-vue chunk', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'node_modules/vue/dist/vue.js',
            'node_modules/@vue/runtime-core/index.js',
            'node_modules/@vue/reactivity/index.js'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === 'vendor-vue'
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract React dependencies into vendor-react chunk', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'node_modules/react/index.js',
            'node_modules/react-dom/client.js',
            'node_modules/react-dom/index.js'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === 'vendor-react'
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract Markdown dependencies into vendor-markdown chunk', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'node_modules/markdown-it/lib/index.js',
            'node_modules/shiki/dist/index.js'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === 'vendor-markdown'
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract Mermaid into separate chunk', () => {
      const config: Partial<SiteConfig> = { vite: {} }
      codeSplitting(config as SiteConfig)

      const output = config.vite!.build!.rollupOptions!.output
      if (typeof output === 'object' && !Array.isArray(output)) {
        const manualChunks = output.manualChunks as (id: string) => string | undefined
        const chunkName = manualChunks('node_modules/mermaid/dist/mermaid.js')

        expect(chunkName).toBe('vendor-mermaid')
      }
    })

    it('should extract theme code into theme chunk', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/src/theme-default/Layout.vue',
            '/src/theme/components/Header.vue'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === 'theme'
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract plugin code into plugins chunk', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/src/plugins/search/index.ts',
            '/src/plugins/version/VersionSelector.vue'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === 'plugins'
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return undefined for non-vendor, non-theme, non-plugin modules', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '/src/pages/index.md',
            '/src/components/MyComponent.vue',
            '/src/utils/helper.ts'
          ),
          (modulePath) => {
            const config: Partial<SiteConfig> = { vite: {} }
            codeSplitting(config as SiteConfig)

            const output = config.vite!.build!.rollupOptions!.output
            if (typeof output === 'object' && !Array.isArray(output)) {
              const manualChunks = output.manualChunks as (id: string) => string | undefined
              const chunkName = manualChunks(modulePath)

              return chunkName === undefined
            }

            return false
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Optimal Chunks Calculation', () => {
    it('should extract modules referenced at least minChunks times', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 10 }),
              deps: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (minChunks, modules) => {
            // Build module map
            const moduleMap = new Map<string, Set<string>>()
            for (const mod of modules) {
              moduleMap.set(mod.name, new Set(mod.deps))
            }

            const chunks = calculateOptimalChunks(moduleMap, minChunks)

            // Count references for each dependency
            const depCounts = new Map<string, number>()
            for (const [, deps] of moduleMap) {
              for (const dep of deps) {
                depCounts.set(dep, (depCounts.get(dep) || 0) + 1)
              }
            }

            // Verify all extracted modules meet the threshold
            const extractedModules = new Set<string>()
            for (const [, mods] of chunks) {
              for (const mod of mods) {
                extractedModules.add(mod)
              }
            }

            for (const mod of extractedModules) {
              const count = depCounts.get(mod) || 0
              if (count < minChunks) {
                return false
              }
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not extract modules referenced less than minChunks times', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 5 }),
          (minChunks) => {
            // Create a module map where each dep is referenced exactly minChunks-1 times
            const moduleMap = new Map<string, Set<string>>()
            for (let i = 0; i < minChunks - 1; i++) {
              moduleMap.set(`module${i}`, new Set(['shared-dep']))
            }

            const chunks = calculateOptimalChunks(moduleMap, minChunks)

            // Verify no chunks were created (since shared-dep is referenced < minChunks times)
            return chunks.size === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
