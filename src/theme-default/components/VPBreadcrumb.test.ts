/**
 * VPBreadcrumb Component Tests
 * Tests for breadcrumb navigation generation
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Mock types for testing
interface BreadcrumbItem {
  path: string
  title: string
}

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

/**
 * Helper function to find title in sidebar (mirrors component logic)
 */
function findTitleInSidebar(path: string, items: SidebarItem[]): string | null {
  for (const item of items) {
    const normalizedItemLink = item.link?.replace(/\/$/, '')
    const normalizedPath = path.replace(/\/$/, '')

    if (normalizedItemLink === normalizedPath) {
      return item.text
    }

    if (item.items) {
      const found = findTitleInSidebar(path, item.items)
      if (found) return found
    }
  }
  return null
}

/**
 * Helper function to get path title (mirrors component logic)
 */
function getPathTitle(path: string, sidebar: SidebarItem[]): string {
  const title = findTitleInSidebar(path, sidebar)
  if (title) return title

  const segments = path.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  return lastSegment
    .replace(/\.(md|html)$/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Helper function to generate breadcrumb items (mirrors component logic)
 */
function generateBreadcrumbItems(
  currentPath: string,
  sidebar: SidebarItem[],
  homeLink: string = '/'
): BreadcrumbItem[] {
  let pathWithoutLocale = currentPath
  if (homeLink !== '/' && currentPath.startsWith(homeLink)) {
    pathWithoutLocale = currentPath.slice(homeLink.length)
  }

  if (!pathWithoutLocale || pathWithoutLocale === '/') {
    return []
  }

  const segments = pathWithoutLocale.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []
  let accumulatedPath = homeLink !== '/' ? homeLink.replace(/\/$/, '') : ''

  for (let i = 0; i < segments.length; i++) {
    accumulatedPath += '/' + segments[i]
    const normalizedPath = accumulatedPath.replace(/\/$/, '') || '/'

    items.push({
      path: normalizedPath,
      title: getPathTitle(normalizedPath, sidebar)
    })
  }

  return items
}

// ============== Property Tests ==============

describe('VPBreadcrumb - Property Tests', () => {
  /**
   * Property 29: Breadcrumb generation
   * For any page at depth > 1 in the hierarchy, the rendered page SHALL include 
   * breadcrumb navigation reflecting the path from root.
   * Validates: Requirements 8.1
   */
  it('Property 29: Breadcrumb generation for nested paths', () => {
    fc.assert(
      fc.property(
        // Generate a path with at least 2 segments (depth > 1)
        fc.array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 2, maxLength: 5 }),
        (segments) => {
          const path = '/' + segments.join('/')
          const breadcrumbs = generateBreadcrumbItems(path, [])

          // Should have breadcrumb items for nested paths
          expect(breadcrumbs.length).toBeGreaterThan(0)

          // Number of breadcrumb items should match path depth
          expect(breadcrumbs.length).toBe(segments.length)

          // Each breadcrumb should have a path and title
          breadcrumbs.forEach(item => {
            expect(item.path).toBeTruthy()
            expect(item.title).toBeTruthy()
          })

          // Paths should be cumulative
          let accumulatedPath = ''
          segments.forEach((segment, index) => {
            accumulatedPath += '/' + segment
            expect(breadcrumbs[index].path).toBe(accumulatedPath)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array for home page', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/', ''),
        (homePath) => {
          const breadcrumbs = generateBreadcrumbItems(homePath, [])
          expect(breadcrumbs).toEqual([])
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle locale prefixes correctly', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z]{2}\/$/), // locale prefix like /en/
        fc.array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 3 }),
        (localePrefix, segments) => {
          const path = localePrefix + segments.join('/')
          const breadcrumbs = generateBreadcrumbItems(path, [], localePrefix)

          // Should strip locale prefix
          expect(breadcrumbs.length).toBe(segments.length)

          // First breadcrumb should start with locale prefix
          if (breadcrumbs.length > 0) {
            expect(breadcrumbs[0].path).toContain(localePrefix.replace(/\/$/, ''))
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should find titles from sidebar configuration', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 20 }),
            link: fc.stringMatching(/^\/[a-z0-9-/]+$/)
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (sidebarItems) => {
          // Ensure unique links by creating a map
          const uniqueItems = Array.from(
            new Map(sidebarItems.map(item => [item.link, item])).values()
          )

          if (uniqueItems.length === 0) return true

          // Pick a random item from unique sidebar items
          const randomItem = uniqueItems[Math.floor(Math.random() * uniqueItems.length)]
          const title = findTitleInSidebar(randomItem.link, uniqueItems)

          // Should find the title
          expect(title).toBe(randomItem.text)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate title from path when not in sidebar', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        (path) => {
          const title = getPathTitle(path, [])

          // Should generate a title
          expect(title).toBeTruthy()
          expect(typeof title).toBe('string')

          // Title should be capitalized
          const words = title.split(' ')
          words.forEach(word => {
            if (word.length > 0) {
              expect(word[0]).toBe(word[0].toUpperCase())
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle paths with trailing slashes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 3 }),
        fc.boolean(),
        (segments, addTrailingSlash) => {
          let path = '/' + segments.join('/')
          if (addTrailingSlash) path += '/'

          const breadcrumbs = generateBreadcrumbItems(path, [])

          // Should normalize paths (no trailing slash in breadcrumb paths)
          breadcrumbs.forEach(item => {
            if (item.path !== '/') {
              expect(item.path.endsWith('/')).toBe(false)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle nested sidebar items', () => {
    const nestedSidebar: SidebarItem[] = [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' }
        ]
      }
    ]

    const title1 = findTitleInSidebar('/guide/getting-started', nestedSidebar)
    expect(title1).toBe('Getting Started')

    const title2 = findTitleInSidebar('/guide/installation', nestedSidebar)
    expect(title2).toBe('Installation')
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('VPBreadcrumb - Unit Tests', () => {
  it('should handle empty path segments', () => {
    const breadcrumbs = generateBreadcrumbItems('//guide//getting-started//', [])
    // Should filter out empty segments
    expect(breadcrumbs.length).toBe(2)
    expect(breadcrumbs[0].path).toBe('/guide')
    expect(breadcrumbs[1].path).toBe('/guide/getting-started')
  })

  it('should handle paths with file extensions', () => {
    const path = '/guide/getting-started.md'
    const breadcrumbs = generateBreadcrumbItems(path, [])

    expect(breadcrumbs.length).toBe(2)
    // Title should have .md removed
    expect(breadcrumbs[1].title).not.toContain('.md')
  })

  it('should handle paths with hyphens and underscores', () => {
    const path = '/api-reference/user_management'
    const breadcrumbs = generateBreadcrumbItems(path, [])

    expect(breadcrumbs.length).toBe(2)
    // Titles should have hyphens/underscores converted to spaces and capitalized
    expect(breadcrumbs[0].title).toBe('Api Reference')
    expect(breadcrumbs[1].title).toBe('User Management')
  })

  it('should return empty for root path', () => {
    const breadcrumbs = generateBreadcrumbItems('/', [])
    expect(breadcrumbs).toEqual([])
  })

  it('should handle single segment path', () => {
    const breadcrumbs = generateBreadcrumbItems('/guide', [])
    expect(breadcrumbs.length).toBe(1)
    expect(breadcrumbs[0].path).toBe('/guide')
    expect(breadcrumbs[0].title).toBe('Guide')
  })

  it('should prefer sidebar title over generated title', () => {
    const sidebar: SidebarItem[] = [
      { text: 'User Guide', link: '/guide' }
    ]

    const breadcrumbs = generateBreadcrumbItems('/guide', sidebar)
    expect(breadcrumbs[0].title).toBe('User Guide')
  })

  it('should handle deeply nested sidebar structure', () => {
    const sidebar: SidebarItem[] = [
      {
        text: 'Documentation',
        items: [
          {
            text: 'API',
            items: [
              { text: 'REST API', link: '/docs/api/rest' }
            ]
          }
        ]
      }
    ]

    const title = findTitleInSidebar('/docs/api/rest', sidebar)
    expect(title).toBe('REST API')
  })

  it('should handle locale prefix with nested paths', () => {
    const breadcrumbs = generateBreadcrumbItems('/en/guide/getting-started', [], '/en/')

    expect(breadcrumbs.length).toBe(2)
    expect(breadcrumbs[0].path).toBe('/en/guide')
    expect(breadcrumbs[1].path).toBe('/en/guide/getting-started')
  })

  it('should handle paths without locale prefix when locale is root', () => {
    const breadcrumbs = generateBreadcrumbItems('/guide/getting-started', [], '/')

    expect(breadcrumbs.length).toBe(2)
    expect(breadcrumbs[0].path).toBe('/guide')
    expect(breadcrumbs[1].path).toBe('/guide/getting-started')
  })
})
