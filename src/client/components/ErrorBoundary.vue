<script setup lang="ts">
/**
 * 错误边界组件
 * 
 * 用于捕获子组件的运行时错误，提供优雅的降级处理。
 * 
 * @example
 * ```vue
 * <ErrorBoundary>
 *   <MyComponent />
 *   <template #fallback="{ error, reset }">
 *     <div>出错了: {{ error.message }}</div>
 *     <button @click="reset">重试</button>
 *   </template>
 * </ErrorBoundary>
 * ```
 */
import { ref, onErrorCaptured, defineProps, defineEmits, defineSlots } from 'vue'

interface Props {
  /** 是否在开发模式下显示详细错误堆栈 */
  showStack?: boolean
  /** 自动重试次数，超过后不再重试 */
  maxRetries?: number
  /** 重试前的延迟时间 (ms) */
  retryDelay?: number
  /** 是否在控制台打印错误 */
  logError?: boolean
}

interface ErrorInfo {
  /** 错误对象 */
  error: Error
  /** 错误组件信息 */
  componentInfo: string
  /** 错误发生时间 */
  timestamp: Date
  /** 重试次数 */
  retryCount: number
}

const props = withDefaults(defineProps<Props>(), {
  showStack: import.meta.env?.DEV ?? false,
  maxRetries: 3,
  retryDelay: 1000,
  logError: true
})

const emit = defineEmits<{
  (e: 'error', info: ErrorInfo): void
  (e: 'reset'): void
  (e: 'retry', count: number): void
}>()

defineSlots<{
  default(): any
  fallback(props: { error: Error; errorInfo: ErrorInfo; reset: () => void; retry: () => void }): any
}>()

// 状态
const hasError = ref(false)
const currentError = ref<Error | null>(null)
const componentInfo = ref('')
const retryCount = ref(0)
const isRetrying = ref(false)

// 错误信息
const errorInfo = ref<ErrorInfo | null>(null)

// 捕获错误
onErrorCaptured((error: Error, instance, info) => {
  hasError.value = true
  currentError.value = error
  componentInfo.value = info

  const errInfo: ErrorInfo = {
    error,
    componentInfo: info,
    timestamp: new Date(),
    retryCount: retryCount.value
  }
  errorInfo.value = errInfo

  // 打印错误
  if (props.logError) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component info:', info)
  }

  // 发出错误事件
  emit('error', errInfo)

  // 阻止错误继续向上传播
  return false
})

// 重置错误状态
function reset() {
  hasError.value = false
  currentError.value = null
  componentInfo.value = ''
  retryCount.value = 0
  errorInfo.value = null
  emit('reset')
}

// 重试
async function retry() {
  if (retryCount.value >= props.maxRetries) {
    console.warn('[ErrorBoundary] Max retry count reached')
    return
  }

  isRetrying.value = true
  retryCount.value++
  emit('retry', retryCount.value)

  // 延迟后重试
  await new Promise(resolve => setTimeout(resolve, props.retryDelay))

  hasError.value = false
  currentError.value = null
  isRetrying.value = false
}

// 复制错误信息到剪贴板
async function copyError() {
  if (!currentError.value) return

  const errorText = [
    `Error: ${currentError.value.message}`,
    `Component: ${componentInfo.value}`,
    `Time: ${errorInfo.value?.timestamp.toISOString()}`,
    '',
    'Stack:',
    currentError.value.stack || 'No stack trace'
  ].join('\n')

  try {
    await navigator.clipboard.writeText(errorText)
    // 可以添加一个 toast 提示
  } catch (e) {
    console.error('Failed to copy error:', e)
  }
}
</script>

