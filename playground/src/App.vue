<template>
  <div class="ldoc-app" :class="{ dark: isDark }">
    <header class="ldoc-nav">
      <div class="ldoc-nav-container">
        <router-link to="/" class="ldoc-nav-logo">
          <span class="ldoc-nav-logo-icon">📚</span>
          <span class="ldoc-nav-logo-text">LDoc</span>
        </router-link>
        
        <nav class="ldoc-nav-links">
          <router-link to="/guide/" class="ldoc-nav-link">指南</router-link>
          <router-link to="/api/" class="ldoc-nav-link">API</router-link>
          <router-link to="/components/" class="ldoc-nav-link">组件</router-link>
        </nav>
        
        <div class="ldoc-nav-actions">
          <button class="ldoc-nav-theme" @click="toggleDark">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    
    <div class="ldoc-layout" :class="{ 'has-sidebar': showSidebar }">
      <aside v-if="showSidebar" class="ldoc-sidebar">
        <nav class="ldoc-sidebar-nav">
          <template v-for="group in currentSidebar" :key="group.text">
            <div class="ldoc-sidebar-group">
              <p class="ldoc-sidebar-group-title">{{ group.text }}</p>
              <ul class="ldoc-sidebar-items">
                <li v-for="item in group.items" :key="item.link">
                  <router-link :to="item.link" class="ldoc-sidebar-link">
                    {{ item.text }}
                  </router-link>
                </li>
              </ul>
            </div>
          </template>
        </nav>
      </aside>
      
      <main class="ldoc-main">
        <div class="ldoc-content-wrapper">
          <router-view />
        </div>
      </main>
    </div>
    
    <footer class="ldoc-footer">
      <p>Released under the MIT License.</p>
      <p>Copyright © 2024 LDesign Team</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDark = ref(false)

const sidebarConfig: Record<string, Array<{text: string, items: Array<{text: string, link: string}>}>> = {
  '/guide/': [
    {
      text: '开始使用',
      items: [
        { text: '介绍', link: '/guide/' },
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '配置', link: '/guide/configuration' }
      ]
    },
    {
      text: '进阶',
      items: [
        { text: '主题开发', link: '/guide/theme' },
        { text: '插件开发', link: '/guide/plugin' }
      ]
    }
  ],
  '/api/': [
    {
      text: 'API 参考',
      items: [
        { text: '配置 API', link: '/api/' },
        { text: '客户端 API', link: '/api/client' },
        { text: '主题 API', link: '/api/theme' }
      ]
    }
  ],
  '/components/': [
    {
      text: '组件演示',
      items: [
        { text: '概述', link: '/components/' },
        { text: 'Button 按钮', link: '/components/button' }
      ]
    }
  ]
}

const showSidebar = computed(() => {
  const path = route.path
  return Object.keys(sidebarConfig).some(prefix => path.startsWith(prefix))
})

const currentSidebar = computed(() => {
  const path = route.path
  for (const [prefix, items] of Object.entries(sidebarConfig)) {
    if (path.startsWith(prefix)) {
      return items
    }
  }
  return []
})

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<style>
.ldoc-app { min-height: 100vh; display: flex; flex-direction: column; }
.ldoc-nav { position: fixed; top: 0; left: 0; right: 0; height: 64px; background: var(--ldoc-c-bg); border-bottom: 1px solid var(--ldoc-c-divider); z-index: 100; }
.ldoc-nav-container { display: flex; align-items: center; justify-content: space-between; height: 100%; max-width: 1400px; margin: 0 auto; padding: 0 24px; }
.ldoc-nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 600; font-size: 18px; color: var(--ldoc-c-text-1); }
.ldoc-nav-logo-icon { font-size: 24px; }
.ldoc-nav-links { display: flex; gap: 24px; }
.ldoc-nav-link { color: var(--ldoc-c-text-1); text-decoration: none; font-size: 14px; font-weight: 500; padding: 4px 0; border-bottom: 2px solid transparent; transition: all 0.2s; }
.ldoc-nav-link:hover, .ldoc-nav-link.router-link-active { color: var(--ldoc-c-brand); border-bottom-color: var(--ldoc-c-brand); }
.ldoc-nav-actions { display: flex; align-items: center; gap: 12px; }
.ldoc-nav-theme { padding: 8px; background: none; border: none; font-size: 18px; cursor: pointer; border-radius: 6px; }
.ldoc-nav-theme:hover { background: var(--ldoc-c-bg-soft); }
.ldoc-layout { display: flex; flex: 1; padding-top: 64px; }
.ldoc-layout.has-sidebar .ldoc-main { margin-left: 260px; }
.ldoc-sidebar { position: fixed; top: 64px; left: 0; bottom: 0; width: 260px; padding: 24px; background: var(--ldoc-c-bg); border-right: 1px solid var(--ldoc-c-divider); overflow-y: auto; }
.ldoc-sidebar-group { margin-bottom: 24px; }
.ldoc-sidebar-group-title { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: var(--ldoc-c-text-1); }
.ldoc-sidebar-items { list-style: none; margin: 0; padding: 0; }
.ldoc-sidebar-link { display: block; padding: 8px 12px; margin: 2px 0; border-radius: 6px; color: var(--ldoc-c-text-2); text-decoration: none; font-size: 14px; transition: all 0.2s; }
.ldoc-sidebar-link:hover { background: var(--ldoc-c-bg-soft); color: var(--ldoc-c-text-1); }
.ldoc-sidebar-link.router-link-exact-active { background: var(--ldoc-c-brand-soft); color: var(--ldoc-c-brand); font-weight: 500; }
.ldoc-main { flex: 1; min-width: 0; padding: 32px 48px; }
.ldoc-content-wrapper { max-width: 800px; margin: 0 auto; }
.ldoc-footer { text-align: center; padding: 24px; border-top: 1px solid var(--ldoc-c-divider); color: var(--ldoc-c-text-2); font-size: 14px; }
.ldoc-footer p { margin: 4px 0; }
@media (max-width: 768px) {
  .ldoc-nav-links { display: none; }
  .ldoc-sidebar { display: none; }
  .ldoc-layout.has-sidebar .ldoc-main { margin-left: 0; }
  .ldoc-main { padding: 24px; }
}
</style>
