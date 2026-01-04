/**
 * 导出插件 - 支持打印优化和多格式导出
 * 
 * 功能：
 * - 打印样式优化
 * - PDF 导出
 * - EPUB 导出 (实验性功能)
 * - 单页 HTML 导出
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'

import type { Plugin as VitePlugin } from 'vite'

// 导出 PDF 功能
export { exportToPDF, exportMultiplePDFs, validatePDFConfig } from './pdf'
export type { PDFExportOptions, PDFConfig } from './pdf'

// 导出 EPUB 功能 (实验性 - 需要 epub-gen-memory 依赖)
// export { exportToEPUB, exportURLsToEPUB, validateEPUBConfig } from './epub'
// export type { EPUBExportOptions, EPUBPage } from './epub'

// EPUB 功能临时禁用，直到添加依赖
export const exportToEPUB = () => {
  throw new Error('EPUB export is experimental and requires epub-gen-memory package. Install it with: npm install epub-gen-memory')
}
export const exportURLsToEPUB = () => {
  throw new Error('EPUB export is experimental and requires epub-gen-memory package. Install it with: npm install epub-gen-memory')
}
export const validateEPUBConfig = () => false

export type EPUBExportOptions = any
export type EPUBPage = any

// 导出单页 HTML 功能
export { exportToSinglePage, exportURLsToSinglePage } from './singlePage'
export type { SinglePageExportOptions, PageContent } from './singlePage'

// ============== 类型定义 ==============

// Import PDFConfig from pdf.ts
import type { PDFConfig } from './pdf'

/**
 * EPUB 导出配置
 */
export interface EPUBConfig {
  title?: string
  author?: string
  cover?: string
  language?: string
}

/**
 * 单页 HTML 配置
 */
export interface HTMLConfig {
  /** 是否内联样式 */
  inlineStyles?: boolean
  /** 是否内联图片 */
  inlineImages?: boolean
}

/**
 * 导出插件选项
 */
export interface ExportOptions {
  /** 支持的导出格式 */
  formats?: ('pdf' | 'epub' | 'html')[]
  /** PDF 配置 */
  pdf?: PDFConfig
  /** EPUB 配置 */
  epub?: EPUBConfig
  /** 单页 HTML 配置 */
  html?: HTMLConfig
  /** 导出按钮位置 */
  buttonPosition?: 'nav' | 'doc-top' | 'doc-bottom' | 'floating'
  /** 是否启用打印样式优化 */
  enablePrintStyles?: boolean
}

// ============== 打印样式生成 ==============

/**
 * 生成打印优化样式
 */
export function generatePrintStyles(): string {
  return `
/* ==================== 打印样式优化 ==================== */
@media print {
  /* 隐藏导航和侧边栏 */
  .vp-nav,
  .vp-sidebar,
  .vp-local-nav,
  .back-to-top,
  .vp-doc-footer-nav,
  .vp-related-pages,
  .vp-social-share {
    display: none !important;
  }

  /* 优化内容区域 */
  .vp-doc {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* 优化代码块 */
  .vp-code-group,
  div[class*="language-"] {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 优化图片 */
  img {
    max-width: 100% !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 优化表格 */
  table {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* 优化标题 */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* 显示链接 URL */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* 移除不必要的阴影和边框 */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }

  /* 确保黑白打印可读 */
  body {
    color: #000 !important;
    background: #fff !important;
  }

  /* 优化代码块颜色 */
  code,
  pre {
    color: #000 !important;
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
  }
}
`.trim()
}

/**
 * 检查 HTML 是否包含打印样式
 * @param html HTML 字符串
 * @returns 是否包含打印样式
 */
export function hasPrintStyles(html: string): boolean {
  return html.includes('@media print') || html.includes('@media\\20print')
}

// ============== 插件实现 ==============

