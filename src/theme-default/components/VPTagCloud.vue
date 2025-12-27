<template>
  <div class="vp-tag-cloud">
    <h2 v-if="title" class="tag-cloud-title">{{ title }}</h2>
    <div class="tag-cloud-container">
      <a
        v-for="tagInfo in sortedTags"
        :key="tagInfo.name"
        :href="`/tags/${encodeURIComponent(tagInfo.name)}.html`"
        class="tag-cloud-item"
        :style="getTagStyle(tagInfo)"
        @click.prevent="handleTagClick(tagInfo.name)"
      >
        {{ tagInfo.name }}
        <span class="tag-count">({{ tagInfo.count }})</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { TagInfo } from '../../../node/tags'

interface Props {
  tags: TagInfo[]
  title?: string
  minSize?: number
  maxSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Tags',
  minSize: 14,
  maxSize: 32
})

const router = useRouter()

const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => a.name.localeCompare(b.name))
})

const getTagStyle = (tagInfo: TagInfo) => {
  const maxCount = Math.max(...props.tags.map(t => t.count))
  const minCount = Math.min(...props.tags.map(t => t.count))
  
  // Calculate font size based on count
  const ratio = maxCount === minCount ? 1 : (tagInfo.count - minCount) / (maxCount - minCount)
  const fontSize = props.minSize + ratio * (props.maxSize - props.minSize)
  
  return {
    fontSize: `${fontSize}px`
  }
}

const handleTagClick = (tagName: string) => {
  router.push(`/tags/${encodeURIComponent(tagName)}.html`)
}
</script>

<style scoped>
.vp-tag-cloud {
  padding: 24px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.tag-cloud-title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tag-cloud-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.tag-cloud-item {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  color: var(--vp-c-brand);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  line-height: 1.5;
}

.tag-cloud-item:hover {
  color: var(--vp-c-brand-dark);
  transform: scale(1.1);
}

.tag-count {
  font-size: 0.8em;
  color: var(--vp-c-text-2);
  font-weight: 400;
}
</style>
