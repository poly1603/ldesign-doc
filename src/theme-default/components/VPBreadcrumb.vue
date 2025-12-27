<template>
  <nav v-if="breadcrumbItems.length > 0" class="vp-breadcrumb" aria-label="breadcrumb">
    <ol class="vp-breadcrumb-list">
      <!-- 首页链接 -->
      <li class="vp-breadcrumb-item">
        <a :href="homeLink" class="vp-breadcrumb-link" :class="{ 'is-active': isHome }">
          <span class="vp-breadcrumb-text">{{ homeText }}</span>
        </a>
        <span v-if="breadcrumbItems.length > 0" class="vp-breadcrumb-separator">
          {{ separator }}
        </span>
      </li>

      <!-- 面包屑项 -->
      <li
        v-for="(item, index) in breadcrumbItems"
        :key="item.path"
        class="vp-breadcrumb-item"
      >
        <a
          v-if="!isLast(index)"
          :href="item.path"
          class="vp-breadcrumb-link"
        >
          <span class="vp-breadcrumb-text">{{ item.title }}</span>
        </a>
        <span
          v-else
          class="vp-breadcrumb-link is-active"
        >
          <span class="vp-breadcrumb-text">{{ item.title }}</span>
        </span>

        <!-- 分隔符 -->
        <span v-if="!isLast(index)" class="vp-breadcrumb-separator">
          {{ separator }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'

export interface BreadcrumbItem {
  /** 路径 */
  path: string
  /** 显示标题 */
  title: string
}

export interface VPBreadcrumbProps {
  /** 分隔符 */
  separator?: string
  /** 首页文本 */
  homeText?: string
}

const props = withDefaults(defineProps<VPBreadcrumbProps>(), {
  separator: '/',
  homeText: '首页'
})

const { site, theme } = useData()
const route = useRoute()

// 获取当前语言环境
const currentLocale = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (!locales) return 'root'
  for (const key of Object.keys(locales)) {
    if (key === 'root') continue
    const locale = locales[key]
    if (locale.link && route.path.startsWith(locale.link)) {
      return key
    }
  }
  return 'root'
})

// 获取语言环境感知的主题配置
const localeTheme = computed(() => {
  const baseTheme = theme.value as Record<string, unknown>
  const locales = site.value.locales as Record<string, { themeConfig?: Record<string, unknown> }> | undefined
  const localeConfig = locales?.[currentLocale.value]?.themeConfig

  if (!localeConfig) return baseTheme
  return { ...baseTheme, ...localeConfig }
})

// 获取当前 locale 的首页链接
const homeLink = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (currentLocale.value === 'root') return '/'
  return locales?.[currentLocale.value]?.link || '/'
})

// 是否在首页
const isHome = computed(() => {
  const normalizedPath = route.path.replace(/\/$/, '') || '/'
  const normalizedHome = homeLink.value.replace(/\/$/, '') || '/'
  return normalizedPath === normalizedHome
})

// 侧边栏配置
interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

const sidebar = computed<Record<string, SidebarItem[]> | SidebarItem[]>(() => {
  const config = localeTheme.value as { sidebar?: Record<string, SidebarItem[]> | SidebarItem[] }
  return config.sidebar || []
})

/**
 * 从侧边栏配置中查找路径对应的标题
 */
function findTitleInSidebar(path: string, items: SidebarItem[]): string | null {
  for (const item of items) {
    // 标准化路径进行比较
    const normalizedItemLink = item.link?.replace(/\/$/, '')
    const normalizedPath = path.replace(/\/$/, '')
    
    if (normalizedItemLink === normalizedPath) {
      return item.text
    }
    
    // 递归查找子项
    if (item.items) {
      const found = findTitleInSidebar(path, item.items)
      if (found) return found
    }
  }
  return null
}

/**
 * 获取路径的标题
 */
function getPathTitle(path: string): string {
  // 首先尝试从侧边栏配置中查找
  if (Array.isArray(sidebar.value)) {
    const title = findTitleInSidebar(path, sidebar.value)
    if (title) return title
  } else {
    // 对象形式的侧边栏，遍历所有分组
    for (const key in sidebar.value) {
      const items = sidebar.value[key]
      const title = findTitleInSidebar(path, items)
      if (title) return title
    }
  }

  // 如果侧边栏中没有找到，从路径中提取
  const segments = path.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  
  // 移除文件扩展名和特殊字符，转换为标题格式
  return lastSegment
    .replace(/\.(md|html)$/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 生成面包屑项
 */
const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const currentPath = route.path
  
  // 移除语言前缀
  let pathWithoutLocale = currentPath
  if (currentLocale.value !== 'root') {
    const localeLink = homeLink.value
    if (currentPath.startsWith(localeLink)) {
      pathWithoutLocale = currentPath.slice(localeLink.length)
    }
  }
  
  // 如果是首页，不显示面包屑
  if (!pathWithoutLocale || pathWithoutLocale === '/') {
    return []
  }

  // 分割路径
  const segments = pathWithoutLocale.split('/').filter(Boolean)
  
  // 生成面包屑项
  const items: BreadcrumbItem[] = []
  let accumulatedPath = currentLocale.value !== 'root' ? homeLink.value.replace(/\/$/, '') : ''
  
  for (let i = 0; i < segments.length; i++) {
    accumulatedPath += '/' + segments[i]
    
    // 标准化路径（移除尾部斜杠）
    const normalizedPath = accumulatedPath.replace(/\/$/, '') || '/'
    
    items.push({
      path: normalizedPath,
      title: getPathTitle(normalizedPath)
    })
  }
  
  return items
})

/**
 * 判断是否为最后一项
 */
const isLast = (index: number): boolean => {
  return index === breadcrumbItems.value.length - 1
}
</script>

<style scoped>
.vp-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 24px;
}

.vp-breadcrumb-list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
  gap: 4px 0;
}

.vp-breadcrumb-item {
  display: flex;
  align-items: center;
}

.vp-breadcrumb-link {
  display: inline-flex;
  align-items: center;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  padding: 2px 4px;
  border-radius: 4px;
}

.vp-breadcrumb-link:hover {
  color: var(--ldoc-c-brand);
  background: var(--ldoc-c-bg-soft);
}

.vp-breadcrumb-link.is-active {
  color: var(--ldoc-c-text-1);
  font-weight: 500;
  cursor: default;
}

.vp-breadcrumb-link.is-active:hover {
  background: transparent;
}

.vp-breadcrumb-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-breadcrumb-separator {
  margin: 0 8px;
  color: var(--ldoc-c-divider);
  user-select: none;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .vp-breadcrumb {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .vp-breadcrumb-text {
    max-width: 120px;
  }

  .vp-breadcrumb-separator {
    margin: 0 6px;
  }
}

/* 大屏优化 */
@media (min-width: 1920px) {
  .vp-breadcrumb {
    font-size: 15px;
  }

  .vp-breadcrumb-text {
    max-width: 250px;
  }
}
</style>
