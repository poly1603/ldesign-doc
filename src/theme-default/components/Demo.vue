<template>
  <div class="demo-container">
    <!-- 预览区域 -->
    <div class="demo-preview">
      <slot />
    </div>

    <!-- 操作栏 -->
    <div class="demo-actions">
      <span v-if="info" class="demo-info">{{ info }}</span>
      <div class="demo-buttons">
        <button class="demo-btn" :class="{ active: copied }" @click="copyCode" title="复制代码">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button class="demo-btn" :class="{ active: expanded }" @click="toggleCode" title="查看代码">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 代码区域 -->
    <Transition name="slide">
      <div v-show="expanded" class="demo-code" ref="codeContainer">
        <slot name="code" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

defineProps<{
  info?: string
}>()

const expanded = ref(false)
const copied = ref(false)
const codeContainer = ref<HTMLElement | null>(null)

const toggleCode = () => {
  expanded.value = !expanded.value
}

const copyCode = async () => {
  if (!codeContainer.value) return

  // 获取代码内容
  const codeEl = codeContainer.value.querySelector('code')
  if (!codeEl) return

  const code = codeEl.textContent || ''

  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.demo-container {
  margin: 24px 0;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--ldoc-c-bg);
}

/* 预览区域 */
.demo-preview {
  padding: 24px;
  background: var(--ldoc-c-bg);
  border-bottom: 1px solid var(--ldoc-c-divider);
}

/* 操作栏 */
.demo-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--ldoc-c-bg-soft);
  border-bottom: 1px solid transparent;
}

.demo-info {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
}

.demo-buttons {
  display: flex;
  gap: 8px;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  color: var(--ldoc-c-text-1);
  background: var(--ldoc-c-bg-mute);
}

.demo-btn.active {
  color: var(--ldoc-c-brand);
}

/* 代码区域 */
.demo-code {
  overflow: hidden;
}

.demo-code :deep(div[class*="language-"]) {
  margin: 0;
  border-radius: 0;
  border: none;
}

.demo-code :deep(pre) {
  margin: 0;
  border-radius: 0;
}

/* 展开动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
