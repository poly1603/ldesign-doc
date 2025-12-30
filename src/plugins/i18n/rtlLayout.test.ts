/**
 * Property-based tests for RTL layout support
 * Feature: doc-system-enhancement, Property 54
 * Validates: Requirements 13.5
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { rtlLayoutSupport } from './rtlLayout'
import type { SiteConfig, LocaleConfig } from '../../shared/types'

// Helper to create a mock SiteConfig
function createMockConfig(locales: Record<string, LocaleConfig>): SiteConfig {
  return {
    root: '/test',
    srcDir: 'docs',
    extraDocs: [],
    lang: 'en-US',
    locales,
    configPath: undefined,
    configDeps: [],
    themeDir: '',
    tempDir: '',
    cacheDir: '',
    userPlugins: [],
    outDir: 'dist',
    base: '/',
    title: 'Test',
    description: 'Test',
    head: [],
    framework: 'vue',
    themeConfig: {},
    markdown: {},
    vite: {},
    build: {}
  } as SiteConfig
}

describe('RTL Layout Support - Property Tests', () => {
  beforeEach(() => {
    // Initialize with default RTL locales
    const config = createMockConfig({})
    rtlLayoutSupport.initialize(config, {})
  })

  /**
   * Property 54: RTL layout application
   * For any RTL language configuration, the generated CSS SHALL include direction: rtl
   * and appropriate layout adjustments.
   */
  it('should generate RTL styles for RTL languages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'ar-AE', 'ar-SA', 'he', 'he-IL', 'fa', 'fa-IR', 'ur', 'ur-PK'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // Should be identified as RTL
          expect(rtlLayoutSupport.isRTL(locale)).toBe(true)

          // Should generate RTL styles
          const styles = rtlLayoutSupport.generateStyles(locale)
          expect(styles).not.toBeNull()
          expect(styles).toContain('direction: rtl')
          expect(styles).toContain(`html[lang="${locale}"]`)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not generate RTL styles for LTR languages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'en-US', 'zh-CN', 'ja', 'ko', 'fr', 'de', 'es', 'ru'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // Should NOT be identified as RTL
          expect(rtlLayoutSupport.isRTL(locale)).toBe(false)

          // Should NOT generate RTL styles
          const styles = rtlLayoutSupport.generateStyles(locale)
          expect(styles).toBeNull()

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return correct text direction for all locales', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          // RTL languages
          'ar', 'ar-SA', 'he', 'fa', 'ur',
          // LTR languages
          'en', 'zh-CN', 'ja', 'ko', 'fr', 'de'
        ),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          const direction = rtlLayoutSupport.getTextDirection(locale)

          // Should be either 'ltr' or 'rtl'
          expect(['ltr', 'rtl']).toContain(direction)

          // Should match isRTL result
          if (rtlLayoutSupport.isRTL(locale)) {
            expect(direction).toBe('rtl')
          } else {
            expect(direction).toBe('ltr')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle locale codes case-insensitively', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'AR', 'Ar', 'aR', 'he', 'HE', 'He', 'hE'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // All variations should be recognized as RTL
          expect(rtlLayoutSupport.isRTL(locale)).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should match language code without region', () => {
    fc.assert(
      fc.property(
        fc.record({
          lang: fc.constantFrom('ar', 'he', 'fa', 'ur'),
          region: fc.constantFrom('SA', 'AE', 'IL', 'IR', 'PK', 'XX', 'YY')
        }),
        ({ lang, region }) => {
          const locale = `${lang}-${region}`
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // Should be recognized as RTL regardless of region
          expect(rtlLayoutSupport.isRTL(locale)).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should support custom RTL locale lists', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 2, maxLength: 5 }).map(s => s.toLowerCase()),
          { minLength: 1, maxLength: 10 }
        ),
        (customLocales) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {
            rtlLocales: customLocales
          })

          // All custom locales should be recognized as RTL
          for (const locale of customLocales) {
            expect(rtlLayoutSupport.isRTL(locale)).toBe(true)
          }

          // Default RTL locales should NOT be recognized (since we provided custom list)
          // unless they're in the custom list
          const defaultRTL = 'ar'
          if (!customLocales.includes(defaultRTL)) {
            expect(rtlLayoutSupport.isRTL(defaultRTL)).toBe(false)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate dir attribute correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'he', 'en', 'zh-CN', 'ja'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          const dirAttr = rtlLayoutSupport.addDirAttribute(locale)

          if (rtlLayoutSupport.isRTL(locale)) {
            expect(dirAttr).toBe('dir="rtl"')
          } else {
            expect(dirAttr).toBe('dir="ltr"')
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include essential RTL CSS adjustments', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'ar-SA', 'he', 'fa'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          const styles = rtlLayoutSupport.generateStyles(locale)
          expect(styles).not.toBeNull()

          // Should include key RTL adjustments
          const requiredAdjustments = [
            'direction: rtl',
            'text-align: right',
            '.sidebar',
            '.nav',
            '.content',
            '.outline',
            'border-right',
            'padding-right',
            'margin-right'
          ]

          for (const adjustment of requiredAdjustments) {
            expect(styles).toContain(adjustment)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve LTR direction for code blocks in RTL pages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'he', 'fa'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          const styles = rtlLayoutSupport.generateStyles(locale)
          expect(styles).not.toBeNull()

          // Code blocks should maintain LTR direction
          expect(styles).toContain('.code-block')
          expect(styles).toMatch(/\.code-block[^}]*direction:\s*ltr/i)
          expect(styles).toMatch(/\.code-block[^}]*text-align:\s*left/i)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty locale gracefully', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', null, undefined),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // Should not crash and should return false
          const result = rtlLayoutSupport.isRTL(locale as string)
          expect(result).toBe(false)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return consistent results for same locale', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'he', 'en', 'zh-CN'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          // Multiple calls should return same result
          const result1 = rtlLayoutSupport.isRTL(locale)
          const result2 = rtlLayoutSupport.isRTL(locale)
          const result3 = rtlLayoutSupport.isRTL(locale)

          expect(result1).toBe(result2)
          expect(result2).toBe(result3)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include all default RTL locales', () => {
    const config = createMockConfig({})
    rtlLayoutSupport.initialize(config, {})

    const rtlLocales = rtlLayoutSupport.getRTLLocales()

    // Should include common RTL languages
    const expectedRTL = ['ar', 'he', 'fa', 'ur']
    for (const locale of expectedRTL) {
      expect(rtlLocales.some(l => l.toLowerCase().startsWith(locale))).toBe(true)
    }
  })

  it('should apply RTL styles to all major layout components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ar', 'he'),
        (locale) => {
          const config = createMockConfig({})
          rtlLayoutSupport.initialize(config, {})

          const styles = rtlLayoutSupport.generateStyles(locale)
          expect(styles).not.toBeNull()

          // Should include styles for all major components
          const components = [
            '.nav',
            '.sidebar',
            '.content',
            '.aside',
            '.outline',
            '.breadcrumb',
            '.search',
            '.doc-footer',
            'ul',
            'ol',
            'blockquote',
            'table',
            '.footer'
          ]

          for (const component of components) {
            expect(styles).toContain(component)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
