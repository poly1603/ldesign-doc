<template>
  <div class="vp-doc">
    <!-- 文档内容前插槽 -->
    <PluginSlot name="doc-before" />

    <!-- 面包屑 -->
    <nav v-if="showBreadcrumb" class="vp-doc-breadcrumb">
      <a :href="homeLink">{{ i18nText.home }}</a>
      <span class="vp-doc-breadcrumb-separator">/</span>
      <span>{{ page.title }}</span>
    </nav>

    <!-- 文档内容 -->
    <article class="vp-doc-content">
      <h1 v-if="page.title && showTitle" class="vp-doc-title">
        {{ page.title }}
      </h1>

      <!-- 标题下方插槽（元信息区域，插件可注入阅读时间等） -->
      <PluginSlot name="doc-top" tag="div" class="vp-doc-top-slot" />
      <div v-if="!docTopHasContent && (readingTimeDisplay || page.lastUpdated)" class="vp-doc-top-slot">
        <div class="ldoc-reading-time" v-if="readingTimeDisplay">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="opacity:.7">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>阅读需 {{ readingTimeDisplay.minutes }} 分钟 · 约 {{ readingTimeDisplay.words.toLocaleString() }} 字</span>
        </div>
        <div class="ldoc-last-updated" v-if="page.lastUpdated">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="opacity:.7">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>最后更新于 {{ formatDate(page.lastUpdated) }}</span>
        </div>
      </div>

      <!-- 主要内容插槽 -->
      <div class="vp-doc-body">
        <Content />
      </div>

      <!-- 文档内容底部插槽：阅读时间 + 最后更新时间（同一行，右对齐） -->
      <PluginSlot name="doc-bottom" tag="div" class="vp-doc-bottom-meta" />
    </article>

    <!-- 编辑链接 -->
    <div v-if="editLink" class="vp-doc-edit">
      <a :href="editLink.url" target="_blank" rel="noopener noreferrer">
        {{ editLink.text }}
      </a>
    </div>

    <!-- 文档页脚前插槽 -->
    <PluginSlot name="doc-footer-before" />

    <!-- 上下页导航 -->
    <nav v-if="prevPage || nextPage" class="vp-doc-pagination">
      <router-link v-if="prevPage" :to="prevPage.link" class="vp-doc-pagination-prev">
        <span class="vp-doc-pagination-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {{ i18nText.prevPage }}
        </span>
        <span class="vp-doc-pagination-title">{{ prevPage.text }}</span>
      </router-link>
      <router-link v-if="nextPage" :to="nextPage.link" class="vp-doc-pagination-next">
        <span class="vp-doc-pagination-label">
          {{ i18nText.nextPage }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
        <span class="vp-doc-pagination-title">{{ nextPage.text }}</span>
      </router-link>
    </nav>

    <!-- 文档页脚后插槽 -->
    <PluginSlot name="doc-footer-after" />

    <!-- 文档内容后插槽 -->
    <PluginSlot name="doc-after" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useData, useRoute, Content } from '@ldesign/doc/client'
import { PluginSlot, usePluginSlots } from '@ldesign/doc/client'

const { page, site, theme, frontmatter } = useData()
const route = useRoute()
const { getSlotComponents } = usePluginSlots()

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

// 获取本地化文本
const i18nText = computed(() => {
  const isEn = currentLocale.value === 'en'
  return {
    home: isEn ? 'Home' : '首页',
    lastUpdated: isEn ? 'Last updated' : '最后更新',
    prevPage: isEn ? 'Previous' : '上一页',
    nextPage: isEn ? 'Next' : '下一页'
  }
})

// 是否显示面包屑
const showBreadcrumb = computed(() => {
  return frontmatter.value.breadcrumb !== false
})

// 是否显示标题
const showTitle = computed(() => {
  return frontmatter.value.title !== false
})

// 是否显示元信息
const showMeta = computed(() => {
  return frontmatter.value.meta !== false
})

// 阅读时间（由 reading-time 插件注入）
interface ReadingTimeData {
  minutes: number
  words: number
  text: string
}
const readingTime = computed<ReadingTimeData | null>(() => {
  return frontmatter.value.readingTime as ReadingTimeData | null
})

const docTopHasContent = computed(() => {
  const comps = getSlotComponents('doc-top')
  return Array.isArray(comps) && comps.length > 0
})

// 客户端兜底：若插件未注入阅读时间，则在挂载后基于正文粗略计算
const fallbackReadingTime = ref<ReadingTimeData | null>(null)
const readingTimeDisplay = computed<ReadingTimeData | null>(() => readingTime.value || fallbackReadingTime.value)

onMounted(async () => {
  if (!readingTime.value) {
    await nextTick()
    const body = document.querySelector('.vp-doc-body')
    if (body) {
      const text = body.textContent || ''
      const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
      const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
      const totalWords = chineseChars + englishWords
      const wpm = 300
      const minutes = Math.max(1, Math.ceil(totalWords / wpm))
      fallbackReadingTime.value = { minutes, words: totalWords, text: `阅读需 ${minutes} 分钟` }
    }
  }
})

