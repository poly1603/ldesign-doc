<template>
  <div class="ldoc-export-button" :data-position="position">
    <button class="ldoc-export-button__btn" :class="{ 'ldoc-export-button__btn--loading': loading }" :disabled="loading"
      @click="handleExport">
      <svg v-if="!loading" class="ldoc-export-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <div v-else class="ldoc-export-button__spinner"></div>
      <span>{{ loading ? '导出中...' : buttonText }}</span>
    </button>

    <div v-if="formats.length > 1" class="ldoc-export-button__dropdown">
      <select v-model="selectedFormat" class="ldoc-export-button__select" :disabled="loading">
        <option v-for="format in formats" :key="format.value" :value="format.value">
          {{ format.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ExportFormat, Props } from './types'

const props = withDefaults(defineProps<Props>(), {
  buttonText: '导出文档',
  formats: () => [
    { value: 'pdf', label: 'PDF' },
    { value: 'html', label: 'HTML' },
    { value: 'epub', label: 'EPUB' }
  ],
  loading: false
})

const emit = defineEmits<{
  export: [format: string]
}>()

const selectedFormat = ref(props.formats[0]?.value || 'pdf')

const handleExport = () => {
  if (!props.loading) {
    // 触发全局导出事件
    window.dispatchEvent(new CustomEvent('ldoc:export', {
      detail: { format: selectedFormat.value }
    }))
  }
}
</script>

<style scoped>
.ldoc-export-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* When in navigation bar, match nav button styles */
.ldoc-export-button:has(.ldoc-export-button__btn) {
  margin: 0;
}

.ldoc-export-button__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 6px 12px;
  background-color: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-2);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.ldoc-export-button__btn:hover:not(:disabled) {
  border-color: var(--ldoc-c-brand);
  background-color: var(--ldoc-c-bg-mute);
  color: var(--ldoc-c-text-1);
  transform: none;
}

.ldoc-export-button__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ldoc-export-button__icon {
  width: 16px;
  height: 16px;
}

.ldoc-export-button__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--ldoc-c-text-3);
  border-top: 2px solid var(--ldoc-c-text-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.ldoc-export-button__dropdown {
  display: flex;
  align-items: center;
}

.ldoc-export-button__select {
  padding: 8px 12px;
  border: 1px solid var(--ldoc-c-border);
  border-radius: 6px;
  background-color: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  font-size: 14px;
  cursor: pointer;
}

.ldoc-export-button__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* When in floating position (back-to-top-before), style as floating button */
.ldoc-export-button[data-position="floating"] {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 100;
}

.ldoc-export-button[data-position="floating"] .ldoc-export-button__btn {
  background-color: var(--ldoc-c-brand);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.ldoc-export-button[data-position="floating"] .ldoc-export-button__btn:hover:not(:disabled) {
  background-color: var(--ldoc-c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.ldoc-export-button[data-position="floating"] .ldoc-export-button__btn span {
  display: none;
}

.ldoc-export-button[data-position="floating"] .ldoc-export-button__spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
}

/* When in document bottom (original position), use original styling */
.ldoc-export-button[data-position="doc-bottom"] {
  margin: 16px 0;
}

.ldoc-export-button[data-position="doc-bottom"] .ldoc-export-button__btn {
  background-color: var(--ldoc-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  padding: 8px 16px;
  height: auto;
}

.ldoc-export-button[data-position="doc-bottom"] .ldoc-export-button__btn:hover:not(:disabled) {
  background-color: var(--ldoc-c-brand-dark);
  transform: translateY(-1px);
}

.ldoc-export-button[data-position="doc-bottom"] .ldoc-export-button__spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
}
</style>
