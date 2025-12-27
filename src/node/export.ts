/**
 * 导出命令 - 支持 PDF、EPUB、HTML 导出
 */

import { resolve } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { logger } from './logger'
import { exportToPDF } from '../plugins/export/pdf'
import { exportURLsToEPUB } from '../plugins/export/epub'
import type { PDFConfig, EPUBConfig } from '../plugins/export'

/**
 * 导出命令选项
 */
export interface ExportCommandOptions {
  /** 导出格式 */
  format: 'pdf' | 'epub' | 'html'
  /** 输出目录 */
  output?: string
  /** 要导出的页面路径（相对于站点根目录） */
  pages?: string[]
  /** PDF 配置 */
  pdf?: PDFConfig
  /** EPUB 配置 */
  epub?: EPUBConfig
  /** 开发服务器 URL */
  baseUrl?: string
}

/**
 * 执行导出命令
 */
export async function exportCommand(
  root: string,
  options: ExportCommandOptions
): Promise<void> {
  const { format, output = './export', pages = [], pdf, epub, baseUrl = 'http://localhost:5173' } = options

  logger.info(`Starting ${format.toUpperCase()} export...`)

  // 确保输出目录存在
  const outputDir = resolve(root, output)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  try {
    switch (format) {
      case 'pdf':
        await exportPDF(baseUrl, pages, outputDir, pdf)
        break
      case 'epub':
        await exportEPUB(baseUrl, pages, outputDir, epub)
        break
      case 'html':
        logger.warn('HTML export is not yet implemented')
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }

    logger.success(`Export completed! Files saved to: ${outputDir}`)
  } catch (error) {
    logger.error(`Export failed: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

/**
 * 导出 PDF
 */
async function exportPDF(
  baseUrl: string,
  pages: string[],
  outputDir: string,
  config?: PDFConfig
): Promise<void> {
  if (pages.length === 0) {
    // 如果没有指定页面，导出首页
    pages = ['/']
  }

  for (const page of pages) {
    const url = `${baseUrl}${page.startsWith('/') ? page : '/' + page}`
    const filename = page === '/' ? 'index.pdf' : `${page.replace(/\//g, '-')}.pdf`
    const output = resolve(outputDir, filename)

    logger.info(`Exporting: ${url} -> ${filename}`)

    await exportToPDF({
      url,
      output,
      ...config
    })
  }
}

/**
 * 导出 EPUB
 */
async function exportEPUB(
  baseUrl: string,
  pages: string[],
  outputDir: string,
  config?: EPUBConfig
): Promise<void> {
  if (pages.length === 0) {
    // 如果没有指定页面，导出首页
    pages = ['/']
  }

  // 构建完整的 URL 列表
  const urls = pages.map(page =>
    `${baseUrl}${page.startsWith('/') ? page : '/' + page}`
  )

  // 生成输出文件名
  const filename = pages.length === 1 && pages[0] === '/'
    ? 'documentation.epub'
    : 'documentation.epub'
  const output = resolve(outputDir, filename)

  logger.info(`Exporting ${urls.length} page(s) to EPUB...`)

  await exportURLsToEPUB(urls, output, config)
}
