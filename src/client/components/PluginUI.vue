<script setup lang="ts">
/**
 * 插件 UI 组件
 * 渲染 Toast、Loading 和 Modal
 */
import { toastState, loadingState, modalState } from '../composables/usePluginContext'

// 关闭 Modal
function closeModal(result: boolean) {
  if (modalState.value.resolve) {
    modalState.value.resolve(result)
  }
  modalState.value.visible = false
}

// Toast 图标
function getToastIcon(type: string) {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    default:
      return 'ℹ'
  }
}

// Toast 颜色
function getToastColor(type: string) {
  switch (type) {
    case 'success':
      return 'var(--ldoc-c-green-1, #10b981)'
    case 'error':
      return 'var(--ldoc-c-red-1, #ef4444)'
    case 'warning':
      return 'var(--ldoc-c-yellow-1, #f59e0b)'
    default:
      return 'var(--ldoc-c-brand-1, #3b82f6)'
  }
}
</script>

<template>
  <!-- Toast -->
  <Teleport to="body">
    <Transition name="ldoc-toast">
      <div
        v-if="toastState.visible"
        class="ldoc-toast"
        :class="[`ldoc-toast--${toastState.position}`]"
        :style="{ '--toast-color': getToastColor(toastState.type || 'info') }"
      >
        <span class="ldoc-toast__icon">{{ getToastIcon(toastState.type || 'info') }}</span>
        <span class="ldoc-toast__message">{{ toastState.message }}</span>
      </div>
    </Transition>
  </Teleport>

  <!-- Loading -->
  <Teleport to="body">
    <Transition name="ldoc-loading">
      <div v-if="loadingState.visible" class="ldoc-loading-overlay">
        <div class="ldoc-loading">
          <div class="ldoc-loading__spinner"></div>
          <span v-if="loadingState.message" class="ldoc-loading__message">
            {{ loadingState.message }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="ldoc-modal">
      <div v-if="modalState.visible" class="ldoc-modal-overlay" @click.self="closeModal(false)">
        <div class="ldoc-modal">
          <div v-if="modalState.options?.title" class="ldoc-modal__header">
            {{ modalState.options.title }}
          </div>
          <div class="ldoc-modal__body">
            <template v-if="typeof modalState.options?.content === 'string'">
              {{ modalState.options.content }}
            </template>
            <component v-else :is="modalState.options?.content" />
          </div>
          <div class="ldoc-modal__footer">
            <button
              v-if="modalState.options?.showCancel !== false"
              class="ldoc-modal__btn ldoc-modal__btn--cancel"
              @click="closeModal(false)"
            >
              {{ modalState.options?.cancelText || '取消' }}
            </button>
            <button
              class="ldoc-modal__btn ldoc-modal__btn--confirm"
              @click="closeModal(true)"
            >
              {{ modalState.options?.confirmText || '确定' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* Toast 样式 */
.ldoc-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--ldoc-c-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid var(--toast-color);
}

.ldoc-toast--top {
  top: 20px;
}

.ldoc-toast--bottom {
  bottom: 20px;
}

.ldoc-toast--center {
  top: 50%;
  transform: translate(-50%, -50%);
}

.ldoc-toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--toast-color);
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.ldoc-toast__message {
  font-size: 14px;
  color: var(--ldoc-c-text-1, #1f2937);
}

/* Toast 动画 */
.ldoc-toast-enter-active,
.ldoc-toast-leave-active {
  transition: all 0.3s ease;
}

.ldoc-toast-enter-from,
.ldoc-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* Loading 样式 */
.ldoc-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.ldoc-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: var(--ldoc-c-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.ldoc-loading__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ldoc-c-divider, #e5e7eb);
  border-top-color: var(--ldoc-c-brand-1, #3b82f6);
  border-radius: 50%;
  animation: ldoc-spin 0.8s linear infinite;
}

@keyframes ldoc-spin {
  to {
    transform: rotate(360deg);
  }
}

.ldoc-loading__message {
  font-size: 14px;
  color: var(--ldoc-c-text-2, #6b7280);
}

/* Loading 动画 */
.ldoc-loading-enter-active,
.ldoc-loading-leave-active {
  transition: opacity 0.3s ease;
}

.ldoc-loading-enter-from,
.ldoc-loading-leave-to {
  opacity: 0;
}

/* Modal 样式 */
.ldoc-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.ldoc-modal {
  width: 90%;
  max-width: 420px;
  background: var(--ldoc-c-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.ldoc-modal__header {
  padding: 20px 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ldoc-c-text-1, #1f2937);
}

.ldoc-modal__body {
  padding: 20px 24px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ldoc-c-text-2, #6b7280);
}

.ldoc-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--ldoc-c-divider, #e5e7eb);
}

.ldoc-modal__btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ldoc-modal__btn--cancel {
  background: var(--ldoc-c-bg-soft, #f3f4f6);
  color: var(--ldoc-c-text-2, #6b7280);
}

.ldoc-modal__btn--cancel:hover {
  background: var(--ldoc-c-bg-mute, #e5e7eb);
}

.ldoc-modal__btn--confirm {
  background: var(--ldoc-c-brand-1, #3b82f6);
  color: #fff;
}

.ldoc-modal__btn--confirm:hover {
  background: var(--ldoc-c-brand-2, #2563eb);
}

/* Modal 动画 */
.ldoc-modal-enter-active,
.ldoc-modal-leave-active {
  transition: opacity 0.3s ease;
}

.ldoc-modal-enter-active .ldoc-modal,
.ldoc-modal-leave-active .ldoc-modal {
  transition: transform 0.3s ease;
}

.ldoc-modal-enter-from,
.ldoc-modal-leave-to {
  opacity: 0;
}

.ldoc-modal-enter-from .ldoc-modal,
.ldoc-modal-leave-to .ldoc-modal {
  transform: scale(0.9);
}

/* 暗色模式 */
.dark .ldoc-toast,
.dark .ldoc-loading,
.dark .ldoc-modal {
  background: var(--ldoc-c-bg, #1f2937);
}

.dark .ldoc-toast__message,
.dark .ldoc-loading__message,
.dark .ldoc-modal__header {
  color: var(--ldoc-c-text-1, #f9fafb);
}

.dark .ldoc-modal__body {
  color: var(--ldoc-c-text-2, #d1d5db);
}
</style>
