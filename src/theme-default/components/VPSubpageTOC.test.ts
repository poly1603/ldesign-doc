/**
 * VPSubpageTOC Component Tests
 * Tests for subpage table of contents display
 * 
 * Feature: doc-system-enhancement, Property 34: Subpage TOC display
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Mock types for testing
interface SubpageItem {
  text: string
  link: string
  description?: string
}

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  description?: string
}

/**
 * Normalize path helper (mirrors component logic)
 */
function normalizePath(path: string): string {
  let normalized = path || '/'
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/**
 * Check if a path is a direct subpath of another (mirrors component logic)
 */
function isSubpath(parentPath: string, childPath: string): boolean {
  const parent = normalizePath(parentPath)
  const child = normalizePath(childPath)

  // Child must not be the same as parent
  if (child === parent) {
    return false
  }

  // Special handling for root path
  if (parent === '/') {
    // For root, check if child has exactly one segment
    const segments = child.split('/').filter(Boolean)
    return segments.length === 1
  }

  // Child must start with parent + '/'
  if (!child.startsWith(parent + '/')) {
    return false
  }

  // Get relative path
  const relativePath = child.substring(parent.length + 1)

  // Must be direct child (no additional slashes)
  return !relativePath.includes('/')
}

/**
 * Extract subpages from sidebar items (mirrors component logic)
 */
function extractSubpages(items: SidebarItem[], currentPath: string): SubpageItem[] {
  const subpages: SubpageItem[] = []
  const normalized = normalizePath(currentPath)

  for (const item of items) {
    // If item has a link and is a subpage of current path
    if (item.link && isSubpath(normalized, item.link)) {
      subpages.push({
        text: item.text,
        link: item.link,
        description: item.description
      })
    }

    // Recursively check child items
    if (item.items && item.items.length > 0) {
      const childSubpages = extractSubpages(item.items, currentPath)
      subpages.push(...childSubpages)
    }
  }

  return subpages
}

// ============== Property Tests ==============

describe('VPSubpageTOC - Property Tests', () => {
  /**
   * Property 34: Subpage TOC display
   * For any page with child pages, the rendered page SHALL include a mini table 
   * of contents listing the subpages.
   * Validates: Requirements 8.6
   */
  it('Property 34: Subpage TOC display for pages with children', () => {
    fc.assert(
      fc.property(
        // Generate a parent path
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        // Generate child pages (direct children only)
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 30 }),
            name: fc.stringMatching(/^[a-z0-9-]+$/)
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (parentPath, children) => {
          // Create sidebar items with parent and children
          const sidebarItems: SidebarItem[] = [
            {
              text: 'Parent',
              link: parentPath,
              items: children.map(child => ({
                text: child.text,
                link: `${parentPath}/${child.name}`
              }))
            }
          ]

          // Extract subpages for the parent path
          const subpages = extractSubpages(sidebarItems, parentPath)

          // Should find all direct children
          expect(subpages.length).toBe(children.length)

          // Each subpage should have required properties
          subpages.forEach(subpage => {
            expect(subpage.text).toBeTruthy()
            expect(subpage.link).toBeTruthy()
            expect(subpage.link.startsWith(parentPath + '/')).toBe(true)
          })

          // All child links should be present
          const childLinks = children.map(c => `${parentPath}/${c.name}`)
          const subpageLinks = subpages.map(s => s.link)
          childLinks.forEach(link => {
            expect(subpageLinks).toContain(link)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array for pages without children', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-/]+$/),
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 20 }),
            link: fc.stringMatching(/^\/[a-z0-9-/]+$/)
          }),
          { minLength: 0, maxLength: 5 }
        ),
        (currentPath, sidebarItems) => {
          // Normalize current path to avoid edge cases
          const normalizedCurrent = normalizePath(currentPath)

          // Ensure no items are children of currentPath
          const filteredItems = sidebarItems.filter(
            item => !isSubpath(normalizedCurrent, item.link)
          )

          const subpages = extractSubpages(filteredItems, normalizedCurrent)

          // Should return empty array when no children exist
          expect(subpages).toEqual([])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should only include direct children, not grandchildren', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        fc.stringMatching(/^[a-z0-9-]+$/),
        fc.stringMatching(/^[a-z0-9-]+$/),
        (parentPath, childName, grandchildName) => {
          const childPath = `${parentPath}/${childName}`
          const grandchildPath = `${childPath}/${grandchildName}`

          const sidebarItems: SidebarItem[] = [
            {
              text: 'Parent',
              link: parentPath,
              items: [
                {
                  text: 'Child',
                  link: childPath,
                  items: [
                    {
                      text: 'Grandchild',
                      link: grandchildPath
                    }
                  ]
                }
              ]
            }
          ]

          // Extract subpages for parent
          const parentSubpages = extractSubpages(sidebarItems, parentPath)

          // Should only include direct child, not grandchild
          expect(parentSubpages.length).toBe(1)
          expect(parentSubpages[0].link).toBe(childPath)

          // Extract subpages for child
          const childSubpages = extractSubpages(sidebarItems, childPath)

          // Should include grandchild as direct child of child
          expect(childSubpages.length).toBe(1)
          expect(childSubpages[0].link).toBe(grandchildPath)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle paths with trailing slashes', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        fc.boolean(),
        fc.boolean(),
        (basePath, parentTrailingSlash, childTrailingSlash) => {
          const parentPath = parentTrailingSlash ? basePath + '/' : basePath
          const childPath = childTrailingSlash ? `${basePath}/child/` : `${basePath}/child`

          const sidebarItems: SidebarItem[] = [
            {
              text: 'Parent',
              link: parentPath,
              items: [
                {
                  text: 'Child',
                  link: childPath
                }
              ]
            }
          ]

          const subpages = extractSubpages(sidebarItems, parentPath)

          // Should find child regardless of trailing slashes
          expect(subpages.length).toBe(1)
          expect(subpages[0].text).toBe('Child')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve description field when present', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        fc.array(
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 20 }),
            name: fc.stringMatching(/^[a-z0-9-]+$/),
            description: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
          }),
          { minLength: 1, maxLength: 3 }
        ),
        (parentPath, children) => {
          const sidebarItems: SidebarItem[] = [
            {
              text: 'Parent',
              link: parentPath,
              items: children.map(child => ({
                text: child.text,
                link: `${parentPath}/${child.name}`,
                description: child.description
              }))
            }
          ]

          const subpages = extractSubpages(sidebarItems, parentPath)

          // Check that descriptions are preserved
          subpages.forEach((subpage, index) => {
            if (children[index].description) {
              expect(subpage.description).toBe(children[index].description)
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle nested sidebar structure', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\/[a-z0-9-]+$/),
        fc.stringMatching(/^[a-z0-9-]+$/),
        (parentPath, childName) => {
          const childPath = `${parentPath}/${childName}`

          // Nested structure where child is not directly under parent in sidebar
          const sidebarItems: SidebarItem[] = [
            {
              text: 'Section',
              items: [
                {
                  text: 'Parent',
                  link: parentPath,
                  items: [
                    {
                      text: 'Child',
                      link: childPath
                    }
                  ]
                }
              ]
            }
          ]

          const subpages = extractSubpages(sidebarItems, parentPath)

          // Should find child even in nested structure
          expect(subpages.length).toBe(1)
          expect(subpages[0].link).toBe(childPath)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('VPSubpageTOC - Unit Tests', () => {
  it('should handle empty sidebar', () => {
    const subpages = extractSubpages([], '/guide')
    expect(subpages).toEqual([])
  })

  it('should handle root path', () => {
    const sidebarItems: SidebarItem[] = [
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ]

    const subpages = extractSubpages(sidebarItems, '/')

    // Should find direct children of root
    expect(subpages.length).toBe(2)
    expect(subpages.map(s => s.link)).toContain('/guide')
    expect(subpages.map(s => s.link)).toContain('/api')
  })

  it('should not include parent itself', () => {
    const sidebarItems: SidebarItem[] = [
      {
        text: 'Guide',
        link: '/guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      }
    ]

    const subpages = extractSubpages(sidebarItems, '/guide')

    // Should not include /guide itself
    expect(subpages.every(s => s.link !== '/guide')).toBe(true)
  })

  it('should handle items without links', () => {
    const sidebarItems: SidebarItem[] = [
      {
        text: 'Section',
        // No link
        items: [
          { text: 'Child', link: '/guide/child' }
        ]
      }
    ]

    const subpages = extractSubpages(sidebarItems, '/guide')

    // Should still find children even if parent has no link
    expect(subpages.length).toBe(1)
    expect(subpages[0].link).toBe('/guide/child')
  })

  it('should handle multiple levels of nesting', () => {
    const sidebarItems: SidebarItem[] = [
      {
        text: 'Docs',
        link: '/docs',
        items: [
          {
            text: 'Guide',
            link: '/docs/guide',
            items: [
              { text: 'Intro', link: '/docs/guide/intro' }
            ]
          }
        ]
      }
    ]

    // Get subpages of /docs
    const docsSubpages = extractSubpages(sidebarItems, '/docs')
    expect(docsSubpages.length).toBe(1)
    expect(docsSubpages[0].link).toBe('/docs/guide')

    // Get subpages of /docs/guide
    const guideSubpages = extractSubpages(sidebarItems, '/docs/guide')
    expect(guideSubpages.length).toBe(1)
    expect(guideSubpages[0].link).toBe('/docs/guide/intro')
  })

  it('should handle paths with similar prefixes', () => {
    const sidebarItems: SidebarItem[] = [
      { text: 'Guide', link: '/guide' },
      { text: 'Guide Advanced', link: '/guide-advanced' },
      { text: 'Getting Started', link: '/guide/getting-started' }
    ]

    const subpages = extractSubpages(sidebarItems, '/guide')

    // Should only include /guide/getting-started, not /guide-advanced
    expect(subpages.length).toBe(1)
    expect(subpages[0].link).toBe('/guide/getting-started')
  })

  it('should handle empty path segments', () => {
    const sidebarItems: SidebarItem[] = [
      { text: 'Child', link: '/guide/child' }
    ]

    const subpages = extractSubpages(sidebarItems, '/guide')

    // Should normalize and find child
    expect(subpages.length).toBe(1)
  })

  it('should handle case sensitivity', () => {
    const sidebarItems: SidebarItem[] = [
      { text: 'Child', link: '/Guide/child' }
    ]

    const subpages = extractSubpages(sidebarItems, '/guide')

    // Paths are case-sensitive, should not match
    expect(subpages.length).toBe(0)
  })

  it('should handle special characters in paths', () => {
    const sidebarItems: SidebarItem[] = [
      { text: 'API Reference', link: '/api-reference/user-management' }
    ]

    const subpages = extractSubpages(sidebarItems, '/api-reference')

    expect(subpages.length).toBe(1)
    expect(subpages[0].text).toBe('API Reference')
  })

  it('should handle deeply nested paths', () => {
    const parentPath = '/docs/guide/advanced'
    const childPath = '/docs/guide/advanced/optimization'

    const sidebarItems: SidebarItem[] = [
      {
        text: 'Advanced',
        link: parentPath,
        items: [
          { text: 'Optimization', link: childPath }
        ]
      }
    ]

    const subpages = extractSubpages(sidebarItems, parentPath)

    expect(subpages.length).toBe(1)
    expect(subpages[0].link).toBe(childPath)
  })
})

// ============== Path Normalization Tests ==============

describe('Path Normalization', () => {
  it('should normalize paths correctly', () => {
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('/guide')).toBe('/guide')
    expect(normalizePath('/guide/')).toBe('/guide')
    expect(normalizePath('guide')).toBe('/guide')
    expect(normalizePath('guide/')).toBe('/guide')
    expect(normalizePath('')).toBe('/')
  })

  it('should detect direct subpaths correctly', () => {
    expect(isSubpath('/guide', '/guide/intro')).toBe(true)
    expect(isSubpath('/guide', '/guide/intro/advanced')).toBe(false)
    expect(isSubpath('/guide', '/guide')).toBe(false)
    expect(isSubpath('/guide', '/guide-advanced')).toBe(false)
    expect(isSubpath('/', '/guide')).toBe(true)
    expect(isSubpath('/', '/guide/intro')).toBe(false)
  })
})
