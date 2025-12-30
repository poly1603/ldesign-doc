<script setup lang="ts">
/**
 * @description 开发模式错误覆盖层组件
 * 在开发模式下显示编译错误、运行时错误等，提供友好的错误展示界面
 *
 * @example
 * ```vue
 * <DevErrorOverlay
 *   :errors="compileErrors"
 *   @dismiss="handleDismiss"
 *   @open-file="handleOpenFile"
 * />
 * ```
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /** 错误类型 */
  type: 'compile' | 'runtime' | 'syntax' | 'warning'
  /** 错误消息 */
  message: string
  /** 文件路径 */
  file?: string
  /** 行号 */
  line?: number
  /** 列号 */
  column?: number
  /** 错误堆栈 */
  stack?: string
  /** 源代码片段 */
  source?: string
  /** 代码帧（带高亮的源代码上下文） */
  frame?: string
  /** 错误 ID */
  id?: string
  /** 插件名称 */
  plugin?: string
  /** 提示信息 */
  hint?: string
}

const props = withDefaults(defineProps<{
  /** 错误列表 */
  errors?: ErrorInfo[]
  /** 是否自动连接 HMR */
  autoConnect?: boolean
  /** 是否显示关闭按钮 */
  dismissible?: boolean
  /** 按 Escape 关闭 */
  escapeClose?: boolean
  /** 主题色 */
  theme?: 'dark' | 'light'
}>(), {
  errors: () => [],
  autoConnect: true,
  dismissible: true,
  escapeClose: true,
  theme: 'dark'
})

const emit = defineEmits<{
  /** 关闭错误覆盖层 */
  dismiss: []
  /** 打开文件 */
  openFile: [file: string, line?: number, column?: number]
  /** 错误数量变化 */
  errorCountChange: [count: number]
}>()

// 内部状态
const internalErrors = ref<ErrorInfo[]>([])
const currentIndex = ref(0)
const isVisible = ref(false)
const copied = ref(false)

// 合并外部和内部错误
const allErrors = computed(() => {
  const external = props.errors || []
  return [...external, ...internalErrors.value]
})

// 当前显示的错误
const currentError = computed(() => {
  return allErrors.value[currentIndex.value] || null
})

// 是否有错误
const hasErrors = computed(() => allErrors.value.length > 0)

// 监听错误数量变化
watch(
  () => allErrors.value.length,
  (count) => {
    isVisible.value = count > 0
    if (count > 0 && currentIndex.value >= count) {
      currentIndex.value = count - 1
    }
    emit('errorCountChange', count)
  },
  { immediate: true }
)

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isVisible.value) return

  switch (e.key) {
    case 'Escape':
      if (props.escapeClose && props.dismissible) {
        dismiss()
      }
      break
    case 'ArrowLeft':
      prevError()
      break
    case 'ArrowRight':
      nextError()
      break
  }
}

// 添加错误
const addError = (error: ErrorInfo) => {
  // 去重
  const exists = internalErrors.value.some(
    e => e.message === error.message && e.file === error.file && e.line === error.line
  )
  if (!exists) {
    internalErrors.value.push({
      ...error,
      id: error.id || `error-${Date.now()}-${Math.random().toString(36).slice(2)}`
    })
  }
}

// 清除所有错误
const clearErrors = () => {
  internalErrors.value = []
  currentIndex.value = 0
}

// 移除特定错误
const removeError = (id: string) => {
  const index = internalErrors.value.findIndex(e => e.id === id)
  if (index > -1) {
    internalErrors.value.splice(index, 1)
    if (currentIndex.value >= internalErrors.value.length) {
      currentIndex.value = Math.max(0, internalErrors.value.length - 1)
    }
  }
}

// 切换到上一个错误
const prevError = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// 切换到下一个错误
const nextError = () => {
  if (currentIndex.value < allErrors.value.length - 1) {
    currentIndex.value++
  }
}

// 关闭覆盖层
const dismiss = () => {
  if (props.dismissible) {
    isVisible.value = false
    emit('dismiss')
  }
}

// 打开文件
const openFile = (error: ErrorInfo) => {
  if (error.file) {
    emit('openFile', error.file, error.line, error.column)
  }
}

// 复制错误信息
const copyError = async () => {
  if (!currentError.value) return

  const error = currentError.value
  const text = [
    `[${error.type.toUpperCase()}] ${error.message}`,
    error.file && `File: ${error.file}${error.line ? `:${error.line}` : ''}${error.column ? `:${error.column}` : ''}`,
    error.plugin && `Plugin: ${error.plugin}`,
    error.frame && `\n${error.frame}`,
    error.stack && `\nStack:\n${error.stack}`
  ].filter(Boolean).join('\n')

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    console.error('Failed to copy error to clipboard')
  }
}

// 获取错误类型图标
const getErrorIcon = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'compile':
      return '⚙️'
    case 'runtime':
      return '💥'
    case 'syntax':
      return '📝'
    case 'warning':
      return '⚠️'
    default:
      return '❌'
  }
}

