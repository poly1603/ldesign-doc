/**
 * 分析脚本注入属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 26: Analytics script injection
 * Validates: Requirements 7.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateGoogleAnalyticsScript,
  generatePlausibleScript,
  generateUmamiScript,
  generateCustomScript,
  injectScripts,
  cleanScript,
  extractScriptConfig
} from './scriptInjection'
import type {
  GoogleAnalyticsConfig,
  PlausibleConfig,
  UmamiConfig,
  CustomAnalyticsConfig
} from './index'

// ============== 生成器 ==============

/**
 * Google Analytics 配置生成器
 */
const googleAnalyticsConfigArb = fc.record({
  measurementId: fc.stringMatching(/^G-[A-Z0-9]{10}$/),
  enhancedMeasurement: fc.option(fc.boolean(), { nil: undefined }),
  customDimensions: fc.option(
    fc.dictionary(fc.string(), fc.string()),
    { nil: undefined }
  )
})

/**
 * Plausible 配置生成器
 */
const plausibleConfigArb = fc.record({
  domain: fc.domain(),
  apiHost: fc.option(fc.webUrl(), { nil: undefined }),
  trackOutboundLinks: fc.option(fc.boolean(), { nil: undefined })
})

/**
 * Umami 配置生成器
 */
const umamiConfigArb = fc.record({
  websiteId: fc.uuid(),
  src: fc.webUrl(),
  dataDomain: fc.option(fc.domain(), { nil: undefined })
})

/**
 * 自定义分析配置生成器
 */
const customAnalyticsConfigArb = fc.record({
  script: fc.option(fc.string(), { nil: undefined }),
  trackPageView: fc.option(
    fc.constant((path: string) => console.log('Track:', path)),
    { nil: undefined }
  ),
  trackEvent: fc.option(
    fc.constant((name: string, data?: Record<string, unknown>) =>
      console.log('Event:', name, data)
    ),
    { nil: undefined }
  )
})

// ============== 属性测试 ==============

