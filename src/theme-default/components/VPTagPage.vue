<template>
  <div class="vp-tag-page">
    <div class="tag-header">
      <h1 class="tag-title">
        <span class="tag-icon">#</span>
        {{ tagName }}
      </h1>
      <p class="tag-description">{{ pageCount }} pages tagged with "{{ tagName }}"</p>
    </div>

    <div class="tag-pages">
      <article
        v-for="page in pages"
        :key="page.relativePath"
        class="tag-page-item"
      >
        <h3 class="page-title">
          <a :href="page.path">{{ page.title }}</a>
        </h3>
        <p v-if="page.description" class="page-description">
          {{ page.description }}
        </p>
        <div class="page-meta">
          <VPTagList
            v-if="page.tags.length > 0"
            :tags="page.tags"
            size="small"
            :clickable="true"
          />
          <time v-if="page.lastUpdated" class="page-date">
            {{ formatDate(page.lastUpdated) }}
          </time>
        </div>
      </article>
    </div>

    <div class="tag-footer">
      <a href="/tags.html" class="back-link">← Back to all tags</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaggedPage } from '../../../node/tags'
import VPTagList from './VPTagList.vue'

interface Props {
  tagName: string
  pages: TaggedPage[]
}

const props = defineProps<Props>()

const pageCount = computed(() => props.pages.length)

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.vp-tag-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.tag-header {
  margin-bottom: 48px;
  text-align: center;
}

.tag-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 12px;
  font-size: 48px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.tag-icon {
  color: var(--vp-c-brand);
}

.tag-description {
  margin: 0;
  font-size: 18px;
  color: var(--vp-c-text-2);
}

.tag-pages {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.tag-page-item {
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tag-page-item:hover {
  background-color: var(--vp-c-bg-mute);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}

.page-title a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.page-title a:hover {
  color: var(--vp-c-brand);
}

.page-description {
  margin: 0 0 16px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.page-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.page-date {
  font-size: 14px;
  color: var(--vp-c-text-3);
}

.tag-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 16px;
  color: var(--vp-c-brand);
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background-color: var(--vp-c-brand-soft);
}

@media (max-width: 768px) {
  .tag-title {
    font-size: 36px;
  }

  .tag-description {
    font-size: 16px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
