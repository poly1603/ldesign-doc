/**
 * Property-Based Tests for Enhanced Previous/Next Navigation
 * Feature: doc-system-enhancement, Property 33: Previous/Next navigation
 * 
 * Validates: Requirements 8.5
 * 
 * Property: For any page in a sequential section, the rendered page SHALL include 
 * correct previous and next page links based on the configured order.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ============== Type Definitions ==============

interface NavLink {
  text: string
  link: string
  description?: string
}

interface SidebarItem {
  text: string
  link?: string
  description?: string
  items?: SidebarItem[]
}

interface DocFooterConfig {
  prev?: string | false
  next?: string | false
  readingOrder?: NavLink[]
}

interface ThemeConfig {
  sidebar?: Record<string, SidebarItem[]>
  docFooter?: DocFooterConfig
}

// ============== Helper Functions ==============

/**
 * Normalize path for comparison
 */
function normalizePath(p: string): string {
  let s = p || '/'
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

/**
 * Extract ordered links from theme config
 * Mimics the logic in VPDoc.vue
 */
function getOrderedLinks(
  themeConfig: ThemeConfig,
  currentPath: string
): NavLink[] {
  // Priority 1: Use custom reading order if configured
  const readingOrder = themeConfig.docFooter?.readingOrder
  if (readingOrder && readingOrder.length > 0) {
    // Filter duplicates based on normalized paths
    const seen = new Set<string>()
    return readingOrder.filter(item => {
      const normalized = normalizePath(item.link)
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
  }

  // Priority 2: Use sidebar order
  const sidebar = themeConfig.sidebar || {}
  const current = normalizePath(currentPath)

  // Find the best matching sidebar group
  const base = Object.keys(sidebar)
    .sort((a, b) => b.length - a.length)
    .find(k => current.startsWith(normalizePath(k)))

  if (!base) return []

  const groups = sidebar[base] || []
  const list: NavLink[] = []
  const seen = new Set<string>()

  for (const group of groups) {
    const items = group.items || []
    for (const item of items) {
      // Filter out items without links, external links, and duplicates
      if (item.link && !/^https?:/i.test(item.link)) {
        const normalized = normalizePath(item.link)
        if (!seen.has(normalized)) {
          seen.add(normalized)
          list.push({
            text: item.text,
            link: item.link,
            description: item.description
          })
        }
      }
    }
  }

  return list
}

/**
 * Get previous page for a given path
 */
function getPrevPage(
  themeConfig: ThemeConfig,
  currentPath: string
): NavLink | null {
  if (themeConfig.docFooter?.prev === false) return null

  const list = getOrderedLinks(themeConfig, currentPath)
  const idx = list.findIndex(i => normalizePath(i.link) === normalizePath(currentPath))

  if (idx > 0) return list[idx - 1]
  return null
}

/**
 * Get next page for a given path
 */
function getNextPage(
  themeConfig: ThemeConfig,
  currentPath: string
): NavLink | null {
  if (themeConfig.docFooter?.next === false) return null

  const list = getOrderedLinks(themeConfig, currentPath)
  const idx = list.findIndex(i => normalizePath(i.link) === normalizePath(currentPath))

  if (idx >= 0 && idx < list.length - 1) return list[idx + 1]
  return null
}

// ============== Arbitraries (Generators) ==============

/**
 * Generate valid page paths
 */
const pagePathArb = fc.tuple(
  fc.constantFrom('guide', 'api', 'tutorial', 'reference'),
  fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e'), { minLength: 1, maxLength: 10 })
).map(([section, chars]) => `/${section}/${chars.join('')}`)

/**
 * Generate nav links with unique paths
 */
const navLinkArb = fc.record({
  text: fc.string({ minLength: 1, maxLength: 50 }),
  link: pagePathArb,
  description: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined })
})

/**
 * Generate array of nav links with guaranteed unique paths
 */
const uniqueNavLinksArb = (minLength: number, maxLength: number) =>
  fc.array(navLinkArb, { minLength: minLength * 3, maxLength: maxLength * 3 })
    .map(links => {
      const seen = new Set<string>()
      const unique: NavLink[] = []
      for (const link of links) {
        const normalized = normalizePath(link.link)
        if (!seen.has(normalized)) {
          seen.add(normalized)
          unique.push(link)
        }
      }
      return unique
    })
    .filter(links => links.length >= minLength)

/**
 * Generate sidebar items
 */
const sidebarItemArb: fc.Arbitrary<SidebarItem> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 50 }),
  link: fc.option(pagePathArb, { nil: undefined }),
  description: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
  items: fc.constant(undefined) // Simplified: no nested items for testing
})

