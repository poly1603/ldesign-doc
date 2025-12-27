/**
 * 默认主题组合式函数
 */

import { computed } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'

// 从客户端导出
export {
  useData,
  useRoute,
  useRouter,
  useSiteData,
  usePageData,
  useDark,
  useSidebar,
  useScrollToAnchor,
  usePageLoading,
  useThemeColor
} from '@ldesign/doc/client'

// 导出标签系统
export { useTags, usePageTags } from './composables/tags'

// 导出站点地图
export { useSitemap } from './composables/sitemap'

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/**
 * 获取侧边栏配置项
 */
export function useSidebarItems() {
  const { theme } = useData()
  const route = useRoute()

  return computed(() => {
    const themeConfig = theme.value as { sidebar?: Record<string, SidebarItem[]> | SidebarItem[] }
    const sidebar = themeConfig.sidebar

    if (!sidebar) return []

    // 数组形式 - 全局侧边栏
    if (Array.isArray(sidebar)) {
      return sidebar
    }

    // 对象形式 - 根据路径匹配
    const path = route.path

    // 按路径长度降序排序，确保匹配最深路径
    const sortedKeys = Object.keys(sidebar).sort((a, b) => b.length - a.length)

    for (const prefix of sortedKeys) {
      if (path.startsWith(prefix)) {
        return sidebar[prefix]
      }
    }

    return []
  })
}
