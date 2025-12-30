/**
 * 站点地图数据生成
 *
 * 功能:
 * - 构建内部站点地图数据
 * - 生成标准 sitemap.xml
 * - 生成 robots.txt
 *
 * @module sitemap
 */

import type { PageData, SiteConfig } from '../shared/types'
import { getPagePath } from './pages'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

export interface SitemapPage {
  title: string
  description: string
  path: string
  relativePath: string
  category?: string
  tags?: string[]
  lastUpdated?: number
}

export interface SitemapCategory {
  name: string
  pages: SitemapPage[]
  count: number
}

export interface SitemapData {
  pages: SitemapPage[]
  categories: Record<string, SitemapCategory>
}

/**
 * 从页面路径提取分类
 * 例如: "guide/getting-started.md" -> "guide"
 */
function extractCategory(relativePath: string): string {
  const parts = relativePath.split('/')

  // 如果在根目录，返回 "Root"
  if (parts.length === 1) {
    return 'Root'
  }

  // 返回第一级目录名，首字母大写
  const category = parts[0]
  return category.charAt(0).toUpperCase() + category.slice(1)
}

/**
 * 构建站点地图数据
 */
export function buildSitemapData(pages: PageData[], config: SiteConfig): SitemapData {
  const sitemapPages: SitemapPage[] = []
  const categories: Record<string, SitemapCategory> = {}

  for (const page of pages) {
    // 跳过隐藏页面
    if (page.frontmatter.hidden === true) {
      continue
    }

    // 从 frontmatter 或路径提取分类
    const category = (page.frontmatter.category as string) || extractCategory(page.relativePath)

    // 从 frontmatter 提取标签
    const tags = Array.isArray(page.frontmatter.tags)
      ? (page.frontmatter.tags as string[])
      : []

    const sitemapPage: SitemapPage = {
      title: page.title,
      description: page.description,
      path: getPagePath(page.relativePath, config.base),
      relativePath: page.relativePath,
      category,
      tags,
      lastUpdated: page.lastUpdated
    }

    sitemapPages.push(sitemapPage)

    // 添加到分类
    if (!categories[category]) {
      categories[category] = {
        name: category,
        pages: [],
        count: 0
      }
    }

    categories[category].pages.push(sitemapPage)
    categories[category].count++
  }

  // 按标题排序每个分类的页面
  for (const category of Object.values(categories)) {
    category.pages.sort((a, b) => a.title.localeCompare(b.title))
  }

  return {
    pages: sitemapPages.sort((a, b) => a.title.localeCompare(b.title)),
    categories
  }
}

/**
 * 生成站点地图页面数据
 */
export function generateSitemapPageData(sitemapData: SitemapData): {
  title: string
  description: string
  pages: SitemapPage[]
  categories: SitemapCategory[]
} {
  return {
    title: 'Site Map',
    description: `Browse all ${sitemapData.pages.length} pages in this documentation`,
    pages: sitemapData.pages,
    categories: Object.values(sitemapData.categories).sort((a, b) => b.count - a.count)
  }
}

// ============================================================================
// Sitemap XML 生成
// ============================================================================

/**
 * Sitemap XML 生成配置
 */
export interface SitemapXmlOptions {
  /** 站点主机名（包含协议） */
  hostname: string
  /** 输出目录 */
  outDir: string
  /** 页面列表 */
  pages: SitemapXmlPage[]
  /** 默认更新频率 */
  defaultChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  /** 默认优先级 */
  defaultPriority?: number
  /** 是否生成 robots.txt */
  generateRobots?: boolean
  /** robots.txt 额外规则 */
  robotsRules?: string[]
  /** 排除的路径模式 */
  exclude?: (string | RegExp)[]
  /** 文件名 */
  filename?: string
}

/**
 * Sitemap XML 页面信息
 */
export interface SitemapXmlPage {
  /** 页面路径 */
  url: string
  /** 最后修改时间 */
  lastmod?: string | Date | number
  /** 更新频率 */
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  /** 优先级 (0.0 - 1.0) */
  priority?: number
  /** 多语言链接 */
  alternates?: Array<{ hreflang: string; href: string }>
}

/**
 * 格式化日期为 W3C 格式
 */
