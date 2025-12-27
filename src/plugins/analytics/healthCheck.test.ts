/**
 * 文档健康检查属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 27: Health check report generation
 * Validates: Requirements 7.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  performHealthCheck,
  extractLinks,
  isInternalLink,
  isValidInternalLink,
  calculateHealthScore,
  generateHealthSummary
} from './healthCheck'
import type { PageData } from '../../shared/types'

// ============== 生成器 ==============

/**
 * 页面数据生成器
 */
const pageDataArb = fc.record({
  relativePath: fc.stringMatching(/^[a-z0-9\-\/]+\.md$/),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  content: fc.option(fc.string(), { nil: undefined }),
  lastUpdated: fc.option(fc.integer({ min: 0, max: Date.now() }), { nil: undefined }),
  frontmatter: fc.constant({}),
  headers: fc.constant([])
}) as fc.Arbitrary<PageData>

/**
 * 健康检查选项生成器
 */
const healthCheckOptionsArb = fc.record({
  checkBrokenLinks: fc.boolean(),
  checkOutdated: fc.boolean(),
  maxAgeDays: fc.integer({ min: 1, max: 365 })
})

// ============== 属性测试 ==============

describe('Health Check - Property Tests', () => {
  /**
   * Property 27: Health check report generation
   * 
   * For any documentation build with health check enabled, the system SHALL
   * generate a report listing all broken links and outdated content.
   * 
   * Validates: Requirements 7.3
   */
  describe('Property 27: Health check report generation', () => {
    it('should generate valid health report for any page set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(pageDataArb, { minLength: 0, maxLength: 20 }),
          healthCheckOptionsArb,
          async (pages, options) => {
            const report = await performHealthCheck(pages, options)

            // 报告应包含必需字段
            expect(report).toHaveProperty('generatedAt')
            expect(report).toHaveProperty('totalPages')
            expect(report).toHaveProperty('brokenLinks')
            expect(report).toHaveProperty('outdatedContent')
            expect(report).toHaveProperty('healthScore')

            // 总页面数应匹配
            expect(report.totalPages).toBe(pages.length)

            // 健康评分应在 0-100 之间
            expect(report.healthScore).toBeGreaterThanOrEqual(0)
            expect(report.healthScore).toBeLessThanOrEqual(100)

            // 生成时间应为有效的 ISO 字符串
            expect(() => new Date(report.generatedAt)).not.toThrow()

            // 断链数组应为数组
            expect(Array.isArray(report.brokenLinks)).toBe(true)

            // 过期内容数组应为数组
            expect(Array.isArray(report.outdatedContent)).toBe(true)

            // 如果没有启用断链检查，断链列表应为空
            if (!options.checkBrokenLinks) {
              expect(report.brokenLinks).toHaveLength(0)
            }

            // 如果没有启用过期检查，过期内容列表应为空
            if (!options.checkOutdated) {
              expect(report.outdatedContent).toHaveLength(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect broken internal links', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(pageDataArb, { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => s.trim() !== '')
            .filter(s => !s.startsWith('#'))
            .filter(s => !s.startsWith('http://') && !s.startsWith('https://'))
            .filter(s => !s.startsWith('mailto:'))
            .filter(s => !/[()[\]{}]/.test(s)), // 过滤掉包含特殊字符的路径
          async (pages, brokenPath) => {
            // 确保 brokenPath 不在有效路径中
            const validPaths = new Set(pages.map(p => p.relativePath))
            if (validPaths.has(brokenPath) || validPaths.has(brokenPath + '.md')) {
              return true // 跳过这个测试用例
            }

            // 添加一个包含断链的页面
            const pageWithBrokenLink: PageData = {
              relativePath: 'test-page.md',
              title: 'Test Page',
              content: `[Broken Link](${brokenPath})`,
              frontmatter: {},
              headers: []
            }

            const allPages = [...pages, pageWithBrokenLink]
            const report = await performHealthCheck(allPages, {
              checkBrokenLinks: true,
              checkOutdated: false,
              maxAgeDays: 365
            })

            // 应该检测到至少一个断链
            expect(report.brokenLinks.length).toBeGreaterThan(0)

            // 断链应包含我们添加的链接
            const foundBrokenLink = report.brokenLinks.some(
              link => link.brokenUrl === brokenPath && link.sourcePage === 'test-page.md'
            )
            expect(foundBrokenLink).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should detect outdated content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 365 }),
          async (maxAgeDays) => {
            const now = Date.now()
            const oldTimestamp = now - (maxAgeDays + 1) * 24 * 60 * 60 * 1000

            const outdatedPage: PageData = {
              relativePath: 'old-page.md',
              title: 'Old Page',
              lastUpdated: oldTimestamp,
              frontmatter: {},
              headers: []
            }

            const report = await performHealthCheck([outdatedPage], {
              checkBrokenLinks: false,
              checkOutdated: true,
              maxAgeDays
            })

            // 应该检测到过期内容
            expect(report.outdatedContent.length).toBeGreaterThan(0)

            // 过期内容应包含我们的页面
            const foundOutdated = report.outdatedContent.some(
              content => content.page === 'old-page.md'
            )
            expect(foundOutdated).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should calculate health score correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 50 }),
          (totalPages, brokenLinks, outdated) => {
            const score = calculateHealthScore(totalPages, brokenLinks, outdated)

            // 分数应在 0-100 之间
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(100)

            // 没有问题时应该是 100 分
            if (brokenLinks === 0 && outdated === 0) {
              expect(score).toBe(100)
            }

            // 有问题时应该低于 100 分
            if (brokenLinks > 0 || outdated > 0) {
              expect(score).toBeLessThan(100)
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should generate valid health summary', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(pageDataArb, { minLength: 0, maxLength: 10 }),
          healthCheckOptionsArb,
          async (pages, options) => {
            const report = await performHealthCheck(pages, options)
            const summary = generateHealthSummary(report)

            // 摘要应包含标题
            expect(summary).toContain('Documentation Health Report')

            // 摘要应包含总页面数
            expect(summary).toContain(`Total Pages: ${report.totalPages}`)

            // 摘要应包含健康评分
            expect(summary).toContain(`Health Score: ${report.healthScore}/100`)

            // 如果有断链，摘要应包含断链部分
            if (report.brokenLinks.length > 0) {
              expect(summary).toContain('Broken Links')
            }

            // 如果有过期内容，摘要应包含过期内容部分
            if (report.outdatedContent.length > 0) {
              expect(summary).toContain('Outdated Content')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// ============== 单元测试（补充） ==============

describe('Link Extraction', () => {
  it('should extract Markdown links from content', () => {
    const page: PageData = {
      relativePath: 'test.md',
      title: 'Test',
      content: '[Link 1](url1.md)\n[Link 2](url2.md)',
      frontmatter: {},
      headers: []
    }

    const links = extractLinks(page)

    expect(links).toHaveLength(2)
    expect(links[0]).toEqual({ url: 'url1.md', text: 'Link 1', line: 1 })
    expect(links[1]).toEqual({ url: 'url2.md', text: 'Link 2', line: 2 })
  })

  it('should handle pages without content', () => {
    const page: PageData = {
      relativePath: 'test.md',
      title: 'Test',
      frontmatter: {},
      headers: []
    }

    const links = extractLinks(page)

    expect(links).toHaveLength(0)
  })
})

describe('Link Validation', () => {
  it('should identify external links', () => {
    expect(isInternalLink('https://example.com')).toBe(false)
    expect(isInternalLink('http://example.com')).toBe(false)
  })

  it('should identify anchor links', () => {
    expect(isInternalLink('#section')).toBe(false)
  })

  it('should identify mailto links', () => {
    expect(isInternalLink('mailto:test@example.com')).toBe(false)
  })

  it('should identify internal links', () => {
    expect(isInternalLink('page.md')).toBe(true)
    expect(isInternalLink('./page.md')).toBe(true)
    expect(isInternalLink('/page.md')).toBe(true)
  })

  it('should validate internal links against valid paths', () => {
    const validPaths = new Set(['page1.md', 'page2.md', 'folder/page3.md'])

    expect(isValidInternalLink('page1.md', validPaths)).toBe(true)
    expect(isValidInternalLink('./page1.md', validPaths)).toBe(true)
    expect(isValidInternalLink('/page1.md', validPaths)).toBe(true)
    expect(isValidInternalLink('page1.md#section', validPaths)).toBe(true)
    expect(isValidInternalLink('page1.md?query=1', validPaths)).toBe(true)
    expect(isValidInternalLink('nonexistent.md', validPaths)).toBe(false)
  })

  it('should handle links with .html extension', () => {
    const validPaths = new Set(['page.md'])

    expect(isValidInternalLink('page.html', validPaths)).toBe(true)
  })

  it('should handle directory index links', () => {
    const validPaths = new Set(['folder/index.md'])

    expect(isValidInternalLink('folder', validPaths)).toBe(true)
    expect(isValidInternalLink('folder/', validPaths)).toBe(true)
  })
})

describe('Health Score Calculation', () => {
  it('should return 100 for perfect health', () => {
    expect(calculateHealthScore(10, 0, 0)).toBe(100)
  })

  it('should return 0 for worst health', () => {
    const score = calculateHealthScore(10, 100, 100)
    expect(score).toBe(0)
  })

  it('should handle zero pages', () => {
    expect(calculateHealthScore(0, 0, 0)).toBe(100)
  })

  it('should weight broken links more than outdated content', () => {
    const score1 = calculateHealthScore(10, 5, 0)
    const score2 = calculateHealthScore(10, 0, 5)

    // 断链权重 60%，过期内容权重 40%
    expect(score1).toBeLessThan(score2)
  })
})

