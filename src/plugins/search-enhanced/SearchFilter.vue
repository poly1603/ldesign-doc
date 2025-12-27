<template>
  <div class="search-filter">
    <div v-for="filter in filters" :key="filter.name" class="filter-group">
      <label class="filter-label">{{ filter.label }}</label>
      <select
        :value="selectedFilters[filter.field]"
        @change="handleFilterChange(filter.field, $event)"
        class="filter-select"
      >
        <option value="">全部</option>
        <option
          v-for="option in filter.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SearchFilter } from './index'

interface Props {
  filters: SearchFilter[]
  modelValue?: Record<string, string>
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, string>): void
  (e: 'change', value: Record<string, string>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedFilters = ref<Record<string, string>>(props.modelValue || {})

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedFilters.value = { ...newValue }
    }
  }
)

function handleFilterChange(field: string, event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  
  if (value) {
    selectedFilters.value[field] = value
  } else {
    delete selectedFilters.value[field]
  }
  
  emit('update:modelValue', { ...selectedFilters.value })
  emit('change', { ...selectedFilters.value })
}
</script>

<style scoped>
.search-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: var(--ldoc-c-bg-soft, #f9fafb);
  border-radius: 8px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--ldoc-c-text-2, #6b7280);
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 6px;
  background: var(--ldoc-c-bg, #ffffff);
  color: var(--ldoc-c-text-1, #1f2937);
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:hover {
  border-color: var(--ldoc-c-brand-1, #3b82f6);
}

.filter-select:focus {
  outline: none;
  border-color: var(--ldoc-c-brand-1, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