<template>
  <slot v-if="!hasError" />
  
  <slot
    v-else
    name="fallback"
    :error="currentError!"
    :error-info="errorInfo!"
    :reset="reset"
    :retry="retry"
  >
    <!-- 默认 fallback UI -->
    <div class="ldoc-error-boundary">
      <div class="ldoc-error-boundary-content">
        <div class="ldoc-error-boundary-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        
        <h2 class="ldoc-error-boundary-title">页面出现错误</h2>
        
        <p class="ldoc-error-boundary-message">
          {{ currentError?.message || '未知错误' }}
        </p>
        
        <!-- 开发模式显示堆栈 -->
        <details v-if="showStack && currentError?.stack" class="ldoc-error-boundary-stack">
          <summary>查看错误堆栈</summary>
          <pre>{{ currentError.stack }}</pre>
        </details>
        
        <div class="ldoc-error-boundary-meta">
          <span>组件: {{ componentInfo }}</span>
          <span>时间: {{ errorInfo?.timestamp.toLocaleTimeString() }}</span>
          <span v-if="retryCount > 0">重试次数: {{ retryCount }}</span>
        </div>
        
        <div class="ldoc-error-boundary-actions">
          <button
            class="ldoc-error-boundary-btn ldoc-error-boundary-btn-primary"
            :disabled="isRetrying || retryCount >= maxRetries"
            @click="retry"
          >
            {{ isRetrying ? '重试中...' : retryCount >= maxRetries ? '已达重试上限' : '重试' }}
          </button>
          
          <button
            class="ldoc-error-boundary-btn"
            @click="reset"
          >
            重置
          </button>
          
          <button
            class="ldoc-error-boundary-btn"
            @click="copyError"
          >
            复制错误
          </button>
        </div>
      </div>
    </div>
  </slot>
</template>

<style scoped>
.ldoc-error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 32px;
  background: var(--ldoc-c-bg-soft, #f6f8fa);
  border-radius: 12px;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
}

.ldoc-error-boundary-content {
  text-align: center;
  max-width: 500px;
}

.ldoc-error-boundary-icon {
  color: var(--ldoc-c-danger, #ef4444);
  margin-bottom: 16px;
}

.ldoc-error-boundary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ldoc-c-text-1, #1f2937);
  margin: 0 0 8px;
}

.ldoc-error-boundary-message {
  color: var(--ldoc-c-text-2, #6b7280);
  margin: 0 0 16px;
  word-break: break-word;
}

.ldoc-error-boundary-stack {
  text-align: left;
  margin-bottom: 16px;
  background: var(--ldoc-c-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  overflow: hidden;
}

.ldoc-error-boundary-stack summary {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--ldoc-c-text-2, #6b7280);
  background: var(--ldoc-c-bg-soft, #f6f8fa);
}

.ldoc-error-boundary-stack summary:hover {
  color: var(--ldoc-c-text-1, #1f2937);
}

.ldoc-error-boundary-stack pre {
  margin: 0;
  padding: 12px;
  font-size: 0.75rem;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--ldoc-c-text-2, #6b7280);
  background: var(--ldoc-c-bg, #fff);
}

.ldoc-error-boundary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 0.75rem;
  color: var(--ldoc-c-text-3, #9ca3af);
}

.ldoc-error-boundary-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.ldoc-error-boundary-btn {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 6px;
  background: var(--ldoc-c-bg, #fff);
  color: var(--ldoc-c-text-1, #1f2937);
  cursor: pointer;
  transition: all 0.2s;
}

.ldoc-error-boundary-btn:hover:not(:disabled) {
  border-color: var(--ldoc-c-brand, #3b82f6);
  color: var(--ldoc-c-brand, #3b82f6);
}

.ldoc-error-boundary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ldoc-error-boundary-btn-primary {
  background: var(--ldoc-c-brand, #3b82f6);
  border-color: var(--ldoc-c-brand, #3b82f6);
  color: #fff;
}

.ldoc-error-boundary-btn-primary:hover:not(:disabled) {
  background: var(--ldoc-c-brand-dark, #2563eb);
  border-color: var(--ldoc-c-brand-dark, #2563eb);
  color: #fff;
}

/* 暗色模式 */
.dark .ldoc-error-boundary {
  background: var(--ldoc-c-bg-soft, #1f2937);
  border-color: var(--ldoc-c-divider, #374151);
}

.dark .ldoc-error-boundary-stack {
  background: var(--ldoc-c-bg, #111827);
  border-color: var(--ldoc-c-divider, #374151);
}

.dark .ldoc-error-boundary-stack summary {
  background: var(--ldoc-c-bg-soft, #1f2937);
}

.dark .ldoc-error-boundary-stack pre {
  background: var(--ldoc-c-bg, #111827);
}

.dark .ldoc-error-boundary-btn {
  background: var(--ldoc-c-bg, #111827);
  border-color: var(--ldoc-c-divider, #374151);
}
</style>
