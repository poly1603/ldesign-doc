/**
 * XSS 防护属性测试
 * Feature: doc-system-enhancement, Property 46: XSS sanitization
 * Validates: Requirements 11.5
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { XSSUtils } from './index'
import type { XSSProtectionOptions } from './index'

// ============== 属性测试 ==============

describe('XSS Protection Property Tests', () => {
  /**
   * Property 46: XSS sanitization
   * For any user-generated content containing script tags or event handlers,
   * the sanitized output SHALL not contain executable JavaScript.
   */
  it('should remove all script tags', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (content) => {
          const maliciousHtml = `<div>${content}<script>alert('XSS')</script></div>`
          const options: XSSProtectionOptions = { enabled: true }

          const sanitized = XSSUtils.sanitizeHtml(maliciousHtml, options)

          // 不应该包含 script 标签
          return !sanitized.includes('<script') && !sanitized.includes('</script>')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should remove all event handlers
   */
  it('should remove all event handlers', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (eventName, content) => {
          const maliciousHtml = `<div ${eventName}="alert('XSS')">${content}</div>`
          const options: XSSProtectionOptions = { enabled: true }

          const sanitized = XSSUtils.sanitizeHtml(maliciousHtml, options)

          // 不应该包含事件处理器
          return !sanitized.toLowerCase().includes(eventName.toLowerCase())
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should remove javascript: protocol
   */
  it('should remove javascript: protocol from links', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (content) => {
          const maliciousHtml = `<a href="javascript:alert('XSS')">${content}</a>`
          const options: XSSProtectionOptions = { enabled: true }

          const sanitized = XSSUtils.sanitizeHtml(maliciousHtml, options)

          // 不应该包含 javascript: 协议
          return !sanitized.toLowerCase().includes('javascript:')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should remove iframes when not allowed
   */
  it('should remove iframes when not allowed', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (content) => {
          const maliciousHtml = `<div>${content}<iframe src="evil.com"></iframe></div>`
          const options: XSSProtectionOptions = {
            enabled: true,
            allowIframes: false
          }

          const sanitized = XSSUtils.sanitizeHtml(maliciousHtml, options)

          // 不应该包含 iframe 标签
          return !sanitized.includes('<iframe') && !sanitized.includes('</iframe>')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should preserve safe content
   */
  it('should preserve safe HTML content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (content) => {
          const safeHtml = `<div><p>${content}</p></div>`
          const options: XSSProtectionOptions = { enabled: true }

          const sanitized = XSSUtils.sanitizeHtml(safeHtml, options)

          // 应该保留安全的内容
          return sanitized.includes(content)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should handle empty input
   */
  it('should handle empty input', () => {
    const options: XSSProtectionOptions = { enabled: true }
    const sanitized = XSSUtils.sanitizeHtml('', options)

    expect(sanitized).toBe('')
  })

  /**
   * Property: Should use custom sanitizer when provided
   */
  it('should use custom sanitizer when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (content) => {
          const options: XSSProtectionOptions = {
            enabled: true,
            customSanitizer: (html) => html.toUpperCase()
          }

          const sanitized = XSSUtils.sanitizeHtml(content, options)

          // 应该使用自定义清理函数
          return sanitized === content.toUpperCase()
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: URL safety check
   */
  it('should identify safe URLs correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('http', 'https', 'mailto'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (protocol, path) => {
          const url = `${protocol}://example.com/${path}`

          const isSafe = XSSUtils.isSafeUrl(url, ['http', 'https', 'mailto'])

          return isSafe
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should reject javascript: URLs
   */
  it('should reject javascript: URLs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (code) => {
          const url = `javascript:${code}`

          const isSafe = XSSUtils.isSafeUrl(url, ['http', 'https'])

          return !isSafe
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Should reject data: URLs
   */
  it('should reject data: URLs', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (data) => {
          const url = `data:text/html,${data}`

          const isSafe = XSSUtils.isSafeUrl(url, ['http', 'https'])

          return !isSafe
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== 单元测试（补充边界情况） ==============

describe('XSS Protection Unit Tests', () => {
  it('should escape HTML special characters', () => {
    const text = '<script>alert("XSS")</script>'
    const escaped = XSSUtils.escapeHtml(text)

    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;')
    expect(escaped).not.toContain('<')
    expect(escaped).not.toContain('>')
  })

  it('should escape all special characters', () => {
    const text = '& < > " \' /'
    const escaped = XSSUtils.escapeHtml(text)

    expect(escaped).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;')
  })

  it('should handle multiple script tags', () => {
    const html = '<script>alert(1)</script><div>content</div><script>alert(2)</script>'
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized).not.toContain('<script')
    expect(sanitized).toContain('content')
  })

  it('should handle script tags with attributes', () => {
    const html = '<script type="text/javascript" src="evil.js">alert(1)</script>'
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized).not.toContain('<script')
    expect(sanitized).not.toContain('evil.js')
  })

  it('should handle inline event handlers with single quotes', () => {
    const html = `<div onclick='alert("XSS")'>Click me</div>`
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('onclick')
  })

  it('should handle inline event handlers with double quotes', () => {
    const html = `<div onclick="alert('XSS')">Click me</div>`
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('onclick')
  })

  it('should handle inline event handlers without quotes', () => {
    const html = `<div onclick=alert(1)>Click me</div>`
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('onclick')
  })

  it('should handle javascript: in href', () => {
    const html = `<a href="javascript:alert('XSS')">Link</a>`
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('javascript:')
  })

  it('should handle javascript: in src', () => {
    const html = `<img src="javascript:alert('XSS')">`
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('javascript:')
  })

  it('should preserve iframes when allowed', () => {
    const html = `<iframe src="https://example.com"></iframe>`
    const options: XSSProtectionOptions = {
      enabled: true,
      allowIframes: true
    }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized).toContain('<iframe')
  })

  it('should handle nested iframes', () => {
    const html = `<div><iframe src="evil.com"><iframe src="evil2.com"></iframe></iframe></div>`
    const options: XSSProtectionOptions = {
      enabled: true,
      allowIframes: false
    }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized).not.toContain('<iframe')
  })

  it('should handle relative URLs as safe', () => {
    expect(XSSUtils.isSafeUrl('/path/to/page')).toBe(true)
    expect(XSSUtils.isSafeUrl('./relative/path')).toBe(true)
    expect(XSSUtils.isSafeUrl('../parent/path')).toBe(true)
  })

  it('should handle absolute URLs with allowed protocols', () => {
    expect(XSSUtils.isSafeUrl('http://example.com', ['http', 'https'])).toBe(true)
    expect(XSSUtils.isSafeUrl('https://example.com', ['http', 'https'])).toBe(true)
    expect(XSSUtils.isSafeUrl('mailto:test@example.com', ['mailto'])).toBe(true)
  })

  it('should reject URLs with disallowed protocols', () => {
    expect(XSSUtils.isSafeUrl('ftp://example.com', ['http', 'https'])).toBe(false)
    expect(XSSUtils.isSafeUrl('file:///etc/passwd', ['http', 'https'])).toBe(false)
  })

  it('should handle case-insensitive script tags', () => {
    const html = '<SCRIPT>alert(1)</SCRIPT><ScRiPt>alert(2)</ScRiPt>'
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('<script')
  })

  it('should handle obfuscated event handlers', () => {
    const html = '<div OnClIcK="alert(1)">Click</div>'
    const options: XSSProtectionOptions = { enabled: true }

    const sanitized = XSSUtils.sanitizeHtml(html, options)

    expect(sanitized.toLowerCase()).not.toContain('onclick')
  })
})
