/**
 * Code Block Enhancement Tests
 * Feature: doc-system-enhancement
 */

import { describe, it, expect, beforeAll } from 'vitest'
import * as fc from 'fast-check'
import { createMarkdownRenderer } from './createMarkdown'
import type { SiteConfig } from '../shared/types'

describe('Code Block Enhancements', () => {
  let renderer: Awaited<ReturnType<typeof createMarkdownRenderer>>

  beforeAll(async () => {
    const config = {
      title: 'Test',
      description: 'Test',
      base: '/',
      markdown: {
        lineNumbers: true
      }
    } as SiteConfig
    renderer = await createMarkdownRenderer(config)
  })

  describe('Property 20: Diff highlighting', () => {
    /**
     * Feature: doc-system-enhancement, Property 20: Diff highlighting
     * Validates: Requirements 6.1
     * 
     * For any code block with diff syntax (lines starting with + or -),
     * the rendered HTML SHALL apply appropriate CSS classes for added and removed lines.
     */
    it('should apply diff-add class to lines starting with +', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 1, maxLength: 10 }
          ),
          (lines) => {
            // Create code with + prefix
            const code = lines.map(line => `+ ${line}`).join('\n')
            const markdown = '```js\n' + code + '\n```'

            const html = renderer.render(markdown)

            // All lines should have diff-add class
            const diffAddMatches = html.match(/class="line diff-add"/g)
            return diffAddMatches !== null && diffAddMatches.length === lines.length
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply diff-remove class to lines starting with -', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 1, maxLength: 10 }
          ),
          (lines) => {
            // Create code with - prefix
            const code = lines.map(line => `- ${line}`).join('\n')
            const markdown = '```js\n' + code + '\n```'

            const html = renderer.render(markdown)

            // All lines should have diff-remove class
            const diffRemoveMatches = html.match(/class="line diff-remove"/g)
            return diffRemoveMatches !== null && diffRemoveMatches.length === lines.length
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle mixed diff lines correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              prefix: fc.constantFrom('+', '-', ' '),
              content: fc.string({ minLength: 1 })
                .filter(s => s.trim().length > 0)
                .filter(s => /^[a-zA-Z0-9_]+$/.test(s))  // Only alphanumeric and underscore
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (lines) => {
            const code = lines.map(l => `${l.prefix} ${l.content}`).join('\n')
            const markdown = '```js\n' + code + '\n```'

            const html = renderer.render(markdown)

            const addCount = lines.filter(l => l.prefix === '+').length
            const removeCount = lines.filter(l => l.prefix === '-').length

            const diffAddMatches = html.match(/class="line diff-add"/g)
            const diffRemoveMatches = html.match(/class="line diff-remove"/g)

            const actualAddCount = diffAddMatches ? diffAddMatches.length : 0
            const actualRemoveCount = diffRemoveMatches ? diffRemoveMatches.length : 0

            return actualAddCount === addCount && actualRemoveCount === removeCount
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 21: Code block titles', () => {
    /**
     * Feature: doc-system-enhancement, Property 21: Code block titles
     * Validates: Requirements 6.2
     * 
     * For any code block with a title annotation,
     * the rendered HTML SHALL include a title element displaying the specified title.
     */
    it('should render title element when title attribute is present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => /^[a-zA-Z0-9_\-.,;: ]+$/.test(s)),
          fc.string(),
          (title, code) => {
            const markdown = `\`\`\`js title="${title}"\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should contain title element with the title text
            return html.includes('<div class="vp-code-title">') &&
              html.includes(title)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should add has-title class when title is present', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => /^[a-zA-Z0-9_\-.,;: ]+$/.test(s)),
          fc.string(),
          (title, code) => {
            const markdown = `\`\`\`js title="${title}"\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should have has-title class
            return html.includes('class="vp-code-block') &&
              html.includes('has-title')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not render title element when title attribute is absent', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (code) => {
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should not contain title element
            return !html.includes('<div class="vp-code-title">')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 22: Playground link generation', () => {
    /**
     * Feature: doc-system-enhancement, Property 22: Playground link generation
     * Validates: Requirements 6.3
     * 
     * For any code block with playground enabled,
     * the rendered HTML SHALL include a link to the configured playground URL with the code properly encoded.
     */
    it('should generate playground link when enabled', async () => {
      const playgroundConfig = {
        title: 'Test',
        description: 'Test',
        base: '/',
        markdown: {
          lineNumbers: true,
          playground: {
            enabled: true,
            url: 'https://playground.example.com?code={code}'
          }
        }
      } as SiteConfig
      const playgroundRenderer = await createMarkdownRenderer(playgroundConfig)

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (code) => {
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = playgroundRenderer.render(markdown)

            // Should contain playground link
            return html.includes('class="vp-code-playground"') &&
              html.includes('https://playground.example.com?code=')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not generate playground link when disabled', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (code) => {
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should not contain playground link
            return !html.includes('class="vp-code-playground"')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should respect language restrictions', async () => {
      const restrictedConfig = {
        title: 'Test',
        description: 'Test',
        base: '/',
        markdown: {
          lineNumbers: true,
          playground: {
            enabled: true,
            url: 'https://playground.example.com?code={code}',
            languages: ['javascript', 'typescript']
          }
        }
      } as SiteConfig
      const restrictedRenderer = await createMarkdownRenderer(restrictedConfig)

      await fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.constantFrom('javascript', 'typescript', 'python', 'go'),
          async (code, lang) => {
            const markdown = `\`\`\`${lang}\n${code}\n\`\`\``

            const html = restrictedRenderer.render(markdown)

            const hasPlayground = html.includes('class="vp-code-playground"')
            const shouldHavePlayground = ['javascript', 'typescript'].includes(lang)

            return hasPlayground === shouldHavePlayground
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 23: Line focus styling', () => {
    /**
     * Feature: doc-system-enhancement, Property 23: Line focus styling
     * Validates: Requirements 6.4
     * 
     * For any code block with focus annotation, non-focused lines SHALL have a dimmed CSS class applied.
     */
    it('should apply dimmed class to non-focused lines', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 5, maxLength: 10 }
          ),
          fc.integer({ min: 1, max: 3 }),
          (lines, focusEnd) => {
            // Ensure we have non-empty lines by filtering
            const nonEmptyLines = lines.filter(line => line.trim().length > 0)

            // Skip if we don't have enough lines
            if (nonEmptyLines.length < 5) {
              return true
            }

            const code = nonEmptyLines.join('\n')
            const markdown = `\`\`\`js{focus:1-${focusEnd}}\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Non-focused lines should have dimmed class
            const dimmedMatches = html.match(/class="line[^"]*dimmed/g)
            const expectedDimmed = nonEmptyLines.length - focusEnd

            return dimmedMatches !== null && dimmedMatches.length >= expectedDimmed
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 24: Long code collapsing', () => {
    /**
     * Feature: doc-system-enhancement, Property 24: Long code collapsing
     * Validates: Requirements 6.5
     * 
     * For any code block exceeding the configured line threshold,
     * the rendered HTML SHALL include a collapse wrapper with expand/collapse functionality.
     */
    it('should add collapsible class when code exceeds threshold', async () => {
      const collapseConfig = {
        title: 'Test',
        description: 'Test',
        base: '/',
        markdown: {
          lineNumbers: true,
          codeCollapse: {
            enabled: true,
            threshold: 5
          }
        }
      } as SiteConfig
      const collapseRenderer = await createMarkdownRenderer(collapseConfig)

      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string(), { minLength: 6, maxLength: 20 }),
          async (lines) => {
            const code = lines.join('\n')
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = collapseRenderer.render(markdown)

            // Should have collapsible class and toggle button
            return html.includes('collapsible') &&
              html.includes('vp-code-collapse-toggle')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 25: Code annotations', () => {
    /**
     * Feature: doc-system-enhancement, Property 25: Code annotations
     * Validates: Requirements 6.6
     * 
     * For any code block with annotation comments,
     * the rendered HTML SHALL include callout elements positioned at the annotated lines.
     */
    it('should apply annotation classes for highlight comments', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 1, maxLength: 5 }
          ),
          (lines) => {
            const code = lines.map(line => `${line} // [!code highlight]`).join('\n')
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should have annotated-highlight class
            const annotatedMatches = html.match(/class="line annotated-highlight"/g)
            return annotatedMatches !== null && annotatedMatches.length === lines.length
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply annotation classes for warning comments', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 1, maxLength: 5 }
          ),
          (lines) => {
            const code = lines.map(line => `${line} // [!code warning]`).join('\n')
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should have annotated-warning class
            const annotatedMatches = html.match(/class="line annotated-warning"/g)
            return annotatedMatches !== null && annotatedMatches.length === lines.length
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should apply annotation classes for error comments', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 1 })
              .filter(s => s.trim().length > 0)
              .filter(s => /^[a-zA-Z0-9_]+$/.test(s)),  // Only alphanumeric and underscore
            { minLength: 1, maxLength: 5 }
          ),
          (lines) => {
            const code = lines.map(line => `${line} // [!code error]`).join('\n')
            const markdown = `\`\`\`js\n${code}\n\`\`\``

            const html = renderer.render(markdown)

            // Should have annotated-error class
            const annotatedMatches = html.match(/class="line annotated-error"/g)
            return annotatedMatches !== null && annotatedMatches.length === lines.length
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
