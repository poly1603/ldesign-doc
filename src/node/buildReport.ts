/**
 * 构建报告生成器
 * 
 * 生成详细的构建报告，包括：
 * - 页面数量统计
 * - 包大小分析
 * - 构建警告和建议
 */

import { existsSync, statSync, readdirSync, readFileSync } from 'fs'
import { join, relative, extname } from 'path'
import pc from 'picocolors'
import type { PageData, SiteConfig } from '../shared/types'

/**
 * 构建报告数据结构
 */
export interface BuildReport {
  /** 页面统计 */
  pages: {
    total: number
    byLanguage: Record<string, number>
    byCategory: Record<string, number>
  }
  /** 资源统计 */
  assets: {
    total: number
    totalSize: number
    byType: Record<string, { count: number; size: number }>
    largest: Array<{ file: string; size: number }>
  }
  /** 构建警告 */
  warnings: BuildWarning[]
  /** 构建建议 */
  suggestions: BuildSuggestion[]
  /** 构建时间 */
  duration: number
}

/**
 * 构建警告
 */
export interface BuildWarning {
  type: 'large-bundle' | 'missing-meta' | 'broken-link' | 'deprecated-api'
  message: string
  file?: string
  severity: 'warning' | 'error'
}

/**
 * 构建建议
 */
export interface BuildSuggestion {
  type: 'optimization' | 'seo' | 'accessibility' | 'performance'
  message: string
  action?: string
}

/**
 * 生成构建报告
 */
export function generateBuildReport(
  config: SiteConfig,
  pages: PageData[],
  duration: number
): BuildReport {
  const report: BuildReport = {
    pages: analyzePages(pages),
    assets: analyzeAssets(config.outDir),
    warnings: [],
    suggestions: [],
    duration
  }

  // 生成警告
  report.warnings = generateWarnings(report, config)

  // 生成建议
  report.suggestions = generateSuggestions(report, config, pages)

  return report
}

/**
 * 分析页面统计
 */
function analyzePages(pages: PageData[]): BuildReport['pages'] {
  const byLanguage: Record<string, number> = {}
  const byCategory: Record<string, number> = {}

  for (const page of pages) {
    // 统计语言
    const lang = (page.frontmatter?.lang as string) || 'default'
    byLanguage[lang] = (byLanguage[lang] || 0) + 1

    // 统计分类
    const category = (page.frontmatter?.category as string) || 'uncategorized'
    byCategory[category] = (byCategory[category] || 0) + 1
  }

  return {
    total: pages.length,
    byLanguage,
    byCategory
  }
}

/**
 * 分析资源文件
 */
function analyzeAssets(outDir: string): BuildReport['assets'] {
  const assets: BuildReport['assets'] = {
    total: 0,
    totalSize: 0,
    byType: {},
    largest: []
  }

  if (!existsSync(outDir)) {
    return assets
  }

  const allFiles: Array<{ file: string; size: number; ext: string }> = []

  // 递归扫描输出目录
  function scanDir(dir: string) {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        scanDir(fullPath)
      } else {
        const size = stat.size
        const ext = extname(item).toLowerCase()
        const relativePath = relative(outDir, fullPath)

        allFiles.push({ file: relativePath, size, ext })

        assets.total++
        assets.totalSize += size

        // 按类型统计
        if (!assets.byType[ext]) {
          assets.byType[ext] = { count: 0, size: 0 }
        }
        assets.byType[ext].count++
        assets.byType[ext].size += size
      }
    }
  }

  scanDir(outDir)

  // 找出最大的文件
  assets.largest = allFiles
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)

  return assets
}

/**
 * 生成构建警告
 */
function generateWarnings(report: BuildReport, config: SiteConfig): BuildWarning[] {
  const warnings: BuildWarning[] = []

  // 检查大文件
  const largeThreshold = (config.build.chunkSizeWarningLimit || 500) * 1024 // 转换为字节
  for (const file of report.assets.largest) {
    if (file.size > largeThreshold) {
      warnings.push({
        type: 'large-bundle',
        message: `Large bundle detected: ${file.file} (${formatSize(file.size)})`,
        file: file.file,
        severity: 'warning'
      })
    }
  }

  // 检查 JS 包总大小
  const jsSize = report.assets.byType['.js']?.size || 0
  if (jsSize > 1024 * 1024) { // 1MB
    warnings.push({
      type: 'large-bundle',
      message: `Total JavaScript size is ${formatSize(jsSize)}. Consider code splitting.`,
      severity: 'warning'
    })
  }

  return warnings
}

/**
 * 生成构建建议
 */