// 获取错误类型标签
const getErrorLabel = (type: ErrorInfo['type']) => {
  switch (type) {
    case 'compile':
      return '编译错误'
    case 'runtime':
      return '运行时错误'
    case 'syntax':
      return '语法错误'
    case 'warning':
      return '警告'
    default:
      return '错误'
  }
}

// HMR 错误监听
let cleanup: (() => void) | null = null

const setupHMRListener = () => {
  if (!props.autoConnect || typeof window === 'undefined') return

  // Vite HMR 错误监听
  if (import.meta.hot) {
    const handleError = (err: Error) => {
      addError({
        type: 'compile',
        message: err.message,
        stack: err.stack
      })
    }

    import.meta.hot.on('vite:error', (payload: { err: { message: string; stack?: string } }) => {
      addError({
        type: 'compile',
        message: payload.err.message,
        stack: payload.err.stack
      })
    })

    import.meta.hot.on('vite:beforeUpdate', () => {
      // 清除之前的编译错误
      internalErrors.value = internalErrors.value.filter(e => e.type !== 'compile')
    })

    // 监听全局错误
    window.addEventListener('error', handleError as EventListener)
    window.addEventListener('unhandledrejection', (e) => {
      addError({
        type: 'runtime',
        message: e.reason?.message || String(e.reason),
        stack: e.reason?.stack
      })
    })

    cleanup = () => {
      window.removeEventListener('error', handleError as EventListener)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  setupHMRListener()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  cleanup?.()
})

// 暴露方法供外部使用
defineExpose({
  addError,
  clearErrors,
  removeError,
  show: () => { isVisible.value = true },
  hide: () => { isVisible.value = false }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="isVisible && hasErrors"
        class="dev-error-overlay"
        :class="[`theme-${theme}`]"
        @click.self="dismiss"
      >
        <div class="error-container">
          <!-- 头部 -->
          <header class="error-header">
            <div class="error-type">
              <span class="error-icon">{{ getErrorIcon(currentError?.type || 'compile') }}</span>
              <span class="error-label">{{ getErrorLabel(currentError?.type || 'compile') }}</span>
              <span v-if="currentError?.plugin" class="error-plugin">
                {{ currentError.plugin }}
              </span>
            </div>

            <div class="error-navigation">
              <span class="error-count">
                {{ currentIndex + 1 }} / {{ allErrors.length }}
              </span>
              <button
                class="nav-button"
                :disabled="currentIndex === 0"
                @click="prevError"
                title="上一个错误 (←)"
              >
                ‹
              </button>
              <button
                class="nav-button"
                :disabled="currentIndex === allErrors.length - 1"
                @click="nextError"
                title="下一个错误 (→)"
              >
                ›
              </button>
            </div>

            <div class="error-actions">
              <button
                class="action-button"
                @click="copyError"
                :title="copied ? '已复制!' : '复制错误信息'"
              >
                {{ copied ? '✓' : '📋' }}
              </button>
              <button
                v-if="dismissible"
                class="action-button close-button"
                @click="dismiss"
                title="关闭 (Esc)"
              >
                ×
              </button>
            </div>
          </header>

          <!-- 错误内容 -->
          <main class="error-content" v-if="currentError">
            <!-- 错误消息 -->
            <div class="error-message">
              {{ currentError.message }}
            </div>

            <!-- 文件位置 -->
            <div
              v-if="currentError.file"
              class="error-location"
              @click="openFile(currentError)"
            >
              <span class="file-icon">📄</span>
              <span class="file-path">{{ currentError.file }}</span>
              <span v-if="currentError.line" class="file-position">
                :{{ currentError.line }}{{ currentError.column ? `:${currentError.column}` : '' }}
              </span>
              <span class="open-hint">点击打开</span>
            </div>

            <!-- 提示信息 -->
            <div v-if="currentError.hint" class="error-hint">
              <span class="hint-icon">💡</span>
              <span class="hint-text">{{ currentError.hint }}</span>
            </div>

            <!-- 代码帧 -->
            <div v-if="currentError.frame" class="error-frame">
              <pre><code v-html="formatCodeFrame(currentError.frame)"></code></pre>
            </div>

            <!-- 源代码 -->
            <div v-else-if="currentError.source" class="error-source">
              <pre><code>{{ currentError.source }}</code></pre>
            </div>

            <!-- 错误堆栈 -->
            <details v-if="currentError.stack" class="error-stack">
              <summary>堆栈跟踪</summary>
              <pre><code>{{ currentError.stack }}</code></pre>
            </details>
          </main>

          <!-- 底部提示 -->
          <footer class="error-footer">
            <span class="keyboard-hint">
              使用 ← → 切换错误 | Esc 关闭
            </span>
            <span class="powered-by">
              Powered by @ldesign/doc
            </span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
/**
 * 格式化代码帧，添加语法高亮
 */
function formatCodeFrame(frame: string): string {
  if (!frame) return ''

  return frame
    // 高亮错误行
    .replace(/^(>\s*\d+\s*\|.*)$/gm, '<span class="error-line">$1</span>')
    // 高亮行号
    .replace(/^(\s*\d+\s*)\|/gm, '<span class="line-number">$1</span>|')
    // 高亮错误指示器
    .replace(/(\s*\|\s*)(\^+)/g, '$1<span class="error-pointer">$2</span>')
    // 高亮关键字
    .replace(/\b(import|export|from|const|let|var|function|class|return|if|else|for|while)\b/g,
      '<span class="keyword">$1</span>')
    // 高亮字符串
    .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="string">$&</span>')
    // 高亮注释
    .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
}
</script>

<style scoped>
.dev-error-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.theme-dark {
  --overlay-bg: #1a1a1a;
  --overlay-border: #333;
  --text-primary: #fff;
  --text-secondary: #999;
  --text-muted: #666;
  --error-color: #ff5555;
  --warning-color: #ffaa00;
  --success-color: #50fa7b;
  --link-color: #8be9fd;
  --code-bg: #2d2d2d;
  --button-bg: #333;
  --button-hover: #444;
}

.theme-light {
  --overlay-bg: #fff;
  --overlay-border: #e5e5e5;
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --text-muted: #999;
  --error-color: #dc3545;
  --warning-color: #ffc107;
  --success-color: #28a745;
  --link-color: #007bff;
  --code-bg: #f5f5f5;
  --button-bg: #e5e5e5;
  --button-hover: #d5d5d5;
}

.error-container {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--overlay-bg);
  border: 1px solid var(--overlay-border);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* 头部 */
.error-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--error-color);
  color: #fff;
}

.error-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 1.2em;
}

