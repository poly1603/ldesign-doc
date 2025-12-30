<template>
  <div class="ldoc-api-doc-nav">
    <div class="ldoc-api-doc-nav__title">API 文档</div>
    <div class="ldoc-api-doc-nav__links">
      <a v-if="showTypesLink" href="#" class="ldoc-api-doc-nav__link" @click.prevent="navigateToTypes">
        类型定义
      </a>
      <a v-if="showEnumsLink" href="#" class="ldoc-api-doc-nav__link" @click.prevent="navigateToEnums">
        枚举
      </a>
      <a v-if="showInterfacesLink" href="#" class="ldoc-api-doc-nav__link" @click.prevent="navigateToInterfaces">
        接口
      </a>
      <a v-if="showClassesLink" href="#" class="ldoc-api-doc-nav__link" @click.prevent="navigateToClasses">
        类
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Props } from './types'

withDefaults(defineProps<Props>(), {
  showTypesLink: true,
  showEnumsLink: true,
  showInterfacesLink: true,
  showClassesLink: true
})

const emit = defineEmits<{
  navigate: [type: 'types' | 'enums' | 'interfaces' | 'classes']
}>()

const navigateToTypes = () => emit('navigate', 'types')
const navigateToEnums = () => emit('navigate', 'enums')
const navigateToInterfaces = () => emit('navigate', 'interfaces')
const navigateToClasses = () => emit('navigate', 'classes')
</script>

<style scoped>
.ldoc-api-doc-nav {
  padding: 12px 16px;
  border-left: 3px solid var(--ldoc-c-brand);
  margin: 16px 0;
  background-color: var(--ldoc-c-bg-soft);
  border-radius: 6px;
}

.ldoc-api-doc-nav__title {
  font-weight: 600;
  font-size: 14px;
  color: var(--ldoc-c-text-1);
  margin-bottom: 8px;
}

.ldoc-api-doc-nav__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ldoc-api-doc-nav__link {
  font-size: 13px;
  color: var(--ldoc-c-brand);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.ldoc-api-doc-nav__link:hover {
  background-color: var(--ldoc-c-brand-light);
  color: white;
}
</style>
