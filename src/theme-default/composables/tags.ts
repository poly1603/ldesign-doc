/**
 * 标签系统 Composable
 */

import { computed, ref } from 'vue'
import type { TagInfo, TaggedPage } from '../../node/tags'

// 全局标签索引数据（由构建时注入）
declare global {
  interface Window {
    __TAG_INDEX__?: {
      tags: Record<string, TagInfo>
      pages: TaggedPage[]
    }
  }
}

/**
 * 使用标签数据
 */
export function useTags() {
  const tagIndex = ref(window.__TAG_INDEX__ || { tags: {}, pages: [] })

  const allTags = computed(() => {
    return Object.values(tagIndex.value.tags).sort((a, b) => b.count - a.count)
  })

  const allTaggedPages = computed(() => {
    return tagIndex.value.pages
  })

  const getTag = (tagName: string): TagInfo | undefined => {
    return tagIndex.value.tags[tagName]
  }

  const getPagesByTag = (tagName: string): TaggedPage[] => {
    const tag = getTag(tagName)
    return tag?.pages || []
  }

  const getRelatedPages = (currentPath: string, limit: number = 5): TaggedPage[] => {
    const currentPage = tagIndex.value.pages.find(p => p.relativePath === currentPath)
    if (!currentPage || currentPage.tags.length === 0) {
      return []
    }

    const relatedPages = new Map<string, { page: TaggedPage; score: number }>()

    // 遍历当前页面的所有标签
    for (const tag of currentPage.tags) {
      const tagInfo = tagIndex.value.tags[tag]
      if (!tagInfo) continue

      // 遍历该标签下的所有页面
      for (const page of tagInfo.pages) {
        // 跳过当前页面
        if (page.relativePath === currentPath) {
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

  return {
    allTags,
    allTaggedPages,
    getTag,
    getPagesByTag,
    getRelatedPages
  }
}

/**
 * 使用当前页面的标签
 */
export function usePageTags() {
  // This would be injected by the page context
  // For now, return empty array
  const pageTags = computed(() => {
    // In a real implementation, this would get the current page's frontmatter tags
    return []
  })

  return {
    pageTags
  }
}
