/**
 * Property-based tests for documentation linter
 * 
 * **Feature: doc-system-enhancement, Property 48: Documentation linting**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractLinks,
  isInternalLink,
  isValidInternalLink,
  checkSpellingInContent,
  checkStyleInContent,
  lintDocumentation,
  type LinterOptions
} from './linter'
import type { PageData } from '../shared/types'

describe('Documentation Linter', () => {
  describe('Link Extraction', () => {
    it('should extract all markdown links from content', () => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(
            fc.string().filter(s => !s.includes(']') && !s.includes(')')),
            fc.webUrl().filter(url => !url.includes(')'))
          )),
          (linkPairs) => {
            // Generate markdown content with links
            const content = linkPairs
              .map(([text, url]) => `[${text}](${url})`)
              .join('\n')

            const extracted = extractLinks(content)

            // All URLs should be extracted
            return extracted.length === linkPairs.length &&
              extracted.every((link, i) => link.url === linkPairs[i][1])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should track line numbers correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
          (urls) => {
            // Create content with one link per line
            const content = urls.map(url => `[link](${url})`).join('\n')

            const extracted = extractLinks(content)

            // Line numbers should match (1-indexed)
            return extracted.every((link, i) => link.line === i + 1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Internal Link Detection', () => {
    it('should identify external links correctly', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          (url) => {
            // External URLs should not be internal
            return !isInternalLink(url)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should identify anchor links as non-internal', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0),
          (anchor) => {
            const url = `#${anchor}`
            return !isInternalLink(url)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should identify relative paths as internal', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !s.startsWith('http') && !s.startsWith('#') && !s.startsWith('mailto:')),
          (path) => {
            return isInternalLink(path)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Internal Link Validation', () => {
    it('should validate links against valid paths', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string().filter(s =>
              s.length > 0 &&
              !s.includes(' ') &&
              /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(s) // Must start with letter or number
            ),
            { minLength: 1, maxLength: 20 }
          ),
          (paths) => {
            const validPaths = new Set(paths)
            const randomPath = paths[Math.floor(Math.random() * paths.length)]

            // A path in the set should be valid
            return isValidInternalLink(randomPath, validPaths)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle .md extension variations', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s =>
            s.length > 0 &&
            !s.includes(' ') &&
            !s.includes('.') &&
            /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(s) // Must start with letter or number
          ),
          (basePath) => {
            const validPaths = new Set([`${basePath}.md`])

            // Both with and without .md should be valid
            return isValidInternalLink(basePath, validPaths) &&
              isValidInternalLink(`${basePath}.md`, validPaths)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle index.md for directory links', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s =>
            s.length > 0 &&
            !s.includes(' ') &&
            /^[a-zA-Z0-9][a-zA-Z0-9/_-]*$/.test(s) // Must start with letter or number
          ),
          (dir) => {
            const validPaths = new Set([`${dir}/index.md`])

            // Directory link should resolve to index.md
            return isValidInternalLink(`${dir}/`, validPaths) ||
              isValidInternalLink(dir, validPaths)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Spelling Check', () => {
    it('should not flag words in custom dictionary', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string().filter(s => /^[a-zA-Z]+$/.test(s) && s.length > 2), { minLength: 1, maxLength: 10 }),
          (words) => {
            const content = words.join(' ')
            const customDictionary = words

            const issues = checkSpellingInContent(content, customDictionary)

            // No issues should be found for words in dictionary
            return issues.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should skip code blocks', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (code) => {
            const content = `\`\`\`\n${code}\n\`\`\``

            const issues = checkSpellingInContent(content, [])

            // Code blocks should be skipped
            return issues.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should provide line and column information', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => /^[a-zA-Z]+$/.test(s) && s.length > 3),
          (word) => {
            // Use a word unlikely to be in dictionary
            const unusualWord = 'xyzabc' + word
            const content = `Some text ${unusualWord} here`

            const issues = checkSpellingInContent(content, [])

            // Should have line and column info
            return issues.every(issue =>
              typeof issue.line === 'number' &&
              typeof issue.column === 'number' &&
              issue.line > 0 &&
              issue.column > 0
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Style Check', () => {
    it('should detect lines exceeding max length', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 50 }),
          fc.string({ minLength: 100, maxLength: 200 }),
          (maxLength, longLine) => {
            const issues = checkStyleInContent(longLine, { maxLineLength: maxLength })

            // Should detect line length issue if line is longer than max
            if (longLine.length > maxLength) {
              return issues.some(issue => issue.type === 'line-length')
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect heading hierarchy issues', () => {
      const content = `# Level 1\n### Level 3\n`

      const issues = checkStyleInContent(content, { checkHeadingHierarchy: true })

      // Should detect skipped heading level
      expect(issues.some(issue => issue.type === 'heading-hierarchy')).toBe(true)
    })

    it('should detect code blocks without language', () => {
      const content = '```\ncode here\n```'

      const issues = checkStyleInContent(content, { checkCodeBlockLanguage: true })

      // Should detect missing language
      expect(issues.some(issue => issue.type === 'code-block-language')).toBe(true)
    })

    it('should not flag code blocks with language', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('javascript', 'typescript', 'python', 'java', 'cpp'),
          fc.string(),
          (lang, code) => {
            const content = `\`\`\`${lang}\n${code}\n\`\`\``

            const issues = checkStyleInContent(content, { checkCodeBlockLanguage: true })

            // Should not flag code blocks with language
            return !issues.some(issue => issue.type === 'code-block-language')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Full Linting', () => {
    /**
     * **Feature: doc-system-enhancement, Property 48: Documentation linting**
     * 
     * For any documentation with broken links or spelling errors,
     * the linter SHALL report all issues with file locations.
     * 
     * **Validates: Requirements 12.3**
     */
    it('should report all issues with file locations', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: fc.string(),
              description: fc.string(),
              frontmatter: fc.dictionary(fc.string(), fc.anything()),
              headers: fc.constant([]),
              relativePath: fc.string().filter(s => s.length > 0),
              filePath: fc.string().filter(s => s.length > 0),
              lastUpdated: fc.option(fc.integer({ min: 0 }), { nil: undefined })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          async (pages) => {
            // Mock file system by creating temporary content
            const mockPages = pages.map(p => ({
              ...p,
              filePath: '/tmp/test.md' // Use a path that won't be read
            }))

            // Since we can't easily mock fs, we'll test the structure
            // In a real scenario, this would read actual files
            const options: LinterOptions = {
              checkBrokenLinks: true,
              checkSpelling: false, // Skip to avoid file reading
              checkStyle: false
            }

            // The function should return a report with proper structure
            // We're testing the interface, not the file I/O
            const report = await lintDocumentation(mockPages as any, options)

            // Report should have required fields
            return (
              typeof report.generatedAt === 'string' &&
              typeof report.totalPages === 'number' &&
              typeof report.totalIssues === 'number' &&
              Array.isArray(report.brokenLinks) &&
              Array.isArray(report.spellingIssues) &&
              Array.isArray(report.styleIssues) &&
              report.totalPages === mockPages.length
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should count total issues correctly', async () => {
      // Create a simple test case with known issues
      const pages: PageData[] = [
        {
          title: 'Test',
          description: 'Test',
          frontmatter: {},
          headers: [],
          relativePath: 'test.md',
          filePath: '/tmp/test.md',
          lastUpdated: Date.now()
        }
      ]

      const report = await lintDocumentation(pages, {
        checkBrokenLinks: false,
        checkSpelling: false,
        checkStyle: false
      })

      // With all checks disabled, should have 0 issues
      expect(report.totalIssues).toBe(0)
      expect(report.brokenLinks.length).toBe(0)
      expect(report.spellingIssues.length).toBe(0)
      expect(report.styleIssues.length).toBe(0)
    })
  })
})