/**
 * 导出插件
 * 
 * @example
 * ```ts
 * import { exportPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     exportPlugin({
 *       formats: ['pdf', 'epub', 'html'],
 *       enablePrintStyles: true,
 *       pdf: {
 *         pageSize: 'A4',
 *         margin: {
 *           top: '1cm',
 *           right: '1cm',
 *           bottom: '1cm',
 *           left: '1cm'
 *         }
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function exportPlugin(options: ExportOptions = {}): LDocPlugin {
  const {
    formats = ['pdf'],
    enablePrintStyles = true,
    buttonPosition = 'doc-bottom'
  } = options

  const pdfOptions = options.pdf

  const mappedFormats = formats.map((f) => ({
    value: f,
    label: f === 'pdf' ? 'PDF' : f === 'html' ? 'HTML' : f === 'epub' ? 'EPUB' : String(f).toUpperCase()
  }))

  return definePlugin({
    name: 'ldoc:export',
    enforce: 'post',

    vitePlugins() {
      const plugin: VitePlugin = {
        name: 'ldoc:export-endpoint',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            try {
              if (!req.url) return next()
              const url = new URL(req.url, 'http://localhost')
              if (url.pathname !== '/__ldoc/export') return next()

              const format = (url.searchParams.get('format') || 'pdf').toLowerCase()
              const path = url.searchParams.get('path') || '/'

              const protocol = server.config.server.https ? 'https' : 'http'
              const host = req.headers.host
              let resolvedPort = server.config.server.port
              if (!resolvedPort) {
                const addr = server.httpServer?.address()
                if (addr && typeof addr === 'object') resolvedPort = addr.port
              }
              const baseHost = host || (resolvedPort ? `localhost:${resolvedPort}` : 'localhost')
              const base = `${protocol}://${baseHost}`
              const normalizedPath = path.startsWith('/') ? path : `/${path}`
              const targetUrl = new URL(normalizedPath, base).toString()

              if (format === 'pdf') {
                const resolvedPdf = pdfOptions || {}
                const resolvedPageSize = resolvedPdf.pageSize || 'A4'
                const resolvedMargin = resolvedPdf.margin
                const resolvedScale = typeof resolvedPdf.scale === 'number' ? resolvedPdf.scale : 0.98
                const resolvedPrintBackground = resolvedPdf.printBackground !== false
                const resolvedDisplayHeaderFooter = !!(resolvedPdf.headerFooter?.header || resolvedPdf.headerFooter?.footer)
                const resolvedHeaderTemplate = resolvedDisplayHeaderFooter
                  ? (resolvedPdf.headerFooter?.header || '<span></span>')
                  : ''
                const resolvedFooterTemplate = resolvedDisplayHeaderFooter
                  ? (resolvedPdf.headerFooter?.footer || '<span></span>')
                  : ''

                const mTop = resolvedMargin?.top || '14mm'
                const mRight = resolvedMargin?.right || '14mm'
                const mBottom = resolvedMargin?.bottom || '16mm'
                const mLeft = resolvedMargin?.left || '14mm'

                const pdfCss = `
@media print {
  @page {
    margin: ${mTop} ${mRight} ${mBottom} ${mLeft};
  }

  html, body {
    background: #fff !important;
  }

  body {
    font-size: 13px !important;
    line-height: 1.65 !important;
    color: #111827 !important;
  }

  .vp-nav,
  .vp-sidebar,
  .vp-local-nav,
  .back-to-top,
  .vp-related-pages,
  .vp-social-share,
  .vp-breadcrumb,
  .vp-doc-edit,
  .vp-doc-pagination,
  .vp-subpage-toc,
  .skip-link,
  .ldoc-export-button {
    display: none !important;
  }

  .vp-doc {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }

  .vp-doc-content {
    max-width: 920px !important;
    margin: 0 auto !important;
  }

  .vp-doc-title {
    font-size: 28px !important;
    margin: 0 0 12px !important;
    line-height: 1.25 !important;
  }

  .vp-doc-body h2 {
    margin: 26px 0 10px !important;
    padding-bottom: 6px !important;
    break-after: avoid;
    page-break-after: avoid;
  }

  .vp-doc-body h3 {
    margin: 18px 0 8px !important;
    break-after: avoid;
    page-break-after: avoid;
  }

  .vp-doc-body p {
    margin: 10px 0 !important;
  }

  .vp-doc-body pre {
    padding: 12px !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .vp-doc-body pre code {
    font-size: 11px !important;
    line-height: 1.55 !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }

  .vp-doc-body code {
    font-size: 0.92em !important;
  }

  .vp-doc-body table {
    font-size: 12px !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .vp-doc-body blockquote {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .vp-doc-body img {
    max-width: 100% !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .vp-doc-body ul, .vp-doc-body ol {
    margin: 10px 0 !important;
  }

  .vp-doc-body li {
    margin: 6px 0 !important;
  }

  .vp-doc-body th, .vp-doc-body td {
    padding: 8px 10px !important;
  }

  .vp-doc-body a {
    color: #2563eb !important;
  }

  .custom-block {
    border-radius: 8px !important;
    padding: 10px 12px !important;
    margin: 12px 0 !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .custom-block-title {
    margin: 0 0 6px !important;
  }
}`.trim()

                let playwright: any
                try {
                  const id = 'play' + 'wright'
                  playwright = await import(/* @vite-ignore */ id)
                } catch {
                  res.statusCode = 500
                  res.setHeader('content-type', 'application/json; charset=utf-8')
                  res.end(JSON.stringify({
                    message: 'Playwright is not installed. Please install it with: pnpm add -D playwright'
                  }))
                  return
                }

                const browser = await playwright.chromium.launch({ headless: true })
                try {
                  const context = await browser.newContext()
                  const page = await context.newPage()
                  page.setDefaultTimeout(60000)
                  page.setDefaultNavigationTimeout(60000)
                  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
                  try {
                    await page.waitForLoadState('networkidle', { timeout: 30000 })
                  } catch {
                    // ignore
                  }
                  try {
                    await page.waitForSelector('.vp-doc-body', { timeout: 30000 })
                  } catch {
                    // ignore
                  }
                  try {
                    await page.evaluate(() => {
                      const d = document as any
                      return d?.fonts?.ready || Promise.resolve(true)
                    })
                  } catch {
                    // ignore
                  }

                  try {
                    await page.waitForFunction(() => {
                      const nodes = Array.from(document.querySelectorAll('.mermaid, .ldoc-echarts')) as HTMLElement[]
                      if (nodes.length === 0) return true
                      return nodes.every(n => n.getAttribute('data-rendered') === 'true')
                    }, { timeout: 30000 })
                  } catch {
                    // ignore
                  }

                  try {
                    await page.emulateMediaType('print')
                  } catch {
                    // ignore
                  }

                  try {
                    await page.addStyleTag({ content: pdfCss })
                  } catch {
                    // ignore
                  }

                  const pdfBuffer = await page.pdf({
                    format: resolvedPageSize,
                    margin: resolvedMargin || {
                      top: '14mm',
                      right: '14mm',
                      bottom: '16mm',
                      left: '14mm'
                    },
                    printBackground: resolvedPrintBackground,
                    scale: resolvedScale,
                    displayHeaderFooter: resolvedDisplayHeaderFooter,
                    headerTemplate: resolvedHeaderTemplate,
                    footerTemplate: resolvedFooterTemplate,
                    preferCSSPageSize: false
                  })

                  res.statusCode = 200
                  res.setHeader('content-type', 'application/pdf')
                  res.setHeader('content-disposition', `attachment; filename="ldoc-export.pdf"`)
                  res.setHeader('content-length', String(pdfBuffer.length))
                  res.setHeader('accept-ranges', 'bytes')
                  res.end(pdfBuffer)
                  return
                } finally {
                  await browser.close()
                }
              }

              if (format === 'html') {
                let playwright: any
                try {
                  const id = 'play' + 'wright'
                  playwright = await import(/* @vite-ignore */ id)
                } catch {
                  // 无 Playwright 时退化：直接返回当前页面的静态 HTML（不含 SSR，适用于简单导出）
                  res.statusCode = 500
                  res.setHeader('content-type', 'application/json; charset=utf-8')
                  res.end(JSON.stringify({
                    message: 'Playwright is required for HTML export in dev server. Install it with: pnpm add -D playwright'
                  }))
                  return
                }

                const browser = await playwright.chromium.launch({ headless: true })
                try {
                  const context = await browser.newContext()
                  const page = await context.newPage()
                  await page.goto(targetUrl, { waitUntil: 'networkidle' })

                  try {
                    await page.waitForFunction(() => {
                      const nodes = Array.from(document.querySelectorAll('.mermaid, .ldoc-echarts')) as HTMLElement[]
                      if (nodes.length === 0) return true
                      return nodes.every(n => n.getAttribute('data-rendered') === 'true')
                    }, { timeout: 30000 })
                  } catch {
                    // ignore
                  }

                  const html = await page.content()

                  res.statusCode = 200
                  res.setHeader('content-type', 'text/html; charset=utf-8')
                  res.setHeader('content-disposition', `attachment; filename="ldoc-export.html"`)
                  res.setHeader('content-length', String(Buffer.byteLength(html, 'utf-8')))
                  res.end(html)
                  return
                } finally {
                  await browser.close()
                }
              }

              res.statusCode = 400
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ message: `Unsupported export format: ${format}` }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json; charset=utf-8')
              const message = err instanceof Error ? err.message : String(err)
              const stack = err instanceof Error ? err.stack : undefined
              res.end(JSON.stringify({ message: 'Export failed', error: message, stack }))
            }
          })
        }
      }

      return [plugin]
    },

    // 注入打印样式
    headStyles: enablePrintStyles ? [generatePrintStyles()] : undefined,

    // 注入导出按钮组件
    slots: mappedFormats.length > 0
      ? {
        [buttonPosition === 'nav' ? 'nav-bar-content-after' :
          buttonPosition === 'floating' ? 'back-to-top-before' :
            buttonPosition === 'doc-top' ? 'doc-before' : 'doc-after']: {
          component: 'LDocExportButton',
          props: {
            formats: mappedFormats,
            position: buttonPosition
          },
          order: 100
        }
      }
      : undefined,

    // 在客户端注册导出组件
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/export/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

export default exportPlugin