/**
 * Generate sidebar configuration
 */
const sidebarArb = fc.dictionary(
  fc.constantFrom('/guide/', '/api/', '/tutorial/'),
  fc.array(
    fc.record({
      text: fc.string({ minLength: 1, maxLength: 30 }),
      items: fc.array(sidebarItemArb, { minLength: 2, maxLength: 10 })
    }),
    { minLength: 1, maxLength: 3 }
  )
)

/**
 * Generate theme config with sidebar
 */
const themeConfigWithSidebarArb = sidebarArb.map(sidebar => ({
  sidebar
}))

/**
 * Generate theme config with reading order (guaranteed unique links)
 */
const themeConfigWithReadingOrderArb = uniqueNavLinksArb(2, 10)
  .map(readingOrder => ({
    docFooter: { readingOrder }
  }))

// ============== Property-Based Tests ==============

describe('VPDoc Navigation - Property 33: Previous/Next navigation', () => {
  /**
   * Property 1: Previous page correctness
   * For any page with a predecessor in the sequence, getPrevPage returns the correct previous page
   */
  it('should return correct previous page based on reading order', () => {
    fc.assert(
      fc.property(
        themeConfigWithReadingOrderArb,
        fc.nat(),
        (themeConfig, indexSeed) => {
          const readingOrder = themeConfig.docFooter!.readingOrder!
          if (readingOrder.length < 2) return true

          // Pick a page that has a predecessor (not the first page)
          const currentIndex = (indexSeed % (readingOrder.length - 1)) + 1
          const currentPath = readingOrder[currentIndex].link
          const expectedPrev = readingOrder[currentIndex - 1]

          const actualPrev = getPrevPage(themeConfig, currentPath)

          return (
            actualPrev !== null &&
            actualPrev.link === expectedPrev.link &&
            actualPrev.text === expectedPrev.text
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2: Next page correctness
   * For any page with a successor in the sequence, getNextPage returns the correct next page
   */
  it('should return correct next page based on reading order', () => {
    fc.assert(
      fc.property(
        themeConfigWithReadingOrderArb,
        fc.nat(),
        (themeConfig, indexSeed) => {
          const readingOrder = themeConfig.docFooter!.readingOrder!

          // Reading order is guaranteed to have unique links by the generator
          if (readingOrder.length < 2) return true

          // Pick a page that has a successor (not the last page)
          const currentIndex = indexSeed % (readingOrder.length - 1)
          const currentPath = readingOrder[currentIndex].link
          const expectedNext = readingOrder[currentIndex + 1]

          const actualNext = getNextPage(themeConfig, currentPath)

          return (
            actualNext !== null &&
            normalizePath(actualNext.link) === normalizePath(expectedNext.link) &&
            actualNext.text === expectedNext.text
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: First page has no previous
   * The first page in any sequence should not have a previous page
   */
  it('should return null for previous page when on first page', () => {
    fc.assert(
      fc.property(
        themeConfigWithReadingOrderArb,
        (themeConfig) => {
          const readingOrder = themeConfig.docFooter!.readingOrder!
          if (readingOrder.length === 0) return true

          const firstPagePath = readingOrder[0].link
          const prev = getPrevPage(themeConfig, firstPagePath)

          return prev === null
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Last page has no next
   * The last page in any sequence should not have a next page
   */
  it('should return null for next page when on last page', () => {
    fc.assert(
      fc.property(
        themeConfigWithReadingOrderArb,
        (themeConfig) => {
          const readingOrder = themeConfig.docFooter!.readingOrder!

          // Reading order is guaranteed to have unique links
          if (readingOrder.length === 0) return true

          const lastPagePath = readingOrder[readingOrder.length - 1].link
          const next = getNextPage(themeConfig, lastPagePath)

          return next === null
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Description preservation
   * When a page has a description, it should be preserved in the navigation link
   */
  it('should preserve page descriptions in navigation links', () => {
    fc.assert(
      fc.property(
        uniqueNavLinksArb(2, 10).chain(links =>
          fc.record({
            links: fc.constant(links),
            indexSeed: fc.nat()
          })
        ),
        ({ links, indexSeed }) => {
          // Ensure all links have descriptions
          const linksWithDesc = links.map(link => ({
            ...link,
            description: link.description || 'Default description'
          }))

          const themeConfig = { docFooter: { readingOrder: linksWithDesc } }

          if (linksWithDesc.length < 2) return true

          const currentIndex = indexSeed % (linksWithDesc.length - 1)
          const currentPath = linksWithDesc[currentIndex].link

          const next = getNextPage(themeConfig, currentPath)

          return (
            next !== null &&
            next.description === linksWithDesc[currentIndex + 1].description
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 6: Disabled navigation
   * When prev/next is disabled in config, navigation should return null
   */
  it('should respect disabled navigation configuration', () => {
    fc.assert(
      fc.property(
        uniqueNavLinksArb(3, 10),
        fc.boolean(),
        fc.boolean(),
        (readingOrder, disablePrev, disableNext) => {
          const themeConfig: ThemeConfig = {
            docFooter: {
              readingOrder,
              prev: disablePrev ? false : undefined,
              next: disableNext ? false : undefined
            }
          }

          // Reading order is guaranteed to have at least 3 unique links
          if (readingOrder.length < 3) return true

          const currentPath = readingOrder[1].link

          const prev = getPrevPage(themeConfig, currentPath)
          const next = getNextPage(themeConfig, currentPath)

          const prevCorrect = disablePrev ? prev === null : prev !== null
          const nextCorrect = disableNext ? next === null : next !== null

          return prevCorrect && nextCorrect
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 7: Sidebar-based navigation
   * When no reading order is configured, navigation should use sidebar order
   */
  it('should use sidebar order when reading order is not configured', () => {
    fc.assert(
      fc.property(
        sidebarArb,
        (sidebar) => {
          const themeConfig: ThemeConfig = { sidebar }

          // Get all unique links from sidebar
          const allLinks: NavLink[] = []
          const seen = new Set<string>()

          for (const groups of Object.values(sidebar)) {
            for (const group of groups) {
              const items = group.items || []
              for (const item of items) {
                if (item.link && !/^https?:/i.test(item.link)) {
                  const normalized = normalizePath(item.link)
                  if (!seen.has(normalized)) {
                    seen.add(normalized)
                    allLinks.push({
                      text: item.text,
                      link: item.link,
                      description: item.description
                    })
                  }
                }
              }
            }
          }

          // Skip if we don't have at least 2 links
          if (allLinks.length < 2) return true

          // Test navigation for the second page (which should have a prev)
          const currentPath = allLinks[1].link

          // Use getOrderedLinks to get the actual navigation order
          const orderedLinks = getOrderedLinks(themeConfig, currentPath)

          // Skip if ordered links don't match (path mismatch between sidebar base and links)
          if (orderedLinks.length < 2) return true

          // Skip if the current path is not in the ordered links
          const currentIndex = orderedLinks.findIndex(l => normalizePath(l.link) === normalizePath(currentPath))
          if (currentIndex < 1) return true

          const prev = getPrevPage(themeConfig, currentPath)

          return prev !== null && normalizePath(prev.link) === normalizePath(orderedLinks[currentIndex - 1].link)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 8: Path normalization consistency
   * Navigation should work correctly regardless of trailing slashes
   */
  it('should handle path normalization correctly', () => {
    fc.assert(
      fc.property(
        uniqueNavLinksArb(3, 10),
        fc.nat(),
        fc.boolean(),
        (readingOrder, indexSeed, addTrailingSlash) => {
          // Reading order is guaranteed to have at least 3 unique links
          if (readingOrder.length < 3) return true

          const themeConfig = { docFooter: { readingOrder } }
          const currentIndex = (indexSeed % (readingOrder.length - 2)) + 1

          let currentPath = readingOrder[currentIndex].link
          if (addTrailingSlash && !currentPath.endsWith('/')) {
            currentPath += '/'
          }

          const prev = getPrevPage(themeConfig, currentPath)
          const next = getNextPage(themeConfig, currentPath)

          return (
            prev !== null &&
            next !== null &&
            normalizePath(prev.link) === normalizePath(readingOrder[currentIndex - 1].link) &&
            normalizePath(next.link) === normalizePath(readingOrder[currentIndex + 1].link)
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 9: Reading order priority
   * When both reading order and sidebar are configured, reading order takes precedence
   */
  it('should prioritize reading order over sidebar', () => {
    fc.assert(
      fc.property(
        uniqueNavLinksArb(3, 10),
        sidebarArb,
        (readingOrder, sidebar) => {
          if (readingOrder.length < 3) return true

          const themeConfig: ThemeConfig = {
            sidebar,
            docFooter: { readingOrder }
          }

          const currentPath = readingOrder[1].link
          const prev = getPrevPage(themeConfig, currentPath)

          // Should use reading order, not sidebar
          return prev !== null && normalizePath(prev.link) === normalizePath(readingOrder[0].link)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 10: Non-existent page handling
   * Navigation for a page not in the sequence should return null
   */
  it('should return null for pages not in the sequence', () => {
    fc.assert(
      fc.property(
        themeConfigWithReadingOrderArb,
        pagePathArb,
        (themeConfig, randomPath) => {
          const readingOrder = themeConfig.docFooter!.readingOrder!

          // Ensure the random path is not in the reading order
          const pathExists = readingOrder.some(item =>
            normalizePath(item.link) === normalizePath(randomPath)
          )

          if (pathExists) return true // Skip if path exists

          const prev = getPrevPage(themeConfig, randomPath)
          const next = getNextPage(themeConfig, randomPath)

          return prev === null && next === null
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('VPDoc Navigation - Edge Cases', () => {
  it('should handle empty reading order', () => {
    const themeConfig: ThemeConfig = {
      docFooter: { readingOrder: [] }
    }

    const prev = getPrevPage(themeConfig, '/any/path')
    const next = getNextPage(themeConfig, '/any/path')

    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('should handle single page in reading order', () => {
    const themeConfig: ThemeConfig = {
      docFooter: {
        readingOrder: [
          { text: 'Only Page', link: '/only' }
        ]
      }
    }

    const prev = getPrevPage(themeConfig, '/only')
    const next = getNextPage(themeConfig, '/only')

    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('should handle external links in sidebar', () => {
    const themeConfig: ThemeConfig = {
      sidebar: {
        '/guide/': [
          {
            text: 'Guide',
            items: [
              { text: 'Internal', link: '/guide/internal' },
              { text: 'External', link: 'https://example.com' },
              { text: 'Another', link: '/guide/another' }
            ]
          }
        ]
      }
    }

    const links = getOrderedLinks(themeConfig, '/guide/internal')

    // Should exclude external links
    expect(links).toHaveLength(2)
    expect(links.every(link => !link.link.startsWith('http'))).toBe(true)
  })

  it('should handle missing sidebar for current path', () => {
    const themeConfig: ThemeConfig = {
      sidebar: {
        '/guide/': [
          {
            text: 'Guide',
            items: [
              { text: 'Page 1', link: '/guide/page1' }
            ]
          }
        ]
      }
    }

    const links = getOrderedLinks(themeConfig, '/api/something')

    expect(links).toHaveLength(0)
  })

  it('should preserve all link properties', () => {
    const themeConfig: ThemeConfig = {
      docFooter: {
        readingOrder: [
          {
            text: 'First',
            link: '/first',
            description: 'First page description'
          },
          {
            text: 'Second',
            link: '/second',
            description: 'Second page description'
          }
        ]
      }
    }

    const next = getNextPage(themeConfig, '/first')

    expect(next).toEqual({
      text: 'Second',
      link: '/second',
      description: 'Second page description'
    })
  })
})