// 编辑链接
const editLink = computed(() => {
  const config = theme.value as { editLink?: { pattern: string; text?: string } }
  if (!config.editLink || frontmatter.value.editLink === false) return null

  const url = config.editLink.pattern.replace(':path', page.value.relativePath)
  return {
    url,
    text: config.editLink.text || '在 GitHub 上编辑此页'
  }
})

interface NavLink {
  text: string
  link: string
}

// 上一页/下一页：根据当前路由在侧边栏的顺序计算
function normalizePath(p: string) {
  let s = p || '/'
  if (!s.startsWith('/')) s = '/' + s
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
  return s
}

function getOrderedLinks(): NavLink[] {
  const themeCfg = localeTheme.value as unknown as {
    sidebar?: Record<string, Array<{ text?: string; items?: Array<{ text: string; link: string }> }>>
  }
  const current = normalizePath(route.path)
  const sidebar = themeCfg?.sidebar || {}

  // 选择与当前路径最匹配的 sidebar 分组（最长前缀）
  const base = Object.keys(sidebar)
    .sort((a, b) => b.length - a.length)
    .find(k => current.startsWith(normalizePath(k)))

  const groups = base ? sidebar[base] : ([] as Array<{ items?: Array<{ text: string; link: string }> }>)
  const list: NavLink[] = []
  for (const g of groups) {
    const items = g.items || []
    for (const it of items) {
      if (it.link && !/^https?:/i.test(it.link)) {
        list.push({ text: it.text, link: it.link })
      }
    }
  }
  return list
}

const prevPage = computed<NavLink | null>(() => {
  const list = getOrderedLinks()
  const idx = list.findIndex(i => normalizePath(i.link) === normalizePath(route.path))
  if (idx > 0) return list[idx - 1]
  return null
})

const nextPage = computed<NavLink | null>(() => {
  const list = getOrderedLinks()
  const idx = list.findIndex(i => normalizePath(i.link) === normalizePath(route.path))
  if (idx >= 0 && idx < list.length - 1) return list[idx + 1]
  return null
})

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.vp-doc {
  width: 100%;
  max-width: 100%;
  padding: 24px 0;
}

.vp-doc-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
}

.vp-doc-breadcrumb a {
  color: var(--ldoc-c-text-2);
  text-decoration: none;
}

.vp-doc-breadcrumb a:hover {
  color: var(--ldoc-c-brand);
}

.vp-doc-breadcrumb-separator {
  color: var(--ldoc-c-divider);
}

.vp-doc-title {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 16px;
  color: var(--ldoc-c-text-1);
}

.vp-doc-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--ldoc-c-text-3);
}

.vp-doc-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vp-doc-reading-time svg {
  opacity: 0.7;
}

.vp-doc-body {
  line-height: 1.7;
  color: var(--ldoc-c-text-1);
}

.vp-doc-body :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  margin: 48px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ldoc-c-divider);
}

.vp-doc-body :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  margin: 32px 0 12px;
}

.vp-doc-body :deep(p) {
  margin: 16px 0;
}

.vp-doc-body :deep(a) {
  color: var(--ldoc-c-brand);
  text-decoration: none;
}

.vp-doc-body :deep(a:hover) {
  text-decoration: underline;
}

.vp-doc-body :deep(code) {
  padding: 2px 6px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 4px;
  font-size: 0.9em;
}

.vp-doc-body :deep(pre) {
  margin: 16px 0;
  padding: 16px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 8px;
  overflow-x: auto;
}

.vp-doc-body :deep(pre code) {
  padding: 0;
  background: none;
}

.vp-doc-body :deep(blockquote) {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--ldoc-c-brand);
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-2);
}

.vp-doc-body :deep(ul),
.vp-doc-body :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.vp-doc-body :deep(li) {
  margin: 8px 0;
}

.vp-doc-body :deep(table) {
  width: 100%;
  margin: 16px 0;
  border-collapse: collapse;
}

.vp-doc-body :deep(th),
.vp-doc-body :deep(td) {
  padding: 12px;
  border: 1px solid var(--ldoc-c-divider);
  text-align: left;
}

.vp-doc-body :deep(th) {
  background: var(--ldoc-c-bg-soft);
  font-weight: 600;
}

.vp-doc-edit {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--ldoc-c-divider);
}

.vp-doc-edit a {
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  font-size: 14px;
}

.vp-doc-edit a:hover {
  color: var(--ldoc-c-brand);
}

.vp-doc-pagination {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 32px;
}

.vp-doc-pagination-prev,
.vp-doc-pagination-next {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  max-width: 50%;
  background: transparent;
}

.vp-doc-pagination-prev {
  grid-column: 1;
}

