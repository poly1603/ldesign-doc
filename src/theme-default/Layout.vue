<template>
  <div class="ldoc-layout" :class="{ 'has-sidebar': hasSidebar }">
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

    <!-- 页脚 -->
    <Transition name="footer-fade">
      <VPFooter v-if="showFooter" />
    </Transition>

    <!-- 回到顶部 -->
    <VPBackToTop />
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useData, useRoute } from '@ldesign/doc/client'
import VPNav from './components/VPNav.vue'
import VPSidebar from './components/VPSidebar.vue'
import VPHome from './components/VPHome.vue'
import VPDoc from './components/VPDoc.vue'
import VPOutline from './components/VPOutline.vue'
import VPFooter from './components/VPFooter.vue'
import VPBackToTop from './components/VPBackToTop.vue'

const { frontmatter, theme } = useData()
const route = useRoute()

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

// 是否显示大纲
const showOutline = computed(() => {
  return frontmatter.value.outline !== false
})

// 是否显示页脚
const showFooter = computed(() => {
  const footer = (theme.value as { footer?: unknown }).footer
  return !!footer && frontmatter.value.footer !== false
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

/* 响应式 */
@media (max-width: 768px) {
  .ldoc-layout-content {
    flex-direction: column;
  }
}
</style>
