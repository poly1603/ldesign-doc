<template>
  <div class="vp-demo">
    <div class="vp-demo-preview">
      <component :is="demoComponent" v-if="demoComponent" />
      <div v-else class="vp-demo-loading">
        <span v-if="error" class="vp-demo-error">{{ error }}</span>
        <span v-else>加载中...</span>
      </div>
    </div>
    <div class="vp-demo-actions">
      <button 
        class="vp-demo-action" 
        :title="copied ? '已复制!' : '复制代码'"
        @click="copyCode"
      >
        <svg v-if="copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
      </button>
      <button 
        class="vp-demo-action" 
        :title="expanded ? '收起代码' : '展开代码'"
        @click="expanded = !expanded"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </button>
    </div>
    <div v-show="expanded" class="vp-demo-code">
      <div class="vp-code-block">
        <div class="vp-code-header">
          <span class="vp-code-lang">{{ language }}</span>
        </div>
        <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef, defineAsyncComponent } from 'vue'

const props = defineProps<{
  code?: string
  src?: string
  title?: string
  language?: string
  defaultExpanded?: boolean
}>()

const expanded = ref(props.defaultExpanded ?? false)
const copied = ref(false)
const error = ref('')
const demoComponent = shallowRef<any>(null)

const actualCode = computed(() => props.code || '')
const language = computed(() => props.language || 'vue')

const highlightedCode = computed(() => {
  return actualCode.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(actualCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

onMounted(async () => {
  if (props.src) {
    try {
      // 动态导入外部组件
      const module = await import(/* @vite-ignore */ props.src)
      demoComponent.value = module.default
    } catch (e: any) {
      error.value = `加载组件失败: ${e.message}`
      console.error('加载组件失败:', e)
    }
  }
})
</script>

<style>
.vp-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 16px 0;
  overflow: hidden;
}

.vp-demo-preview {
  padding: 24px;
  min-height: 60px;
  background: var(--vp-c-bg);
}

.vp-demo-loading {
  color: var(--vp-c-text-3);
  font-size: 14px;
}

.vp-demo-error {
  color: var(--vp-c-danger-1);
}

.vp-demo-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.vp-demo-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.vp-demo-action:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.vp-demo-code {
  border-top: 1px solid var(--vp-c-divider);
}

.vp-demo-code .vp-code-block {
  margin: 0;
  border-radius: 0;
  border: none;
}
</style>