.vp-doc-pagination-next {
  grid-column: 2;
  justify-self: end;
  text-align: right;
}

.vp-doc-pagination-prev:hover,
.vp-doc-pagination-next:hover {
  background: var(--ldoc-c-bg-soft);
}



.vp-doc-pagination-label {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
  margin-bottom: 4px;
}

.vp-doc-pagination-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-brand);
}

/* 底部元信息：阅读时间（左） + 最后更新时间（右） */
.vp-doc-bottom-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  color: var(--ldoc-c-text-3);
  font-size: 14px;
}

.vp-doc-bottom-meta :deep(.ldoc-reading-time) {
  margin-bottom: 0 !important;
}

.vp-doc-bottom-meta :deep(.ldoc-last-updated) {
  margin-top: 0 !important;
}

/* 顶部元信息：阅读时间（左） + 最后更新时间（右） */
.vp-doc-top-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0 16px;
  color: var(--ldoc-c-text-3);
  font-size: 14px;
}

.vp-doc-top-slot :deep(.ldoc-reading-time) {
  margin-bottom: 0 !important;
}

.vp-doc-top-slot :deep(.ldoc-last-updated) {
  margin-top: 0 !important;
}

/* ==================== 响应式优化 ==================== */

/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .vp-doc {
    padding: 16px 0;
  }

  .vp-doc-breadcrumb {
    font-size: 13px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .vp-doc-title {
    font-size: clamp(24px, 6vw, 28px);
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .vp-doc-meta {
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .vp-doc-body {
    font-size: 15px;
    line-height: 1.65;
  }

  .vp-doc-body :deep(h2) {
    font-size: 20px;
    margin: 32px 0 12px;
  }

  .vp-doc-body :deep(h3) {
    font-size: 17px;
    margin: 24px 0 10px;
  }

  .vp-doc-body :deep(pre) {
    margin: 12px -16px;
    padding: 12px 16px;
    border-radius: 0;
    font-size: 12px;
  }

  .vp-doc-body :deep(table) {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .vp-doc-pagination {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 24px;
  }

  .vp-doc-pagination-prev,
  .vp-doc-pagination-next {
    padding: 14px;
  }

  .vp-doc-pagination-next {
    text-align: left;
  }

  .vp-doc-edit {
    margin-top: 32px;
    padding-top: 16px;
  }
}

/* 平板 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .vp-doc-title {
    font-size: clamp(28px, 4vw, 32px);
  }

  .vp-doc-body :deep(h2) {
    font-size: 22px;
  }

  .vp-doc-body :deep(h3) {
    font-size: 18px;
  }
}

/* 大屏幕 (>= 1920px) */
@media (min-width: 1920px) {
  .vp-doc {
    padding: 32px 0;
  }

  .vp-doc-breadcrumb {
    font-size: 15px;
    margin-bottom: 28px;
  }

  .vp-doc-title {
    font-size: clamp(36px, 2.5vw, 44px);
    margin-bottom: 20px;
  }

  .vp-doc-meta {
    margin-bottom: 28px;
    font-size: 15px;
  }

  .vp-doc-body {
    font-size: 17px;
    line-height: 1.75;
  }

  .vp-doc-body :deep(h2) {
    font-size: 28px;
    margin: 56px 0 20px;
  }

  .vp-doc-body :deep(h3) {
    font-size: 22px;
    margin: 40px 0 16px;
  }

  .vp-doc-body :deep(p) {
    margin: 20px 0;
  }

  .vp-doc-pagination {
    gap: 24px;
    margin-top: 48px;
  }
}

/* 4K 显示器 (>= 2560px) */
@media (min-width: 2560px) {
  .vp-doc {
    padding: 40px 0;
  }

  .vp-doc-title {
    font-size: clamp(42px, 2.5vw, 56px);
    margin-bottom: 24px;
  }

  .vp-doc-body {
    font-size: 18px;
    line-height: 1.8;
  }

  .vp-doc-body :deep(h2) {
    font-size: 32px;
    margin: 64px 0 24px;
  }

  .vp-doc-body :deep(h3) {
    font-size: 26px;
    margin: 48px 0 18px;
  }

  .vp-doc-body :deep(pre) {
    padding: 20px;
    font-size: 15px;
  }

  .vp-doc-body :deep(code) {
    font-size: 0.92em;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {

  .vp-doc-pagination-prev,
  .vp-doc-pagination-next {
    min-height: 60px;
    padding: 16px;
  }

  .vp-doc-edit a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 8px 0;
  }
}

/* 打印样式 */
@media print {
  .vp-doc {
    padding: 0;
  }

  .vp-doc-breadcrumb,
  .vp-doc-meta,
  .vp-doc-edit,
  .vp-doc-pagination {
    display: none;
  }

  .vp-doc-title {
    font-size: 24pt;
    margin-bottom: 12pt;
  }

  .vp-doc-body {
    font-size: 11pt;
    line-height: 1.5;
  }
}
</style>
