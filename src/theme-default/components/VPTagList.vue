<template>
  <div class="vp-tag-list" :class="{ wrap }">
    <VPTag
      v-for="tag in tags"
      :key="tag"
      :tag="tag"
      :size="size"
      :variant="variant"
      :clickable="clickable"
      @click="handleTagClick"
    >
      {{ tag }}
    </VPTag>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import VPTag from './VPTag.vue'

interface Props {
  tags: string[]
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  clickable?: boolean
  wrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  clickable: true,
  wrap: true
})

const emit = defineEmits<{
  tagClick: [tag: string]
}>()

const router = useRouter()

const handleTagClick = (tag: string) => {
  emit('tagClick', tag)
  
  if (props.clickable) {
    // Navigate to tag page
    router.push(`/tags/${encodeURIComponent(tag)}.html`)
  }
}
</script>

<style scoped>
.vp-tag-list {
  display: flex;
  gap: 8px;
  align-items: center;
}

.vp-tag-list.wrap {
  flex-wrap: wrap;
}
</style>
