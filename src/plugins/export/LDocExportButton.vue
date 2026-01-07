<template>
  <div class="ldoc-export-button" :data-position="position">
    <button class="ldoc-export-button__btn" :class="{ 'ldoc-export-button__btn--loading': loading }" :disabled="loading"
      @click="handleClick">
      <svg v-if="!loading" class="ldoc-export-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <div v-else class="ldoc-export-button__spinner"></div>
      <span>{{ loading ? '导出中...' : buttonText }}</span>
    </button>

    <Teleport to="body">
      <div v-if="pickerOpen" class="ldoc-export-picker-mask" @click.self="closePicker">
        <div class="ldoc-export-picker" role="dialog" aria-modal="true">
          <div class="ldoc-export-picker__header">
            <div class="ldoc-export-picker__title">导出文档</div>
            <button type="button" class="ldoc-export-picker__close" @click="closePicker">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- 导出范围选择 -->
          <div v-if="showScopeOption" class="ldoc-export-picker__section">
            <div class="ldoc-export-picker__label">导出范围</div>
            <div class="ldoc-export-picker__scope">
              <button 
                type="button" 
                class="ldoc-export-picker__scope-btn"
                :class="{ 'ldoc-export-picker__scope-btn--active': selectedScope === 'current' }"
                @click="selectedScope = 'current'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>当前页面</span>
              </button>
              <button 
                type="button" 
                class="ldoc-export-picker__scope-btn"
                :class="{ 'ldoc-export-picker__scope-btn--active': selectedScope === 'all' }"
                @click="selectedScope = 'all'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>所有文档</span>
              </button>
            </div>
          </div>
          
          <!-- 导出格式选择 -->
          <div class="ldoc-export-picker__section">
            <div class="ldoc-export-picker__label">导出格式</div>
            <div class="ldoc-export-picker__formats">
              <button 
                v-for="format in formats" 
                :key="format.value" 
                type="button" 
                class="ldoc-export-picker__format"
                :class="{ 'ldoc-export-picker__format--active': selectedFormat === format.value }"
                @click="selectedFormat = format.value"
              >
                <span class="ldoc-export-picker__format-icon">{{ getFormatIcon(format.value) }}</span>
                <span class="ldoc-export-picker__format-label">{{ format.label }}</span>
                <span class="ldoc-export-picker__format-desc">{{ getFormatDesc(format.value) }}</span>
              </button>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="ldoc-export-picker__actions">
            <button type="button" class="ldoc-export-picker__cancel" @click="closePicker">取消</button>
            <button type="button" class="ldoc-export-picker__confirm" @click="confirmExport">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              开始导出
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ExportFormat, ExportScope, Props } from './types'

const props = withDefaults(defineProps<Props>(), {
  buttonText: '导出文档',
  formats: () => [
    { value: 'pdf', label: 'PDF' },
    { value: 'html', label: 'HTML' },
    { value: 'epub', label: 'EPUB' }
  ],
  loading: false,
  showScopeOption: true
})

const pickerOpen = ref(false)
const selectedScope = ref<ExportScope>('current')
const selectedFormat = ref('pdf')

const openPicker = () => {
  // 重置选中的格式为第一个可用格式
  if (props.formats && props.formats.length > 0) {
    selectedFormat.value = props.formats[0].value
  }
  pickerOpen.value = true
}

const closePicker = () => {
  pickerOpen.value = false
}

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'pdf': return '📄'
    case 'html': return '🌐'
    case 'epub': return '📖'
    case 'docx': return '🗒️'
    case 'md': return '📝'
    default: return '📁'
  }
}

const getFormatDesc = (format: string) => {
  switch (format) {
    case 'pdf': return '适合打印和分享'
    case 'html': return '离线浏览和部署'
    case 'epub': return '电子书格式'
    case 'docx': return 'Word 文档'
    case 'md': return 'Markdown 源文件'
    default: return ''
  }
}

const confirmExport = () => {
  closePicker()
  if (props.loading) return
  window.dispatchEvent(new CustomEvent('ldoc:export', {
    detail: { 
      format: selectedFormat.value,
      scope: selectedScope.value
    }
  }))
}

const handleClick = () => {
  if (props.loading) return
  openPicker()
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

/* When in floating position (back-to-top-before), style as floating button */
.ldoc-export-button[data-position="floating"] {
  position: fixed;
  bottom: 84px;
  right: 24px;
  z-index: 101;
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

.ldoc-export-picker-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ldoc-export-picker {
  width: min(420px, calc(100vw - 32px));
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  padding: 0;
  overflow: hidden;
}

.ldoc-export-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ldoc-c-divider);
}

.ldoc-export-picker__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
}

.ldoc-export-picker__close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--ldoc-c-text-3);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.ldoc-export-picker__close:hover {
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-1);
}

.ldoc-export-picker__close svg {
  width: 16px;
  height: 16px;
}

.ldoc-export-picker__section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--ldoc-c-divider);
}

.ldoc-export-picker__section:last-of-type {
  border-bottom: none;
}

.ldoc-export-picker__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ldoc-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.ldoc-export-picker__scope {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ldoc-export-picker__scope-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 12px;
  border: 2px solid var(--ldoc-c-divider);
  border-radius: 12px;
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.ldoc-export-picker__scope-btn:hover {
  border-color: var(--ldoc-c-brand-light);
  background: var(--ldoc-c-bg);
}

.ldoc-export-picker__scope-btn--active {
  border-color: var(--ldoc-c-brand);
  background: var(--ldoc-c-brand-soft);
  color: var(--ldoc-c-brand);
}

.ldoc-export-picker__scope-btn svg {
  width: 24px;
  height: 24px;
}

.ldoc-export-picker__scope-btn span {
  font-size: 13px;
  font-weight: 500;
}

.ldoc-export-picker__formats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ldoc-export-picker__format {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid var(--ldoc-c-divider);
  border-radius: 10px;
  background: var(--ldoc-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.ldoc-export-picker__format:hover {
  border-color: var(--ldoc-c-brand-light);
  background: var(--ldoc-c-bg);
}

.ldoc-export-picker__format--active {
  border-color: var(--ldoc-c-brand);
  background: var(--ldoc-c-brand-soft);
}

.ldoc-export-picker__format-icon {
  font-size: 22px;
  line-height: 1;
}

.ldoc-export-picker__format-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  flex: 1;
}

.ldoc-export-picker__format-desc {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}

.ldoc-export-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  background: var(--ldoc-c-bg-soft);
}

.ldoc-export-picker__cancel {
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--ldoc-c-divider);
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.ldoc-export-picker__cancel:hover {
  border-color: var(--ldoc-c-text-3);
  color: var(--ldoc-c-text-1);
}

.ldoc-export-picker__confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  background: var(--ldoc-c-brand);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.ldoc-export-picker__confirm:hover {
  background: var(--ldoc-c-brand-dark);
}

.ldoc-export-picker__confirm svg {
  width: 16px;
  height: 16px;
}
</style>
