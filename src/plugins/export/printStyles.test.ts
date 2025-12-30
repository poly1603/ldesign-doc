/**
 * Property-Based Tests for Print Stylesheet Inclusion
 * Feature: doc-system-enhancement, Property 55: Print stylesheet inclusion
 * 
 * Property 55: Print stylesheet inclusion
 * For any page, the rendered HTML SHALL include print-optimized stylesheets.
 * Validates: Requirements 14.1
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { exportPlugin, generatePrintStyles, hasPrintStyles } from './index'

describe('Export Plugin - Print Stylesheet Inclusion', () => {
  /**
   * Property 55: Print stylesheet inclusion
   * 
   * For any page configuration, when the export plugin is enabled with print styles,
   * the generated HTML SHALL include print-optimized stylesheets with @media print rules.
   */
  it('should include print stylesheets in rendered HTML for any page', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary page configurations
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          content: fc.string({ minLength: 0, maxLength: 1000 }),
          enablePrintStyles: fc.boolean(),
          formats: fc.array(fc.constantFrom('pdf', 'epub', 'html'), { minLength: 0, maxLength: 3 })
        }),
        (pageConfig) => {
          // Create plugin with configuration
          const plugin = exportPlugin({
            enablePrintStyles: pageConfig.enablePrintStyles,
            formats: pageConfig.formats as ('pdf' | 'epub' | 'html')[]
          })

          // Simulate HTML generation with plugin styles
          const headStyles = plugin.headStyles || []
          const stylesArray = typeof headStyles === 'function' ? [] : headStyles
          const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${pageConfig.title}</title>
                <style>${stylesArray.join('\n')}</style>
              </head>
              <body>
                ${pageConfig.content}
              </body>
            </html>
          `

          // Property: If print styles are enabled, HTML must contain @media print
          if (pageConfig.enablePrintStyles) {
            expect(hasPrintStyles(htmlWithStyles)).toBe(true)
            expect(htmlWithStyles).toContain('@media print')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Print styles should be valid CSS
   * 
   * For any generated print stylesheet, it should be valid CSS syntax
   * and contain essential print optimization rules.
   */
  it('should generate valid print CSS with essential rules', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed, testing the function itself
        () => {
          const printStyles = generatePrintStyles()

          // Must contain @media print
          expect(printStyles).toContain('@media print')

          // Must contain essential print optimizations
          expect(printStyles).toContain('display: none') // Hide non-print elements
          expect(printStyles).toContain('page-break-inside: avoid') // Prevent breaks
          expect(printStyles).toContain('break-inside: avoid') // Modern syntax

          // Must optimize for print
          expect(printStyles).toContain('max-width: 100%') // Full width
          expect(printStyles).toContain('color: #000') // Black text
          expect(printStyles).toContain('background: #fff') // White background

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Print styles should hide interactive elements
   * 
   * For any page with navigation, sidebars, and interactive elements,
   * print styles should hide these elements.
   */
  it('should hide interactive elements in print styles', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            '.vp-nav',
            '.vp-sidebar',
            '.vp-local-nav',
            '.back-to-top',
            '.vp-doc-footer-nav',
            '.vp-related-pages',
            '.vp-social-share'
          ),
          { minLength: 1, maxLength: 7 }
        ),
        (elementsToCheck) => {
          const printStyles = generatePrintStyles()

          // All interactive elements should be hidden
          for (const element of elementsToCheck) {
            expect(printStyles).toContain(element)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Print styles should optimize content elements
   * 
   * For any page with code blocks, images, tables, and headings,
   * print styles should prevent page breaks within these elements.
   */
  it('should prevent page breaks in content elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          hasCodeBlocks: fc.boolean(),
          hasImages: fc.boolean(),
          hasTables: fc.boolean(),
          hasHeadings: fc.boolean()
        }),
        (contentConfig) => {
          const printStyles = generatePrintStyles()

          // Check for page-break prevention rules
          // The styles should contain the selectors and the page-break rules
          if (contentConfig.hasCodeBlocks) {
            expect(printStyles).toContain('.vp-code-group')
            expect(printStyles).toContain('page-break-inside: avoid')
          }

          if (contentConfig.hasImages) {
            expect(printStyles).toContain('img')
            expect(printStyles).toContain('page-break-inside: avoid')
          }

          if (contentConfig.hasTables) {
            expect(printStyles).toContain('table')
            expect(printStyles).toContain('page-break-inside: avoid')
          }

          if (contentConfig.hasHeadings) {
            expect(printStyles).toContain('h1, h2, h3, h4, h5, h6')
            expect(printStyles).toContain('page-break-after: avoid')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: hasPrintStyles detection should be accurate
   * 
   * For any HTML string, the hasPrintStyles function should correctly
   * detect the presence of @media print rules.
   */
  it('should accurately detect print styles in HTML', () => {
    fc.assert(
      fc.property(
        fc.record({
          beforeContent: fc.string({ maxLength: 100 }),
          afterContent: fc.string({ maxLength: 100 }),
          includePrintStyles: fc.boolean()
        }),
        (htmlConfig) => {
          const printStylesBlock = htmlConfig.includePrintStyles
            ? '<style>@media print { body { color: black; } }</style>'
            : ''

          const html = `
            ${htmlConfig.beforeContent}
            ${printStylesBlock}
            ${htmlConfig.afterContent}
          `

          const result = hasPrintStyles(html)

          // Property: Detection should match actual presence
          expect(result).toBe(htmlConfig.includePrintStyles)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Print styles should be idempotent
   * 
   * For any configuration, generating print styles multiple times
   * should produce the same result.
   */
  it('should generate consistent print styles', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // Number of times to generate
        (iterations) => {
          const results: string[] = []

          for (let i = 0; i < iterations; i++) {
            results.push(generatePrintStyles())
          }

          // All results should be identical
          const firstResult = results[0]
          for (const result of results) {
            expect(result).toBe(firstResult)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Plugin with disabled print styles should not inject styles
   * 
   * For any configuration with enablePrintStyles: false,
   * the plugin should not inject print stylesheets.
   */
  it('should not inject print styles when disabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          formats: fc.array(fc.constantFrom('pdf', 'epub', 'html'), { minLength: 0, maxLength: 3 }),
          buttonPosition: fc.constantFrom('nav', 'doc-top', 'doc-bottom')
        }),
        (config) => {
          const plugin = exportPlugin({
            enablePrintStyles: false,
            formats: config.formats as ('pdf' | 'epub' | 'html')[],
            buttonPosition: config.buttonPosition as 'nav' | 'doc-top' | 'doc-bottom'
          })

          // When disabled, headStyles should be undefined or empty
          const headStyles = plugin.headStyles || []
          const stylesArray = typeof headStyles === 'function' ? [] : headStyles
          const stylesContent = stylesArray.join('\n')

          expect(stylesContent).not.toContain('@media print')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
