/**
 * 站点地图数据生成
 */

import type { PageData, SiteConfig } from '../shared/types'
import { getPagePath } from './pages'

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
