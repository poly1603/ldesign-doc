/**
 * Tests for build report generation
 * Feature: doc-system-enhancement, Task 25.5
 * Validates: Requirements 12.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { generateBuildReport, type BuildReport } from './buildReport'
import type { PageData, SiteConfig } from '../shared/types'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Build Report Generation', () => {
  let testOutDir: string
  let mockConfig: SiteConfig
  let mockPages: PageData[]

  beforeEach(() => {
    // Create a temporary output directory for testing
    testOutDir = join(tmpdir(), `ldoc-test-${Date.now()}`)
    if (!existsSync(testOutDir)) {
      mkdirSync(testOutDir, { recursive: true })
    }

    // Create some test files
    writeFileSync(join(testOutDir, 'index.html'), '<html></html>')
    writeFileSync(join(testOutDir, 'main.js'), 'console.log("test")')
    writeFileSync(join(testOutDir, 'style.css'), 'body { margin: 0; }')

    // Mock config
    mockConfig = {
      outDir: testOutDir,
      build: {
        minify: true,
        chunkSizeWarningLimit: 500
      },
      markdown: {}
    } as SiteConfig

    // Mock pages
    mockPages = [
      {
        title: 'Home',
        description: 'Home page',
        relativePath: 'index.md',
        filePath: '/test/index.md',
        headers: [],
        frontmatter: {
          lang: 'en',
          category: 'guide'
        }
      } as PageData,
      {
        title: 'About',
        description: 'About page',
        relativePath: 'about.md',
        filePath: '/test/about.md',
        headers: [],
        frontmatter: {
          lang: 'en',
          category: 'guide'
        }
      } as PageData,
      {
        title: '关于',
        description: '关于页面',
        relativePath: 'zh/about.md',
        filePath: '/test/zh/about.md',
        headers: [],
        frontmatter: {
          lang: 'zh',
          category: 'guide'
        }
      } as PageData
    ]
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testOutDir)) {
      rmSync(testOutDir, { recursive: true, force: true })
    }
  })

  it('should generate a build report with page statistics', () => {
    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report).toBeDefined()
    expect(report.pages).toBeDefined()
    expect(report.pages.total).toBe(3)
    expect(report.pages.byLanguage).toBeDefined()
    expect(report.pages.byLanguage['en']).toBe(2)
    expect(report.pages.byLanguage['zh']).toBe(1)
  })

  it('should analyze assets in the output directory', () => {
    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report.assets).toBeDefined()
    expect(report.assets.total).toBeGreaterThan(0)
    expect(report.assets.totalSize).toBeGreaterThan(0)
    expect(report.assets.byType).toBeDefined()
  })

  it('should categorize pages by category', () => {
    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report.pages.byCategory).toBeDefined()
    expect(report.pages.byCategory['guide']).toBe(3)
  })

  it('should include build duration', () => {
    const duration = 5000
    const report = generateBuildReport(mockConfig, mockPages, duration)

    expect(report.duration).toBe(duration)
  })

  it('should generate warnings for large bundles', () => {
    // Create a large file
    const largeContent = 'x'.repeat(600 * 1024) // 600KB
    writeFileSync(join(testOutDir, 'large.js'), largeContent)

    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report.warnings).toBeDefined()
    const largeBundleWarnings = report.warnings.filter(w => w.type === 'large-bundle')
    expect(largeBundleWarnings.length).toBeGreaterThan(0)
  })

  it('should generate suggestions for missing descriptions', () => {
    const pagesWithoutDesc = [
      {
        title: 'Test',
        relativePath: 'test.md',
        frontmatter: {}
      } as PageData
    ]

    const report = generateBuildReport(mockConfig, pagesWithoutDesc, 1000)

    expect(report.suggestions).toBeDefined()
    const seoSuggestions = report.suggestions.filter(s => s.type === 'seo')
    expect(seoSuggestions.length).toBeGreaterThan(0)
  })

  it('should suggest enabling minification when disabled', () => {
    const configWithoutMinify = {
      ...mockConfig,
      build: {
        ...mockConfig.build,
        minify: false
      }
    }

    const report = generateBuildReport(configWithoutMinify, mockPages, 1000)

    const optimizationSuggestions = report.suggestions.filter(s => s.type === 'optimization')
    const minifySuggestion = optimizationSuggestions.find(s => s.message.includes('Minification'))
    expect(minifySuggestion).toBeDefined()
  })

  it('should handle empty output directory gracefully', () => {
    const emptyDir = join(tmpdir(), `ldoc-empty-${Date.now()}`)
    const configWithEmptyDir = {
      ...mockConfig,
      outDir: emptyDir
    }

    const report = generateBuildReport(configWithEmptyDir, mockPages, 1000)

    expect(report.assets.total).toBe(0)
    expect(report.assets.totalSize).toBe(0)
  })

  it('should list largest files', () => {
    // Create files of different sizes
    writeFileSync(join(testOutDir, 'small.js'), 'x'.repeat(100))
    writeFileSync(join(testOutDir, 'medium.js'), 'x'.repeat(1000))
    writeFileSync(join(testOutDir, 'large.js'), 'x'.repeat(10000))

    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report.assets.largest).toBeDefined()
    expect(report.assets.largest.length).toBeGreaterThan(0)

    // Should be sorted by size (descending)
    for (let i = 1; i < report.assets.largest.length; i++) {
      expect(report.assets.largest[i - 1].size).toBeGreaterThanOrEqual(
        report.assets.largest[i].size
      )
    }
  })

  it('should categorize assets by file type', () => {
    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(report.assets.byType).toBeDefined()
    expect(report.assets.byType['.html']).toBeDefined()
    expect(report.assets.byType['.js']).toBeDefined()
    expect(report.assets.byType['.css']).toBeDefined()
  })

  it('should handle pages without frontmatter', () => {
    const pagesWithoutFrontmatter = [
      {
        title: 'Test',
        description: 'Test page',
        relativePath: 'test.md',
        filePath: '/test/test.md',
        headers: [],
        frontmatter: {}
      } as PageData
    ]

    const report = generateBuildReport(mockConfig, pagesWithoutFrontmatter, 1000)

    expect(report.pages.total).toBe(1)
    expect(report.pages.byLanguage['default']).toBe(1)
    expect(report.pages.byCategory['uncategorized']).toBe(1)
  })

  it('should include warnings and suggestions arrays', () => {
    const report = generateBuildReport(mockConfig, mockPages, 1000)

    expect(Array.isArray(report.warnings)).toBe(true)
    expect(Array.isArray(report.suggestions)).toBe(true)
  })
})

// ============== Property-Based Tests ==============

/**
 * Arbitraries for property-based testing
 */

