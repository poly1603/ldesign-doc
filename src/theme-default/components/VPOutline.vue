<template>
  <Transition name="outline-fade">
    <aside v-if="tocHeaders.length && isReady" class="vp-outline">
      <div class="vp-outline-container">
        <!-- 右侧栏顶部插槽 -->
        <PluginSlot name="aside-top" />

        <!-- 大纲前插槽 -->
        <PluginSlot name="aside-outline-before" />

        <h2 class="vp-outline-title">{{ outlineTitle }}</h2>
        <nav class="vp-outline-nav">
          <!-- 独立的滑动指示器 -->
          <div class="vp-outline-indicator" :style="indicatorStyle"></div>
          <ul class="vp-outline-list" ref="listRef">
            <li v-for="(header, index) in tocHeaders" :key="header.slug" class="vp-outline-item"
              :class="'level-' + header.level" :ref="el => setItemRef(el, index)">
              <a :href="'#' + header.slug" class="vp-outline-link" :class="{ active: activeId === header.slug }"
                @click.prevent="scrollToHeader(header.slug)">
                {{ header.title }}
              </a>
            </li>
          </ul>
        </nav>

        <!-- 大纲后插槽 -->
        <PluginSlot name="aside-outline-after" />

        <!-- 右侧栏底部插槽 -->
        <PluginSlot name="aside-bottom" />
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick, type CSSProperties } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'
import { PluginSlot } from '@ldesign/doc/client'

interface Header {
  level: number
  title: string
  slug: string
}

const { theme } = useData()
const route = useRoute()

// 从 DOM 提取的标题
const tocHeaders = ref<Header[]>([])

// 是否准备就绪（用于动画）
const isReady = ref(false)

// 列表容器引用
const listRef = ref<HTMLElement | null>(null)

// 存储每个列表项的引用
const itemRefs = ref<(HTMLElement | null)[]>([])

// 设置列表项引用
const setItemRef = (el: unknown, index: number) => {
  itemRefs.value[index] = el as HTMLElement | null
}

// 指示器位置和高度
const indicatorTop = ref(0)
const indicatorHeight = ref(0)

// 计算指示器样式
const indicatorStyle = computed<CSSProperties>(() => ({
  transform: `translateY(${indicatorTop.value}px)`,
  height: `${indicatorHeight.value}px`,
  opacity: indicatorHeight.value > 0 ? 1 : 0
}))

// 大纲标题
const outlineTitle = computed(() => {
  const config = theme.value as { outline?: { label?: string } }
  return config.outline?.label || '本页目录'
})

// 获取标题级别配置 - 默认获取所有标题(h1-h6)
const getLevelConfig = () => {
  const config = theme.value as { outline?: { level?: number | [number, number] | 'deep' } }
  const levelConfig = config.outline?.level

  // 默认显示 h2-h6 所有标题
  let minLevel = 2
  let maxLevel = 6

  if (levelConfig === 'deep') {
    minLevel = 1
    maxLevel = 6
  } else if (Array.isArray(levelConfig)) {
    [minLevel, maxLevel] = levelConfig
  } else if (typeof levelConfig === 'number') {
    maxLevel = levelConfig
  }

  return { minLevel, maxLevel }
}

// 从 DOM 中提取标题
const extractHeaders = () => {
  const { minLevel, maxLevel } = getLevelConfig()
  const selectors = []
  for (let i = minLevel; i <= maxLevel; i++) {
    // 同时支持 .ldoc-content 和 .vp-doc-body 选择器
    selectors.push(`.ldoc-content h${i}`, `.vp-doc-body h${i}`)
  }

  const headers: Header[] = []
  document.querySelectorAll(selectors.join(', ')).forEach((el) => {
    const level = parseInt(el.tagName[1])
    const title = el.textContent?.replace(/^#\s*/, '') || ''
    let slug = el.id

    // 如果没有 id，生成一个
    if (!slug && title) {
      slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
      el.id = slug
    }

    if (slug && title) {
      headers.push({ level, title, slug })
    }
  })

  tocHeaders.value = headers
}

// 当前激活的标题
const activeId = ref('')

// 容器引用（用于滚动）
const containerRef = ref<HTMLElement | null>(null)

// 更新指示器位置并滚动到可视区
const updateIndicator = () => {
  const activeIndex = tocHeaders.value.findIndex(h => h.slug === activeId.value)
  if (activeIndex === -1) {
    indicatorHeight.value = 0
    return
  }

  const activeItem = itemRefs.value[activeIndex]
  if (activeItem && listRef.value) {
    const listRect = listRef.value.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    indicatorTop.value = itemRect.top - listRect.top
    indicatorHeight.value = itemRect.height

    // 滚动到可视区
    scrollActiveItemIntoView(activeItem)
  }
}

// 滚动选中项到可视区
const scrollActiveItemIntoView = (activeItem: HTMLElement) => {
  const outline = document.querySelector('.vp-outline') as HTMLElement
  if (!outline) return

  const outlineRect = outline.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()

  // 计算项相对于容器的位置
  const itemTop = itemRect.top - outlineRect.top + outline.scrollTop
  const itemBottom = itemTop + itemRect.height
  const visibleTop = outline.scrollTop
  const visibleBottom = visibleTop + outline.clientHeight - 80 // 减去标题高度

  // 如果项在可视区外，滚动到可视区
  if (itemTop < visibleTop + 40) {
    outline.scrollTo({
      top: Math.max(0, itemTop - 60),
      behavior: 'smooth'
    })
  } else if (itemBottom > visibleBottom) {
    outline.scrollTo({
      top: itemBottom - outline.clientHeight + 100,
      behavior: 'smooth'
    })
  }
}

// 监听激活项变化，更新指示器
watch(activeId, () => {
  nextTick(updateIndicator)
})

// 监听标题列表变化，重置指示器
watch(tocHeaders, () => {
  itemRefs.value = []
  nextTick(updateIndicator)
}, { deep: true })

// 滚动监听
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  observer?.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      // 找到最上面的可见标题
      const visibleEntries = entries.filter(e => e.isIntersecting)
      if (visibleEntries.length > 0) {
        // 按 boundingClientRect.top 排序，取最靠近顶部的
        visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        activeId.value = visibleEntries[0].target.id
      }
    },
    {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    }
  )

  // 观察所有标题元素
  tocHeaders.value.forEach(h => {
    const el = document.getElementById(h.slug)
    if (el) {
      observer?.observe(el)
    }
  })
}

