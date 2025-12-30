/**
 * Property-based tests for tag indexing
 * Feature: doc-system-enhancement, Property 31: Tag indexing
 * Validates: Requirements 8.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractTags,
  buildTagIndex,
  getTagList,
  getTagByName,
  getRelatedPagesByTags,
  generateTagPageData,
  type TagIndex,
  type TaggedPage
} from './tags'
import type { PageData, SiteConfig } from '../shared/types'

// Arbitraries for generating test data
const tagArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)

const tagsArrayArb = fc.array(tagArb, { minLength: 0, maxLength: 10 })

const pageDataArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 200 }),
  relativePath: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.md`),
  filePath: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/test/${s}.md`),
  headers: fc.constant([]),
  frontmatter: fc.record({
    tags: fc.oneof(
      fc.constant(undefined),
      tagArb,
      tagsArrayArb
    )
  }),
  lastUpdated: fc.option(fc.integer({ min: 1000000000000, max: 2000000000000 }), { nil: undefined })
}) as fc.Arbitrary<PageData>

const siteConfigArb = fc.record({
  base: fc.constantFrom('/', '/docs/', '/app/'),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  lang: fc.constantFrom('en', 'zh', 'es')
}) as fc.Arbitrary<SiteConfig>

describe('Tag Indexing - Property Tests', () => {
  /**
   * Property 31: Tag indexing
   * For any page with frontmatter tags, the tags SHALL be indexed and the page SHALL
   * appear in tag-based navigation.
   */
  it('should index all tags from pages with frontmatter tags', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each page with tags
          for (const page of pages) {
            const tags = extractTags(page)

            if (tags.length > 0) {
              // Page should appear in taggedPages
              const taggedPage = tagIndex.pages.find(
                p => p.relativePath === page.relativePath
              )
              expect(taggedPage).toBeDefined()

              // Each tag should be in the index
              for (const tag of tags) {
                const tagInfo = tagIndex.tags.get(tag)
                expect(tagInfo).toBeDefined()
                expect(tagInfo!.name).toBe(tag)

                // Page should appear in the tag's page list
                const pageInTag = tagInfo!.pages.find(
                  p => p.relativePath === page.relativePath
                )
                expect(pageInTag).toBeDefined()
              }
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly count pages per tag', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each tag in the index
          for (const [tagName, tagInfo] of tagIndex.tags) {
            // Count should match the number of pages in the tag
            expect(tagInfo.count).toBe(tagInfo.pages.length)

            // Verify each page actually has this tag
            for (const page of tagInfo.pages) {
              expect(page.tags).toContain(tagName)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not index pages without tags', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each page without tags
          for (const page of pages) {
            const tags = extractTags(page)

            if (tags.length === 0) {
              // Page should NOT appear in taggedPages
              const taggedPage = tagIndex.pages.find(
                p => p.relativePath === page.relativePath
              )
              expect(taggedPage).toBeUndefined()
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract tags correctly from string format', () => {
    fc.assert(
      fc.property(
        tagArb,
        (tag) => {
          const pageData = {
            title: 'Test',
            description: '',
            relativePath: 'test.md',
            filePath: '/test/test.md',
            headers: [],
            frontmatter: { tags: tag }
          } as PageData

          const extracted = extractTags(pageData)

          expect(extracted).toHaveLength(1)
          expect(extracted[0]).toBe(tag.trim())

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should extract tags correctly from array format', () => {
    fc.assert(
      fc.property(
        tagsArrayArb,
        (tags) => {
          const pageData = {
            title: 'Test',
            description: '',
            relativePath: 'test.md',
            filePath: '/test/test.md',
            headers: [],
            frontmatter: { tags }
          } as PageData

          const extracted = extractTags(pageData)

          // Should extract all valid tags
          const validTags = tags.filter(t => t.trim().length > 0)
          expect(extracted).toHaveLength(validTags.length)

          for (const tag of validTags) {
            expect(extracted).toContain(tag.trim())
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array for pages without tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (title) => {
          const pageData = {
            title,
            description: '',
            relativePath: 'test.md',
            filePath: '/test/test.md',
            headers: [],
            frontmatter: {}
          } as PageData

          const extracted = extractTags(pageData)

          expect(extracted).toHaveLength(0)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should sort tag list by count in descending order', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 2, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)
          const tagList = getTagList(tagIndex)

          // Should be sorted by count (descending)
          for (let i = 1; i < tagList.length; i++) {
            expect(tagList[i - 1].count).toBeGreaterThanOrEqual(tagList[i].count)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should retrieve tag by name correctly', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each tag in the index
          for (const [tagName, expectedTagInfo] of tagIndex.tags) {
            const retrievedTagInfo = getTagByName(tagIndex, tagName)

            expect(retrievedTagInfo).toBeDefined()
            expect(retrievedTagInfo).toBe(expectedTagInfo)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return undefined for non-existent tags', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (pages, config, nonExistentTag) => {
          const tagIndex = buildTagIndex(pages, config)

          // Make sure the tag doesn't exist
          if (!tagIndex.tags.has(nonExistentTag)) {
            const result = getTagByName(tagIndex, nonExistentTag)
            expect(result).toBeUndefined()
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should find related pages based on shared tags', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 3, maxLength: 30 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each tagged page
          for (const currentPage of tagIndex.pages) {
            const relatedPages = getRelatedPagesByTags(currentPage, tagIndex, 5)

            // Related pages should not include the current page
            for (const relatedPage of relatedPages) {
              expect(relatedPage.relativePath).not.toBe(currentPage.relativePath)
            }

            // Related pages should share at least one tag with current page
            for (const relatedPage of relatedPages) {
              const sharedTags = currentPage.tags.filter(tag =>
                relatedPage.tags.includes(tag)
              )
              expect(sharedTags.length).toBeGreaterThan(0)
            }

            // Should not exceed the limit
            expect(relatedPages.length).toBeLessThanOrEqual(5)

            return true
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate tag page data correctly', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // For each tag in the index
          for (const [tagName, tagInfo] of tagIndex.tags) {
            const pageData = generateTagPageData(tagName, tagIndex)

            expect(pageData).toBeDefined()
            expect(pageData!.title).toContain(tagName)
            expect(pageData!.description).toContain(tagName)
            expect(pageData!.description).toContain(String(tagInfo.count))

            // Should include all pages with this tag
            expect(pageData!.pages.length).toBe(tagInfo.count)

            // All pages should have the tag
            for (const page of pageData!.pages) {
              expect(page.tags).toContain(tagName)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return null for non-existent tag in generateTagPageData', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (pages, config, nonExistentTag) => {
          const tagIndex = buildTagIndex(pages, config)

          // Make sure the tag doesn't exist
          if (!tagIndex.tags.has(nonExistentTag)) {
            const result = generateTagPageData(nonExistentTag, tagIndex)
            expect(result).toBeNull()
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve tag information across index operations', () => {
    fc.assert(
      fc.property(
        fc.array(pageDataArb, { minLength: 1, maxLength: 50 }),
        siteConfigArb,
        (pages, config) => {
          const tagIndex = buildTagIndex(pages, config)

          // Total pages in index should match pages with tags
          const pagesWithTags = pages.filter(p => extractTags(p).length > 0)
          expect(tagIndex.pages.length).toBe(pagesWithTags.length)

          // Total tag occurrences should match sum of all tag counts
          let totalOccurrences = 0
          for (const page of pagesWithTags) {
            totalOccurrences += extractTags(page).length
          }

          let sumOfCounts = 0
          for (const tagInfo of tagIndex.tags.values()) {
            sumOfCounts += tagInfo.count
          }

          expect(sumOfCounts).toBe(totalOccurrences)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle duplicate tags in a single page correctly', () => {
    fc.assert(
      fc.property(
        tagArb,
        fc.integer({ min: 2, max: 5 }),
        siteConfigArb,
        (tag, duplicateCount, config) => {
          // Create a page with duplicate tags
          const duplicateTags = Array(duplicateCount).fill(tag)
          const pageData = {
            title: 'Test',
            description: '',
            relativePath: 'test.md',
            filePath: '/test/test.md',
            headers: [],
            frontmatter: { tags: duplicateTags }
          } as PageData

          const tagIndex = buildTagIndex([pageData], config)

          // The tag should be trimmed in the index
          const trimmedTag = tag.trim()

          // Should only count the tag once per page
          const tagInfo = tagIndex.tags.get(trimmedTag)
          expect(tagInfo).toBeDefined()
          expect(tagInfo!.count).toBe(1)
          expect(tagInfo!.pages).toHaveLength(1)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty and whitespace-only tags correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t'),
            fc.constant('\n'),
            tagArb
          ),
          { minLength: 1, maxLength: 10 }
        ),
        siteConfigArb,
        (tags, config) => {
          const pageData = {
            title: 'Test',
            description: '',
            relativePath: 'test.md',
            filePath: '/test/test.md',
            headers: [],
            frontmatter: { tags }
          } as PageData

          const extracted = extractTags(pageData)

          // Should only extract non-empty, non-whitespace tags
          for (const tag of extracted) {
            expect(tag.trim().length).toBeGreaterThan(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
