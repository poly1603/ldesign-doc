/**
 * 站点地图 Composable
 */

import { computed, ref } from 'vue'

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

// 全局站点地图数据（由构建时注入）
declare global {
  interface Window {
    __SITEMAP_DATA__?: {
      pages: SitemapPage[]
      categories: Record<string, SitemapCategory>
    }
  }
}

/**
 * 使用站点地图数据
 */
export function useSitemap() {
  const sitemapData = ref(window.__SITEMAP_DATA__ || { pages: [], categories: {} })

  const allPages = computed(() => {
    return sitemapData.value.pages
  })

  const allCategories = computed(() => {
    return Object.values(sitemapData.value.categories).sort((a, b) => b.count - a.count)
  })

  const getCategory = (categoryName: string): SitemapCategory | undefined => {
    return sitemapData.value.categories[categoryName]
  }

  const getPagesByCategory = (categoryName: string): SitemapPage[] => {
    const category = getCategory(categoryName)
    return category?.pages || []
  }

  const searchPages = (query: string): SitemapPage[] => {
    if (!query.trim()) {
      return allPages.value
    }

    const lowerQuery = query.toLowerCase()
    return allPages.value.filter(page => {
      return (
        page.title.toLowerCase().includes(lowerQuery) ||
        page.description.toLowerCase().includes(lowerQuery) ||
        page.relativePath.toLowerCase().includes(lowerQuery) ||
        page.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    })
  }

  const groupPagesByCategory = (): Record<string, SitemapPage[]> => {
    const grouped: Record<string, SitemapPage[]> = Object.create(null)

    for (const page of allPages.value) {
      const category = page.category || 'Uncategorized'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(page)
    }

    return grouped
  }

  return {
    allPages,
    allCategories,
    getCategory,
    getPagesByCategory,
    searchPages,
    groupPagesByCategory
  }
}
