<template>
  <div class="vp-code-block" :class="{ 'line-numbers': showLineNumbers }">
    <div class="vp-code-block-header">
      <span class="vp-code-block-lang">{{ lang }}</span>
      <div class="vp-code-block-actions">
        <button class="vp-code-block-copy" :class="{ copied }" @click="copyCode" title="复制代码">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </div>
    </div>
    <div class="vp-code-block-content">
      <div v-if="showLineNumbers" class="vp-code-block-line-numbers">
        <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
      </div>
      <pre :class="`language-${lang}`"><code v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  code: string
  lang?: string
  highlightedCode: string
  lineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lang: 'text',
  lineNumbers: true
})

const copied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const showLineNumbers = computed(() => props.lineNumbers && props.code.trim().split('\n').length > 1)

const lineCount = computed(() => {
  const lines = props.code.trim().split('\n')
  return lines.length
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code.trim())
    copied.value = true
    if (copyTimeout) clearTimeout(copyTimeout)
    copyTimeout = setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.vp-code-block {
  position: relative;
  margin: 16px 0;
  border-radius: var(--ldoc-radius-md, 8px);
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  overflow: hidden;
}

.dark .vp-code-block {
  background: #1e1e1e;
}

.vp-code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--ldoc-c-divider, #e2e2e3);
}

.dark .vp-code-block-header {
  background: rgba(255, 255, 255, 0.03);
  border-bottom-color: #333;
}

.vp-code-block-lang {
  font-size: 12px;
  font-weight: 500;
  color: var(--ldoc-c-text-2, rgba(60, 60, 67, 0.78));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vp-code-block-actions {
  display: flex;
  gap: 8px;
}

.vp-code-block-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--ldoc-c-text-3, rgba(60, 60, 67, 0.56));
  cursor: pointer;
  transition: all 0.2s;
}

.vp-code-block-copy:hover {
  background: var(--ldoc-c-bg-mute, #e4e4e9);
  color: var(--ldoc-c-text-1, rgba(60, 60, 67));
}

.vp-code-block-copy.copied {
  color: var(--ldoc-c-green, #42b883);
}

.vp-code-block-content {
  display: flex;
  overflow-x: auto;
}

.vp-code-block-line-numbers {
  flex-shrink: 0;
  padding: 16px 0;
  width: 48px;
  text-align: right;
  background: rgba(0, 0, 0, 0.02);
  border-right: 1px solid var(--ldoc-c-divider, #e2e2e3);
  user-select: none;
}

.dark .vp-code-block-line-numbers {
  background: rgba(255, 255, 255, 0.02);
  border-right-color: #333;
}

.vp-code-block-line-numbers .line-number {
  display: block;
  padding-right: 12px;
  font-family: var(--ldoc-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--ldoc-c-text-3, rgba(60, 60, 67, 0.56));
}

.vp-code-block-content pre {
  flex: 1;
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  background: transparent !important;
}

.vp-code-block-content code {
  font-family: var(--ldoc-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
}

/* 确保代码行和行号对齐 */
.vp-code-block-content code .line {
  display: block;
  min-height: 1.6em;
}

/* 滚动条样式 */
.vp-code-block-content::-webkit-scrollbar {
  height: 6px;
}

.vp-code-block-content::-webkit-scrollbar-thumb {
  background: var(--ldoc-c-divider);
  border-radius: 3px;
}
</style>
