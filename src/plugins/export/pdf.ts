/**
 * PDF 导出功能
 * 使用 Playwright 生成 PDF
 */

import type { PDFConfig } from './index'

/**
 * PDF 页面尺寸映射
 */
const PAGE_SIZES = {
  A4: { width: '210mm', height: '297mm' },
  Letter: { width: '8.5in', height: '11in' },
  Legal: { width: '8.5in', height: '14in' }
} as const

/**
 * PDF 导出选项
 */
export interface PDFExportOptions extends PDFConfig {
  /** 要导出的 URL */
  url: string
  /** 输出文件路径 */
  output: string
  /** 是否等待网络空闲 */
  waitForNetwork?: boolean
  /** 超时时间（毫秒） */
  timeout?: number
}

/**
 * 生成 PDF 页边距配置
 */
function generateMargin(margin?: PDFConfig['margin']) {
  return {
    top: margin?.top || '1cm',
    right: margin?.right || '1cm',
    bottom: margin?.bottom || '1cm',
    left: margin?.left || '1cm'
  }
}

/**
 * 生成 PDF 页眉页脚模板
 */
function generateHeaderFooterTemplate(headerFooter?: PDFConfig['headerFooter']) {
  const header = headerFooter?.header || ''
  const footer = headerFooter?.footer || '<span class="pageNumber"></span> / <span class="totalPages"></span>'

  return {
    headerTemplate: header ? `
      <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0;">
        ${header}
      </div>
    ` : '',
    footerTemplate: footer ? `
      <div style="font-size: 10px; text-align: center; width: 100%; padding: 5px 0;">
        ${footer}
      </div>
    ` : ''
  }
}

/**
 * 导出页面为 PDF
 * 
 * @param options PDF 导出选项
 * @returns Promise<void>
 * 
 * @example
 * ```ts
 * await exportToPDF({
 *   url: 'http://localhost:5173/guide/getting-started',
 *   output: './output/guide.pdf',
 *   pageSize: 'A4',
 *   margin: {
 *     top: '2cm',
 *     bottom: '2cm'
 *   }
 * })
 * ```
 */
export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const {
    url,
    output,
    pageSize = 'A4',
    margin,
    toc = false,
    headerFooter,
    waitForNetwork = true,
    timeout = 30000
  } = options

  // 动态导入 Playwright
  let playwright: any
  try {
    playwright = await import('playwright')
  } catch (error) {
    throw new Error(
      'Playwright is not installed. Please install it with: npm install -D playwright'
    )
  }

  const browser = await playwright.chromium.launch({
    headless: true
  })

  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    // 设置超时
    page.setDefaultTimeout(timeout)

    // 导航到页面
    await page.goto(url, {
      waitUntil: waitForNetwork ? 'networkidle' : 'domcontentloaded'
    })

    // 如果需要目录，注入目录生成脚本
    if (toc) {
      await injectTOC(page)
    }

    // 获取页面尺寸
    const size = PAGE_SIZES[pageSize]
    const margins = generateMargin(margin)
    const templates = generateHeaderFooterTemplate(headerFooter)

    // 生成 PDF
    await page.pdf({
      path: output,
      format: pageSize,
      width: size.width,
      height: size.height,
      margin: margins,
      printBackground: true,
      displayHeaderFooter: !!(headerFooter?.header || headerFooter?.footer),
      headerTemplate: templates.headerTemplate,
      footerTemplate: templates.footerTemplate,
      preferCSSPageSize: false
    })
  } finally {
    await browser.close()
  }
}

/**
 * 注入目录生成脚本
 */
async function injectTOC(page: any): Promise<void> {
  await page.evaluate(() => {
    // 查找所有标题
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))

    if (headings.length === 0) return

    // 创建目录容器
    const toc = document.createElement('div')
    toc.className = 'pdf-toc'
    toc.style.cssText = `
      page-break-after: always;
      padding: 20px;
      margin-bottom: 40px;
    `

    // 添加目录标题
    const tocTitle = document.createElement('h1')
    tocTitle.textContent = 'Table of Contents'
    tocTitle.style.cssText = 'margin-bottom: 20px;'
    toc.appendChild(tocTitle)

    // 创建目录列表
    const tocList = document.createElement('ul')
    tocList.style.cssText = 'list-style: none; padding: 0;'

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1))
      const item = document.createElement('li')
      item.style.cssText = `
        margin-left: ${(level - 1) * 20}px;
        margin-bottom: 8px;
      `

      const link = document.createElement('a')
      link.textContent = heading.textContent || ''
      link.href = `#heading-${index}`
      link.style.cssText = 'text-decoration: none; color: #333;'

      // 为标题添加 ID
      heading.id = `heading-${index}`

      item.appendChild(link)
      tocList.appendChild(item)
    })

    toc.appendChild(tocList)

    // 插入到文档开头
    const content = document.querySelector('.vp-doc') || document.body
    content.insertBefore(toc, content.firstChild)
  })
}

/**
 * 批量导出多个页面为 PDF
 * 
 * @param pages 页面配置数组
 * @param baseOptions 基础配置
 * @returns Promise<void>
 * 
 * @example
 * ```ts
 * await exportMultiplePDFs([
 *   { url: 'http://localhost:5173/guide/intro', output: './intro.pdf' },
 *   { url: 'http://localhost:5173/guide/setup', output: './setup.pdf' }
 * ], {
 *   pageSize: 'A4',
 *   margin: { top: '1cm', bottom: '1cm' }
 * })
 * ```
 */
export async function exportMultiplePDFs(
  pages: Array<{ url: string; output: string }>,
  baseOptions: Omit<PDFExportOptions, 'url' | 'output'> = {}
): Promise<void> {
  for (const page of pages) {
    await exportToPDF({
      ...baseOptions,
      ...page
    })
  }
}

/**
 * 验证 PDF 配置
 */
export function validatePDFConfig(config: PDFConfig): boolean {
  // 验证页面大小
  if (config.pageSize !== undefined) {
    // Empty string or invalid values should fail
    if (!config.pageSize || !['A4', 'Letter', 'Legal'].includes(config.pageSize)) {
      return false
    }
  }

  // 验证页边距格式
  if (config.margin) {
    const marginValues = [
      config.margin.top,
      config.margin.right,
      config.margin.bottom,
      config.margin.left
    ].filter(Boolean)

    for (const value of marginValues) {
      if (value && !/^\d+(\.\d+)?(cm|mm|in|px)$/.test(value)) {
        return false
      }
    }
  }

  return true
}
