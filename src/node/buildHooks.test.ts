/**
 * Property-based tests for build hooks
 * Feature: doc-system-enhancement, Property 50: Build hook execution
 * Validates: Requirements 12.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mkdirSync, existsSync, rmSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import type { SiteConfig, BuildHookFunction } from '../shared/types'

// Test directory
const TEST_ROOT = resolve(__dirname, '../../test-temp/build-hooks')

// Mock SiteConfig for testing
function createMockSiteConfig(overrides?: Partial<SiteConfig>): SiteConfig {
  return {
    root: TEST_ROOT,
    srcDir: join(TEST_ROOT, 'docs'),
    extraDocs: [],
    outDir: join(TEST_ROOT, 'dist'),
    base: '/',
    title: 'Test Site',
    description: 'Test Description',
    lang: 'en-US',
    head: [],
    framework: 'vue',
    themeConfig: {},
    locales: {},
    markdown: {},
    vite: {},
    build: {
      minify: true,
      sourcemap: false,
      ssr: false,
      ...overrides?.build
    },
    auth: { enabled: false },
    configPath: undefined,
    configDeps: [],
    themeDir: join(TEST_ROOT, 'theme'),
    tempDir: join(TEST_ROOT, '.temp'),
    cacheDir: join(TEST_ROOT, '.cache'),
    userPlugins: [],
    ...overrides
  } as SiteConfig
}

// Helper to execute build hooks
async function executeBuildHooks(
  hooks: BuildHookFunction | BuildHookFunction[] | undefined,
  config: SiteConfig
): Promise<void> {
  if (!hooks) return

  const hookArray = Array.isArray(hooks) ? hooks : [hooks]

  for (const hook of hookArray) {
    await hook(config)
  }
}

describe('Build Hooks - Property Tests', () => {
  beforeEach(() => {
    // Create test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
    mkdirSync(TEST_ROOT, { recursive: true })
    mkdirSync(join(TEST_ROOT, 'docs'), { recursive: true })
    mkdirSync(join(TEST_ROOT, 'dist'), { recursive: true })
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
  })

  /**
   * Property 50: Build hook execution
   * For any configured build hooks, the hooks SHALL be executed at the correct
   * lifecycle phase (pre-build or post-build).
   */
  it('should execute pre-build hooks before build starts', async () => {
    const executionLog: string[] = []

    const preBuildHook: BuildHookFunction = async (config) => {
      executionLog.push('pre-build')
      // Verify we can access config
      expect(config.root).toBe(TEST_ROOT)
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: preBuildHook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(executionLog).toEqual(['pre-build'])
  })

  it('should execute post-build hooks after build completes', async () => {
    const executionLog: string[] = []

    const postBuildHook: BuildHookFunction = async (config) => {
      executionLog.push('post-build')
      expect(config.outDir).toBe(join(TEST_ROOT, 'dist'))
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          postBuild: postBuildHook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.postBuild, config)

    expect(executionLog).toEqual(['post-build'])
  })

  it('should execute multiple pre-build hooks in order', async () => {
    const executionLog: string[] = []

    const hooks: BuildHookFunction[] = [
      async () => { executionLog.push('hook-1') },
      async () => { executionLog.push('hook-2') },
      async () => { executionLog.push('hook-3') }
    ]

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: hooks
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(executionLog).toEqual(['hook-1', 'hook-2', 'hook-3'])
  })

  it('should execute multiple post-build hooks in order', async () => {
    const executionLog: string[] = []

    const hooks: BuildHookFunction[] = [
      async () => { executionLog.push('post-1') },
      async () => { executionLog.push('post-2') },
      async () => { executionLog.push('post-3') }
    ]

    const config = createMockSiteConfig({
      build: {
        hooks: {
          postBuild: hooks
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.postBuild, config)

    expect(executionLog).toEqual(['post-1', 'post-2', 'post-3'])
  })

  it('should pass correct config to hooks', async () => {
    let receivedConfig: SiteConfig | null = null

    const hook: BuildHookFunction = async (config) => {
      receivedConfig = config
    }

    const config = createMockSiteConfig({
      title: 'Custom Title',
      description: 'Custom Description',
      build: {
        hooks: {
          preBuild: hook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(receivedConfig).not.toBeNull()
    if (receivedConfig) {
      expect(receivedConfig.title).toBe('Custom Title')
      expect(receivedConfig.description).toBe('Custom Description')
    }
  })

  it('should support synchronous hooks', async () => {
    const executionLog: string[] = []

    const syncHook: BuildHookFunction = (config) => {
      executionLog.push('sync-hook')
      expect(config.root).toBe(TEST_ROOT)
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: syncHook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(executionLog).toEqual(['sync-hook'])
  })

  it('should support asynchronous hooks', async () => {
    const executionLog: string[] = []

    const asyncHook: BuildHookFunction = async (config) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      executionLog.push('async-hook')
      expect(config.root).toBe(TEST_ROOT)
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: asyncHook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(executionLog).toEqual(['async-hook'])
  })

  it('should allow hooks to create files', async () => {
    const testFile = join(TEST_ROOT, 'hook-created-file.txt')

    const hook: BuildHookFunction = async () => {
      writeFileSync(testFile, 'Created by hook')
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: hook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(existsSync(testFile)).toBe(true)
  })

  it('should allow hooks to modify directories', async () => {
    const customDir = join(TEST_ROOT, 'custom-dir')

    const hook: BuildHookFunction = async () => {
      mkdirSync(customDir, { recursive: true })
      writeFileSync(join(customDir, 'file.txt'), 'content')
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: hook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(existsSync(customDir)).toBe(true)
    expect(existsSync(join(customDir, 'file.txt'))).toBe(true)
  })

  it('should propagate errors from hooks', async () => {
    const errorMessage = 'Hook error'

    const failingHook: BuildHookFunction = async () => {
      throw new Error(errorMessage)
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: failingHook
        }
      }
    })

    await expect(
      executeBuildHooks(config.build.hooks?.preBuild, config)
    ).rejects.toThrow(errorMessage)
  })

  it('should handle undefined hooks gracefully', async () => {
    const config = createMockSiteConfig({
      build: {
        hooks: undefined
      }
    })

    // Should not throw
    await expect(
      executeBuildHooks(config.build.hooks?.preBuild, config)
    ).resolves.toBeUndefined()
  })

  it('should handle empty hook arrays', async () => {
    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: [],
          postBuild: []
        }
      }
    })

    // Should not throw
    await expect(
      executeBuildHooks(config.build.hooks?.preBuild, config)
    ).resolves.toBeUndefined()
  })

  it('should execute hooks with access to all config properties', async () => {
    let capturedConfig: {
      root?: string
      srcDir?: string
      outDir?: string
      base?: string
      title?: string
      description?: string
      lang?: string
    } = {}

    const hook: BuildHookFunction = async (config) => {
      capturedConfig = {
        root: config.root,
        srcDir: config.srcDir,
        outDir: config.outDir,
        base: config.base,
        title: config.title,
        description: config.description,
        lang: config.lang
      }
    }

    const config = createMockSiteConfig({
      title: 'Test Title',
      description: 'Test Description',
      lang: 'zh-CN',
      base: '/docs/',
      build: {
        hooks: {
          preBuild: hook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(capturedConfig.root).toBe(TEST_ROOT)
    expect(capturedConfig.title).toBe('Test Title')
    expect(capturedConfig.description).toBe('Test Description')
    expect(capturedConfig.lang).toBe('zh-CN')
    expect(capturedConfig.base).toBe('/docs/')
  })

  it('should support both single hook and array of hooks', async () => {
    const log1: string[] = []
    const log2: string[] = []

    const singleHook: BuildHookFunction = async () => {
      log1.push('single')
    }

    const multipleHooks: BuildHookFunction[] = [
      async () => { log2.push('multi-1') },
      async () => { log2.push('multi-2') }
    ]

    const config1 = createMockSiteConfig({
      build: { hooks: { preBuild: singleHook } }
    })

    const config2 = createMockSiteConfig({
      build: { hooks: { preBuild: multipleHooks } }
    })

    await executeBuildHooks(config1.build.hooks?.preBuild, config1)
    await executeBuildHooks(config2.build.hooks?.preBuild, config2)

    expect(log1).toEqual(['single'])
    expect(log2).toEqual(['multi-1', 'multi-2'])
  })

  it('should allow hooks to read and write files in output directory', async () => {
    const outputFile = join(TEST_ROOT, 'dist', 'custom-output.json')

    const hook: BuildHookFunction = async (config) => {
      const data = {
        buildTime: new Date().toISOString(),
        outDir: config.outDir,
        title: config.title
      }
      writeFileSync(outputFile, JSON.stringify(data, null, 2))
    }

    const config = createMockSiteConfig({
      build: {
        hooks: {
          postBuild: hook
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.postBuild, config)

    expect(existsSync(outputFile)).toBe(true)
  })

  it('should maintain execution order with mixed sync and async hooks', async () => {
    const executionLog: string[] = []

    const hooks: BuildHookFunction[] = [
      () => { executionLog.push('sync-1') },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5))
        executionLog.push('async-1')
      },
      () => { executionLog.push('sync-2') },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5))
        executionLog.push('async-2')
      }
    ]

    const config = createMockSiteConfig({
      build: {
        hooks: {
          preBuild: hooks
        }
      }
    })

    await executeBuildHooks(config.build.hooks?.preBuild, config)

    expect(executionLog).toEqual(['sync-1', 'async-1', 'sync-2', 'async-2'])
  })

  /**
   * Property-Based Test: Property 50 - Build hook execution
   * For any configured build hooks, the hooks SHALL be executed at the correct
   * lifecycle phase (pre-build or post-build).
   * 
   * This property test validates that:
   * 1. All hooks in an array are executed
   * 2. Hooks are executed in the correct order
   * 3. Each hook receives the correct config
   * 4. The execution order is maintained regardless of hook count
   */
  it('Property 50: should execute all configured hooks in correct order', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of 1-10 hooks
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 10 }),
        async (hookIds) => {
          const executionLog: number[] = []
          const receivedConfigs: SiteConfig[] = []

          // Create hooks that log their execution order
          const hooks: BuildHookFunction[] = hookIds.map(id => {
            return async (config: SiteConfig) => {
              executionLog.push(id)
              receivedConfigs.push(config)
            }
          })

          const config = createMockSiteConfig({
            title: 'Property Test',
            build: {
              hooks: {
                preBuild: hooks
              }
            }
          })

          await executeBuildHooks(config.build.hooks?.preBuild, config)

          // Property 1: All hooks should be executed
          expect(executionLog.length).toBe(hookIds.length)

          // Property 2: Hooks should be executed in order
          expect(executionLog).toEqual(hookIds)

          // Property 3: Each hook should receive the correct config
          for (const receivedConfig of receivedConfigs) {
            expect(receivedConfig.title).toBe('Property Test')
            expect(receivedConfig.root).toBe(TEST_ROOT)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-Based Test: Hook execution with different config properties
   * Validates that hooks receive all config properties correctly
   */
  it('Property 50: should pass complete config to all hooks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.string({ minLength: 1, maxLength: 100 }),
          lang: fc.constantFrom('en-US', 'zh-CN', 'ja-JP', 'fr-FR'),
          base: fc.constantFrom('/', '/docs/', '/guide/', '/api/')
        }),
        fc.integer({ min: 1, max: 5 }),
        async (configProps, hookCount) => {
          const receivedConfigs: SiteConfig[] = []

          // Create multiple hooks
          const hooks: BuildHookFunction[] = Array.from({ length: hookCount }, () => {
            return async (config: SiteConfig) => {
              receivedConfigs.push(config)
            }
          })

          const config = createMockSiteConfig({
            ...configProps,
            build: {
              hooks: {
                preBuild: hooks
              }
            }
          })

          await executeBuildHooks(config.build.hooks?.preBuild, config)

          // All hooks should receive the same config with correct properties
          expect(receivedConfigs.length).toBe(hookCount)

          for (const receivedConfig of receivedConfigs) {
            expect(receivedConfig.title).toBe(configProps.title)
            expect(receivedConfig.description).toBe(configProps.description)
            expect(receivedConfig.lang).toBe(configProps.lang)
            expect(receivedConfig.base).toBe(configProps.base)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property-Based Test: Pre-build and post-build hook separation
   * Validates that pre-build and post-build hooks are independent
   */
  it('Property 50: should execute pre-build and post-build hooks independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (preHookCount, postHookCount) => {
          const preLog: string[] = []
          const postLog: string[] = []

          const preHooks: BuildHookFunction[] = Array.from({ length: preHookCount }, (_, i) => {
            return async () => {
              preLog.push(`pre-${i}`)
            }
          })

          const postHooks: BuildHookFunction[] = Array.from({ length: postHookCount }, (_, i) => {
            return async () => {
              postLog.push(`post-${i}`)
            }
          })

          const config = createMockSiteConfig({
            build: {
              hooks: {
                preBuild: preHooks,
                postBuild: postHooks
              }
            }
          })

          // Execute pre-build hooks
          await executeBuildHooks(config.build.hooks?.preBuild, config)

          // Execute post-build hooks
          await executeBuildHooks(config.build.hooks?.postBuild, config)

          // Verify pre-build hooks executed correctly
          expect(preLog.length).toBe(preHookCount)
          for (let i = 0; i < preHookCount; i++) {
            expect(preLog[i]).toBe(`pre-${i}`)
          }

          // Verify post-build hooks executed correctly
          expect(postLog.length).toBe(postHookCount)
          for (let i = 0; i < postHookCount; i++) {
            expect(postLog[i]).toBe(`post-${i}`)
          }

          // Verify no cross-contamination
          expect(preLog.some(item => item.startsWith('post-'))).toBe(false)
          expect(postLog.some(item => item.startsWith('pre-'))).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})
