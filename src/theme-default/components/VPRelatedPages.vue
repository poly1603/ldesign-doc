<template>
  <div v-if="relatedPages.length > 0" class="vp-related-pages">
    <h2 class="vp-related-pages-title">{{ title }}</h2>
    <div class="vp-related-pages-list">
      <router-link
        v-for="page in relatedPages"
        :key="page.link"
        :to="page.link"
        class="vp-related-page-item"
      >
        <div class="vp-related-page-content">
          <h3 class="vp-related-page-title">{{ page.title }}</h3>
          <p v-if="page.description" class="vp-related-page-description">
            {{ page.description }}
          </p>
          <div v-if="page.tags && page.tags.length > 0" class="vp-related-page-tags">
            <span
              v-for="tag in page.tags"
              :key="tag"
              class="vp-related-page-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="vp-related-page-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'
import { computeRelatedPages } from '../composables/relatedPages'

interface Props {
  /** 最大显示数量 */
  maxItems?: number
  /** 标题文本 */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 5,
  title: '相关页面'
})

const { page, site, theme } = useData()
const route = useRoute()

// 计算相关页面
const relatedPages = computed(() => {
  try {
    return computeRelatedPages(
      route.path,
      page.value,
      site.value,
      theme.value,
      props.maxItems
    )
  } catch {
    return []
  }
})
</script>

<style scoped>
.vp-related-pages {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--ldoc-c-divider);
}

.vp-related-pages-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px;
  color: var(--ldoc-c-text-1);
}

.vp-related-pages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vp-related-page-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  background: transparent;
}

.vp-related-page-item:hover {
  background: var(--ldoc-c-bg-soft);
  border-color: var(--ldoc-c-brand);
  transform: translateX(4px);
}

.vp-related-page-content {
  flex: 1;
  min-width: 0;
}

.vp-related-page-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px;
  color: var(--ldoc-c-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-related-page-description {
  font-size: 14px;
  margin: 0 0 8px;
  color: var(--ldoc-c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vp-related-page-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vp-related-page-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  color: var(--ldoc-c-brand);
  background: var(--ldoc-c-brand-soft);
  border-radius: 4px;
}

.vp-related-page-arrow {
  flex-shrink: 0;
  margin-left: 16px;
  color: var(--ldoc-c-text-3);
  transition: transform 0.2s;
}

.vp-related-page-item:hover .vp-related-page-arrow {
  color: var(--ldoc-c-brand);
  transform: translateX(4px);
}

/* 响应式 */
@media (max-width: 767px) {
  .vp-related-pages {
    margin-top: 32px;
    padding-top: 24px;
  }

  .vp-related-pages-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .vp-related-page-item {
    padding: 12px;
  }

  .vp-related-page-title {
    font-size: 15px;
  }

  .vp-related-page-description {
    font-size: 13px;
  }

  .vp-related-page-arrow {
    margin-left: 12px;
  }
}

@media (min-width: 1920px) {
  .vp-related-pages {
    margin-top: 56px;
    padding-top: 40px;
  }

  .vp-related-pages-title {
    font-size: 22px;
    margin-bottom: 28px;
  }

  .vp-related-page-item {
    padding: 20px;
  }

  .vp-related-page-title {
    font-size: 17px;
  }

  .vp-related-page-description {
    font-size: 15px;
  }
}

/* 打印样式 */
@media print {
  .vp-related-pages {
    display: none;
  }
}
</style>
