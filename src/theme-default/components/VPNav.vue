<template>
  <header class="vp-nav">
    <div class="vp-nav-container">
      <!-- Logo -->
      <router-link to="/" class="vp-nav-logo">
        <img v-if="logo" :src="logo" :alt="siteTitle" class="vp-nav-logo-img" />
        <span class="vp-nav-logo-text">{{ siteTitle }}</span>
      </router-link>
      
      <!-- 导航链接 -->
      <nav class="vp-nav-links">
        <template v-for="item in navItems" :key="item.text">
          <div v-if="item.items" class="vp-nav-dropdown">
            <button class="vp-nav-dropdown-trigger">
              {{ item.text }}
              <svg class="vp-nav-dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <div class="vp-nav-dropdown-menu">
              <template v-for="subItem in item.items" :key="subItem.text">
                <a
                  v-if="isExternalLink(subItem.link)"
                  :href="subItem.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="vp-nav-dropdown-item"
                >
                  {{ subItem.text }}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
                <router-link
                  v-else
                  :to="subItem.link"
                  class="vp-nav-dropdown-item"
                >
                  {{ subItem.text }}
                </router-link>
              </template>
            </div>
          </div>
          <a
            v-else-if="isExternalLink(item.link)"
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="vp-nav-link"
          >
            {{ item.text }}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px; opacity: 0.6;">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <router-link 
            v-else 
            :to="item.link" 
            class="vp-nav-link"
            :class="{ active: isNavActive(item.link) }"
          >
            {{ item.text }}
          </router-link>
        </template>
      </nav>
      
      <!-- 右侧区域 -->
      <div class="vp-nav-actions">
        <!-- 搜索 -->
        <button class="vp-nav-search" @click="openSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span class="vp-nav-search-text">搜索</span>
          <span class="vp-nav-search-shortcut">Ctrl K</span>
        </button>
        
        <!-- 主题色选择 -->
        <div class="vp-nav-theme-color">
          <button class="vp-nav-theme-color-trigger" title="选择主题色">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4" fill="var(--ldoc-c-brand)"/>
            </svg>
          </button>
          <div class="vp-nav-theme-color-panel">
            <button
              v-for="color in themeColors"
              :key="color.name"
              class="vp-nav-theme-color-item"
              :class="{ active: currentThemeColor === color.name }"
              :style="{ '--color': `hsl(${color.hue}, 80%, 60%)` }"
              :title="color.label"
              @click="setThemeColor(color.name)"
            />
          </div>
        </div>
        
        <!-- 暗黑模式切换 -->
        <button class="vp-nav-theme-toggle" @click="toggleDark" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
          <Transition name="icon-fade" mode="out-in">
            <svg v-if="isDark" key="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else key="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </Transition>
        </button>
        
        <!-- 社交链接 -->
        <div class="vp-nav-social">
          <a
            v-for="social in socialLinks"
            :key="social.link"
            :href="social.link"
            target="_blank"
            rel="noopener noreferrer"
            class="vp-nav-social-link"
            :title="social.icon"
          >
            <svg v-if="social.icon === 'github'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <svg v-else-if="social.icon === 'twitter'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </a>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button class="vp-nav-hamburger" @click="toggleSidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useDark, useSidebar, useThemeColor, useRoute } from '@ldesign/doc/client'

const { site, theme } = useData()
const { isDark, toggle: toggleDark } = useDark()
const { toggle: toggleSidebar } = useSidebar()
const { colors: themeColors, currentColor: currentThemeColor, setColor: setThemeColor } = useThemeColor()
const route = useRoute()

// 站点标题
const siteTitle = computed(() => {
  const config = theme.value as { siteTitle?: string | false }
  if (config.siteTitle === false) return ''
  return config.siteTitle || site.value.title
})

// Logo
const logo = computed(() => {
  const config = theme.value as { logo?: string | { light: string; dark: string } }
  if (!config.logo) return ''
  if (typeof config.logo === 'string') return config.logo
  return isDark.value ? config.logo.dark : config.logo.light
})

// 导航项
const navItems = computed(() => {
  const config = theme.value as { nav?: Array<{ text: string; link?: string; items?: unknown[] }> }
  return config.nav || []
})

