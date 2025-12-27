/**
 * Property-based tests for fuzzy search
 * Feature: doc-system-enhancement, Property 6: Fuzzy search matching
 * Validates: Requirements 2.1
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  levenshteinDistance,
  similarityScore,
  fuzzyMatch,
  fuzzySearch,
  fuzzySearchWithScore
} from './fuzzy'

describe('Fuzzy Search - Property Tests', () => {
  /**
   * Property 6: Fuzzy search matching
   * For any search query with up to 2 character typos, the search results SHALL include
   * documents that would match the corrected query.
   */
  it('should match queries with up to 2 character typos', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length > 0),
        (originalQuery) => {
          // Create a typo version by changing up to 2 characters
          const queryChars = originalQuery.split('')
          const typoCount = Math.min(2, Math.floor(Math.random() * 2) + 1)

          for (let i = 0; i < typoCount && queryChars.length > 0; i++) {
            const pos = Math.floor(Math.random() * queryChars.length)
            // Replace with a different character
            queryChars[pos] = String.fromCharCode(97 + Math.floor(Math.random() * 26))
          }

          const typoQuery = queryChars.join('')

          // The fuzzy match should still find the original
          const matched = fuzzyMatch(typoQuery, originalQuery, { distance: 2, threshold: 0.5 })

          // Should match if the edit distance is <= 2
          const distance = levenshteinDistance(typoQuery.toLowerCase(), originalQuery.toLowerCase())
          if (distance <= 2) {
            expect(matched).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have symmetric similarity scores', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (a, b) => {
          const scoreAB = similarityScore(a, b)
          const scoreBA = similarityScore(b, a)

          // Similarity should be symmetric
          expect(scoreAB).toBeCloseTo(scoreBA, 5)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have similarity score of 1 for identical strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (str) => {
          const score = similarityScore(str, str)
          expect(score).toBe(1)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have similarity score between 0 and 1', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (a, b) => {
          const score = similarityScore(a, b)
          expect(score).toBeGreaterThanOrEqual(0)
          expect(score).toBeLessThanOrEqual(1)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have levenshtein distance of 0 for identical strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        (str) => {
          const distance = levenshteinDistance(str, str)
          expect(distance).toBe(0)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have symmetric levenshtein distance', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 50 }),
        (a, b) => {
          const distanceAB = levenshteinDistance(a, b)
          const distanceBA = levenshteinDistance(b, a)

          expect(distanceAB).toBe(distanceBA)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should always match exact substrings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        (text) => {
          // Extract a substring
          const start = Math.floor(Math.random() * (text.length - 2))
          const end = start + Math.floor(Math.random() * (text.length - start - 1)) + 1
          const query = text.substring(start, end)

          if (query.length > 0) {
            const matched = fuzzyMatch(query, text)
            expect(matched).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should filter items correctly in fuzzySearch', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        (items, query) => {
          const results = fuzzySearch(
            query,
            items,
            (item) => item,
            { threshold: 0.6, distance: 2 }
          )

          // All results should match the query
          for (const result of results) {
            const matched = fuzzyMatch(query, result, { threshold: 0.6, distance: 2 })
            expect(matched).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return results sorted by score in fuzzySearchWithScore', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 2, maxLength: 50 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        (items, query) => {
          const results = fuzzySearchWithScore(
            query,
            items,
            (item) => item,
            { threshold: 0.3, distance: 3 }
          )

          // Results should be sorted by score (descending)
          for (let i = 1; i < results.length; i++) {
            expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
          }

          // All scores should be >= threshold
          for (const result of results) {
            expect(result.score).toBeGreaterThanOrEqual(0.3)
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
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 50 }),
        (items) => {
          const results = fuzzySearch('', items, (item) => item)

          // Empty query should return all items
          expect(results.length).toBe(items.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
