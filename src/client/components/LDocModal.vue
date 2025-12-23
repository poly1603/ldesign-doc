<template>
  <Teleport to="body">
    <Transition name="ldoc-modal-overlay" appear>
      <div v-show="modelValue" class="ldoc-modal__overlay" :style="overlayStyle" @click.self="onMaskClick">
        <Transition name="ldoc-modal-panel" appear>
          <div v-show="modelValue" class="ldoc-modal__panel" :style="panelStyle">
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  namespace?: string
  zIndex?: number
  maskClosable?: boolean
  closeOnEsc?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const ns = computed(() => props.namespace || 'modal')

const overlayStyle = computed(() => ({
  // 基础定位样式，确保作为全屏遮罩显示
  position: 'fixed',
  inset: '0',
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: props.zIndex ?? 1000,
  // 动画变量透传
  '--enter-duration': `var(--ldoc-${ns.value}-enter-duration, 0.3s)`,
  '--leave-duration': `var(--ldoc-${ns.value}-leave-duration, 0.2s)`,
  '--ease': `var(--ldoc-${ns.value}-ease, cubic-bezier(0.4, 0, 0.2, 1))`,
  '--transform-from': `var(--ldoc-${ns.value}-transform-from, scale(0.96) translateY(16px))`
} as Record<string, string | number>))

const panelStyle = computed(() => ({
  width: '100%',
  maxWidth: '640px'
} as Record<string, string | number>))

const onMaskClick = () => {
  if (props.maskClosable === false) return
  emit('update:modelValue', false)
  emit('close')
}

const onKeydown = (e: KeyboardEvent) => {
  if (props.closeOnEsc === false) return
  if (e.key === 'Escape' && props.modelValue) {
    emit('update:modelValue', false)
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') {
    const STYLE_ID = 'ldoc-modal-runtime-style'
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = `
      /* Overlay transition */
      .ldoc-modal-overlay-enter-active,
      .ldoc-modal-overlay-leave-active { transition: all var(--enter-duration) var(--ease); }
      .ldoc-modal-overlay-enter-from,
      .ldoc-modal-overlay-leave-to { opacity: 0; backdrop-filter: blur(0); }

      /* Panel transition */
      .ldoc-modal-panel-enter-active { transition: all var(--enter-duration) var(--ease); }
      .ldoc-modal-panel-leave-active { transition: all var(--leave-duration) ease-in; }
      .ldoc-modal-panel-enter-from,
      .ldoc-modal-panel-leave-to { opacity: 0; transform: var(--transform-from); }
      `
      document.head.appendChild(style)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.ldoc-modal__overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.ldoc-modal__panel {
  width: 100%;
  max-width: 640px;
}

/* Overlay transition */
.ldoc-modal-overlay-enter-active,
.ldoc-modal-overlay-leave-active {
  transition: all var(--enter-duration) var(--ease);
}

.ldoc-modal-overlay-enter-from,
.ldoc-modal-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

/* Panel transition */
.ldoc-modal-panel-enter-active {
  transition: all var(--enter-duration) var(--ease);
}

.ldoc-modal-panel-leave-active {
  transition: all var(--leave-duration) ease-in;
}

.ldoc-modal-panel-enter-from,
.ldoc-modal-panel-leave-to {
  opacity: 0;
  transform: var(--transform-from);
}
</style>
