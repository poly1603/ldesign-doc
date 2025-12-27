<template>
  <div v-if="subpages.length > 0" class="vp-subpage-toc">
    <h3 class="vp-subpage-toc-title">{{ title }}</h3>
    <ul class="vp-subpage-toc-list">
      <li v-for="page in subpages" :key="page.link" class="vp-subpage-toc-item">
        <router-link :to="page.link" class="vp-subpage-toc-link">
          <span class="vp-subpage-toc-text">{{ page.text }}</span>
          <span v-if="page.description" class="vp-subpage-toc-description">
            {{ page.description }}
          </span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'
import type { SidebarItem } from '../../shared/types'

interface SubpageItem {
  text: string
  link: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    /** 标题文本 */
    title?: string
  }>(),
  {
    title: '子页面'
  }
)

const { theme, frontmatter } = useData()
const route = useRoute()

/**
 * 规范化路径
 */
function normalizePath(path: string): string {
  let normalized = path || '/'
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized
  }
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/**
 * 检查路径是否为另一个路径的子路径
 */
function isSubpath(parentPath: string, childPath: string): boolean {
  const parent = normalizePath(parentPath)
  const child = normalizePath(childPath)
  
  // 子路径必须以父路径开头，且不能完全相同
  if (child === parent) {
    return false
  }
  
  // Special handling for root path
  if (parent === '/') {
    // For root, check if child has exactly one segment
    const segments = child.split('/').filter(Boolean)
    return segments.length === 1
  }
  
  // 检查是否为直接子路径（只深一层）
  if (!child.startsWith(parent + '/')) {
    return false
  }
  
  // 获取相对路径部分
  const relativePath = child.substring(parent.length + 1)
  
  // 如果相对路径中还有斜杠，说明不是直接子路径
  return !relativePath.includes('/')
}

/**
 * 从侧边栏项中提取子页面
 */
function extractSubpages(items: SidebarItem[], currentPath: string): SubpageItem[] {
  const subpages: SubpageItem[] = []
  const normalized = normalizePath(currentPath)
  
  for (const item of items) {
    // 如果当前项有链接且是当前页面的子页面
    if (item.link && isSubpath(normalized, item.link)) {
      subpages.push({
        text: item.text,
        link: item.link,
        description: item.description
      })
    }
    
    // 递归检查子项
    if (item.items && item.items.length > 0) {
      const childSubpages = extractSubpages(item.items, currentPath)
      subpages.push(...childSubpages)
    }
  }
  
  return subpages
}

/**
 * 获取当前页面的子页面列表
 */
const subpages = computed<SubpageItem[]>(() => {
  // 如果 frontmatter 中禁用了子页面目录
  if (frontmatter.value.subpageTOC === false) {
    return []
  }
  
  const themeConfig = theme.value as { sidebar?: Record<string, SidebarItem[]> | SidebarItem[] }
  const sidebar = themeConfig.sidebar
  
  if (!sidebar) {
    return []
  }
  
  const currentPath = route.path
  let sidebarItems: SidebarItem[] = []
  
  // 如果 sidebar 是数组，直接使用
  if (Array.isArray(sidebar)) {
    sidebarItems = sidebar
  } else {
    // 如果 sidebar 是对象，找到匹配当前路径的配置
    const matchedKey = Object.keys(sidebar)
      .sort((a, b) => b.length - a.length) // 最长匹配优先
      .find(key => currentPath.startsWith(normalizePath(key)))
    
    if (matchedKey) {
      sidebarItems = sidebar[matchedKey]
    }
  }
  
  // 提取子页面
  return extractSubpages(sidebarItems, currentPath)
})
</script>

<style scoped>
.vp-subpage-toc {
  margin-top: 32px;
  padding: 20px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--ldoc-c-divider);
}

.vp-subpage-toc-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
  color: var(--ldoc-c-text-1);
}

.vp-subpage-toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.vp-subpage-toc-item {
  margin: 0;
}

.vp-subpage-toc-link {
  display: block;
  padding: 12px 16px;
  background: var(--ldoc-c-bg);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.vp-subpage-toc-link:hover {
  background: var(--ldoc-c-bg-elv);
  border-color: var(--ldoc-c-brand);
  transform: translateX(4px);
}

.vp-subpage-toc-text {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-brand);
  margin-bottom: 4px;
}

.vp-subpage-toc-description {
  display: block;
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  line-height: 1.5;
}

/* 响应式优化 */
@media (max-width: 767px) {
  .vp-subpage-toc {
    margin-top: 24px;
    padding: 16px;
  }

  .vp-subpage-toc-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .vp-subpage-toc-link {
    padding: 10px 12px;
  }

  .vp-subpage-toc-text {
    font-size: 13px;
  }

  .vp-subpage-toc-description {
    font-size: 12px;
  }
}

@media (min-width: 1920px) {
  .vp-subpage-toc {
    padding: 24px;
  }

  .vp-subpage-toc-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .vp-subpage-toc-link {
    padding: 14px 18px;
  }

  .vp-subpage-toc-text {
    font-size: 15px;
  }

  .vp-subpage-toc-description {
    font-size: 14px;
  }
}

/* 打印样式 */
@media print {
  .vp-subpage-toc {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
