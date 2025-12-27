<template>
  <Transition name="ldoc-pwa-update">
    <div v-if="showPrompt" class="ldoc-pwa-update-prompt" role="alert" aria-live="polite">
      <div class="ldoc-pwa-update-content">
        <div class="ldoc-pwa-update-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
        <div class="ldoc-pwa-update-message">
          {{ message }}
        </div>
        <div class="ldoc-pwa-update-actions">
          <button
            class="ldoc-pwa-update-button ldoc-pwa-update-button-primary"
            @click="handleUpdate"
            :aria-label="buttonText"
          >
            {{ buttonText }}
          </button>
          <button
            class="ldoc-pwa-update-button ldoc-pwa-update-button-secondary"
            @click="handleDismiss"
            aria-label="Dismiss update notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// ============== Props ==============

interface Props {
  /** 提示消息 */
  message?: string
  /** 按钮文本 */
  buttonText?: string
  /** 自动检查更新间隔（毫秒） */
  checkInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  message: 'New content available, click to refresh.',
  buttonText: 'Refresh',
  checkInterval: 60000 // 1 分钟
})

// ============== State ==============

const showPrompt = ref(false)
let registration: ServiceWorkerRegistration | null = null
let checkIntervalId: number | null = null

// ============== Lifecycle ==============

onMounted(() => {
  // 监听 PWA 更新事件
  window.addEventListener('ldoc:pwa-update-available', handleUpdateAvailable)

  // 定期检查更新
  if (props.checkInterval > 0) {
    checkIntervalId = window.setInterval(() => {
      checkForUpdates()
    }, props.checkInterval)
  }

  // 初始检查
  checkForUpdates()
})

onUnmounted(() => {
  window.removeEventListener('ldoc:pwa-update-available', handleUpdateAvailable)

  if (checkIntervalId !== null) {
    clearInterval(checkIntervalId)
  }
})

// ============== Methods ==============

/**
 * 处理更新可用事件
 */
function handleUpdateAvailable(event: Event) {
  const customEvent = event as CustomEvent
  registration = customEvent.detail?.registration || null
  showPrompt.value = true
}

/**
 * 检查更新
 */
async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      await reg.update()
    }
  } catch (error) {
    console.error('[PWA] Failed to check for updates:', error)
  }
}

/**
 * 处理更新按钮点击
 */
function handleUpdate() {
  if (registration && registration.waiting) {
    // 通知 Service Worker 跳过等待
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // 监听控制器变化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // 刷新页面以应用更新
      window.location.reload()
    })
  } else {
    // 如果没有等待的 Service Worker，直接刷新
    window.location.reload()
  }
}

/**
 * 处理关闭按钮点击
 */
function handleDismiss() {
  showPrompt.value = false
}
</script>

<style scoped>
.ldoc-pwa-update-prompt {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  max-width: 400px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ldoc-pwa-update-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.ldoc-pwa-update-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--ldoc-c-brand-1);
}

.ldoc-pwa-update-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ldoc-c-text-1);
}

.ldoc-pwa-update-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.ldoc-pwa-update-button {
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.ldoc-pwa-update-button-primary {
  background: var(--ldoc-c-brand-1);
  color: var(--ldoc-c-white);
}

.ldoc-pwa-update-button-primary:hover {
  background: var(--ldoc-c-brand-2);
}

.ldoc-pwa-update-button-secondary {
  background: transparent;
  color: var(--ldoc-c-text-2);
  padding: 6px 8px;
  font-size: 20px;
  line-height: 1;
}

.ldoc-pwa-update-button-secondary:hover {
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-text-1);
}

/* 过渡动画 */
.ldoc-pwa-update-enter-active,
.ldoc-pwa-update-leave-active {
  transition: all 0.3s ease;
}

.ldoc-pwa-update-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.ldoc-pwa-update-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ldoc-pwa-update-prompt {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }

  .ldoc-pwa-update-content {
    flex-wrap: wrap;
  }

  .ldoc-pwa-update-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 暗色模式 */
.dark .ldoc-pwa-update-prompt {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
</style>
