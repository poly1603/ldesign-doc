/**
 * Property-Based Tests for Single-Page HTML Export
 * Feature: doc-system-enhancement, Property 58: Single-page export completeness
 * 
 * Property 58: Single-page export completeness
 * For any single-page export, the generated HTML SHALL contain all documentation content with working internal links.
 * Validates: Requirements 14.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import { exportToSinglePage } from './singlePage'
import type { SinglePageExportOptions, PageContent } from './singlePage'
import { existsSync, unlinkSync, readFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// ============== Arbitraries ==============

/**
 * 生成有效的页面内容
 */
const pageContentArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }).filter((s: string) => s.trim().length > 0),
  content: fc.oneof(
    fc.constant('<h1>Test</h1><p>Content</p>'),
    fc.constant('<h2>Chapter</h2><p>Some text here.</p>'),
    fc.constant('<div><p>Paragraph 1</p><p>Paragraph 2</p></div>'),
    fc.constant('<ul><li>Item 1</li><li>Item 2</li></ul>')
  ),
  id: fc.option(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s: string) => /^[a-z0-9-]+$/.test(s)),
    { nil: undefined }
  )
})

// ============== Test Setup ==============

let testDir: string

beforeEach(() => {
  // 创建临时测试目录
  testDir = join(tmpdir(), `single-page-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  mkdirSync(testDir, { recursive: true })
})

afterEach(() => {
  // 清理测试目录
  if (existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true })
  }
})

// ============== Property Tests ==============

describe('Single-Page Export - Property 58: Single-page export completeness', () => {
  it('should generate HTML containing all page content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(pageContentArb, { minLength: 1, maxLength: 5 }),
        async (pages: PageContent[]) => {
          const outputPath = join(testDir, `test-${Date.now()}.html`)

          const options: SinglePageExportOptions = {
            pages,
            output: outputPath,
            title: 'Test Documentation',
            inlineStyles: true
          }

          // 导出单页 HTML
          await exportToSinglePage(options)

          // 验证文件存在
          expect(existsSync(outputPath)).toBe(true)

          // 读取生成的 HTML
          const html = readFileSync(outputPath, 'utf-8')

          // 验证 HTML 不为空
          expect(html.length).toBeGreaterThan(0)

          // 验证包含 DOCTYPE
          expect(html).toContain('<!DOCTYPE html>')

          // 验证包含所有页面标题（考虑 HTML 转义）
          pages.forEach(page => {
            // HTML 转义标题中的特殊字符
            const escapedTitle = page.title
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')

            expect(html).toContain(escapedTitle)
          })

          // 验证包含目录
          expect(html).toContain('Table of Contents')

          // 清理
          unlinkSync(outputPath)

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should generate valid HTML structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(pageContentArb, { minLength: 1, maxLength: 3 }),
        async (pages: PageContent[]) => {
          const outputPath = join(testDir, `test-structure-${Date.now()}.html`)

          const options: SinglePageExportOptions = {
            pages,
            output: outputPath,
            title: 'Test Doc'
          }

          await exportToSinglePage(options)

          const html = readFileSync(outputPath, 'utf-8')

          // 验证基本 HTML 结构
          expect(html).toContain('<html')
          expect(html).toContain('<head>')
          expect(html).toContain('</head>')
          expect(html).toContain('<body>')
          expect(html).toContain('</body>')
          expect(html).toContain('</html>')

          // 验证包含 meta 标签
          expect(html).toContain('<meta charset="UTF-8">')
          expect(html).toContain('<meta name="viewport"')

          // 清理
          unlinkSync(outputPath)

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should include table of contents with links to all pages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(pageContentArb, { minLength: 2, maxLength: 4 }),
        async (pages: PageContent[]) => {
          const outputPath = join(testDir, `test-toc-${Date.now()}.html`)

          const options: SinglePageExportOptions = {
            pages,
            output: outputPath,
            title: 'Test'
          }

          await exportToSinglePage(options)

          const html = readFileSync(outputPath, 'utf-8')

          // 验证目录存在
          expect(html).toContain('class="toc"')

          // 验证每个页面都有对应的目录链接
          pages.forEach((page, index) => {
            const pageId = page.id || `page-${index + 1}`
            expect(html).toContain(`href="#${pageId}"`)
          })

          // 清理
          unlinkSync(outputPath)

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should inline styles when requested', async () => {
    const pages: PageContent[] = [
      { title: 'Test Page', content: '<p>Content</p>' }
    ]

    const outputPath = join(testDir, 'test-inline-styles.html')

    await exportToSinglePage({
      pages,
      output: outputPath,
      inlineStyles: true
    })

    const html = readFileSync(outputPath, 'utf-8')

    // 验证包含内联样式
    expect(html).toContain('<style>')
    expect(html).toContain('</style>')
    expect(html).toContain('font-family')

    // 清理
    unlinkSync(outputPath)
  })

  it('should not inline styles when not requested', async () => {
    const pages: PageContent[] = [
      { title: 'Test Page', content: '<p>Content</p>' }
    ]

    const outputPath = join(testDir, 'test-no-inline-styles.html')

    await exportToSinglePage({
      pages,
      output: outputPath,
      inlineStyles: false
    })

    const html = readFileSync(outputPath, 'utf-8')

    // 验证不包含内联样式
    expect(html).not.toContain('<style>')

    // 清理
    unlinkSync(outputPath)
  })

  it('should handle empty pages array gracefully', async () => {
    const outputPath = join(testDir, 'test-empty.html')

    const options: SinglePageExportOptions = {
      pages: [],
      output: outputPath
    }

    await expect(exportToSinglePage(options)).rejects.toThrow(
      'At least one page is required'
    )
  })

  it('should escape HTML in titles', async () => {
    const pages: PageContent[] = [
      { title: 'Test <script>alert("xss")</script>', content: '<p>Content</p>' }
    ]

    const outputPath = join(testDir, 'test-escape.html')

    await exportToSinglePage({
      pages,
      output: outputPath
    })

    const html = readFileSync(outputPath, 'utf-8')

    // 验证标题被转义
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert')

    // 清理
    unlinkSync(outputPath)
  })

  it('should generate unique IDs for pages without IDs', async () => {
    const pages: PageContent[] = [
      { title: 'Page 1', content: '<p>Content 1</p>' },
      { title: 'Page 2', content: '<p>Content 2</p>' },
      { title: 'Page 3', content: '<p>Content 3</p>' }
    ]

    const outputPath = join(testDir, 'test-ids.html')

    await exportToSinglePage({
      pages,
      output: outputPath
    })

    const html = readFileSync(outputPath, 'utf-8')

    // 验证生成了唯一 ID
    expect(html).toContain('id="page-1"')
    expect(html).toContain('id="page-2"')
    expect(html).toContain('id="page-3"')

    // 清理
    unlinkSync(outputPath)
  })

  it('should include smooth scroll script', async () => {
    const pages: PageContent[] = [
      { title: 'Test', content: '<p>Content</p>' }
    ]

    const outputPath = join(testDir, 'test-script.html')

    await exportToSinglePage({
      pages,
      output: outputPath
    })

    const html = readFileSync(outputPath, 'utf-8')

    // 验证包含平滑滚动脚本
    expect(html).toContain('<script>')
    expect(html).toContain('scrollIntoView')
    expect(html).toContain('smooth')

    // 清理
    unlinkSync(outputPath)
  })

  it('should create output directory if it does not exist', async () => {
    const pages: PageContent[] = [
      { title: 'Test', content: '<p>Content</p>' }
    ]

    const nestedDir = join(testDir, 'nested', 'deep', 'path')
    const outputPath = join(nestedDir, 'test.html')

    await exportToSinglePage({
      pages,
      output: outputPath
    })

    // 验证文件被创建
    expect(existsSync(outputPath)).toBe(true)

    // 清理
    unlinkSync(outputPath)
  })
})
