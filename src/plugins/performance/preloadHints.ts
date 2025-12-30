/**
 * 预加载提示
 * 分析导航链接、添加 preload/prefetch 标签
 */

import { resolve, join } from 'path'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import type { SiteConfig } from '../../shared/types'

export interface PreloadHintsOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 预加载策略 */
  strategy?: 'prefetch' | 'preload' | 'both'
  /** 最大预加载链接数 */
  maxLinks?: number
}

/**
 * 预加载提示主函数
 */
export async function preloadHints(
  config: SiteConfig,
  options: PreloadHintsOptions = {}
): Promise<void> {
  const {
    strategy = 'prefetch',
    maxLinks = 5
  } = options

  const outDir = config.outDir

  if (!existsSync(outDir)) {
    console.warn('Output directory does not exist, skipping preload hints')
    return
  }

  // 扫描所有 HTML 文件
  const htmlFiles = await scanHtmlFiles(outDir)

  if (htmlFiles.length === 0) {
    return
  }

  console.log(`Adding preload hints to ${htmlFiles.length} HTML files...`)

  // 分析导航链接并添加预加载提示
  for (const htmlFile of htmlFiles) {
    try {
      let html = readFileSync(htmlFile, 'utf-8')

      // 提取导航链接
      const navLinks = extractNavigationLinks(html)

      // 生成预加载标签
      const preloadTags = generatePreloadTags(navLinks, strategy, maxLinks)

      // 将预加载标签插入到 head 中
      html = insertPreloadTags(html, preloadTags)

      // 写回文件
      writeFileSync(htmlFile, html, 'utf-8')
    } catch (error) {
      console.warn(`Failed to add preload hints to ${htmlFile}:`, error)
    }
  }
}

/**
 * 扫描目录中的所有 HTML 文件
 */
async function scanHtmlFiles(dir: string): Promise<string[]> {
  const htmlFiles: string[] = []

  function scan(currentDir: string) {
    if (!existsSync(currentDir)) {
      return
    }

    const items = readdirSync(currentDir)
    for (const item of items) {
      const fullPath = join(currentDir, item)

      try {
        const stat = require('fs').statSync(fullPath)
        if (stat.isDirectory()) {
          // 跳过 assets 目录
          if (item !== 'assets' && item !== 'node_modules' && !item.startsWith('.')) {
            scan(fullPath)
          }
        } else if (item.endsWith('.html')) {
          htmlFiles.push(fullPath)
        }
      } catch {
        // 忽略无法访问的文件
      }
    }
  }

  scan(dir)
  return htmlFiles
}

/**
 * 从 HTML 中提取导航链接
 */
function extractNavigationLinks(html: string): string[] {
  const links: string[] = []

  // 匹配导航区域的链接
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>/gi

  let navMatch
  while ((navMatch = navRegex.exec(html)) !== null) {
    const navContent = navMatch[1]
    let linkMatch
    while ((linkMatch = linkRegex.exec(navContent)) !== null) {
      const href = linkMatch[1]
      // 只处理相对路径和内部链接
      if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        links.push(href)
      }
    }
  }

  // 也提取侧边栏链接
  const sidebarRegex = /<aside[^>]*>([\s\S]*?)<\/aside>/gi
  let sidebarMatch
  while ((sidebarMatch = sidebarRegex.exec(html)) !== null) {
    const sidebarContent = sidebarMatch[1]
    let linkMatch
    while ((linkMatch = linkRegex.exec(sidebarContent)) !== null) {
      const href = linkMatch[1]
      if (!href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        links.push(href)
      }
    }
  }

  // 去重
  return Array.from(new Set(links))
}

/**
 * 生成预加载标签
 */
function generatePreloadTags(
  links: string[],
  strategy: 'prefetch' | 'preload' | 'both',
  maxLinks: number
): string[] {
  const tags: string[] = []
  const limitedLinks = links.slice(0, maxLinks)

  for (const link of limitedLinks) {
    // 确定资源类型
    const as = determineResourceType(link)

    if (strategy === 'preload' || strategy === 'both') {
      tags.push(`<link rel="preload" href="${link}" as="${as}">`)
    }

    if (strategy === 'prefetch' || strategy === 'both') {
      tags.push(`<link rel="prefetch" href="${link}" as="${as}">`)
    }
  }

  return tags
}

/**
 * 确定资源类型
 */
function determineResourceType(url: string): string {
  if (url.endsWith('.js')) return 'script'
  if (url.endsWith('.css')) return 'style'
  if (url.endsWith('.woff') || url.endsWith('.woff2')) return 'font'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  return 'document'
}

/**
 * 将预加载标签插入到 HTML 的 head 中
 */
function insertPreloadTags(html: string, tags: string[]): string {
  if (tags.length === 0) {
    return html
  }

  const tagsHtml = tags.join('\n    ')

  // 在 </head> 之前插入
  return html.replace('</head>', `    ${tagsHtml}\n  </head>`)
}

/**
 * 分析页面导航模式
 */
export interface NavigationPattern {
  from: string
  to: string
  frequency: number
}

export function analyzeNavigationPatterns(
  accessLogs: Array<{ path: string; timestamp: number }>
): NavigationPattern[] {
  const patterns = new Map<string, NavigationPattern>()

  // 按时间排序
  const sorted = accessLogs.sort((a, b) => a.timestamp - b.timestamp)

  // 分析连续访问
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    // 如果两次访问间隔小于 5 分钟，认为是导航行为
    if (next.timestamp - current.timestamp < 5 * 60 * 1000) {
      const key = `${current.path}->${next.path}`
      const existing = patterns.get(key)

      if (existing) {
        existing.frequency++
      } else {
        patterns.set(key, {
          from: current.path,
          to: next.path,
          frequency: 1
        })
      }
    }
  }

  // 按频率排序
  return Array.from(patterns.values()).sort((a, b) => b.frequency - a.frequency)
}