.error-label {
  font-weight: 600;
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.error-plugin {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.8em;
}

.error-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-count {
  font-size: 0.85em;
  opacity: 0.9;
}

.nav-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 1.2em;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.2s;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-button {
  font-size: 1.5em;
  font-weight: 300;
}

/* 错误内容 */
.error-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: var(--text-primary);
}

.error-message {
  font-size: 1.1em;
  line-height: 1.5;
  margin-bottom: 16px;
  word-break: break-word;
}

.error-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: var(--code-bg);
  border-radius: 6px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.2s;
}

.error-location:hover {
  background: var(--button-hover);
}

.file-icon {
  font-size: 1em;
}

.file-path {
  color: var(--link-color);
}

.file-position {
  color: var(--text-secondary);
}

.open-hint {
  margin-left: 8px;
  padding: 2px 6px;
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 0.8em;
  color: var(--text-muted);
}

.error-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: rgba(80, 250, 123, 0.1);
  border: 1px solid rgba(80, 250, 123, 0.3);
  border-radius: 6px;
  color: var(--success-color);
}

.hint-icon {
  flex-shrink: 0;
}

.hint-text {
  font-size: 0.9em;
  line-height: 1.5;
}

.error-frame,
.error-source {
  margin-bottom: 16px;
  background: var(--code-bg);
  border-radius: 8px;
  overflow: hidden;
}

.error-frame pre,
.error-source pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 0.85em;
  line-height: 1.6;
}

.error-frame code,
.error-source code {
  font-family: inherit;
}

/* 代码高亮 */
.error-frame :deep(.error-line) {
  display: block;
  background: rgba(255, 85, 85, 0.2);
  margin: 0 -16px;
  padding: 0 16px;
}

.error-frame :deep(.line-number) {
  color: var(--text-muted);
}

.error-frame :deep(.error-pointer) {
  color: var(--error-color);
  font-weight: bold;
}

.error-frame :deep(.keyword) {
  color: #ff79c6;
}

.error-frame :deep(.string) {
  color: #f1fa8c;
}

.error-frame :deep(.comment) {
  color: #6272a4;
}

/* 堆栈跟踪 */
.error-stack {
  margin-top: 16px;
}

.error-stack summary {
  padding: 8px 12px;
  background: var(--code-bg);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  color: var(--text-secondary);
  transition: background 0.2s;
}

.error-stack summary:hover {
  background: var(--button-hover);
}

.error-stack[open] summary {
  border-radius: 6px 6px 0 0;
}

.error-stack pre {
  margin: 0;
  padding: 16px;
  background: var(--code-bg);
  border-radius: 0 0 6px 6px;
  font-size: 0.8em;
  line-height: 1.5;
  overflow-x: auto;
  color: var(--text-secondary);
}

/* 底部 */
.error-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--overlay-border);
  font-size: 0.8em;
  color: var(--text-muted);
}

.keyboard-hint {
  opacity: 0.7;
}

/* 过渡动画 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-active .error-container,
.overlay-fade-leave-active .error-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-from .error-container,
.overlay-fade-leave-to .error-container {
  transform: scale(0.95);
  opacity: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .dev-error-overlay {
    padding: 10px;
  }

  .error-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .error-navigation {
    order: 3;
    width: 100%;
    justify-content: center;
  }

  .error-footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
