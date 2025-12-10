<template>
  <div class="vp-doc">
    <!-- 面包屑 -->
    <nav v-if="showBreadcrumb" class="vp-doc-breadcrumb">
      <a href="/">首页</a>
      <span class="vp-doc-breadcrumb-separator">/</span>
      <span>{{ page.title }}</span>
    </nav>
    
    <!-- 文档内容 -->
    <article class="vp-doc-content">
      <h1 v-if="page.title && showTitle" class="vp-doc-title">
        {{ page.title }}
      </h1>
      
      <!-- 元信息 -->
      <div v-if="showMeta" class="vp-doc-meta">
        <span v-if="page.lastUpdated" class="vp-doc-meta-item">
          最后更新: {{ formatDate(page.lastUpdated) }}
        </span>
      </div>
      
      <!-- 主要内容插槽 -->
      <div class="vp-doc-body">
        <Content />
      </div>
    </article>
    
    <!-- 编辑链接 -->
    <div v-if="editLink" class="vp-doc-edit">
      <a :href="editLink.url" target="_blank" rel="noopener noreferrer">
        {{ editLink.text }}
      </a>
    </div>
    
    <!-- 上下页导航 -->
    <nav v-if="prevPage || nextPage" class="vp-doc-pagination">
      <router-link v-if="prevPage" :to="prevPage.link" class="vp-doc-pagination-prev">
        <span class="vp-doc-pagination-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          上一页
        </span>
        <span class="vp-doc-pagination-title">{{ prevPage.text }}</span>
      </router-link>
      <router-link v-if="nextPage" :to="nextPage.link" class="vp-doc-pagination-next">
        <span class="vp-doc-pagination-label">
          下一页
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </span>
        <span class="vp-doc-pagination-title">{{ nextPage.text }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, Content } from '@ldesign/doc/client'

const { page, theme, frontmatter } = useData()
const route = useRoute()

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

// 上一页/下一页
const prevPage = computed(() => {
  // TODO: 实现上下页导航
  return null
})

const nextPage = computed(() => {
  // TODO: 实现上下页导航
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
  max-width: var(--ldoc-content-width, 740px);
  margin: 0 auto;
  padding: 32px 24px;
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
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.vp-doc-pagination-prev:hover,
.vp-doc-pagination-next:hover {
  border-color: var(--ldoc-c-brand);
}

.vp-doc-pagination-next {
  text-align: right;
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
</style>