describe('Analytics Script Injection - Property Tests', () => {
  /**
   * Property 26: Analytics script injection
   * 
   * For any analytics provider configuration, the generated HTML SHALL include
   * the correct tracking script for that provider.
   * 
   * Validates: Requirements 7.2
   */
  describe('Property 26: Analytics script injection', () => {
    it('should generate valid Google Analytics script for any config', () => {
      fc.assert(
        fc.property(googleAnalyticsConfigArb, (config) => {
          const script = generateGoogleAnalyticsScript(config)

          // 脚本应包含测量 ID
          expect(script).toContain(config.measurementId)

          // 脚本应包含 gtag 函数定义
          expect(script).toContain('function gtag()')
          expect(script).toContain('window.dataLayer')

          // 脚本应包含 Google Analytics 脚本源
          expect(script).toContain('googletagmanager.com/gtag/js')

          // 如果启用了增强测量，应包含配置
          if (config.enhancedMeasurement) {
            expect(script).toContain('enhanced_measurement')
          }

          // 如果有自定义维度，应包含在配置中
          if (config.customDimensions) {
            Object.keys(config.customDimensions).forEach(key => {
              expect(script).toContain(key)
            })
          }

          // 脚本应包含路由变化监听
          expect(script).toContain('ldoc:route-change')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should generate valid Plausible script for any config', () => {
      fc.assert(
        fc.property(plausibleConfigArb, (config) => {
          const script = generatePlausibleScript(config)

          // 脚本应包含域名
          expect(script).toContain(config.domain)

          // 脚本应包含 Plausible 脚本源
          const apiHost = config.apiHost || 'https://plausible.io'
          expect(script).toContain(apiHost)

          // 如果启用了出站链接追踪，脚本名应包含 outbound-links
          if (config.trackOutboundLinks) {
            expect(script).toContain('outbound-links')
          }

          // 脚本应包含路由变化监听
          expect(script).toContain('ldoc:route-change')
          expect(script).toContain('window.plausible')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should generate valid Umami script for any config', () => {
      fc.assert(
        fc.property(umamiConfigArb, (config) => {
          const script = generateUmamiScript(config)

          // 脚本应包含网站 ID
          expect(script).toContain(config.websiteId)

          // 脚本应包含脚本源
          expect(script).toContain(config.src)

          // 如果有数据域名，应包含在属性中
          if (config.dataDomain) {
            expect(script).toContain(config.dataDomain)
            expect(script).toContain('data-domains')
          }

          // 脚本应包含路由变化监听
          expect(script).toContain('ldoc:route-change')
          expect(script).toContain('window.umami')

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should generate custom script with tracking functions', () => {
      fc.assert(
        fc.property(customAnalyticsConfigArb, (config) => {
          const script = generateCustomScript(config)

          // 如果提供了非空脚本，trimmed 输出应包含 trimmed 输入
          if (config.script && config.script.trim()) {
            expect(script).toContain(config.script.trim())
          }

          // 如果提供了 trackPageView 函数，应包含路由监听
          if (config.trackPageView) {
            expect(script).toContain('ldoc:route-change')
            expect(script).toContain('trackPageView')
          }

          // 如果两者都没有或脚本为空白，输出应为空
          if ((!config.script || !config.script.trim()) && !config.trackPageView) {
            expect(script).toBe('')
          }

          return true
        }),
        { numRuns: 100 }
      )
    })

    it('should inject scripts into HTML correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
          fc.oneof(
            fc.constant('<html><head></head><body></body></html>'),
            fc.constant('<html><body></body></html>'),
            fc.constant('<div>content</div>')
          ),
          (scripts, html) => {
            const result = injectScripts(html, scripts)

            // 脚本会被 join('\n') 连接，所以检查连接后的字符串
            const joinedScripts = scripts.join('\n')
            expect(result).toContain(joinedScripts)

            // 原始 HTML 内容应保留
            if (html.includes('</head>')) {
              expect(result).toContain('</head>')
            }
            if (html.includes('<body>')) {
              expect(result).toContain('<body>')
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty script array', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (html) => {
            const result = injectScripts(html, [])
            // 空脚本数组应返回原始 HTML
            expect(result).toBe(html)
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // ============== 单元测试（补充） ==============

  describe('Script Generation - Unit Tests', () => {
    it('should generate Google Analytics script with minimal config', () => {
      const config: GoogleAnalyticsConfig = {
        measurementId: 'G-XXXXXXXXXX'
      }
      const script = generateGoogleAnalyticsScript(config)

      expect(script).toContain('G-XXXXXXXXXX')
      expect(script).toContain('gtag')
      expect(script).toContain('dataLayer')
    })

    it('should generate Plausible script with default API host', () => {
      const config: PlausibleConfig = {
        domain: 'example.com'
      }
      const script = generatePlausibleScript(config)

      expect(script).toContain('example.com')
      expect(script).toContain('https://plausible.io')
    })

    it('should generate Umami script without optional fields', () => {
      const config: UmamiConfig = {
        websiteId: '12345',
        src: 'https://analytics.example.com/script.js'
      }
      const script = generateUmamiScript(config)

      expect(script).toContain('12345')
      expect(script).toContain('https://analytics.example.com/script.js')
      expect(script).not.toContain('data-domains')
    })

    it('should inject scripts before </head> tag', () => {
      const html = '<html><head><title>Test</title></head><body></body></html>'
      const scripts = ['<script>console.log("test")</script>']
      const result = injectScripts(html, scripts)

      const headEndIndex = result.indexOf('</head>')
      const scriptIndex = result.indexOf('<script>console.log("test")</script>')

      expect(scriptIndex).toBeLessThan(headEndIndex)
    })

    it('should inject scripts after <body> tag if no </head>', () => {
      const html = '<html><body><div>content</div></body></html>'
      const scripts = ['<script>console.log("test")</script>']
      const result = injectScripts(html, scripts)

      const bodyStartIndex = result.indexOf('<body>')
      const scriptIndex = result.indexOf('<script>console.log("test")</script>')

      expect(scriptIndex).toBeGreaterThan(bodyStartIndex)
    })

    it('should inject scripts at beginning if no head or body tags', () => {
      const html = '<div>content</div>'
      const scripts = ['<script>console.log("test")</script>']
      const result = injectScripts(html, scripts)

      expect(result.startsWith('<script>console.log("test")</script>')).toBe(true)
    })
  })

  describe('Script Utilities', () => {
    it('should clean script by removing comments and compressing whitespace', () => {
      const script = `
        <!-- Comment -->
        <script>
          console.log("test");
        </script>
      `
      const cleaned = cleanScript(script)

      expect(cleaned).not.toContain('<!--')
      expect(cleaned).not.toContain('-->')
      expect(cleaned.split(/\s+/).length).toBeLessThan(script.split(/\s+/).length)
    })

    it('should extract config values from script', () => {
      const script = `
        <script>
          const config = { measurementId: 'G-XXXXXXXXXX' };
        </script>
      `
      const value = extractScriptConfig(script, 'measurementId')

      expect(value).toBe('G-XXXXXXXXXX')
    })

    it('should return null for non-existent config keys', () => {
      const script = '<script>const config = {};</script>'
      const value = extractScriptConfig(script, 'nonExistent')

      expect(value).toBeNull()
    })
  })
})
