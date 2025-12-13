<template>
  <div class="ldoc-layout" :class="{ 'has-sidebar': hasSidebar, 'is-404': is404, 'is-home': isHome }"
    :style="layoutStyles">
    <!-- 布局顶部插槽（导航栏上方，可用于公告栏） -->
    <PluginSlot name="layout-top" />

    <!-- 阅读进度条 -->
    <VPReadingProgress v-if="!isHome" />

    <!-- 跳过导航 -->
    <a href="#main-content" class="skip-link">跳至主要内容</a>

    <!-- 导航栏 -->
    <VPNav />

    <!-- 主要内容区 -->
    <div class="ldoc-layout-content">
      <!-- 侧边栏 -->
      <Transition name="sidebar-slide">
        <VPSidebar v-if="hasSidebar" :key="hasSidebar ? 'sidebar' : 'no-sidebar'" />
      </Transition>

      <!-- 内容区 带过渡动画 -->
      <main id="main-content" class="ldoc-main">
        <Transition name="fade-slide" mode="out-in">
          <component :is="currentPage" :key="route.path" />
        </Transition>
      </main>

      <!-- 右侧大纲 -->
      <VPOutline v-if="!isHome && showOutline" />
    </div>

    <!-- 页脚上方插槽 -->
    <PluginSlot name="footer-before" />

    <!-- 页脚 -->
    <Transition name="footer-fade">
      <VPFooter v-if="showFooter" />
    </Transition>

    <!-- 页脚下方插槽 -->
    <PluginSlot name="footer-after" />

    <!-- 返回顶部上方插槽 -->
    <PluginSlot name="back-to-top-before" />

    <!-- 回到顶部 -->
    <VPBackToTop />

    <!-- 返回顶部下方插槽 -->
    <PluginSlot name="back-to-top-after" />

    <!-- 图片灯箱 -->
    <VPImageZoom />

    <!-- 布局底部插槽 -->
    <PluginSlot name="layout-bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'
import { PluginSlot } from '@ldesign/doc/client'
import VPNav from './components/VPNav.vue'
import VPSidebar from './components/VPSidebar.vue'
import VPHome from './components/VPHome.vue'
import VPDoc from './components/VPDoc.vue'
import VPOutline from './components/VPOutline.vue'
import VPFooter from './components/VPFooter.vue'
import VPBackToTop from './components/VPBackToTop.vue'
import VPReadingProgress from './components/VPReadingProgress.vue'
import VPImageZoom from './components/VPImageZoom.vue'

const { frontmatter, theme } = useData()
const route = useRoute()

// 布局配置
const layoutConfig = computed(() => {
  const config = (theme.value as { layout?: { sidebarWidth?: number; outlineWidth?: number; contentGap?: number; navHeight?: number; maxWidth?: number } }).layout || {}
  return {
    sidebarWidth: config.sidebarWidth || 260,
    outlineWidth: config.outlineWidth || 220,
    contentGap: config.contentGap || 32,
    navHeight: config.navHeight || 64,
    maxWidth: config.maxWidth || 1400
  }
})

// 布局样式变量
const layoutStyles = computed(() => ({
  '--ldoc-sidebar-width': `${layoutConfig.value.sidebarWidth}px`,
  '--ldoc-outline-width': `${layoutConfig.value.outlineWidth}px`,
  '--ldoc-content-gap': `${layoutConfig.value.contentGap}px`,
  '--ldoc-nav-height': `${layoutConfig.value.navHeight}px`,
  '--ldoc-layout-max-width': `${layoutConfig.value.maxWidth}px`
}))

// 是否为首页
const isHome = computed(() => {
  return frontmatter.value.layout === 'home' || route.path === '/'
})

// 当前页面组件
const currentPage = computed(() => {
  return isHome.value ? VPHome : VPDoc
})

// 是否显示侧边栏
const hasSidebar = computed(() => {
  if (frontmatter.value.sidebar === false) return false
  if (isHome.value) return false

  const sidebar = (theme.value as { sidebar?: unknown }).sidebar
  return !!sidebar
})

// 是否为404页面
const is404 = computed(() => {
  return frontmatter.value.layout === '404' || frontmatter.value.notFound === true
})

// 是否显示大纲（404页面不显示）
const showOutline = computed(() => {
  if (is404.value) return false
  return frontmatter.value.outline !== false
})

