/**
 * Property-based tests for translation status tracking
 * Feature: doc-system-enhancement, Property 51 & 52
 * Validates: Requirements 13.1, 13.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { translationStatusTracker } from './translationStatus'
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

// Helper to create a file with specific mtime
async function createFileWithMtime(filePath: string, content: string, mtime: number): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf-8')

  // Set modification time
  const date = new Date(mtime)
  await fs.utimes(filePath, date, date)
}

describe('Translation Status Tracking - Property Tests', () => {
  /**
   * Property 51: Translation status tracking
   * For any page with translations, the system SHALL track and report the translation status
   * (up-to-date, outdated, missing) for each locale.
   */
  it('should track translation status for all locales', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 5, maxLength: 30 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
            sourceTime: fc.integer({ min: 1000000000000, max: Date.now() }),
            translations: fc.dictionary(
              fc.constantFrom('en', 'ja'),
              fc.option(fc.integer({ min: 1000000000000, max: Date.now() }), { nil: null })
            )
          }),
          { minLength: 1, maxLength: 5 }
        )
          .filter(pages => pages.some(p => Object.keys(p.translations).length > 0)) // Ensure at least one page has translations
          .map(pages => {
            // Ensure unique paths
            const seen = new Set<string>()
            return pages.filter(p => {
              if (seen.has(p.path)) return false
              seen.add(p.path)
              return true
            })
          }),
        async (pages) => {
          const iterTempDir = await createTempDir()

          try {
            const docsDir = path.join(iterTempDir, 'docs')

            // Filter pages to only those with translations
            const pagesWithTranslations = pages.filter(p => Object.keys(p.translations).length > 0)

            // Create source files only for pages with translations
            for (const page of pagesWithTranslations) {
              const sourceFile = path.join(docsDir, page.path)
              await createFileWithMtime(sourceFile, `# ${page.path}`, page.sourceTime)
            }

            // Create translation files
            const locales: Record<string, LocaleConfig> = {}

            for (const page of pagesWithTranslations) {
              for (const [locale, translationTime] of Object.entries(page.translations)) {
                if (!locales[locale]) {
                  locales[locale] = {
                    label: locale.toUpperCase(),
                    lang: locale,
                    link: `/${locale}/`
                  }
                }

                if (translationTime !== null) {
                  const translationFile = path.join(docsDir, locale, page.path)
                  await createFileWithMtime(translationFile, `# ${page.path} (${locale})`, translationTime)
                }
              }
            }

            // Initialize tracker
            const config = createMockConfig(iterTempDir, locales)
            await translationStatusTracker.initialize(config, {
              sourceLocale: 'zh-CN'
            })

            // Get all statuses
            const statuses = translationStatusTracker.getAllStatuses()

            // Verify: should have status for each page-locale combination
            // The implementation creates status for ALL source files × ALL configured locales
            const expectedCount = pagesWithTranslations.length * Object.keys(locales).length
            expect(statuses.length).toBe(expectedCount)

            // Verify: each status should be correctly determined
            for (const page of pagesWithTranslations) {
              for (const locale of Object.keys(locales)) {
                const status = translationStatusTracker.getStatus(page.path, locale)
                expect(status).toBeDefined()
                expect(status!.locale).toBe(locale)
                expect(status!.filePath).toBe(page.path)

                // Check if this page has a translation for this locale
                const translationTime = page.translations[locale]

                if (translationTime === undefined || translationTime === null) {
                  expect(status!.status).toBe('missing')
                } else if (translationTime >= page.sourceTime) {
                  expect(status!.status).toBe('up-to-date')
                } else {
                  expect(status!.status).toBe('outdated')
                }
              }
            }
          } finally {
            await fs.rm(iterTempDir, { recursive: true, force: true }).catch(() => { })
          }

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Property 52: Outdated translation detection
   * For any source page update, translations of that page SHALL be marked as potentially outdated.
   */
  it('should detect outdated translations when source is updated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          initialSourceTime: fc.integer({ min: 1000000000000, max: 1600000000000 }),
          translationTime: fc.integer({ min: 1000000000000, max: 1600000000000 }),
          updatedSourceTime: fc.integer({ min: 1600000000001, max: Date.now() })
        }),
        async ({ path: filePath, initialSourceTime, translationTime, updatedSourceTime }) => {
          const iterTempDir = await createTempDir()

          try {
            const docsDir = path.join(iterTempDir, 'docs')
            const sourceFile = path.join(docsDir, filePath)
            const translationFile = path.join(docsDir, 'en', filePath)

            await createFileWithMtime(sourceFile, `# ${filePath}`, initialSourceTime)
            await createFileWithMtime(translationFile, `# ${filePath} (en)`, translationTime)

            const locales: Record<string, LocaleConfig> = {
              en: { label: 'English', lang: 'en-US', link: '/en/' }
            }

            const config = createMockConfig(iterTempDir, locales)
            await translationStatusTracker.initialize(config, {
              sourceLocale: 'zh-CN'
            })

            const initialStatus = translationStatusTracker.getStatus(filePath, 'en')
            expect(initialStatus).toBeDefined()

            const initialExpectedStatus = translationTime >= initialSourceTime ? 'up-to-date' : 'outdated'
            expect(initialStatus!.status).toBe(initialExpectedStatus)

            await createFileWithMtime(sourceFile, `# ${filePath} (updated)`, updatedSourceTime)
            await translationStatusTracker.markOutdatedTranslations(sourceFile)

            const updatedStatus = translationStatusTracker.getStatus(filePath, 'en')
            expect(updatedStatus).toBeDefined()

            if (updatedSourceTime > translationTime) {
              expect(updatedStatus!.status).toBe('outdated')
            } else {
              expect(updatedStatus!.status).toBe('up-to-date')
            }
          } finally {
            await fs.rm(iterTempDir, { recursive: true, force: true }).catch(() => { })
          }

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should generate correct summary statistics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            path: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
            sourceTime: fc.integer({ min: 1000000000000, max: Date.now() }),
            enTime: fc.option(fc.integer({ min: 1000000000000, max: Date.now() }), { nil: null }),
            jaTime: fc.option(fc.integer({ min: 1000000000000, max: Date.now() }), { nil: null })
          }),
          { minLength: 1, maxLength: 3 }
        ),
        async (pages) => {
          const iterTempDir = await createTempDir()

          try {
            const docsDir = path.join(iterTempDir, 'docs')

            for (const page of pages) {
              await createFileWithMtime(path.join(docsDir, page.path), `# ${page.path}`, page.sourceTime)

              if (page.enTime !== null) {
                await createFileWithMtime(path.join(docsDir, 'en', page.path), `# ${page.path} (en)`, page.enTime)
              }

              if (page.jaTime !== null) {
                await createFileWithMtime(path.join(docsDir, 'ja', page.path), `# ${page.path} (ja)`, page.jaTime)
              }
            }

            const locales: Record<string, LocaleConfig> = {
              en: { label: 'English', lang: 'en-US', link: '/en/' },
              ja: { label: '日本語', lang: 'ja-JP', link: '/ja/' }
            }

            const config = createMockConfig(iterTempDir, locales)
            await translationStatusTracker.initialize(config, {
              sourceLocale: 'zh-CN'
            })

            const report = await translationStatusTracker.generateReport(config)

            let expectedUpToDate = 0
            let expectedOutdated = 0
            let expectedMissing = 0

            for (const page of pages) {
              for (const [locale, time] of [['en', page.enTime], ['ja', page.jaTime]]) {
                if (time === null) {
                  expectedMissing++
                } else if (typeof time === 'number' && typeof page.sourceTime === 'number' && time >= page.sourceTime) {
                  expectedUpToDate++
                } else {
                  expectedOutdated++
                }
              }
            }

            expect(report.summary.total).toBe(pages.length * 2)
            expect(report.summary.upToDate).toBe(expectedUpToDate)
            expect(report.summary.outdated).toBe(expectedOutdated)
            expect(report.summary.missing).toBe(expectedMissing)

            expect(report.summary.byLocale.en).toBeDefined()
            expect(report.summary.byLocale.ja).toBeDefined()
          } finally {
            await fs.rm(iterTempDir, { recursive: true, force: true }).catch(() => { })
          }

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should handle missing source files gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
        async (filePath) => {
          const iterTempDir = await createTempDir()

          try {
            const locales: Record<string, LocaleConfig> = {
              en: { label: 'English', lang: 'en-US', link: '/en/' }
            }

            const config = createMockConfig(iterTempDir, locales)
            await translationStatusTracker.initialize(config, {
              sourceLocale: 'zh-CN'
            })

            const status = translationStatusTracker.getStatus(filePath, 'en')

            if (status) {
              expect(status.status).toBe('missing')
            }
          } finally {
            await fs.rm(iterTempDir, { recursive: true, force: true }).catch(() => { })
          }

          return true
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should correctly identify up-to-date translations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          path: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, '-') + '.md'),
          baseTime: fc.integer({ min: 1000000000000, max: Date.now() - 1000000 }),
          timeDelta: fc.integer({ min: 0, max: 1000000 })
        }),
        async ({ path: filePath, baseTime, timeDelta }) => {
          const iterTempDir = await createTempDir()

          try {
            const docsDir = path.join(iterTempDir, 'docs')
            const sourceFile = path.join(docsDir, filePath)
            const translationFile = path.join(docsDir, 'en', filePath)

            await createFileWithMtime(sourceFile, `# ${filePath}`, baseTime)
            await createFileWithMtime(translationFile, `# ${filePath} (en)`, baseTime + timeDelta)

            const locales: Record<string, LocaleConfig> = {
              en: { label: 'English', lang: 'en-US', link: '/en/' }
            }

            const config = createMockConfig(iterTempDir, locales)
            await translationStatusTracker.initialize(config, {
              sourceLocale: 'zh-CN'
            })

            const status = translationStatusTracker.getStatus(filePath, 'en')
            expect(status).toBeDefined()
            expect(status!.status).toBe('up-to-date')
          } finally {
            await fs.rm(iterTempDir, { recursive: true, force: true }).catch(() => { })
          }

          return true
        }
      ),
      { numRuns: 10 }
    )
  })
})
