/**
 * Related Pages Computation Tests
 * Tests for computing related pages based on tags and content similarity
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  computeRelatedPages,
  computeRelatedPagesWithData,
  type RelatedPage
} from './relatedPages'
import type { PageData, SiteData, ThemeConfig } from '../../shared/types'

// ============== Test Helpers ==============

/**
 * Create a mock PageData object
 */
function createMockPageData(
  title: string,
  relativePath: string,
  tags: string[] = [],
  description: string = ''
): PageData {
  return {
    title,
    description,
    frontmatter: { tags },
    headers: [],
    relativePath,
    filePath: relativePath,
    lastUpdated: Date.now()
  }
}

/**
 * Create a mock SiteData object
 */
function createMockSiteData(): SiteData {
  return {
    base: '/',
    title: 'Test Site',
    description: 'Test Description',
    lang: 'en',
    locales: {},
    themeConfig: {},
    head: []
  }
}

/**
 * Create a mock ThemeConfig with sidebar
 */
function createMockThemeConfig(sidebar: unknown): ThemeConfig {
  return {
    sidebar
  } as ThemeConfig
}

// ============== Property Tests ==============

describe('Related Pages - Property Tests', () => {
  /**
   * Property 30: Related pages computation
   * For any page with tags or in a section with multiple pages, the system SHALL 
   * compute and display related pages based on content similarity or shared tags.
   * Validates: Requirements 8.2
   */
  it('Property 30: Related pages with shared tags have higher scores', () => {
    fc.assert(
      fc.property(
        // Generate a set of tags (at least 3 to ensure we can create different overlap levels)
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 3, maxLength: 5 }),
        // Generate number of shared tags (at least 2 to ensure meaningful differences)
        fc.integer({ min: 2, max: 3 }),
        (allTags, numShared) => {
          if (allTags.length < numShared + 1) return true // Need at least numShared + 1 tags

          const sharedTags = allTags.slice(0, numShared)
          const currentPage = createMockPageData('Current', 'current.md', sharedTags)

          // Create pages with varying tag overlap
          // All shared: same tags as current
          const pageWithAllShared = createMockPageData('All Shared', 'all-shared.md', sharedTags)
          // Some shared: only first tag (guaranteed to be less than all)
          const pageWithSomeShared = createMockPageData('Some Shared', 'some-shared.md', sharedTags.slice(0, 1))
          // No shared: completely different tag
          const pageWithNoShared = createMockPageData('No Shared', 'no-shared.md', ['different'])

          const allPages = [currentPage, pageWithAllShared, pageWithSomeShared, pageWithNoShared]
          const related = computeRelatedPagesWithData('/current', currentPage, allPages, 10)

          // Pages with more shared tags should have higher scores
          const allSharedPage = related.find(p => p.title === 'All Shared')
          const someSharedPage = related.find(p => p.title === 'Some Shared')
          const noSharedPage = related.find(p => p.title === 'No Shared')

          // All shared should have higher score than some shared (since numShared >= 2)
          if (allSharedPage && someSharedPage) {
            expect(allSharedPage.score).toBeGreaterThan(someSharedPage.score)
          }

          // Some shared should have higher score than no shared
          if (someSharedPage && noSharedPage) {
            expect(someSharedPage.score).toBeGreaterThan(noSharedPage.score)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return at most maxItems related pages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 5, maxLength: 20 }),
        (maxItems, tags) => {
          const currentPage = createMockPageData('Current', 'current.md', tags.slice(0, 2))

          // Create many pages with shared tags
          const allPages = [currentPage]
          for (let i = 0; i < 20; i++) {
            allPages.push(
              createMockPageData(`Page ${i}`, `page-${i}.md`, tags.slice(0, 1))
            )
          }

          const related = computeRelatedPagesWithData('/current', currentPage, allPages, maxItems)

          // Should not exceed maxItems
          expect(related.length).toBeLessThanOrEqual(maxItems)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not include current page in related pages', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z-]+$/),
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 1, maxLength: 5 }),
        (pageName, tags) => {
          const currentPath = `/${pageName}`
          const currentPage = createMockPageData('Current', `${pageName}.md`, tags)

          const allPages = [
            currentPage,
            createMockPageData('Other 1', 'other1.md', tags),
            createMockPageData('Other 2', 'other2.md', tags)
          ]

          const related = computeRelatedPagesWithData(currentPath, currentPage, allPages, 10)

          // Current page should not be in related pages
          const currentInRelated = related.some(p => p.title === 'Current')
          expect(currentInRelated).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle pages with no tags', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 3, maxLength: 10 }),
        (titles) => {
          const currentPage = createMockPageData('Current', 'current.md', [])

          const allPages = [currentPage]
          titles.forEach((title, i) => {
            allPages.push(createMockPageData(title, `${title}.md`, []))
          })

          const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

          // Should still compute related pages based on content similarity
          // (even without tags, path similarity should work)
          expect(Array.isArray(related)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should score pages in same directory higher', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]+$/),
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 2, maxLength: 5 }),
        (directory, pageNames) => {
          if (pageNames.length < 2) return true

          const currentPage = createMockPageData(
            'Current',
            `${directory}/${pageNames[0]}.md`,
            []
          )

          const sameDirPage = createMockPageData(
            'Same Dir',
            `${directory}/${pageNames[1]}.md`,
            []
          )

          const diffDirPage = createMockPageData(
            'Diff Dir',
            `other/${pageNames[1]}.md`,
            []
          )

          const allPages = [currentPage, sameDirPage, diffDirPage]
          const related = computeRelatedPagesWithData(
            `/${directory}/${pageNames[0]}`,
            currentPage,
            allPages,
            10
          )

          // Page in same directory should have higher score
          const sameDirResult = related.find(p => p.title === 'Same Dir')
          const diffDirResult = related.find(p => p.title === 'Diff Dir')

          if (sameDirResult && diffDirResult) {
            expect(sameDirResult.score).toBeGreaterThan(diffDirResult.score)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty page list', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z]+$/),
        (title) => {
          const currentPage = createMockPageData(title, `${title}.md`, [])
          const related = computeRelatedPagesWithData(`/${title}`, currentPage, [currentPage], 5)

          // Should return empty array when only current page exists
          expect(related).toEqual([])
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should return results sorted by score descending', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z]+$/), { minLength: 3, maxLength: 5 }),
        (tags) => {
          const currentPage = createMockPageData('Current', 'current.md', tags)

          // Create pages with different levels of tag overlap
          const allPages = [currentPage]
          for (let i = 0; i < 5; i++) {
            const numSharedTags = Math.max(0, tags.length - i)
            allPages.push(
              createMockPageData(`Page ${i}`, `page-${i}.md`, tags.slice(0, numSharedTags))
            )
          }

          const related = computeRelatedPagesWithData('/current', currentPage, allPages, 10)

          // Scores should be in descending order
          for (let i = 1; i < related.length; i++) {
            expect(related[i - 1].score).toBeGreaterThanOrEqual(related[i].score)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests ==============

describe('Related Pages - Unit Tests', () => {
  it('should compute related pages with tag similarity', () => {
    const currentPage = createMockPageData('Current', 'current.md', ['vue', 'typescript'])

    const allPages = [
      currentPage,
      createMockPageData('Page 1', 'page1.md', ['vue', 'typescript'], 'About Vue and TypeScript'),
      createMockPageData('Page 2', 'page2.md', ['vue'], 'About Vue'),
      createMockPageData('Page 3', 'page3.md', ['react'], 'About React'),
      createMockPageData('Page 4', 'page4.md', [], 'No tags')
    ]

    const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

    // Should find related pages
    expect(related.length).toBeGreaterThan(0)

    // Page 1 should be most related (same tags)
    expect(related[0].title).toBe('Page 1')

    // Page 2 should be second (one shared tag)
    expect(related[1].title).toBe('Page 2')
  })

  it('should handle pages with string tags in frontmatter', () => {
    const currentPage: PageData = {
      title: 'Current',
      description: '',
      frontmatter: { tags: 'vue,typescript' }, // String instead of array
      headers: [],
      relativePath: 'current.md',
      filePath: 'current.md',
      lastUpdated: Date.now()
    }

    const otherPage = createMockPageData('Other', 'other.md', ['vue'])
    const allPages = [currentPage, otherPage]

    const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

    // Should parse string tags and find related pages
    expect(related.length).toBeGreaterThan(0)
  })

  it('should compute related pages from sidebar when page data not available', () => {
    const currentPage = createMockPageData('Current', 'guide/current.md', [])
    const siteData = createMockSiteData()
    const themeConfig = createMockThemeConfig({
      '/guide/': [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Configuration', link: '/guide/configuration' }
      ]
    })

    const related = computeRelatedPages(
      '/guide/current',
      currentPage,
      siteData,
      themeConfig,
      5
    )

    // Should find pages from sidebar
    expect(related.length).toBeGreaterThan(0)
  })

  it('should handle nested sidebar structure', () => {
    const currentPage = createMockPageData('Current', 'guide/advanced/current.md', [])
    const siteData = createMockSiteData()
    const themeConfig = createMockThemeConfig({
      '/guide/': [
        {
          text: 'Advanced',
          items: [
            { text: 'Performance', link: '/guide/advanced/performance' },
            { text: 'Security', link: '/guide/advanced/security' }
          ]
        }
      ]
    })

    const related = computeRelatedPages(
      '/guide/advanced/current',
      currentPage,
      siteData,
      themeConfig,
      5
    )

    // Should find pages from nested sidebar
    expect(related.length).toBeGreaterThan(0)
  })

  it('should return empty array when no related pages found', () => {
    const currentPage = createMockPageData('Current', 'current.md', [])
    const allPages = [currentPage]

    const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

    expect(related).toEqual([])
  })

  it('should handle pages with identical content', () => {
    const currentPage = createMockPageData('Current', 'current.md', ['vue'], 'About Vue framework')
    const identicalPage = createMockPageData('Identical', 'identical.md', ['vue'], 'About Vue framework')

    const allPages = [currentPage, identicalPage]
    const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

    // Should find the identical page with high score
    expect(related.length).toBe(1)
    expect(related[0].title).toBe('Identical')
    expect(related[0].score).toBeGreaterThan(0)
  })

  it('should normalize paths correctly', () => {
    const currentPage = createMockPageData('Current', 'guide/current.md', [])
    const otherPage = createMockPageData('Other', 'guide/other.md', [])

    const allPages = [currentPage, otherPage]

    // Test with various path formats
    const related1 = computeRelatedPagesWithData('/guide/current', currentPage, allPages, 5)
    const related2 = computeRelatedPagesWithData('/guide/current/', currentPage, allPages, 5)
    const related3 = computeRelatedPagesWithData('/guide/current.html', currentPage, allPages, 5)

    // All should produce same results
    expect(related1.length).toBe(related2.length)
    expect(related2.length).toBe(related3.length)
  })

  it('should handle multi-sidebar configuration', () => {
    const currentPage = createMockPageData('Current', 'api/current.md', [])
    const siteData = createMockSiteData()
    const themeConfig = createMockThemeConfig({
      '/guide/': [
        { text: 'Guide 1', link: '/guide/page1' }
      ],
      '/api/': [
        { text: 'API 1', link: '/api/page1' },
        { text: 'API 2', link: '/api/page2' }
      ]
    })

    const related = computeRelatedPages(
      '/api/current',
      currentPage,
      siteData,
      themeConfig,
      5
    )

    // Should use the matching sidebar section
    expect(related.length).toBeGreaterThan(0)
    // Should not include guide pages
    const hasGuidePage = related.some(p => p.link.startsWith('/guide/'))
    expect(hasGuidePage).toBe(false)
  })

  it('should handle pages with headers in content similarity', () => {
    const currentPage: PageData = {
      title: 'Current',
      description: 'About Vue',
      frontmatter: {},
      headers: [
        { level: 2, title: 'Installation', slug: 'installation' },
        { level: 2, title: 'Configuration', slug: 'configuration' }
      ],
      relativePath: 'current.md',
      filePath: 'current.md',
      lastUpdated: Date.now()
    }

    const relatedPage: PageData = {
      title: 'Related',
      description: 'About Installation',
      frontmatter: {},
      headers: [
        { level: 2, title: 'Installation Guide', slug: 'installation-guide' }
      ],
      relativePath: 'related.md',
      filePath: 'related.md',
      lastUpdated: Date.now()
    }

    const allPages = [currentPage, relatedPage]
    const related = computeRelatedPagesWithData('/current', currentPage, allPages, 5)

    // Should find related page based on header similarity
    expect(related.length).toBeGreaterThan(0)
    expect(related[0].title).toBe('Related')
  })
})