function generateSuggestions(
  report: BuildReport,
  config: SiteConfig,
  pages: PageData[]
): BuildSuggestion[] {
  const suggestions: BuildSuggestion[] = []

  // 检查是否有页面缺少描述
  const pagesWithoutDesc = pages.filter(p => !p.frontmatter?.description)
  if (pagesWithoutDesc.length > 0) {
    suggestions.push({
      type: 'seo',
      message: `${pagesWithoutDesc.length} pages are missing meta descriptions`,
      action: 'Add "description" field to frontmatter for better SEO'
    })
  }

  // 检查是否启用了图片优化
  const markdownConfig = config.markdown as any
  if (!markdownConfig?.image?.lazyLoading) {
    suggestions.push({
      type: 'performance',
      message: 'Image lazy loading is not enabled',
      action: 'Enable markdown.image.lazyLoading in config for better performance'
    })
  }

  // 检查是否有很多小文件
  const smallFiles = report.assets.largest.filter(f => f.size < 1024).length
  if (smallFiles > 20) {
    suggestions.push({
      type: 'optimization',
      message: `${smallFiles} small files detected`,
      action: 'Consider bundling small assets to reduce HTTP requests'
    })
  }

  // 检查 CSS 大小
  const cssSize = report.assets.byType['.css']?.size || 0
  if (cssSize > 200 * 1024) { // 200KB
    suggestions.push({
      type: 'performance',
      message: `CSS size is ${formatSize(cssSize)}`,
      action: 'Consider removing unused CSS or splitting styles'
    })
  }

  // 检查是否启用了 minify
  if (!config.build.minify) {
    suggestions.push({
      type: 'optimization',
      message: 'Minification is disabled',
      action: 'Enable build.minify for smaller bundle sizes'
    })
  }

  return suggestions
}

/**
 * 打印构建报告
 */
export function printBuildReport(report: BuildReport): void {
  console.log()
  console.log(pc.bold(pc.cyan('📊 Build Report')))
  console.log(pc.gray('─'.repeat(50)))
  console.log()

  // 页面统计
  console.log(pc.bold(pc.white('📄 Pages')))
  console.log(`  Total: ${pc.green(String(report.pages.total))}`)

  if (Object.keys(report.pages.byLanguage).length > 1) {
    console.log(`  By Language:`)
    for (const [lang, count] of Object.entries(report.pages.byLanguage)) {
      console.log(`    ${lang}: ${pc.cyan(String(count))}`)
    }
  }

  if (Object.keys(report.pages.byCategory).length > 1) {
    console.log(`  By Category:`)
    for (const [category, count] of Object.entries(report.pages.byCategory)) {
      console.log(`    ${category}: ${pc.cyan(String(count))}`)
    }
  }
  console.log()

  // 资源统计
  console.log(pc.bold(pc.white('📦 Assets')))
  console.log(`  Total Files: ${pc.green(String(report.assets.total))}`)
  console.log(`  Total Size: ${pc.green(formatSize(report.assets.totalSize))}`)
  console.log(`  By Type:`)

  const sortedTypes = Object.entries(report.assets.byType)
    .sort((a, b) => b[1].size - a[1].size)

  for (const [ext, data] of sortedTypes) {
    const extLabel = ext || 'no extension'
    console.log(`    ${extLabel}: ${pc.cyan(String(data.count))} files, ${pc.cyan(formatSize(data.size))}`)
  }

  if (report.assets.largest.length > 0) {
    console.log(`  Largest Files:`)
    for (const file of report.assets.largest.slice(0, 5)) {
      console.log(`    ${pc.gray(file.file)}: ${pc.yellow(formatSize(file.size))}`)
    }
  }
  console.log()

  // 警告
  if (report.warnings.length > 0) {
    console.log(pc.bold(pc.yellow('⚠️  Warnings')))
    for (const warning of report.warnings) {
      const icon = warning.severity === 'error' ? pc.red('✗') : pc.yellow('⚠')
      const fileInfo = warning.file ? pc.gray(` (${warning.file})`) : ''
      console.log(`  ${icon} ${warning.message}${fileInfo}`)
    }
    console.log()
  }

  // 建议
  if (report.suggestions.length > 0) {
    console.log(pc.bold(pc.blue('💡 Suggestions')))
    for (const suggestion of report.suggestions) {
      console.log(`  ${pc.blue('•')} ${suggestion.message}`)
      if (suggestion.action) {
        console.log(`    ${pc.gray('→')} ${pc.gray(suggestion.action)}`)
      }
    }
    console.log()
  }

  // 构建时间
  console.log(pc.gray('─'.repeat(50)))
  console.log(`  ${pc.dim('Build completed in')} ${pc.green(formatDuration(report.duration))}`)
  console.log()
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

/**
 * 格式化时长
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  } else {
    return `${(ms / 1000).toFixed(2)}s`
  }
}

/**
 * 将构建报告保存为 JSON 文件
 */
export function saveBuildReport(report: BuildReport, outDir: string): void {
  const reportPath = join(outDir, 'build-report.json')
  const fs = require('fs')

  fs.writeFileSync(
    reportPath,
    JSON.stringify(report, null, 2),
    'utf-8'
  )

  console.log(`  ${pc.dim('Report saved to')} ${pc.cyan(reportPath)}`)
}