function formatDateW3C(date: string | Date | number): string {
  const d = typeof date === 'number'
    ? new Date(date)
    : typeof date === 'string'
      ? new Date(date)
      : date
  return d.toISOString().split('T')[0]
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * 规范化 URL
 */
function normalizeUrl(hostname: string, path: string): string {
  const base = hostname.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * 检查路径是否被排除
 */
function isExcluded(path: string, excludePatterns: (string | RegExp)[]): boolean {
  return excludePatterns.some(pattern => {
    if (typeof pattern === 'string') {
      return path === pattern || path.startsWith(pattern)
    }
    return pattern.test(path)
  })
}

/**
 * 生成 Sitemap XML 文件
 *
 * @description 根据页面列表生成标准的 sitemap.xml 文件
 *
 * @example
 * ```ts
 * await generateSitemapXml({
 *   hostname: 'https://ldesign.dev',
 *   outDir: './dist',
 *   pages: [
 *     { url: '/', priority: 1.0 },
 *     { url: '/guide/', changefreq: 'weekly' },
 *     { url: '/api/', lastmod: new Date() }
 *   ]
 * })
 * ```
 */
export async function generateSitemapXml(options: SitemapXmlOptions): Promise<string> {
  const {
    hostname,
    outDir,
    pages,
    defaultChangefreq = 'weekly',
    defaultPriority = 0.5,
    generateRobots = true,
    robotsRules = [],
    exclude = [],
    filename = 'sitemap.xml'
  } = options

  // 过滤排除的页面
  const filteredPages = pages.filter(page => !isExcluded(page.url, exclude))

  // 检查是否有多语言链接
  const hasAlternates = filteredPages.some(p => p.alternates && p.alternates.length > 0)

  // 生成 XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
  if (hasAlternates) {
    xml += ' xmlns:xhtml="http://www.w3.org/1999/xhtml"'
  }
  xml += '>\n'

  for (const page of filteredPages) {
    const fullUrl = normalizeUrl(hostname, page.url)
    const changefreq = page.changefreq || defaultChangefreq
    const priority = page.priority ?? defaultPriority

    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(fullUrl)}</loc>\n`

    if (page.lastmod) {
      xml += `    <lastmod>${formatDateW3C(page.lastmod)}</lastmod>\n`
    }

    if (changefreq) {
      xml += `    <changefreq>${changefreq}</changefreq>\n`
    }

    if (priority !== undefined) {
      xml += `    <priority>${priority.toFixed(1)}</priority>\n`
    }

    // 多语言链接
    if (page.alternates && page.alternates.length > 0) {
      for (const alt of page.alternates) {
        const altUrl = normalizeUrl(hostname, alt.href)
        xml += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(altUrl)}" />\n`
      }
    }

    xml += '  </url>\n'
  }

  xml += '</urlset>\n'

  // 确保输出目录存在
  const outputPath = join(outDir, filename)
  const dir = dirname(outputPath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  // 写入 sitemap.xml
  await writeFile(outputPath, xml, 'utf-8')
  console.log(`✅ Sitemap generated: ${outputPath} (${filteredPages.length} URLs)`)

  // 生成 robots.txt
  if (generateRobots) {
    await generateRobotsTxt({
      outDir,
      sitemapUrl: normalizeUrl(hostname, `/${filename}`),
      rules: robotsRules
    })
  }

  return xml
}

/**
 * Robots.txt 生成配置
 */
export interface RobotsTxtOptions {
  /** 输出目录 */
  outDir: string
  /** Sitemap URL */
  sitemapUrl?: string
  /** 自定义规则 */
  rules?: string[]
  /** 禁止爬取的路径 */
  disallow?: string[]
  /** 允许爬取的路径 */
  allow?: string[]
}

/**
 * 生成 robots.txt
 *
 * @example
 * ```ts
 * await generateRobotsTxt({
 *   outDir: './dist',
 *   sitemapUrl: 'https://example.com/sitemap.xml',
 *   disallow: ['/admin/', '/private/']
 * })
 * ```
 */
export async function generateRobotsTxt(options: RobotsTxtOptions): Promise<void> {
  const {
    outDir,
    sitemapUrl,
    rules = [],
    disallow = [],
    allow = []
  } = options

  let content = '# Robots.txt generated by @ldesign/doc\n\n'
  content += 'User-agent: *\n'

  // 添加 Allow 规则
  for (const path of allow) {
    content += `Allow: ${path}\n`
  }

  // 添加 Disallow 规则
  for (const path of disallow) {
    content += `Disallow: ${path}\n`
  }

  // 默认允许所有
  if (disallow.length === 0) {
    content += 'Disallow:\n'
  }

  // 添加自定义规则
  if (rules.length > 0) {
    content += '\n'
    content += rules.join('\n')
    content += '\n'
  }

  // 添加 Sitemap
  if (sitemapUrl) {
    content += `\nSitemap: ${sitemapUrl}\n`
  }

  const outputPath = join(outDir, 'robots.txt')
  await writeFile(outputPath, content, 'utf-8')
  console.log(`✅ Robots.txt generated: ${outputPath}`)
}

/**
 * 从 SitemapData 生成 Sitemap XML
 *
 * @description 便捷方法，直接从 buildSitemapData 的结果生成 sitemap.xml
 */
export async function generateSitemapXmlFromData(
  sitemapData: SitemapData,
  options: Omit<SitemapXmlOptions, 'pages'>
): Promise<string> {
  const pages: SitemapXmlPage[] = sitemapData.pages.map(page => ({
    url: page.path,
    lastmod: page.lastUpdated,
    changefreq: 'weekly' as const,
    priority: page.path === '/' ? 1.0 : 0.7
  }))

  return generateSitemapXml({ ...options, pages })
}