// 是否显示页脚
const showFooter = computed(() => {
  const footer = (theme.value as { footer?: unknown }).footer
  return !!footer && frontmatter.value.footer !== false
})

// 代码块复制功能
const handleCopyClick = async (e: Event) => {
  const target = e.target as HTMLElement
  const copyBtn = target.closest('.vp-code-copy') as HTMLButtonElement
  if (!copyBtn) return

  // 支持 Base64 编码的代码（新格式）和 HTML 实体编码的代码（旧格式）
  const base64Code = copyBtn.dataset.codeBase64
  const htmlCode = copyBtn.dataset.code

  let decodedCode = ''
  
  if (base64Code) {
    // Base64 解码
    try {
      decodedCode = decodeURIComponent(escape(atob(base64Code)))
    } catch {
      decodedCode = atob(base64Code)
    }
  } else if (htmlCode) {
    // HTML 实体解码（兼容旧格式）
    const textarea = document.createElement('textarea')
    textarea.innerHTML = htmlCode
    decodedCode = textarea.value
  }

  if (!decodedCode) return

  try {
    await navigator.clipboard.writeText(decodedCode)
    copyBtn.classList.add('copied')
    setTimeout(() => {
      copyBtn.classList.remove('copied')
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 设置事件监听
const setupEventListeners = () => {
  document.addEventListener('click', handleCopyClick)
}

const removeEventListeners = () => {
  document.removeEventListener('click', handleCopyClick)
}

onMounted(() => {
  setupEventListeners()
})

onUnmounted(() => {
  removeEventListeners()
})
</script>

<style>
.ldoc-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.ldoc-layout-content {
  display: flex;
  flex: 1;
  padding-top: var(--ldoc-nav-height, 64px);
}

.ldoc-main {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

/* 首页无顶部padding */
.ldoc-layout.is-home .ldoc-main {
  padding-top: 0;
}

.skip-link {
  position: fixed;
  top: -100px;
  left: 16px;
  z-index: 999;
  padding: 8px 16px;
  background: var(--ldoc-c-brand);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 16px;
}

/* 路由切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 侧边栏动画 */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s ease;
}

.sidebar-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.sidebar-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 页脚动画 */
.footer-fade-enter-active,
.footer-fade-leave-active {
  transition: all 0.3s ease;
}

.footer-fade-enter-from,
.footer-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式 - 手机设备 */
@media (max-width: 768px) {
  .ldoc-layout-content {
    flex-direction: column;
  }

  .ldoc-main {
    padding: 16px;
  }
}

/* 响应式 - 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .ldoc-main {
    padding: 20px;
  }
}

/* 响应式 - 大屏设备 */
@media (min-width: 1600px) {
  .ldoc-layout-content {
    max-width: var(--ldoc-layout-max-width, 1440px);
    margin: 0 auto;
    width: 100%;
  }
}

/* 有侧边栏时的布局 */
.ldoc-layout.has-sidebar .ldoc-main {
  margin-left: var(--ldoc-sidebar-width, 260px);
  /* 右侧留出和TOC一样的空间 */
  margin-right: var(--ldoc-outline-width, 220px);
  /* 使用配置的间距 */
  padding-left: var(--ldoc-content-gap, 32px);
  padding-right: var(--ldoc-content-gap, 32px);
}

@media (max-width: 1280px) {

  /* 当TOC隐藏时移除右侧margin */
  .ldoc-layout.has-sidebar .ldoc-main {
    margin-right: 0;
    padding-left: var(--ldoc-content-gap, 32px);
    padding-right: var(--ldoc-content-gap, 32px);
  }
}

@media (max-width: 768px) {
  .ldoc-layout.has-sidebar .ldoc-main {
    margin-left: 0;
    margin-right: 0;
    padding: 16px;
  }
}

/* 404页面布局 - 居中显示 */
.ldoc-layout.is-404 .ldoc-main {
  margin-left: 0 !important;
  margin-right: 0 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ldoc-layout.is-404.has-sidebar .ldoc-main {
  margin-left: var(--ldoc-sidebar-width, 260px) !important;
  margin-right: 0 !important;
}

/* 打印样式 */
@media print {
  .ldoc-layout-content {
    padding-top: 0;
  }

  .vp-sidebar,
  .vp-outline,
  .vp-nav,
  .vp-back-to-top {
    display: none !important;
  }

  .ldoc-main {
    margin-left: 0 !important;
  }
}
</style>
