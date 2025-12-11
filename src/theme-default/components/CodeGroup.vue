<template>
  <div class="code-group">
    <!-- 标签页头部 -->
    <div class="code-group-tabs">
      <button v-for="(tab, index) in tabs" :key="index" class="code-group-tab"
        :class="{ active: activeIndex === index }" @click="activeIndex = index">
        {{ tab }}
      </button>
    </div>

    <!-- 代码内容 -->
    <div class="code-group-content">
      <div v-for="(_, index) in tabs" :key="index" v-show="activeIndex === index" class="code-group-panel">
        <slot :name="`tab-${index}`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useSlots } from 'vue'

const slots = useSlots()
const tabs = ref<string[]>([])
const activeIndex = ref(0)

onMounted(() => {
  // 从 slot 内容中提取标签名
  const slotContent = document.querySelectorAll('.code-group-content > div')
  slotContent.forEach((el, index) => {
    const codeBlock = el.querySelector('div[class*="language-"]')
    if (codeBlock) {
      const classList = Array.from(codeBlock.classList)
      const langClass = classList.find(c => c.startsWith('language-'))
      if (langClass) {
        tabs.value.push(langClass.replace('language-', '').toUpperCase())
      } else {
        tabs.value.push(`Tab ${index + 1}`)
      }
    }
  })
})
</script>

<style scoped>
.code-group {
  margin: 24px 0;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.code-group-tabs {
  display: flex;
  background: var(--ldoc-c-bg-soft);
  border-bottom: 1px solid var(--ldoc-c-divider);
  overflow-x: auto;
}

.code-group-tab {
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.code-group-tab:hover {
  color: var(--ldoc-c-text-1);
}

.code-group-tab.active {
  color: var(--ldoc-c-brand);
}

.code-group-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ldoc-c-brand);
}

.code-group-content {
  background: var(--ldoc-c-bg);
}

.code-group-panel :deep(div[class*="language-"]) {
  margin: 0;
  border-radius: 0;
  border: none;
}

.code-group-panel :deep(pre) {
  margin: 0;
  border-radius: 0;
}
</style>