// 路由变化时重新提取标题
watch(() => route.path, (newPath, oldPath) => {
  // 立即清空旧内容并隐藏
  isReady.value = false
  tocHeaders.value = []
  activeId.value = ''
  observer?.disconnect()

  // 等待新内容渲染完成后提取标题
  nextTick(() => {
    setTimeout(() => {
      extractHeaders()
      setupObserver()
      // 延迟显示，确保内容已完全加载
      setTimeout(() => {
        isReady.value = true
      }, 50)
    }, 300)
  })
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    extractHeaders()
    setupObserver()
    // 页面加载时选中第一个标题
    if (tocHeaders.value.length > 0 && !activeId.value) {
      activeId.value = tocHeaders.value[0].slug
    }
    isReady.value = true
  }, 400)
})

onUnmounted(() => {
  observer?.disconnect()
})

// 滚动到标题
const scrollToHeader = (slug: string) => {
  const el = document.getElementById(slug)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })
    activeId.value = slug
  }
}
</script>

<style scoped>
.vp-outline {
  position: sticky;
  top: calc(var(--ldoc-nav-height, 64px) + 24px);
  right: 0;
  width: var(--ldoc-outline-width, 220px);
  max-height: calc(100vh - var(--ldoc-nav-height, 64px) - 48px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  padding-right: 24px;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.vp-outline:hover {
  scrollbar-color: var(--ldoc-c-divider) transparent;
}

.vp-outline::-webkit-scrollbar {
  width: 4px;
}

.vp-outline::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 2px;
}

.vp-outline:hover::-webkit-scrollbar-thumb {
  background: var(--ldoc-c-divider);
}

.vp-outline::-webkit-scrollbar-track {
  background: transparent;
}

.vp-outline-container {
  padding: 16px 0;
  padding-left: var(--ldoc-content-gap, 32px);
  border-left: 1px solid var(--ldoc-c-divider);
}

.vp-outline-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--ldoc-c-text-2);
  margin: 0 0 12px;
  padding-left: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vp-outline-nav {
  position: relative;
}

/* 独立的滑动指示器 */
.vp-outline-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  background: var(--ldoc-c-brand);
  border-radius: 0 2px 2px 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.15s ease;
  z-index: 1;
}

.vp-outline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.vp-outline-item {
  margin: 0;
}

/* 标题缩进 */
.vp-outline-item.level-2 {
  padding-left: 0;
}

.vp-outline-item.level-3 {
  padding-left: 8px;
}

.vp-outline-item.level-4 {
  padding-left: 16px;
}

.vp-outline-item.level-5 {
  padding-left: 24px;
}

.vp-outline-item.level-6 {
  padding-left: 32px;
}

.vp-outline-link {
  display: block;
  padding: 6px 16px;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  font-size: 13px;
  line-height: 1.4;
  transition: color 0.15s ease;
  position: relative;
}

.vp-outline-link:hover {
  color: var(--ldoc-c-text-1);
}

.vp-outline-link.active {
  color: var(--ldoc-c-brand);
  font-weight: 500;
}

/* 过渡动画 */
.outline-fade-enter-active,
.outline-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.outline-fade-enter-from,
.outline-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 响应式隐藏 */
@media (max-width: 1280px) {
  .vp-outline {
    display: none;
  }
}

/* 大屏幕优化定位 */
@media (min-width: 1600px) {
  .vp-outline {
    right: calc((100vw - var(--ldoc-layout-max-width, 1400px)) / 2);
  }
}
</style>