// Generate valid page data
const pageDataArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  relativePath: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.md`),
  filePath: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/test/${s}.md`),
  headers: fc.constant([]),
  frontmatter: fc.option(
    fc.record({
      lang: fc.option(fc.constantFrom('en', 'zh', 'es', 'fr', 'de'), { nil: undefined }),
      category: fc.option(fc.constantFrom('guide', 'api', 'tutorial', 'reference'), { nil: undefined })
    }),
    { nil: undefined }
  )
}) as fc.Arbitrary<PageData>

// Generate site config
const siteConfigArb = fc.record({
  outDir: fc.constant(join(tmpdir(), `ldoc-pbt-${Date.now()}-${Math.random().toString(36).slice(2)}`)),
  build: fc.record({
    minify: fc.boolean(),
    chunkSizeWarningLimit: fc.integer({ min: 100, max: 1000 })
  }),
  markdown: fc.record({
    image: fc.option(
      fc.record({
        lazyLoading: fc.boolean()
      }),
      { nil: undefined }
    )
  })
}) as fc.Arbitrary<SiteConfig>

describe('Build Report Generation - Property-Based Tests', () => {
  /**
   * Property 49: Build report generation
   * Feature: doc-system-enhancement, Property 49
   * Validates: Requirements 12.4
   * 
   * For any build, the system SHALL generate a report including page count, 
   * bundle sizes, and any warnings.
   */
  it('Property 49: should generate complete report for any build configuration', () => {
    fc.assert(
      fc.property(
        siteConfigArb,
        fc.array(pageDataArb, { minLength: 0, maxLength: 50 }),
        fc.integer({ min: 0, max: 60000 }), // duration in ms
        (config, pages, duration) => {
          // Create output directory with some test files
          if (!existsSync(config.outDir)) {
            mkdirSync(config.outDir, { recursive: true })
          }

          // Create some test assets
          try {
            writeFileSync(join(config.outDir, 'index.html'), '<html></html>')
            writeFileSync(join(config.outDir, 'main.js'), 'console.log("test")')
            writeFileSync(join(config.outDir, 'style.css'), 'body { margin: 0; }')

            // Generate the report
            const report = generateBuildReport(config, pages, duration)

            // Verify report structure - all required fields must be present
            expect(report).toBeDefined()
            expect(typeof report).toBe('object')

            // Verify pages section
            expect(report.pages).toBeDefined()
            expect(typeof report.pages).toBe('object')
            expect(typeof report.pages.total).toBe('number')
            expect(report.pages.total).toBe(pages.length)
            expect(typeof report.pages.byLanguage).toBe('object')
            expect(typeof report.pages.byCategory).toBe('object')

            // Verify assets section (bundle sizes)
            expect(report.assets).toBeDefined()
            expect(typeof report.assets).toBe('object')
            expect(typeof report.assets.total).toBe('number')
            expect(typeof report.assets.totalSize).toBe('number')
            expect(report.assets.totalSize).toBeGreaterThanOrEqual(0)
            expect(typeof report.assets.byType).toBe('object')
            expect(Array.isArray(report.assets.largest)).toBe(true)

            // Verify warnings array
            expect(Array.isArray(report.warnings)).toBe(true)
            for (const warning of report.warnings) {
              expect(warning).toBeDefined()
              expect(typeof warning.type).toBe('string')
              expect(typeof warning.message).toBe('string')
              expect(typeof warning.severity).toBe('string')
              expect(['warning', 'error']).toContain(warning.severity)
            }

            // Verify suggestions array
            expect(Array.isArray(report.suggestions)).toBe(true)
            for (const suggestion of report.suggestions) {
              expect(suggestion).toBeDefined()
              expect(typeof suggestion.type).toBe('string')
              expect(typeof suggestion.message).toBe('string')
            }

            // Verify duration
            expect(typeof report.duration).toBe('number')
            expect(report.duration).toBe(duration)

            return true
          } finally {
            // Clean up
            if (existsSync(config.outDir)) {
              rmSync(config.outDir, { recursive: true, force: true })
            }
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design
    )
  })

  /**
   * Additional property: Page statistics accuracy
   * Verifies that page counts are accurate across different configurations
   */
  it('should accurately count pages by language and category', () => {
    fc.assert(
      fc.property(
        siteConfigArb,
        fc.array(pageDataArb, { minLength: 1, maxLength: 30 }),
        fc.integer({ min: 0, max: 10000 }),
        (config, pages, duration) => {
          try {
            // Create minimal output directory
            if (!existsSync(config.outDir)) {
              mkdirSync(config.outDir, { recursive: true })
            }

            const report = generateBuildReport(config, pages, duration)

            // Verify total count matches input
            expect(report.pages.total).toBe(pages.length)

            // Verify language counts sum to total
            const langSum = Object.values(report.pages.byLanguage).reduce((a, b) => a + b, 0)
            expect(langSum).toBe(pages.length)

            // Verify category counts sum to total
            const categorySum = Object.values(report.pages.byCategory).reduce((a, b) => a + b, 0)
            expect(categorySum).toBe(pages.length)

            // Verify each page is counted exactly once in language stats
            for (const page of pages) {
              const lang = (page.frontmatter?.lang as string) || 'default'
              expect(report.pages.byLanguage[lang]).toBeGreaterThan(0)
            }

            return true
          } finally {
            if (existsSync(config.outDir)) {
              rmSync(config.outDir, { recursive: true, force: true })
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Additional property: Asset size consistency
   * Verifies that asset sizes are calculated correctly
   */
  it('should calculate asset sizes consistently', () => {
    fc.assert(
      fc.property(
        siteConfigArb,
        fc.array(pageDataArb, { minLength: 0, maxLength: 10 }),
        fc.integer({ min: 0, max: 5000 }),
        (config, pages, duration) => {
          try {
            if (!existsSync(config.outDir)) {
              mkdirSync(config.outDir, { recursive: true })
            }

            // Create files with known sizes
            const file1Content = 'x'.repeat(100)
            const file2Content = 'y'.repeat(200)
            const file3Content = 'z'.repeat(300)

            writeFileSync(join(config.outDir, 'file1.js'), file1Content)
            writeFileSync(join(config.outDir, 'file2.css'), file2Content)
            writeFileSync(join(config.outDir, 'file3.html'), file3Content)

            const report = generateBuildReport(config, pages, duration)

            // Total size should equal sum of all file sizes
            const expectedTotal = 100 + 200 + 300
            expect(report.assets.totalSize).toBe(expectedTotal)

            // Sum of sizes by type should equal total size
            const sizeByTypeSum = Object.values(report.assets.byType)
              .reduce((sum, type) => sum + type.size, 0)
            expect(sizeByTypeSum).toBe(expectedTotal)

            // Count should match
            expect(report.assets.total).toBe(3)

            return true
          } finally {
            if (existsSync(config.outDir)) {
              rmSync(config.outDir, { recursive: true, force: true })
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