// 社交链接
const socialLinks = computed(() => {
  const config = theme.value as { socialLinks?: Array<{ icon: string; link: string }> }
  return config.socialLinks || []
})

// 判断是否为外部链接
const isExternalLink = (link: string) => {
  return /^https?:\/\//.test(link)
}

// 判断导航是否激活
const isNavActive = (link: string) => {
  if (!link) return false
  const currentPath = route.path
  // 精确匹配或路径前缀匹配
  if (currentPath === link) return true
  if (link !== '/' && currentPath.startsWith(link)) return true
  return false
}

// 搜索
const openSearch = () => {
  // TODO: 实现搜索
  console.log('Open search')
}
</script>

<style scoped>
.vp-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--ldoc-nav-height, 64px);
  background: var(--ldoc-c-bg);
  border-bottom: 1px solid var(--ldoc-c-divider);
  z-index: 100;
}

.vp-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: var(--ldoc-layout-max-width, 1400px);
  margin: 0 auto;
  padding: 0 24px;
}

.vp-nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--ldoc-c-text-1);
  font-weight: 600;
  font-size: 18px;
}

.vp-nav-logo-img {
  height: 32px;
}

.vp-nav-links {
  display: flex;
  gap: 24px;
}

.vp-nav-link {
  color: var(--ldoc-c-text-1);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.vp-nav-link:hover {
  color: var(--ldoc-c-brand);
}

.vp-nav-dropdown {
  position: relative;
}

.vp-nav-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: var(--ldoc-c-text-1);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.vp-nav-dropdown-icon {
  font-size: 10px;
}

.vp-nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 150px;
  padding: 8px 0;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  box-shadow: var(--ldoc-shadow-3);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
}

.vp-nav-dropdown:hover .vp-nav-dropdown-menu {
  opacity: 1;
  visibility: visible;
}

.vp-nav-dropdown-item {
  display: block;
  padding: 8px 16px;
  color: var(--ldoc-c-text-1);
  text-decoration: none;
  font-size: 14px;
}

.vp-nav-dropdown-item:hover {
  background: var(--ldoc-c-bg-mute);
  color: var(--ldoc-c-brand);
}

.vp-nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vp-nav-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  color: var(--ldoc-c-text-2);
  font-size: 14px;
  cursor: pointer;
}

.vp-nav-search:hover {
  border-color: var(--ldoc-c-brand);
}

.vp-nav-search-shortcut {
  padding: 2px 6px;
  background: var(--ldoc-c-bg-mute);
  border-radius: 4px;
  font-size: 12px;
}

/* 主题色选择器 */
.vp-nav-theme-color {
  position: relative;
}

.vp-nav-theme-color-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--ldoc-c-text-1);
  transition: background-color 0.2s;
}

.vp-nav-theme-color-trigger:hover {
  background: var(--ldoc-c-bg-soft);
}

.vp-nav-theme-color-panel {
  position: absolute;
  top: 100%;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 12px;
  margin-top: 8px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  box-shadow: var(--ldoc-shadow-3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 0.2s ease;
}

.vp-nav-theme-color:hover .vp-nav-theme-color-panel {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.vp-nav-theme-color-item {
  width: 24px;
  height: 24px;
  padding: 0;
  background: var(--color);
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.vp-nav-theme-color-item:hover {
  transform: scale(1.15);
}

.vp-nav-theme-color-item.active {
  border-color: var(--ldoc-c-text-1);
}

/* 暗黑模式切换 */
.vp-nav-theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--ldoc-c-text-1);
  transition: background-color 0.2s;
}

.vp-nav-theme-toggle:hover {
  background: var(--ldoc-c-bg-soft);
}

/* 图标切换动画 */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.25s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.vp-nav-social {
  display: flex;
  gap: 8px;
}

.vp-nav-social-link {
  padding: 8px;
  text-decoration: none;
  font-size: 18px;
}

.vp-nav-hamburger {
  display: none;
  padding: 8px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .vp-nav-links,
  .vp-nav-search,
  .vp-nav-social {
    display: none;
  }
  
  .vp-nav-hamburger {
    display: block;
  }
}
</style>
