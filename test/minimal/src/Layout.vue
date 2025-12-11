<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 可以从 @ldesign/doc/client 导入内置 composables
// import { usePageData, useSiteData, useRoute } from '@ldesign/doc/client'

const isDark = ref(false)

onMounted(() => {
  // 检测系统主题
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
})

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <div class="theme-minimal" :class="{ dark: isDark }">
    <!-- 头部 -->
    <header class="theme-header">
      <div class="header-content">
        <a href="/" class="logo">
          <span class="logo-text">LDoc Theme</span>
        </a>
        
        <nav class="nav">
          <a href="/">首页</a>
          <a href="/guide/">指南</a>
        </nav>
        
        <div class="header-actions">
          <button @click="toggleDark" class="theme-toggle">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="theme-main">
      <div class="content-wrapper">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <slot name="sidebar" />
        </aside>
        
        <!-- 内容 -->
        <article class="content">
          <!-- Vue Router 视图 -->
          <router-view />
        </article>
        
        <!-- 大纲 -->
        <aside class="outline">
          <slot name="outline" />
        </aside>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="theme-footer">
      <p>Built with LDoc</p>
    </footer>
  </div>
</template>

<style scoped>
.theme-minimal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.theme-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--theme-bg, #fff);
  border-bottom: 1px solid var(--theme-border, #e5e7eb);
  padding: 0 24px;
  height: 64px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--theme-text, #1f2937);
  font-weight: 600;
  font-size: 18px;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  color: var(--theme-text-secondary, #6b7280);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav a:hover {
  color: var(--theme-primary, #3b82f6);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
}

.theme-main {
  flex: 1;
  padding: 24px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr 220px;
  gap: 32px;
}

.sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.content {
  min-width: 0;
}

.outline {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.theme-footer {
  border-top: 1px solid var(--theme-border, #e5e7eb);
  padding: 24px;
  text-align: center;
  color: var(--theme-text-secondary, #6b7280);
  font-size: 14px;
}

/* 暗色模式 */
.dark {
  --theme-bg: #1f2937;
  --theme-text: #f9fafb;
  --theme-text-secondary: #9ca3af;
  --theme-border: #374151;
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .sidebar,
  .outline {
    display: none;
  }
}
</style>
