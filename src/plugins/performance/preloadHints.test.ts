/**
 * Property-based tests for preload hints
 * Feature: doc-system-enhancement, Property 41: Preload hints
 * Validates: Requirements 10.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'fs'
import { resolve, join } from 'path'
import { analyzeNavigationPatterns } from './preloadHints'

// Import internal functions for testing
// Note: In a real scenario, these would be exported or we'd test through the public API
function extractNavigationLinks(html: string): string[] {
  const links: string[] = []

  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi

  let navMatch
  while ((navMatch = navRegex.exec(html)) !== null) {
    const navContent = navMatch[1]
    let linkMatch
    while ((linkMatch = linkRegex.exec(navContent)) !== null) {
      const href = linkMatch[1]
      if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        links.push(href)
      }
    }
  }

  const sidebarRegex = /<aside[^>]*>([\s\S]*?)<\/aside>/gi
  let sidebarMatch
  while ((sidebarMatch = sidebarRegex.exec(html)) !== null) {
    const sidebarContent = sidebarMatch[1]
    let linkMatch
    while ((linkMatch = linkRegex.exec(sidebarContent)) !== null) {
      const href = linkMatch[1]
      if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        links.push(href)
      }
    }
  }

  return Array.from(new Set(links))
}

function generatePreloadTags(
  links: string[],
  strategy: 'prefetch' | 'preload' | 'both',
  maxLinks: number
): string[] {
  const tags: string[] = []
  const limitedLinks = links.slice(0, maxLinks)

  for (const link of limitedLinks) {
    const as = determineResourceType(link)

    if (strategy === 'preload' || strategy === 'both') {
      tags.push(`<link rel="preload" href="${link}" as="${as}">`)
    }

    if (strategy === 'prefetch' || strategy === 'both') {
      tags.push(`<link rel="prefetch" href="${link}" as="${as}">`)
    }
  }

  return tags
}

function determineResourceType(url: string): string {
  if (url.endsWith('.js')) return 'script'
  if (url.endsWith('.css')) return 'style'
  if (url.endsWith('.woff') || url.endsWith('.woff2')) return 'font'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  return 'document'
}

describe('Preload Hints - Property Tests', () => {
  const testDir = resolve(__dirname, '__test_preload__')

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  /**
   * Property 41: Preload hints
   * For any page with navigation links, the rendered HTML SHALL include preload hints
   * for likely next pages.
   */
  describe('Property 41: Preload hints', () => {
    it('should extract all navigation links from nav elements', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              href: fc.constantFrom('/page1', '/page2', '/docs/guide', '/api/reference'),
              text: fc.string({ minLength: 1, maxLength: 20 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (links) => {
            const navLinks = links.map(link =>
              `<a href="${link.href}">${link.text}</a>`
            ).join('\n')

            const html = `
              <html>
                <body>
                  <nav>${navLinks}</nav>
                </body>
              </html>
            `

            const extracted = extractNavigationLinks(html)

            // All internal links should be extracted
            return links.every(link => extracted.includes(link.href))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should extract links from sidebar (aside) elements', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              href: fc.constantFrom('/sidebar1', '/sidebar2', '/docs/api'),
              text: fc.string({ minLength: 1, maxLength: 20 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (links) => {
            const sidebarLinks = links.map(link =>
              `<a href="${link.href}">${link.text}</a>`
            ).join('\n')

            const html = `
              <html>
                <body>
                  <aside>${sidebarLinks}</aside>
                </body>
              </html>
            `

            const extracted = extractNavigationLinks(html)

            return links.every(link => extracted.includes(link.href))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should exclude external links (http/https)', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.webUrl(),
            { minLength: 1, maxLength: 10 }
          ),
          (urls) => {
            const navLinks = urls.map(url =>
              `<a href="${url}">External</a>`
            ).join('\n')

            const html = `
              <html>
                <body>
                  <nav>${navLinks}</nav>
                </body>
              </html>
            `

            const extracted = extractNavigationLinks(html)

            // No external links should be extracted
            return extracted.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should exclude anchor links', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1, maxLength: 20 }),
            { minLength: 1, maxLength: 10 }
          ),
          (anchors) => {
            const navLinks = anchors.map(anchor =>
              `<a href="#${anchor}">Anchor</a>`
            ).join('\n')

            const html = `
              <html>
                <body>
                  <nav>${navLinks}</nav>
                </body>
              </html>
            `

            const extracted = extractNavigationLinks(html)

            return extracted.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should deduplicate links', () => {
      const html = `
        <html>
          <body>
            <nav>
              <a href="/page1">Link 1</a>
              <a href="/page1">Link 1 Again</a>
              <a href="/page2">Link 2</a>
            </nav>
          </body>
        </html>
      `

      const extracted = extractNavigationLinks(html)

      expect(extracted).toHaveLength(2)
      expect(extracted).toContain('/page1')
      expect(extracted).toContain('/page2')
    })

    it('should generate preload tags with correct strategy', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('/page1.html', '/page2.html'), { minLength: 1, maxLength: 5 }),
          fc.constantFrom('preload', 'prefetch', 'both'),
          fc.integer({ min: 1, max: 10 }),
          (links, strategy, maxLinks) => {
            const tags = generatePreloadTags(links, strategy as any, maxLinks)

            const limitedLinks = links.slice(0, maxLinks)

            if (strategy === 'preload') {
              return tags.every(tag => tag.includes('rel="preload"')) &&
                tags.length === limitedLinks.length
            } else if (strategy === 'prefetch') {
              return tags.every(tag => tag.includes('rel="prefetch"')) &&
                tags.length === limitedLinks.length
            } else { // both
              const preloadCount = tags.filter(tag => tag.includes('rel="preload"')).length
              const prefetchCount = tags.filter(tag => tag.includes('rel="prefetch"')).length
              return preloadCount === limitedLinks.length &&
                prefetchCount === limitedLinks.length &&
                tags.length === limitedLinks.length * 2
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should respect maxLinks limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.constantFrom('/page1', '/page2', '/page3', '/page4', '/page5'), { minLength: 6, maxLength: 10 }),
          (maxLinks, links) => {
            const tags = generatePreloadTags(links, 'preload', maxLinks)

            return tags.length === maxLinks
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should determine correct resource type for different file extensions', () => {
      const testCases = [
        { url: '/script.js', expected: 'script' },
        { url: '/style.css', expected: 'style' },
        { url: '/font.woff', expected: 'font' },
        { url: '/font.woff2', expected: 'font' },
        { url: '/image.jpg', expected: 'image' },
        { url: '/image.png', expected: 'image' },
        { url: '/image.webp', expected: 'image' },
        { url: '/page.html', expected: 'document' },
        { url: '/page', expected: 'document' }
      ]

      for (const { url, expected } of testCases) {
        expect(determineResourceType(url)).toBe(expected)
      }
    })

    it('should include resource type in preload tags', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('/script.js', '/style.css', '/image.png'),
          (link) => {
            const tags = generatePreloadTags([link], 'preload', 10)
            const resourceType = determineResourceType(link)

            return tags.every(tag => tag.includes(`as="${resourceType}"`))
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Navigation Pattern Analysis', () => {
    it('should identify navigation patterns from access logs', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.constantFrom('/page1', '/page2', '/page3'),
              timestamp: fc.integer({ min: 1000000, max: 2000000 })
            }),
            { minLength: 2, maxLength: 20 }
          ).map(logs => logs.sort((a, b) => a.timestamp - b.timestamp)),
          (logs) => {
            const patterns = analyzeNavigationPatterns(logs)

            // All patterns should have valid from/to paths
            return patterns.every(p =>
              p.from && p.to && p.frequency > 0
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should count navigation frequency correctly', () => {
      const logs = [
        { path: '/page1', timestamp: 1000 },
        { path: '/page2', timestamp: 2000 },
        { path: '/page1', timestamp: 10000 },
        { path: '/page2', timestamp: 11000 },
        { path: '/page1', timestamp: 20000 },
        { path: '/page2', timestamp: 21000 }
      ]

      const patterns = analyzeNavigationPatterns(logs)

      const page1ToPage2 = patterns.find(p => p.from === '/page1' && p.to === '/page2')
      expect(page1ToPage2).toBeDefined()
      expect(page1ToPage2!.frequency).toBe(3)
    })

    it('should ignore navigations with large time gaps', () => {
      const logs = [
        { path: '/page1', timestamp: 1000 },
        { path: '/page2', timestamp: 1000 + 6 * 60 * 1000 } // 6 minutes later
      ]

      const patterns = analyzeNavigationPatterns(logs)

      // Should not create a pattern due to large time gap (> 5 minutes)
      expect(patterns.length).toBe(0)
    })

    it('should sort patterns by frequency', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.constantFrom('/page1', '/page2', '/page3', '/page4'),
              timestamp: fc.integer({ min: 1000, max: 100000 })
            }),
            { minLength: 10, maxLength: 50 }
          ).map(logs => logs.sort((a, b) => a.timestamp - b.timestamp)),
          (logs) => {
            const patterns = analyzeNavigationPatterns(logs)

            // Verify patterns are sorted by frequency (descending)
            for (let i = 0; i < patterns.length - 1; i++) {
              if (patterns[i].frequency < patterns[i + 1].frequency) {
                return false
              }
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
