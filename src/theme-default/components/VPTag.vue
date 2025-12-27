<template>
  <span class="vp-tag" :class="[size, variant]" @click="handleClick">
    <slot>{{ tag }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tag?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  clickable: false
})

const emit = defineEmits<{
  click: [tag: string]
}>()

const handleClick = () => {
  if (props.clickable && props.tag) {
    emit('click', props.tag)
  }
}
</script>

<style scoped>
.vp-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

/* Sizes */
.vp-tag.small {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.5;
}

.vp-tag.medium {
  padding: 4px 12px;
  font-size: 14px;
  line-height: 1.5;
}

.vp-tag.large {
  padding: 6px 16px;
  font-size: 16px;
  line-height: 1.5;
}

/* Variants */
.vp-tag.default {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.vp-tag.primary {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-brand-light);
}

.vp-tag.success {
  background-color: var(--vp-c-success-soft);
  color: var(--vp-c-success);
  border: 1px solid var(--vp-c-success-light);
}

.vp-tag.warning {
  background-color: var(--vp-c-warning-soft);
  color: var(--vp-c-warning);
  border: 1px solid var(--vp-c-warning-light);
}

.vp-tag.danger {
  background-color: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
  border: 1px solid var(--vp-c-danger-light);
}

/* Clickable */
.vp-tag[clickable] {
  cursor: pointer;
}

.vp-tag[clickable]:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}
</style>
