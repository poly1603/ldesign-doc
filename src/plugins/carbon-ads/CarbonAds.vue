<template>
  <div v-if="show" class="carbon-ads-container" ref="containerRef">
    <!-- Carbon Ads 将被注入到这里 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  code: string
  placement: string
}

const props = defineProps<Props>()
const route = useRoute()

const containerRef = ref<HTMLElement | null>(null)
const show = ref(true)

// Carbon Ads 脚本 ID
const SCRIPT_ID = 'carbon-ads-script'

/**
 * 加载 Carbon Ads 脚本
 */
const loadCarbonAds = () => {
  if (!props.code || !props.placement) {
    return
  }

  // 移除旧脚本
  const existingScript = document.getElementById(SCRIPT_ID)
  if (existingScript) {
    existingScript.remove()
  }

  // 清空容器
  if (containerRef.value) {
    containerRef.value.innerHTML = ''
  }

  // 创建新脚本
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.type = 'text/javascript'
  script.src = `//cdn.carbonads.com/carbon.js?serve=${props.code}&placement=${props.placement}`

  // 插入脚本
  if (containerRef.value) {
    containerRef.value.appendChild(script)
  }
}

onMounted(() => {
  loadCarbonAds()
})

// 路由变化时重新加载广告
watch(() => route.path, () => {
  // 延迟加载，等待页面渲染完成
  setTimeout(loadCarbonAds, 100)
})

onUnmounted(() => {
  const existingScript = document.getElementById(SCRIPT_ID)
  if (existingScript) {
    existingScript.remove()
  }
})
</script>

<style scoped>
.carbon-ads-container {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--ldoc-c-divider);
}

.carbon-ads-container :deep(#carbonads) {
  display: block;
  overflow: hidden;
  max-width: 200px;
  border-radius: 8px;
  background: var(--ldoc-c-bg-soft);
  font-size: 13px;
  line-height: 1.4;
}

.carbon-ads-container :deep(#carbonads a) {
  color: var(--ldoc-c-text-1);
  text-decoration: none;
}

.carbon-ads-container :deep(#carbonads a:hover) {
  color: var(--ldoc-c-brand);
}

.carbon-ads-container :deep(.carbon-wrap) {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.carbon-ads-container :deep(.carbon-img) {
  margin-bottom: 8px;
}

.carbon-ads-container :deep(.carbon-img img) {
  display: block;
  width: 100%;
  border-radius: 4px;
}

.carbon-ads-container :deep(.carbon-text) {
  display: block;
  margin-bottom: 8px;
  color: var(--ldoc-c-text-2);
}

.carbon-ads-container :deep(.carbon-poweredby) {
  display: block;
  font-size: 11px;
  color: var(--ldoc-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
