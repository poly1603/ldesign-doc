<template>
  <div class="ldoc-layout" :class="{ 'has-sidebar': hasSidebar, 'is-404': is404, 'is-home': isHome, 'is-mobile': isMobile }"
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
import { computed, onMounted, onUnmounted, nextTick, watch, ref } from 'vue'
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
import { useSidebarItems } from './composables'

const { frontmatter, theme } = useData()
const route = useRoute()
const sidebarItems = useSidebarItems()

// 移动端检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth <= 768
}
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 路由切换时滚动到顶部
watch(() => route.path, () => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
})

// 布局配置
const layoutConfig = computed(() => {
  const config = (theme.value as { layout?: { sidebarWidth?: number; outlineWidth?: number; contentGap?: number; navHeight?: number; maxWidth?: number; contentWidth?: string; navFullWidth?: boolean } }).layout || {}
  return {
    sidebarWidth: config.sidebarWidth || 260,
    outlineWidth: config.outlineWidth || 220,
    contentGap: config.contentGap || 32,
    navHeight: config.navHeight || 64,
    maxWidth: config.maxWidth || 1400,
    // 内容宽度：支持百分比或固定像素值
    contentWidth: config.contentWidth || '100%',
    // 导航栏是否铺满宽度（默认跟随内容宽度）
    navFullWidth: config.navFullWidth !== false
  }
})

// 布局样式变量
const layoutStyles = computed(() => ({
  '--ldoc-sidebar-width': `${layoutConfig.value.sidebarWidth}px`,
  '--ldoc-outline-width': `${layoutConfig.value.outlineWidth}px`,
  '--ldoc-content-gap': `${layoutConfig.value.contentGap}px`,
  '--ldoc-nav-height': `${layoutConfig.value.navHeight}px`,
  '--ldoc-layout-max-width': `${layoutConfig.value.maxWidth}px`,
  '--ldoc-content-width': layoutConfig.value.contentWidth,
  '--ldoc-nav-full-width': layoutConfig.value.navFullWidth ? '1' : '0'
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

  return sidebarItems.value.length > 0
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
  /* 确保没有 overflow 设置，确保 sticky 生效 */
  overflow: visible;
  width: 100%;
}

.ldoc-layout-content {
  display: flex;
  flex: 1;
  /* 确保 flex 容器允许子元素 sticky */
  overflow: visible;
}

.ldoc-main {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

/* 首页样式 */
.ldoc-layout.is-home .ldoc-main {
  padding: 0;
  /* 首页内容通常包含全宽元素，可能需要隐藏溢出，但不影响 Nav 的 sticky */
  overflow-x: hidden;
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
    min-height: calc(100vh - var(--ldoc-nav-height, 64px));
    /* 移动端重置为块级布局，避免 flex 影响 */
    display: block !important;
  }

  .ldoc-main {
    padding: 16px;
    width: 100%;
    min-width: 0;
    display: block !important;
  }

  /* 移动端侧边栏固定定位，不占用布局空间 */
  .ldoc-layout-content > .vp-sidebar,
  .ldoc-layout-content :deep(.vp-sidebar) {
    position: fixed !important;
    top: var(--ldoc-nav-height, 64px);
    left: 0;
    width: var(--ldoc-sidebar-width, 260px);
    height: calc(100vh - var(--ldoc-nav-height, 64px));
    transform: translateX(-100%);
    z-index: 200;
    background: var(--ldoc-c-bg);
  }

  .ldoc-layout-content > .vp-sidebar.open,
  .ldoc-layout-content :deep(.vp-sidebar.open) {
    transform: translateX(0);
  }

  /* 移动端隐藏右侧大纲 */
  .ldoc-layout-content > .vp-outline,
  .ldoc-layout-content :deep(.vp-outline) {
    display: none !important;
  }
}

/* 响应式 - 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .ldoc-main {
    padding: 20px;
  }
}

/* 内容区域宽度控制 */
.ldoc-layout-content {
  width: var(--ldoc-content-width, 100%);
  max-width: var(--ldoc-layout-max-width, 1440px);
  margin: 0 auto;
}

/* 首页布局特殊处理：移除最大宽度限制，允许 Hero/Banner 全屏展示 */
.ldoc-layout.is-home .ldoc-layout-content {
  max-width: none;
  width: 100%;
}

/* 有侧边栏时的布局 */
.ldoc-layout.has-sidebar .ldoc-layout-content {
  /* 使用 Flexbox 布局，Sidebar 占据空间 */
  align-items: flex-start;
}

.ldoc-layout.has-sidebar .ldoc-main {
  /* 移除 margin，由 Sidebar 占据空间 */
  margin-left: 0;
  margin-right: 0;
  /* 使用配置的间距 */
  padding-left: var(--ldoc-content-gap, 32px);
  padding-right: var(--ldoc-content-gap, 32px);
  /* 确保 main 有最小宽度 */
  min-width: 0;
}

@media (max-width: 1280px) {
  /* 当TOC隐藏时，main 仍然自适应 */
  .ldoc-layout.has-sidebar .ldoc-main {
    padding-left: var(--ldoc-content-gap, 32px);
    padding-right: var(--ldoc-content-gap, 32px);
  }
}

@media (max-width: 768px) {
  .ldoc-layout.has-sidebar .ldoc-main {
    padding: 16px;
  }
}

/* 404页面布局 - 居中显示 */
.ldoc-layout.is-404 .ldoc-main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
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

<!-- 全局移动端样式 - 使用 JavaScript 检测的 .is-mobile 类 -->
<style>
/* 移动端布局 - 通过 JS 检测应用 */
.ldoc-layout.is-mobile .ldoc-layout-content {
  display: block !important;
  width: 100% !important;
}

.ldoc-layout.is-mobile .vp-sidebar {
  position: fixed !important;
  top: var(--ldoc-nav-height, 64px) !important;
  left: 0 !important;
  width: var(--ldoc-sidebar-width, 260px) !important;
  height: calc(100vh - var(--ldoc-nav-height, 64px)) !important;
  transform: translateX(-100%) !important;
  z-index: 200 !important;
  background: var(--ldoc-c-bg) !important;
  border-right: 1px solid var(--ldoc-c-divider);
}

.ldoc-layout.is-mobile .vp-sidebar.open {
  transform: translateX(0) !important;
}

.ldoc-layout.is-mobile .ldoc-main {
  width: 100% !important;
  max-width: 100vw !important;
  margin-left: 0 !important;
  padding: 16px !important;
}

.ldoc-layout.is-mobile .vp-outline {
  display: none !important;
}
</style>
