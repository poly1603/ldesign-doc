/**
 * Property-based tests for search result highlighting
 * Feature: doc-system-enhancement, Property 7: Search result highlighting
 * Validates: Requirements 2.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  highlightMatches,
  generateSnippet,
  generateHighlightedSnippet,
  findAllMatches,
  generateMultipleSnippets,
  highlightMultipleQueries
} from './highlight'

describe('Search Result Highlighting - Property Tests', () => {
  /**
   * Property 7: Search result highlighting
   * For any search result, the content preview SHALL contain HTML markup highlighting the matched terms.
   */
  it('should contain HTML markup for matched terms', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        (text, query) => {
          // Only test if query exists in text
          if (text.toLowerCase().includes(query.toLowerCase())) {
            const highlighted = highlightMatches(text, query)

            // Should contain mark tags
            expect(highlighted).toContain('<mark')
            expect(highlighted).toContain('</mark>')

            // Should contain the query text (case-insensitive)
            const lowerHighlighted = highlighted.toLowerCase()
            expect(lowerHighlighted).toContain(query.toLowerCase())
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve original text when no match found', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        (text, query) => {
          // Only test when query is NOT in text
          if (!text.toLowerCase().includes(query.toLowerCase())) {
            const highlighted = highlightMatches(text, query)

            // Should be unchanged
            expect(highlighted).toBe(text)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate snippets with ellipsis when text is long', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 200, maxLength: 500 }),
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        (text, query) => {
          const snippet = generateSnippet(text, query, { snippetLength: 100 })

          // Snippet should be shorter than original text
          expect(snippet.length).toBeLessThanOrEqual(text.length)

          // Should contain ellipsis if text was truncated
          if (snippet.length < text.length) {
            expect(snippet.includes('...')).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include query in generated snippet when match exists', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.integer({ min: 10, max: 40 }),
        (text, queryStart) => {
          // Extract a substring as query
          const queryEnd = Math.min(queryStart + 5, text.length)
          const query = text.substring(queryStart, queryEnd)

          if (query.length > 0) {
            const snippet = generateSnippet(text, query)

            // Snippet should contain the query
            expect(snippet.toLowerCase()).toContain(query.toLowerCase())
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should find all match positions correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 1, max: 5 }),
        (query, repeatCount) => {
          // Create text with known number of matches
          const text = Array(repeatCount).fill(query).join(' ')

          const matches = findAllMatches(text, query)

          // Should find at least repeatCount matches
          expect(matches.length).toBeGreaterThanOrEqual(repeatCount)

          // All positions should be valid
          for (const pos of matches) {
            expect(pos).toBeGreaterThanOrEqual(0)
            expect(pos).toBeLessThan(text.length)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array when no matches found', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        (text, query) => {
          // Only test when query is NOT in text
          if (!text.toLowerCase().includes(query.toLowerCase())) {
            const matches = findAllMatches(text, query)
            expect(matches).toEqual([])
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate highlighted snippet with both snippet and highlight', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.integer({ min: 10, max: 40 }),
        (text, queryStart) => {
          const queryEnd = Math.min(queryStart + 5, text.length)
          const query = text.substring(queryStart, queryEnd)

          if (query.length > 0) {
            const snippet = generateHighlightedSnippet(text, query)

            // Should contain the query
            expect(snippet.toLowerCase()).toContain(query.toLowerCase())

            // Should contain highlight markup
            if (text.toLowerCase().includes(query.toLowerCase())) {
              expect(snippet).toContain('<mark')
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate multiple snippets for multiple matches', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 2, max: 5 }),
        (query, repeatCount) => {
          // Create text with multiple matches
          const text = Array(repeatCount).fill(query).join(' some text ')

          const snippets = generateMultipleSnippets(text, query)

          // Should generate at least one snippet
          expect(snippets.length).toBeGreaterThan(0)

          // Each snippet should contain the query or highlight markup
          for (const snippet of snippets) {
            const hasQuery = snippet.toLowerCase().includes(query.toLowerCase())
            const hasMarkup = snippet.includes('<mark')
            expect(hasQuery || hasMarkup).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should highlight multiple queries', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 100 }),
        fc.array(fc.string({ minLength: 2, maxLength: 5 }), { minLength: 1, maxLength: 3 }),
        (text, queries) => {
          const highlighted = highlightMultipleQueries(text, queries)

          // Count how many queries are in the text
          let matchCount = 0
          for (const query of queries) {
            if (query && text.toLowerCase().includes(query.toLowerCase())) {
              matchCount++
            }
          }

          // If any query matched, should have highlight markup
          if (matchCount > 0) {
            expect(highlighted).toContain('<mark')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty query gracefully', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (text) => {
          const highlighted = highlightMatches(text, '')

          // Should return original text unchanged
          expect(highlighted).toBe(text)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
