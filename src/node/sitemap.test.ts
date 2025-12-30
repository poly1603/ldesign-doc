/**
 * 站点地图功能测试
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { buildSitemapData, generateSitemapPageData } from './sitemap'
import type { PageData, SiteConfig } from '../shared/types'

describe('Sitemap', () => {
  const mockConfig: SiteConfig = {
    root: '/test',
    srcDir: '/test/docs',
    outDir: '/test/dist',
    base: '/',
    title: 'Test Docs',
    description: 'Test documentation',
    lang: 'en-US',
    head: [],
    framework: 'vue',
    themeConfig: {},
    locales: {},
    markdown: {},
    vite: {},
    build: {},
    auth: {},
    themeDir: '/test/theme',
    tempDir: '/test/.temp',
    cacheDir: '/test/.cache',
    userPlugins: [],
    configPath: undefined,
    configDeps: [],
    extraDocs: []
  }

  const mockPages: PageData[] = [
    {
      title: 'Getting Started',
      description: 'Learn how to get started',
      frontmatter: { category: 'Guide', tags: ['setup', 'intro'] },
      headers: [],
      relativePath: 'guide/getting-started.md',
      filePath: '/test/docs/guide/getting-started.md',
      lastUpdated: 1234567890000
    },
    {
      title: 'Installation',
      description: 'How to install',
      frontmatter: { tags: ['setup'] },
      headers: [],
      relativePath: 'guide/installation.md',
      filePath: '/test/docs/guide/installation.md',
      lastUpdated: 1234567890000
    },
    {
      title: 'API Reference',
      description: 'API documentation',
      frontmatter: { category: 'API' },
      headers: [],
      relativePath: 'api/reference.md',
      filePath: '/test/docs/api/reference.md',
      lastUpdated: 1234567890000
    },
    {
      title: 'Hidden Page',
      description: 'This should be hidden',
      frontmatter: { hidden: true },
      headers: [],
      relativePath: 'hidden.md',
      filePath: '/test/docs/hidden.md',
      lastUpdated: 1234567890000
    }
  ]

  describe('buildSitemapData', () => {
    it('should build sitemap data from pages', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      // Should exclude hidden pages
      expect(sitemapData.pages).toHaveLength(3)
      expect(sitemapData.pages.find(p => p.title === 'Hidden Page')).toBeUndefined()
    })

    it('should extract categories from frontmatter', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      expect(sitemapData.categories['Guide']).toBeDefined()
      expect(sitemapData.categories['Guide'].count).toBe(2)
      expect(sitemapData.categories['API']).toBeDefined()
      expect(sitemapData.categories['API'].count).toBe(1)
    })

    it('should extract categories from file path when not in frontmatter', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      // Installation page has no category in frontmatter, should use "Guide" from path
      const installPage = sitemapData.pages.find(p => p.title === 'Installation')
      expect(installPage?.category).toBe('Guide')
    })

    it('should extract tags from frontmatter', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      const gettingStartedPage = sitemapData.pages.find(p => p.title === 'Getting Started')
      expect(gettingStartedPage?.tags).toEqual(['setup', 'intro'])

      const installPage = sitemapData.pages.find(p => p.title === 'Installation')
      expect(installPage?.tags).toEqual(['setup'])
    })

    it('should generate correct page paths', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      const gettingStartedPage = sitemapData.pages.find(p => p.title === 'Getting Started')
      expect(gettingStartedPage?.path).toBe('/guide/getting-started.html')
    })

    it('should sort pages alphabetically by title', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      expect(sitemapData.pages[0].title).toBe('API Reference')
      expect(sitemapData.pages[1].title).toBe('Getting Started')
      expect(sitemapData.pages[2].title).toBe('Installation')
    })

    it('should sort pages within categories alphabetically', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)

      const guidePages = sitemapData.categories['Guide'].pages
      expect(guidePages[0].title).toBe('Getting Started')
      expect(guidePages[1].title).toBe('Installation')
    })
  })

  describe('generateSitemapPageData', () => {
    it('should generate sitemap page data', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)
      const pageData = generateSitemapPageData(sitemapData)

      expect(pageData.title).toBe('Site Map')
      expect(pageData.description).toContain('3 pages')
      expect(pageData.pages).toHaveLength(3)
      expect(pageData.categories).toHaveLength(2)
    })

    it('should sort categories by count descending', () => {
      const sitemapData = buildSitemapData(mockPages, mockConfig)
      const pageData = generateSitemapPageData(sitemapData)

      // Guide has 2 pages, API has 1
      expect(pageData.categories[0].name).toBe('Guide')
      expect(pageData.categories[0].count).toBe(2)
      expect(pageData.categories[1].name).toBe('API')
      expect(pageData.categories[1].count).toBe(1)
    })
  })

  // ============== Property-Based Tests ==============

  describe('Property Tests', () => {
    /**
     * Property 32: Sitemap completeness
     * For any documentation build with sitemap enabled, the sitemap page SHALL list 
     * all non-hidden pages in the documentation.
     * Validates: Requirements 8.4
     */
    it('Property 32: Sitemap completeness - all non-hidden pages are listed', () => {
      fc.assert(
        fc.property(
          // Generate an array of pages with some hidden and some visible
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ maxLength: 200 }),
              frontmatter: fc.record({
                hidden: fc.option(fc.boolean(), { nil: undefined }),
                category: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !['toString', 'constructor', 'valueOf', '__proto__'].includes(s)), { nil: undefined }),
                tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 5 }), { nil: undefined })
              }),
              headers: fc.constant([]) as fc.Arbitrary<[]>,
              relativePath: fc.stringMatching(/^[a-z0-9/-]+\.md$/),
              filePath: fc.string({ minLength: 1, maxLength: 100 }),
              lastUpdated: fc.option(fc.integer({ min: 1000000000000, max: 2000000000000 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 50 }
          ).map(pages => {
            // Ensure unique relativePath for each page
            return pages.map((page, index) => ({
              ...page,
              relativePath: `page-${index}.md`,
              headers: [] as []
            }))
          }),
          (pages) => {
            // Build sitemap data
            const sitemapData = buildSitemapData(pages as PageData[], mockConfig)

            // Count non-hidden pages in input
            const nonHiddenPages = pages.filter(p => p.frontmatter.hidden !== true)

            // Property: All non-hidden pages should be in the sitemap
            expect(sitemapData.pages.length).toBe(nonHiddenPages.length)

            // Property: No hidden pages should be in the sitemap
            const hiddenPagesInSitemap = sitemapData.pages.filter(sitemapPage => {
              const originalPage = pages.find(p => p.relativePath === sitemapPage.relativePath)
              return originalPage?.frontmatter.hidden === true
            })
            expect(hiddenPagesInSitemap.length).toBe(0)

            // Property: All non-hidden pages should be present
            nonHiddenPages.forEach(page => {
              const found = sitemapData.pages.find(p => p.relativePath === page.relativePath)
              expect(found).toBeDefined()
              expect(found?.title).toBe(page.title)
            })

            // Property: Categories should contain all non-hidden pages
            const totalPagesInCategories = Object.values(sitemapData.categories)
              .reduce((sum, category) => sum + category.count, 0)
            expect(totalPagesInCategories).toBe(nonHiddenPages.length)

            // Property: Each page should be in exactly one category
            const allCategoryPages = Object.values(sitemapData.categories)
              .flatMap(category => category.pages)
            expect(allCategoryPages.length).toBe(nonHiddenPages.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Sitemap preserves page metadata', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ maxLength: 200 }),
              frontmatter: fc.record({
                hidden: fc.constant(false),
                category: fc.option(fc.string({ minLength: 1, maxLength: 20 }).filter(s => !['toString', 'constructor', 'valueOf', '__proto__'].includes(s)), { nil: undefined }),
                tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 5 }), { nil: undefined })
              }),
              headers: fc.constant([]) as fc.Arbitrary<[]>,
              relativePath: fc.stringMatching(/^[a-z0-9/-]+\.md$/),
              filePath: fc.string({ minLength: 1, maxLength: 100 }),
              lastUpdated: fc.option(fc.integer({ min: 1000000000000, max: 2000000000000 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 30 }
          ).map(pages => {
            // Ensure unique relativePath for each page
            return pages.map((page, index) => ({
              ...page,
              relativePath: `page-${index}.md`,
              headers: [] as []
            }))
          }),
          (pages) => {
            const sitemapData = buildSitemapData(pages as PageData[], mockConfig)

            // Property: All page metadata should be preserved
            pages.forEach(page => {
              const sitemapPage = sitemapData.pages.find(p => p.relativePath === page.relativePath)
              expect(sitemapPage).toBeDefined()
              expect(sitemapPage?.title).toBe(page.title)
              expect(sitemapPage?.description).toBe(page.description)
              expect(sitemapPage?.lastUpdated).toBe(page.lastUpdated)

              // Tags should be preserved
              const expectedTags = Array.isArray(page.frontmatter.tags) ? page.frontmatter.tags : []
              expect(sitemapPage?.tags).toEqual(expectedTags)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property: Category grouping is consistent', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ maxLength: 200 }),
              frontmatter: fc.record({
                hidden: fc.constant(false),
                category: fc.option(fc.constantFrom('Guide', 'API', 'Tutorial', 'Reference'), { nil: undefined })
              }),
              headers: fc.constant([]) as fc.Arbitrary<[]>,
              relativePath: fc.stringMatching(/^[a-z0-9/-]+\.md$/),
              filePath: fc.string({ minLength: 1, maxLength: 100 }),
              lastUpdated: fc.option(fc.integer({ min: 1000000000000, max: 2000000000000 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 30 }
          ).map(pages => {
            // Ensure unique relativePath for each page
            return pages.map((page, index) => ({
              ...page,
              relativePath: `page-${index}.md`,
              headers: [] as []
            }))
          }),
          (pages) => {
            const sitemapData = buildSitemapData(pages as PageData[], mockConfig)

            // Property: Each page should be in its correct category
            Object.entries(sitemapData.categories).forEach(([categoryName, category]) => {
              category.pages.forEach(page => {
                expect(page.category).toBe(categoryName)
              })
            })

            // Property: Category counts should match page counts
            Object.values(sitemapData.categories).forEach(category => {
              expect(category.count).toBe(category.pages.length)
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
