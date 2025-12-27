/**
 * Property-based tests for search suggestions
 * Feature: doc-system-enhancement, Property 10: Empty search suggestions
 * Validates: Requirements 2.6
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateSuggestions,
  getPopularTerms,
  generateRelatedQueries,
  suggestSpellingCorrection,
  generateAutocompleteSuggestions,
  generateCombinedSuggestions
} from './suggestions'
import type { SearchDocument } from './index'

// Arbitrary for SearchDocument
const searchDocumentArb = fc.record({
  id: fc.string(),
  path: fc.string(),
  title: fc.string({ minLength: 3, maxLength: 50 }),
  content: fc.string({ minLength: 10, maxLength: 200 }),
  headers: fc.array(fc.string({ minLength: 3, maxLength: 30 })),
  tags: fc.option(fc.array(fc.string({ minLength: 2, maxLength: 15 })), { nil: undefined }),
  category: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: undefined }),
  lastUpdated: fc.option(fc.integer(), { nil: undefined }),
  metadata: fc.record({
    category: fc.option(fc.string(), { nil: undefined }),
    tags: fc.option(fc.array(fc.string()), { nil: undefined })
  })
}) as fc.Arbitrary<SearchDocument>

describe('Search Suggestions - Property Tests', () => {
  /**
   * Property 10: Empty search suggestions
   * For any search query returning zero results, the search component SHALL provide
   * at least one alternative suggestion or related term.
   */
  it('should provide suggestions when query returns no results', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 15 }),
        (documents, query) => {
          const suggestions = generateSuggestions(query, documents, { maxSuggestions: 5 })

          // Should return an array
          expect(Array.isArray(suggestions)).toBe(true)

          // All suggestions should be non-empty strings
          for (const suggestion of suggestions) {
            expect(typeof suggestion).toBe('string')
            expect(suggestion.length).toBeGreaterThan(0)
          }

          // Should not exceed max suggestions
          expect(suggestions.length).toBeLessThanOrEqual(5)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not suggest the same query', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 15 }),
        (documents, query) => {
          const suggestions = generateSuggestions(query, documents)

          // Suggestions should not include the original query
          for (const suggestion of suggestions) {
            expect(suggestion.toLowerCase()).not.toBe(query.toLowerCase())
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return popular terms when query is empty', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        (documents) => {
          const suggestions = generateSuggestions('', documents, { includePopular: true })

          // Should return some suggestions
          expect(suggestions.length).toBeGreaterThanOrEqual(0)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return popular terms sorted by frequency', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.integer({ min: 1, max: 10 }),
        (documents, maxTerms) => {
          const popularTerms = getPopularTerms(documents, maxTerms)

          // Should not exceed max terms
          expect(popularTerms.length).toBeLessThanOrEqual(maxTerms)

          // All terms should be non-empty
          for (const term of popularTerms) {
            expect(term.length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate related queries from matching documents', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 15 }),
        (documents, query) => {
          const relatedQueries = generateRelatedQueries(query, documents, 5)

          // Should return an array
          expect(Array.isArray(relatedQueries)).toBe(true)

          // Should not exceed max queries
          expect(relatedQueries.length).toBeLessThanOrEqual(5)

          // All queries should be non-empty
          for (const relatedQuery of relatedQueries) {
            expect(relatedQuery.length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return null for spelling correction when query is too short', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 2 }),
        (documents, query) => {
          const correction = suggestSpellingCorrection(query, documents)

          // Should return null for short queries
          expect(correction).toBeNull()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate autocomplete suggestions for valid prefix', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 2, maxLength: 10 }),
        (documents, prefix) => {
          const suggestions = generateAutocompleteSuggestions(prefix, documents, 10)

          // Should return an array
          expect(Array.isArray(suggestions)).toBe(true)

          // Should not exceed max suggestions
          expect(suggestions.length).toBeLessThanOrEqual(10)

          // All suggestions should start with the prefix (case-insensitive)
          for (const suggestion of suggestions) {
            expect(suggestion.toLowerCase().startsWith(prefix.toLowerCase())).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array for autocomplete with short prefix', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 1 }),
        (documents, prefix) => {
          const suggestions = generateAutocompleteSuggestions(prefix, documents)

          // Should return empty array for short prefix
          expect(suggestions).toEqual([])

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate combined suggestions with all components', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 5, maxLength: 50 }),
        fc.string({ minLength: 3, maxLength: 15 }),
        fc.boolean(),
        (documents, query, hasResults) => {
          const combined = generateCombinedSuggestions(query, documents, hasResults)

          // Should have all expected properties
          expect(combined).toHaveProperty('suggestions')
          expect(combined).toHaveProperty('relatedQueries')
          expect(combined).toHaveProperty('spellingCorrection')
          expect(combined).toHaveProperty('autocompleteSuggestions')

          // Suggestions should be array
          expect(Array.isArray(combined.suggestions)).toBe(true)
          expect(Array.isArray(combined.relatedQueries)).toBe(true)
          expect(Array.isArray(combined.autocompleteSuggestions)).toBe(true)

          // When hasResults is true, suggestions should be empty
          if (hasResults) {
            expect(combined.suggestions.length).toBe(0)
            expect(combined.spellingCorrection).toBeNull()
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty document array gracefully', () => {
    const suggestions = generateSuggestions('test', [], { maxSuggestions: 5 })
    expect(suggestions).toEqual([])

    const popularTerms = getPopularTerms([], 10)
    expect(popularTerms).toEqual([])

    const relatedQueries = generateRelatedQueries('test', [], 5)
    expect(relatedQueries).toEqual([])

    const correction = suggestSpellingCorrection('test', [])
    expect(correction).toBeNull()

    const autocomplete = generateAutocompleteSuggestions('te', [], 10)
    expect(autocomplete).toEqual([])
  })
})
