<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="isOpen" class="vp-search-overlay" @click.self="close">
        <div class="vp-search-modal">
          <!-- 搜索头部 -->
          <div class="vp-search-header">
            <div class="vp-search-input-wrapper">
              <svg class="vp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input ref="inputRef" v-model="query" type="text" class="vp-search-input" placeholder="搜索文档..."
                @keydown.esc="close" @keydown.enter="handleEnter" @keydown.up.prevent="navigateUp"
                @keydown.down.prevent="navigateDown" />
              <kbd class="vp-search-kbd">ESC</kbd>
            </div>
          </div>

          <!-- 搜索结果 -->
          <div class="vp-search-body">
            <div v-if="!query" class="vp-search-hint">
              <div class="vp-search-hint-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p>输入关键词搜索文档</p>
              <div class="vp-search-shortcuts">
                <div class="vp-search-shortcut-item">
                  <kbd>↑</kbd><kbd>↓</kbd> 选择
                </div>
                <div class="vp-search-shortcut-item">
                  <kbd>Enter</kbd> 确认
                </div>
                <div class="vp-search-shortcut-item">
                  <kbd>ESC</kbd> 关闭
                </div>
              </div>
            </div>

            <div v-else-if="isSearching" class="vp-search-loading">
              <div class="vp-search-spinner"></div>
              <p>搜索中...</p>
            </div>

            <div v-else-if="results.length === 0" class="vp-search-empty">
              <div class="vp-search-empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9.172 9.172a4 4 0 015.656 5.656M15 9l-6 6" />
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p>未找到相关结果</p>
              <span class="vp-search-empty-hint">尝试使用其他关键词</span>
            </div>

            <div v-else class="vp-search-results">
              <div v-for="(result, index) in results" :key="result.path + (result.anchor || index)"
                class="vp-search-result" :class="{ active: activeIndex === index }" @click="goToResult(result)"
                @mouseenter="activeIndex = index">
                <div class="vp-search-result-icon" :class="result.type">
                  <!-- 页面图标 -->
                  <svg v-if="result.type === 'page'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <!-- 标题图标 -->
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M4 12h16M4 6h16M4 18h16" />
                  </svg>
                </div>
                <div class="vp-search-result-content">
                  <div class="vp-search-result-title" v-html="result.title"></div>
                  <div v-if="result.excerpt" class="vp-search-result-excerpt" v-html="result.excerpt"></div>
                </div>
                <svg class="vp-search-result-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>

          <!-- 搜索页脚 -->
          <div class="vp-search-footer">
            <span class="vp-search-footer-text">由 LDoc 提供搜索</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useData } from '@ldesign/doc/client'

interface SearchResult {
  path: string
  title: string
  excerpt?: string
  anchor?: string
  type: 'page' | 'heading'
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const { theme } = useData()
const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const results = ref<SearchResult[]>([])
const activeIndex = ref(0)
const isSearching = ref(false)

// 中英文关键词映射
const keywordMap: Record<string, string[]> = {
  'button': ['按钮', 'btn'],
  '按钮': ['button', 'btn'],
  'input': ['输入框', 'textfield'],
  '输入框': ['input', 'textfield'],
  'guide': ['指南', '教程'],
  '指南': ['guide', 'tutorial'],
  'config': ['配置', 'configuration'],
  '配置': ['config', 'configuration'],
  'markdown': ['md', '语法'],
  'theme': ['主题', '样式'],
  '主题': ['theme', 'style'],
  'api': ['接口', '函数'],
  'component': ['组件', '控件'],
  '组件': ['component', 'widget']
}

// 从配置中提取所有页面和标题
const getAllSearchableContent = (): SearchResult[] => {
  const content: SearchResult[] = []
  const config = theme.value as {
    nav?: Array<{ text: string; link?: string; items?: Array<{ text: string; link: string }> }>
    sidebar?: Record<string, Array<{ text: string; items?: Array<{ text: string; link: string }> }>>
  }

  // 从导航提取
  if (config.nav) {
    for (const item of config.nav) {
      if (item.link && !item.link.startsWith('http')) {
        content.push({ path: item.link, title: item.text, type: 'page' })
      }
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.link && !subItem.link.startsWith('http')) {
            content.push({ path: subItem.link, title: subItem.text, type: 'page' })
          }
        }
      }
    }
  }

  // 从侧边栏提取
  if (config.sidebar) {
    for (const [, groups] of Object.entries(config.sidebar)) {
      for (const group of groups) {
        if (group.items) {
          for (const item of group.items) {
            if (item.link && !item.link.startsWith('http')) {
              content.push({
                path: item.link,
                title: item.text,
                excerpt: group.text,
                type: 'page'
              })
            }
          }
        }
      }
    }
  }

  // 添加首页
  content.unshift({ path: '/', title: '首页', type: 'page' })

  return content
}

// 从当前页面DOM提取标题
const extractHeadingsFromDOM = (): SearchResult[] => {
  const headings: SearchResult[] = []
  const currentPath = window.location.pathname

  document.querySelectorAll('.vp-doc-content h1, .vp-doc-content h2, .vp-doc-content h3, .vp-doc-content h4').forEach((el) => {
    const id = el.getAttribute('id')
    const text = el.textContent?.trim()
    if (id && text) {
      headings.push({
        path: currentPath,
        title: text,
        anchor: id,
        type: 'heading'
      })
    }
  })

  return headings
}

// 打开时聚焦输入框
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    query.value = ''
    results.value = []
    activeIndex.value = 0
  }
})

