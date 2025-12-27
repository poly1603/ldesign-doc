/**
 * 标签系统 - 标签索引和管理
 */

import type { PageData, SiteConfig } from '../shared/types'

/**
 * 标签信息
 */
export interface TagInfo {
  /** 标签名称 */
  name: string
  /** 标签下的页面数量 */
  count: number
  /** 标签下的页面列表 */
  pages: TaggedPage[]
}

/**
 * 带标签的页面信息
 */
export interface TaggedPage {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description: string
  /** 页面相对路径 */
  relativePath: string
  /** 页面 URL 路径 */
  path: string
  /** 页面标签 */
  tags: string[]
  /** 最后更新时间 */
  lastUpdated?: number
}

/**
 * 标签索引
 */
export interface TagIndex {
  /** 所有标签的映射 */
  tags: Map<string, TagInfo>
  /** 所有带标签的页面 */
  pages: TaggedPage[]
}

/**
 * 从页面数据中提取标签
 */
export function extractTags(pageData: PageData): string[] {
  const tags = pageData.frontmatter.tags

  if (!tags) {
    return []
  }

  // 支持字符串或数组格式
  if (typeof tags === 'string') {
    return [tags.trim()].filter(Boolean)
  }

  if (Array.isArray(tags)) {
    const tagList = tags
      .filter(tag => typeof tag === 'string')
      .map(tag => tag.trim())
      .filter(Boolean)

    // Deduplicate tags
    return Array.from(new Set(tagList))
  }

  return []
}

/**
 * 构建标签索引
 */
export function buildTagIndex(pages: PageData[], config: SiteConfig): TagIndex {
  const tagMap = new Map<string, TagInfo>()
  const taggedPages: TaggedPage[] = []

  for (const page of pages) {
    const tags = extractTags(page)

    if (tags.length === 0) {
      continue
    }

    // 计算页面 URL 路径
    const path = getPagePath(page.relativePath, config.base)

    // 创建带标签的页面信息
    const taggedPage: TaggedPage = {
      title: page.title,
      description: page.description,
      relativePath: page.relativePath,
      path,
      tags,
      lastUpdated: page.lastUpdated
    }

    taggedPages.push(taggedPage)

    // 更新标签索引
    for (const tag of tags) {
      let tagInfo = tagMap.get(tag)

      if (!tagInfo) {
        tagInfo = {
          name: tag,
          count: 0,
          pages: []
        }
        tagMap.set(tag, tagInfo)
      }

      tagInfo.count++
      tagInfo.pages.push(taggedPage)
    }
  }

  return {
    tags: tagMap,
    pages: taggedPages
  }
}

/**
 * 获取页面的 URL 路径
 */
function getPagePath(relativePath: string, base: string = '/'): string {
  let path = relativePath
    .replace(/\.md$/, '.html')
    .replace(/index\.html$/, '')

  if (!path.startsWith('/')) {
    path = '/' + path
  }

  return base.replace(/\/$/, '') + path
}

/**
 * 获取标签列表（按页面数量排序）
 */
export function getTagList(tagIndex: TagIndex): TagInfo[] {
  return Array.from(tagIndex.tags.values())
    .sort((a, b) => b.count - a.count)
}

/**
 * 根据标签名获取标签信息
 */
export function getTagByName(tagIndex: TagIndex, tagName: string): TagInfo | undefined {
  return tagIndex.tags.get(tagName)
}

/**
 * 获取页面的相关标签页面（共享标签的其他页面）
 */
export function getRelatedPagesByTags(
  currentPage: TaggedPage,
  tagIndex: TagIndex,
  limit: number = 5
): TaggedPage[] {
  const relatedPages = new Map<string, { page: TaggedPage; score: number }>()

  // 遍历当前页面的所有标签
  for (const tag of currentPage.tags) {
    const tagInfo = tagIndex.tags.get(tag)
    if (!tagInfo) continue

    // 遍历该标签下的所有页面
    for (const page of tagInfo.pages) {
      // 跳过当前页面
      if (page.relativePath === currentPage.relativePath) {
        continue
      }

      const existing = relatedPages.get(page.relativePath)
      if (existing) {
        // 增加相关度分数（共享的标签越多，分数越高）
        existing.score++
      } else {
        relatedPages.set(page.relativePath, { page, score: 1 })
      }
    }
  }

  // 按相关度分数排序，返回前 N 个
  return Array.from(relatedPages.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.page)
}

/**
 * 生成标签页面数据
 */
export function generateTagPageData(tagName: string, tagIndex: TagIndex): {
  title: string
  description: string
  pages: TaggedPage[]
} | null {
  const tagInfo = tagIndex.tags.get(tagName)

  if (!tagInfo) {
    return null
  }

  return {
    title: `Tag: ${tagName}`,
    description: `Pages tagged with "${tagName}" (${tagInfo.count} pages)`,
    pages: tagInfo.pages.sort((a, b) => {
      // 按最后更新时间排序
      if (a.lastUpdated && b.lastUpdated) {
        return b.lastUpdated - a.lastUpdated
      }
      // 如果没有更新时间，按标题排序
      return a.title.localeCompare(b.title)
    })
  }
}
