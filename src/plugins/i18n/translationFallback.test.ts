/**
 * Property-based tests for translation fallback
 * Feature: doc-system-enhancement, Property 53
 * Validates: Requirements 13.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { translationFallback } from './translationFallback'
import type { SiteConfig, LocaleConfig } from '../../shared/types'

// Helper to create a temporary directory
async function createTempDir(): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), `ldoc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  await fs.mkdir(tmpDir, { recursive: true })
  return tmpDir
}

// Helper to create a mock SiteConfig
function createMockConfig(root: string, locales: Record<string, LocaleConfig>): SiteConfig {
  return {
    root,
    srcDir: 'docs',
    extraDocs: [],
    lang: 'zh-CN',
    locales,
    configPath: undefined,
    configDeps: [],
    themeDir: '',
    tempDir: '',
    cacheDir: '',
    userPlugins: [],
    outDir: 'dist',
    base: '/',
    title: 'Test',
    description: 'Test',
    head: [],
    framework: 'vue',
    themeConfig: {},
    markdown: {},
    vite: {},
    build: {},
    auth: undefined
  } as SiteConfig
}

describe('Translation Fallback - Property Tests', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await createTempDir()
    translationFallback.clearCache()
  })

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  /**
   * Property 53: Fallback content resolution
   * For any missing translation, the system SHALL serve the fallback locale content
   * with a translation notice.
   */
  it('should serve fallback content when translation is missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          targetLocale: fc.constantFrom('en', 'ja', 'ko', 'fr', 'de')
        }),
        async ({ path: filePath, sourceContent, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          // Create only source file (no translation)
          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          // Resolve fallback content
          const result = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Should use fallback
          expect(result.isFallback).toBe(true)
          expect(result.targetLocale).toBe(targetLocale)
          expect(result.sourceLocale).toBe('zh-CN')

          // Should contain original content
          expect(result.content).toContain(sourceContent)

          // Should contain translation notice
          expect(result.content).toMatch(/:::warning/i)

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should not use fallback when translation exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          translationContent: fc.string({ minLength: 10, maxLength: 200 }),
          targetLocale: fc.constantFrom('en', 'ja', 'ko')
        }),
        async ({ path: filePath, sourceContent, translationContent, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)
          const translationFile = path.join(docsDir, targetLocale, filePath)

          // Create both source and translation files
          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          await fs.mkdir(path.dirname(translationFile), { recursive: true })
          await fs.writeFile(translationFile, translationContent, 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          // Resolve content
          const result = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Should NOT use fallback
          expect(result.isFallback).toBe(false)
          expect(result.targetLocale).toBe(targetLocale)

          // Should contain translation content, not source
          expect(result.content).toBe(translationContent)

          // Should NOT contain translation notice
          expect(result.content).not.toMatch(/:::warning/i)

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should cache fallback results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          targetLocale: fc.constantFrom('en', 'ja')
        }),
        async ({ path: filePath, sourceContent, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          // First call
          const result1 = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Second call (should use cache)
          const result2 = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Results should be identical
          expect(result1.isFallback).toBe(result2.isFallback)
          expect(result1.content).toBe(result2.content)
          expect(result1.targetLocale).toBe(result2.targetLocale)

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should correctly identify fallback pages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          hasTranslation: fc.boolean(),
          targetLocale: fc.constantFrom('en', 'ja')
        }),
        async ({ path: filePath, sourceContent, hasTranslation, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          if (hasTranslation) {
            const translationFile = path.join(docsDir, targetLocale, filePath)
            await fs.mkdir(path.dirname(translationFile), { recursive: true })
            await fs.writeFile(translationFile, `Translated: ${sourceContent}`, 'utf-8')
          }

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          // Resolve content first to populate cache
          await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Check if it's a fallback page
          const isFallback = translationFallback.isFallbackPage(filePath, targetLocale)

          // Should match whether translation exists
          expect(isFallback).toBe(!hasTranslation)

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should add appropriate notice for different locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          targetLocale: fc.constantFrom('en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'ar')
        }),
        async ({ path: filePath, sourceContent, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          const result = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Should contain warning container
          expect(result.content).toMatch(/:::warning/i)

          // Should contain some text (notice is not empty)
          const noticeMatch = result.content.match(/:::warning[^:]*\n([^:]+)\n:::/i)
          expect(noticeMatch).toBeTruthy()
          if (noticeMatch) {
            expect(noticeMatch[1].trim().length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should respect showMissingNotice option', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          sourceContent: fc.string({ minLength: 10, maxLength: 200 }),
          showNotice: fc.boolean(),
          targetLocale: fc.constantFrom('en', 'ja')
        }),
        async ({ path: filePath, sourceContent, showNotice, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, sourceContent, 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: showNotice
          })

          const result = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          if (showNotice) {
            // Should contain notice
            expect(result.content).toMatch(/:::warning/i)
          } else {
            // Should NOT contain notice
            expect(result.content).not.toMatch(/:::warning/i)
            // Should just be the source content
            expect(result.content).toBe(sourceContent)
          }

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should handle empty source content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          targetLocale: fc.constantFrom('en', 'ja')
        }),
        async ({ path: filePath, targetLocale }) => {
          const docsDir = path.join(tempDir, 'docs')
          const sourceFile = path.join(docsDir, filePath)

          // Create empty source file
          await fs.mkdir(path.dirname(sourceFile), { recursive: true })
          await fs.writeFile(sourceFile, '', 'utf-8')

          const locales: Record<string, LocaleConfig> = {
            [targetLocale]: {
              label: targetLocale.toUpperCase(),
              lang: targetLocale,
              link: `/${targetLocale}/`
            }
          }

          const config = createMockConfig(tempDir, locales)
          translationFallback.initialize(config, {
            fallbackLocale: 'zh-CN',
            showMissingNotice: true
          })

          const result = await translationFallback.resolveFallbackContent(filePath, targetLocale)

          // Should still work with empty content
          expect(result.isFallback).toBe(true)
          expect(result.content).toMatch(/:::warning/i)

          return true
        }
      ),
      { numRuns: 20 }
    )
  })
})