// 搜索逻辑
watch(query, async (newQuery) => {
  if (!newQuery.trim()) {
    results.value = []
    return
  }

  isSearching.value = true

  // 短暂延迟防止频繁搜索
  await new Promise(resolve => setTimeout(resolve, 100))

  const searchTerm = newQuery.toLowerCase()
  const allContent = getAllSearchableContent()
  const headings = extractHeadingsFromDOM()

  // 合并所有可搜索内容
  const allSearchable = [...allContent, ...headings]

  // 获取搜索词的别名
  const searchTerms = [searchTerm]
  const aliases = keywordMap[searchTerm]
  if (aliases) {
    searchTerms.push(...aliases.map(a => a.toLowerCase()))
  }

  // 搜索匹配 - 支持多关键词
  const matched = allSearchable.filter(item => {
    const titleLower = item.title.toLowerCase()
    const excerptLower = item.excerpt?.toLowerCase() || ''
    const pathLower = item.path.toLowerCase()

    return searchTerms.some(term =>
      titleLower.includes(term) ||
      excerptLower.includes(term) ||
      pathLower.includes(term)
    )
  })

  // 高亮匹配文本
  results.value = matched.map(item => ({
    ...item,
    title: highlightText(item.title, searchTerm),
    excerpt: item.excerpt ? highlightText(item.excerpt, searchTerm) : undefined
  })).slice(0, 10) // 限制结果数量

  isSearching.value = false
  activeIndex.value = 0
})

// 高亮匹配文本
const highlightText = (text: string, term: string): string => {
  if (!term) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const close = () => {
  emit('close')
}

const navigateUp = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

const navigateDown = () => {
  if (activeIndex.value < results.value.length - 1) {
    activeIndex.value++
  }
}

const handleEnter = () => {
  if (results.value[activeIndex.value]) {
    goToResult(results.value[activeIndex.value])
  }
}

const goToResult = (result: SearchResult) => {
  close()

  // 如果有锚点，先导航再滚动
  if (result.anchor) {
    const currentPath = window.location.pathname
    if (currentPath === result.path || result.path === currentPath.replace(/\/$/, '')) {
      // 同页面，直接滚动
      scrollToAnchor(result.anchor)
    } else {
      // 不同页面，先导航
      router.push(result.path).then(() => {
        setTimeout(() => scrollToAnchor(result.anchor!), 300)
      })
    }
  } else {
    router.push(result.path)
  }
}

const scrollToAnchor = (anchor: string) => {
  const el = document.getElementById(anchor)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

// 全局快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (!props.isOpen) {
      // 由父组件控制打开
    } else {
      close()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.vp-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.vp-search-modal {
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--ldoc-c-bg);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.vp-search-header {
  padding: 16px;
  border-bottom: 1px solid var(--ldoc-c-divider);
}

.vp-search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--ldoc-c-bg-soft);
  border: 2px solid transparent;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.vp-search-input-wrapper:focus-within {
  border-color: var(--ldoc-c-brand);
}

.vp-search-icon {
  flex-shrink: 0;
  color: var(--ldoc-c-text-3);
}

.vp-search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 16px;
  color: var(--ldoc-c-text-1);
  outline: none;
}

.vp-search-input::placeholder {
  color: var(--ldoc-c-text-3);
}

.vp-search-kbd {
  padding: 4px 8px;
  background: var(--ldoc-c-bg-mute);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  color: var(--ldoc-c-text-2);
}

.vp-search-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.vp-search-hint,
.vp-search-loading,
.vp-search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--ldoc-c-text-2);
}

.vp-search-hint-icon,
.vp-search-empty-icon {
  margin-bottom: 16px;
  color: var(--ldoc-c-text-3);
}

.vp-search-shortcuts {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.vp-search-shortcut-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ldoc-c-text-3);
}

.vp-search-shortcut-item kbd {
  padding: 3px 6px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
}

.vp-search-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ldoc-c-divider);
  border-top-color: var(--ldoc-c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.vp-search-empty-hint {
  font-size: 13px;
  color: var(--ldoc-c-text-3);
  margin-top: 8px;
}

.vp-search-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vp-search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.vp-search-result:hover,
.vp-search-result.active {
  background: var(--ldoc-c-bg-soft);
}

.vp-search-result.active {
  background: var(--ldoc-c-brand-soft);
}

.vp-search-result-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldoc-c-bg-mute);
  border-radius: 8px;
  color: var(--ldoc-c-text-2);
}

.vp-search-result.active .vp-search-result-icon {
  background: var(--ldoc-c-brand);
  color: white;
}

.vp-search-result-content {
  flex: 1;
  min-width: 0;
}

.vp-search-result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
}

.vp-search-result-excerpt {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-search-result-excerpt :deep(mark) {
  background: var(--ldoc-c-brand-soft);
  color: var(--ldoc-c-brand);
  padding: 0 2px;
  border-radius: 2px;
}

.vp-search-result-arrow {
  flex-shrink: 0;
  color: var(--ldoc-c-text-3);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.15s;
}

.vp-search-result.active .vp-search-result-arrow {
  opacity: 1;
  transform: translateX(0);
}

.vp-search-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--ldoc-c-divider);
  text-align: center;
}

.vp-search-footer-text {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}

/* 动画 */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: all 0.2s ease-out;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-from .vp-search-modal,
.search-fade-leave-to .vp-search-modal {
  transform: scale(0.95) translateY(-20px);
}
</style>
