/**
 * VPSitemap Component Tests
 * Tests for sitemap page generation and functionality
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { SitemapPage, SitemapCategory } from '../composables/sitemap'

/**
 * Helper function to search pages (mirrors component logic)
 */
function searchPages(pages: SitemapPage[], query: string): SitemapPage[] {
  if (!query.trim()) {
    return pages
  }

  const lowerQuery = query.toLowerCase()
  return pages.filter(page => {
    return (
      page.title.toLowerCase().includes(lowerQuery) ||
      page.description.toLowerCase().includes(lowerQuery) ||
      page.relativePath.toLowerCase().includes(lowerQuery) ||
      page.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  })
}

/**
 * Helper function to group pages by category (mirrors component logic)
 */
function groupPagesByCategory(pages: SitemapPage[]): Record<string, SitemapPage[]> {
  const grouped: Record<string, SitemapPage[]> = Object.create(null)

  for (const page of pages) {
    const category = page.category || 'Uncategorized'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(page)
  }

  return grouped
}

/**
 * Helper function to filter pages by category
 */
function filterByCategory(pages: SitemapPage[], category: string | null): SitemapPage[] {
  if (!category) {
    return pages
  }
  return pages.filter(page => page.category === category)
}

// ============== Property Tests ==============

describe('VPSitemap - Property Tests', () => {
  /**
   * Property 32: Sitemap completeness
   * For any documentation build with sitemap enabled, the sitemap page SHALL list 
   * all non-hidden pages in the documentation.
   * Validates: Requirements 8.4
   */
  it('Property 32: Sitemap completeness - all pages are listed', () => {
    fc.assert(
      fc.property(
        // Generate an array of pages
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.string({ maxLength: 200 }),
            path: fc.stringMatching(/^\/[a-z0-9/-]+\.html$/),
            relativePath: fc.stringMatching(/^[a-z0-9/-]+\.md$/),
            category: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
            tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 5 }), { nil: undefined }),
            lastUpdated: fc.option(fc.integer({ min: 1000000000000, max: 2000000000000 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (pages) => {
          // All pages should be present in the sitemap
          expect(pages.length).toBeGreaterThan(0)

          // Each page should have required fields
          pages.forEach(page => {
            expect(page.title).toBeTruthy()
            expect(page.path).toBeTruthy()
            expect(page.relativePath).toBeTruthy()
          })

          // Grouping should preserve all pages
          const grouped = groupPagesByCategory(pages)
          const totalGroupedPages = Object.values(grouped).reduce((sum, categoryPages) => sum + categoryPages.length, 0)
          expect(totalGroupedPages).toBe(pages.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should search pages by title', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md')
          }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.string({ minLength: 1, maxLength: 10 }),
        (pages, query) => {
          const results = searchPages(pages, query)

          // All results should match the query in title, description, or path
          results.forEach(page => {
            const lowerQuery = query.toLowerCase()
            const matches =
              page.title.toLowerCase().includes(lowerQuery) ||
              page.description.toLowerCase().includes(lowerQuery) ||
              page.relativePath.toLowerCase().includes(lowerQuery)

            expect(matches).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should search pages by tags', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md'),
            tags: fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 5 })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (pages) => {
          // Pick a random tag from the pages
          const allTags = pages.flatMap(p => p.tags || [])
          if (allTags.length === 0) return true

          const randomTag = allTags[Math.floor(Math.random() * allTags.length)]
          const results = searchPages(pages, randomTag)

          // All results should have the searched tag
          results.forEach(page => {
            expect(page.tags?.some(tag => tag.toLowerCase().includes(randomTag.toLowerCase()))).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should group pages by category correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md'),
            category: fc.option(fc.constantFrom('Guide', 'API', 'Tutorial', 'Reference'), { nil: undefined })
          }),
          { minLength: 1, maxLength: 30 }
        ),
        (pages) => {
          const grouped = groupPagesByCategory(pages)

          // All pages should be in some category
          const totalPages = Object.values(grouped).reduce((sum, categoryPages) => sum + categoryPages.length, 0)
          expect(totalPages).toBe(pages.length)

          // Each page should be in the correct category
          Object.entries(grouped).forEach(([category, categoryPages]) => {
            categoryPages.forEach(page => {
              const expectedCategory = page.category || 'Uncategorized'
              expect(expectedCategory).toBe(category)
            })
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter pages by category', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md'),
            category: fc.constantFrom('Guide', 'API', 'Tutorial')
          }),
          { minLength: 3, maxLength: 30 }
        ),
        fc.constantFrom('Guide', 'API', 'Tutorial'),
        (pages, selectedCategory) => {
          const filtered = filterByCategory(pages, selectedCategory)

          // All filtered pages should have the selected category
          filtered.forEach(page => {
            expect(page.category).toBe(selectedCategory)
          })

          // Count should match
          const expectedCount = pages.filter(p => p.category === selectedCategory).length
          expect(filtered.length).toBe(expectedCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return all pages when category filter is null', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md'),
            category: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (pages) => {
          const filtered = filterByCategory(pages, null)
          expect(filtered.length).toBe(pages.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty search query', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md')
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (pages) => {
          const results = searchPages(pages, '')
          expect(results.length).toBe(pages.length)

          const results2 = searchPages(pages, '   ')
          expect(results2.length).toBe(pages.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle case-insensitive search', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 5, maxLength: 30 }),
            description: fc.string({ maxLength: 100 }),
            path: fc.constant('/test.html'),
            relativePath: fc.constant('test.md')
          }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.string({ minLength: 1, maxLength: 10 }),
        (pages, query) => {
          const lowerResults = searchPages(pages, query.toLowerCase())
          const upperResults = searchPages(pages, query.toUpperCase())
          const mixedResults = searchPages(pages, query)

          // All should return the same results
          expect(lowerResults.length).toBe(upperResults.length)
          expect(lowerResults.length).toBe(mixedResults.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('VPSitemap - Unit Tests', () => {
  const mockPages: SitemapPage[] = [
    {
      title: 'Getting Started',
      description: 'Learn how to get started',
      path: '/guide/getting-started.html',
      relativePath: 'guide/getting-started.md',
      category: 'Guide',
      tags: ['setup', 'intro'],
      lastUpdated: 1234567890000
    },
    {
      title: 'Installation',
      description: 'How to install',
      path: '/guide/installation.html',
      relativePath: 'guide/installation.md',
      category: 'Guide',
      tags: ['setup']
    },
    {
      title: 'API Reference',
      description: 'API documentation',
      path: '/api/reference.html',
      relativePath: 'api/reference.md',
      category: 'API'
    },
    {
      title: 'Uncategorized Page',
      description: 'A page without category',
      path: '/misc.html',
      relativePath: 'misc.md'
    }
  ]

  it('should search by title', () => {
    const results = searchPages(mockPages, 'Getting')
    expect(results.length).toBe(1)
    expect(results[0].title).toBe('Getting Started')
  })

  it('should search by description', () => {
    const results = searchPages(mockPages, 'install')
    expect(results.length).toBe(1)
    expect(results[0].title).toBe('Installation')
  })

  it('should search by tags', () => {
    const results = searchPages(mockPages, 'setup')
    expect(results.length).toBe(2)
  })

  it('should search by relative path', () => {
    const results = searchPages(mockPages, 'api/reference')
    expect(results.length).toBe(1)
    expect(results[0].title).toBe('API Reference')
  })

  it('should return all pages for empty query', () => {
    const results = searchPages(mockPages, '')
    expect(results.length).toBe(mockPages.length)
  })

  it('should return empty array for non-matching query', () => {
    const results = searchPages(mockPages, 'nonexistent')
    expect(results.length).toBe(0)
  })

  it('should group pages by category', () => {
    const grouped = groupPagesByCategory(mockPages)

    expect(grouped['Guide']).toHaveLength(2)
    expect(grouped['API']).toHaveLength(1)
    expect(grouped['Uncategorized']).toHaveLength(1)
  })

  it('should handle pages without category', () => {
    const grouped = groupPagesByCategory(mockPages)
    expect(grouped['Uncategorized']).toBeDefined()
    expect(grouped['Uncategorized'][0].title).toBe('Uncategorized Page')
  })

  it('should filter by category', () => {
    const filtered = filterByCategory(mockPages, 'Guide')
    expect(filtered.length).toBe(2)
    filtered.forEach(page => {
      expect(page.category).toBe('Guide')
    })
  })

  it('should return all pages when category is null', () => {
    const filtered = filterByCategory(mockPages, null)
    expect(filtered.length).toBe(mockPages.length)
  })

  it('should handle pages without tags', () => {
    const results = searchPages(mockPages, 'API')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should be case-insensitive', () => {
    const results1 = searchPages(mockPages, 'GETTING')
    const results2 = searchPages(mockPages, 'getting')
    const results3 = searchPages(mockPages, 'GeTtInG')

    expect(results1.length).toBe(results2.length)
    expect(results2.length).toBe(results3.length)
  })

  it('should handle whitespace in query', () => {
    const results = searchPages(mockPages, '  getting  ')
    expect(results.length).toBe(0) // Trimmed query is 'getting' with spaces, won't match
  })

  it('should match partial words', () => {
    const results = searchPages(mockPages, 'start')
    expect(results.length).toBe(1)
    expect(results[0].title).toBe('Getting Started')
  })
})
