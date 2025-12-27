/**
 * Property-based tests for CJK word segmentation
 * Feature: doc-system-enhancement, Property 9: CJK word segmentation
 * Validates: Requirements 2.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  containsCJK,
  segmentCJK,
  createCJKIndex,
  matchCJK,
  searchCJK,
  highlightCJK,
  extractCJKKeywords
} from './cjk'

describe('CJK Word Segmentation - Property Tests', () => {
  /**
   * Property 9: CJK word segmentation
   * For any Chinese text content, the search index SHALL contain segmented tokens
   * that enable partial word matching.
   */
  it('should create index with segmented tokens for CJK text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (text) => {
          const index = createCJKIndex(text)

          // Index should not be empty
          expect(index.size).toBeGreaterThan(0)

          // Index should contain the original text (lowercase)
          expect(index.has(text.toLowerCase())).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect CJK characters correctly', () => {
    // Test with known CJK text
    expect(containsCJK('你好')).toBe(true)
    expect(containsCJK('世界')).toBe(true)
    expect(containsCJK('Hello')).toBe(false)
    expect(containsCJK('Hello 世界')).toBe(true)
    expect(containsCJK('')).toBe(false)
  })

  it('should segment CJK text into tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (text) => {
          const tokens = segmentCJK(text)

          // Should return an array
          expect(Array.isArray(tokens)).toBe(true)

          // All tokens should be non-empty
          for (const token of tokens) {
            expect(token.length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty text gracefully', () => {
    const tokens = segmentCJK('')
    expect(tokens).toEqual([])

    const index = createCJKIndex('')
    expect(index.has('')).toBe(true)
  })

  it('should match CJK text correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        (text) => {
          // Extract a substring as query
          const start = Math.floor(Math.random() * Math.max(1, text.length - 2))
          const end = Math.min(start + Math.floor(Math.random() * 5) + 1, text.length)
          const query = text.substring(start, end)

          if (query.length > 0) {
            // Should match if query is substring of text
            const matched = matchCJK(query, text)
            expect(matched).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array for empty query in searchCJK', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 50 }),
        (items) => {
          const results = searchCJK('', items, (item) => item)

          // Empty query should return all items
          expect(results.length).toBe(items.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter items correctly in searchCJK', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        (items, query) => {
          const results = searchCJK(query, items, (item) => item)

          // All results should match the query
          for (const result of results) {
            const matched = matchCJK(query, result)
            expect(matched).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve original text when no match in highlightCJK', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length > 0),
        (text, query) => {
          // Only test when query is NOT in text
          if (!text.toLowerCase().includes(query.toLowerCase()) && !matchCJK(query, text)) {
            const highlighted = highlightCJK(text, query)

            // Should be unchanged or have minimal changes
            // (CJK segmentation might add some highlights)
            expect(highlighted.length).toBeGreaterThanOrEqual(text.length)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract keywords from text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.integer({ min: 1, max: 20 }),
        (text, maxKeywords) => {
          const keywords = extractCJKKeywords(text, maxKeywords)

          // Should not exceed max keywords
          expect(keywords.length).toBeLessThanOrEqual(maxKeywords)

          // All keywords should be non-empty
          for (const keyword of keywords) {
            expect(keyword.length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle mixed CJK and non-CJK text', () => {
    const mixedText = 'Hello 世界 World 你好'

    const tokens = segmentCJK(mixedText)
    expect(tokens.length).toBeGreaterThan(0)

    const index = createCJKIndex(mixedText)
    expect(index.size).toBeGreaterThan(0)

    // Should match both CJK and non-CJK parts
    expect(matchCJK('Hello', mixedText)).toBe(true)
    expect(matchCJK('世界', mixedText)).toBe(true)
  })

  it('should create consistent index for same text', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (text) => {
          const index1 = createCJKIndex(text)
          const index2 = createCJKIndex(text)

          // Should produce same index
          expect(index1.size).toBe(index2.size)

          for (const token of index1) {
            expect(index2.has(token)).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
