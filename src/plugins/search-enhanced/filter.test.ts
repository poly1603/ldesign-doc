/**
 * Property-based tests for search filters
 * Feature: doc-system-enhancement, Property 8: Search filter application
 * Validates: Requirements 2.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  applyFilters,
  getAvailableFilterOptions,
  getFilterStats,
  combineFilters,
  FilterBuilder
} from './filter'
import type { SearchDocument } from './index'

// Arbitrary for SearchDocument
const searchDocumentArb = fc.record({
  id: fc.string(),
  path: fc.string(),
  title: fc.string(),
  content: fc.string(),
  headers: fc.array(fc.string()),
  tags: fc.option(fc.array(fc.string()), { nil: undefined }),
  category: fc.option(fc.string(), { nil: undefined }),
  lastUpdated: fc.option(fc.integer(), { nil: undefined }),
  metadata: fc.record({
    category: fc.option(fc.string(), { nil: undefined }),
    tags: fc.option(fc.array(fc.string()), { nil: undefined })
  })
}) as fc.Arbitrary<SearchDocument>

describe('Search Filters - Property Tests', () => {
  /**
   * Property 8: Search filter application
   * For any search with active filters, all returned results SHALL satisfy the filter criteria.
   */
  it('should return only results matching filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (documents, filterValue) => {
          // Apply a category filter
          const filters = { category: filterValue }
          const results = applyFilters(documents, filters)

          // All results should have the matching category
          for (const result of results) {
            const category = result.category || result.metadata?.category
            expect(category).toBe(filterValue)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return all documents when no filters applied', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        (documents) => {
          const results = applyFilters(documents, {})

          // Should return all documents
          expect(results.length).toBe(documents.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle array filter values correctly', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
        (documents, filterValues) => {
          // Apply filter with array of values
          const filters = { category: filterValues }
          const results = applyFilters(documents, filters)

          // All results should have category matching one of the filter values
          for (const result of results) {
            const category = result.category || result.metadata?.category
            if (category) {
              expect(filterValues).toContain(category)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle tags filter correctly', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (documents, tagValue) => {
          // Apply tags filter
          const filters = { tags: tagValue }
          const results = applyFilters(documents, filters)

          // All results should have the tag
          for (const result of results) {
            const tags = result.tags || result.metadata?.tags
            if (tags && Array.isArray(tags)) {
              expect(tags).toContain(tagValue)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract all available filter options', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        (documents) => {
          const options = getAvailableFilterOptions(documents, 'category')

          // All options should exist in at least one document
          for (const option of options) {
            const found = documents.some(doc => {
              const category = doc.category || doc.metadata?.category
              return String(category) === option
            })
            expect(found).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return sorted filter options', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        (documents) => {
          const options = getAvailableFilterOptions(documents, 'category')

          // Options should be sorted
          const sorted = [...options].sort()
          expect(options).toEqual(sorted)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should calculate filter stats correctly', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        (documents) => {
          const stats = getFilterStats(documents, 'category')

          // Sum of all counts should not exceed document count
          const totalCount = Object.values(stats).reduce((sum, count) => sum + count, 0)
          expect(totalCount).toBeLessThanOrEqual(documents.length)

          // All counts should be positive
          for (const count of Object.values(stats)) {
            expect(count).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should combine filters with AND logic correctly', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (documents, category, tag) => {
          const filters = [
            { category },
            { tags: tag }
          ]

          const results = combineFilters(documents, filters, 'AND')

          // All results should match both filters
          for (const result of results) {
            const docCategory = result.category || result.metadata?.category
            const docTags = result.tags || result.metadata?.tags

            expect(docCategory).toBe(category)
            if (docTags && Array.isArray(docTags)) {
              expect(docTags).toContain(tag)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should combine filters with OR logic correctly', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (documents, category1, category2) => {
          const filters = [
            { category: category1 },
            { category: category2 }
          ]

          const results = combineFilters(documents, filters, 'OR')

          // All results should match at least one filter
          for (const result of results) {
            const docCategory = result.category || result.metadata?.category
            const matchesAny = docCategory === category1 || docCategory === category2
            expect(matchesAny).toBe(true)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should support FilterBuilder chain API', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (documents, category) => {
          const builder = new FilterBuilder()
          const results = builder
            .add('category', category)
            .apply(documents)

          // All results should match the filter
          for (const result of results) {
            const docCategory = result.category || result.metadata?.category
            expect(docCategory).toBe(category)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle filter removal in FilterBuilder', () => {
    fc.assert(
      fc.property(
        fc.array(searchDocumentArb, { minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (documents, category) => {
          const builder = new FilterBuilder()
          builder.add('category', category)
          builder.remove('category')

          const results = builder.apply(documents)

          // Should return all documents (no filters)
          expect(results.length).toBe(documents.length)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
