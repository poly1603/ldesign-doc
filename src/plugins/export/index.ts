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

  return definePlugin({
    name: 'ldoc:export',
    enforce: 'post',

    // 注入打印样式
    headStyles: enablePrintStyles ? [generatePrintStyles()] : undefined,

    // 注入导出按钮组件
    slots: formats.length > 0
      ? {
        [buttonPosition === 'nav' ? 'nav-bar-content-after' :
          buttonPosition === 'floating' ? 'back-to-top-before' :
            buttonPosition === 'doc-top' ? 'doc-before' : 'doc-after']: {
          component: 'LDocExportButton',
          props: {
            formats,
            position: buttonPosition
          },
          order: 100
        }
      }
      : undefined,

    // 注入导出脚本
    headScripts: formats.length > 0 ? [
      `window.addEventListener('ldoc:export', function(e) { 
        const format = e.detail.format; 
        if (format === 'pdf') { 
          const btn = document.querySelector('.ldoc-export-button__btn'); 
          if (btn) { 
            btn.disabled = true; 
            btn.innerHTML = '<div class="ldoc-export-button__spinner"></div><span>导出中...</span>'; 
          } 
          setTimeout(function() { window.print(); }, 100); 
          setTimeout(function() { 
            if (btn) { 
              btn.disabled = false; 
              btn.innerHTML = '<svg class="ldoc-export-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>导出文档</span>'; 
            } 
          }, 2000); 
        } 
      });`
    ] : undefined,

    // 在客户端注册导出组件
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/export/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

export default exportPlugin
