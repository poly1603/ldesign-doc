<template>
  <header class="vp-nav">
    <div class="vp-nav-container">
      <!-- 左侧区域：Logo 与侧边栏对齐 -->
      <div class="vp-nav-left">
        <a :href="homeLink" class="vp-nav-logo">
          <img v-if="logo" :src="logo" :alt="siteTitle" class="vp-nav-logo-img" />
          <span class="vp-nav-logo-text">{{ siteTitle }}</span>
        </a>
        <!-- Logo 后面插槽 -->
        <PluginSlot name="nav-bar-logo-after" />
      </div>

      <!-- 中间区域：导航链接 -->
      <div class="vp-nav-center">
        <nav class="vp-nav-links">
          <template v-for="item in navItems" :key="item.text">
            <div v-if="item.items" class="vp-nav-dropdown">
              <button class="vp-nav-dropdown-trigger">
                {{ item.text }}
                <svg class="vp-nav-dropdown-icon" width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div class="vp-nav-dropdown-menu">
                <template v-for="subItem in item.items" :key="subItem.text">
                  <a v-if="isExternalLink(subItem.link)" :href="subItem.link" target="_blank" rel="noopener noreferrer"
                    class="vp-nav-dropdown-item">
                    {{ subItem.text }}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <router-link v-else :to="subItem.link" class="vp-nav-dropdown-item">
                    {{ subItem.text }}
                  </router-link>
                </template>
              </div>
            </div>
            <a v-else-if="item.link && isExternalLink(item.link)" :href="item.link" target="_blank"
              rel="noopener noreferrer" class="vp-nav-link">
              {{ item.text }}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                style="margin-left: 4px; opacity: 0.6;">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <router-link v-else-if="item.link" :to="item.link" class="vp-nav-link"
              :class="{ active: isNavActive(item.link) }">
              {{ item.text }}
            </router-link>
          </template>
        </nav>
        <!-- 导航菜单后面插槽 -->
        <PluginSlot name="nav-bar-nav-after" />
      </div>

      <!-- 右侧区域 -->
      <div class="vp-nav-right">
        <!-- 右侧内容左边插槽 -->
        <PluginSlot name="nav-bar-content-before" />
        <!-- 搜索 -->
        <button class="vp-nav-search" @click="openSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span class="vp-nav-search-text">搜索</span>
          <span class="vp-nav-search-shortcut">Ctrl K</span>
        </button>

        <!-- 语言切换 -->
        <div v-if="locales && Object.keys(locales).length > 1" class="vp-nav-lang" :class="{ open: isLangMenuOpen }">
          <button class="vp-nav-lang-trigger" title="切换语言" @click.stop="toggleLangMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span class="vp-nav-lang-label">{{ currentLocaleLabel }}</span>
            <svg class="vp-nav-lang-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-show="isLangMenuOpen" class="vp-nav-lang-menu">
              <a v-for="(locale, key) in locales" :key="key" :href="getLocaleLink(key as string)" class="vp-nav-lang-item"
                :class="{ active: isCurrentLocale(key as string) }" @click="closeAllDropdowns">
                {{ locale.label }}
              </a>
            </div>
          </Transition>
          <!-- 移动端遮罩 -->
          <Transition name="fade">
            <div v-show="isLangMenuOpen" class="vp-nav-dropdown-overlay" @click="closeAllDropdowns"></div>
          </Transition>
        </div>

        <!-- 主题色选择 -->
        <div class="vp-nav-theme-color" :class="{ open: isThemeColorOpen }">
          <button class="vp-nav-theme-color-trigger" title="选择主题色" @click.stop="toggleThemeColor">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="var(--ldoc-c-brand)" />
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-show="isThemeColorOpen" class="vp-nav-theme-color-panel">
              <div class="vp-theme-color-header">选择主题色</div>
              <div class="vp-theme-color-grid">
                <button v-for="color in themeColors" :key="color.name" class="vp-theme-color-card"
                  :class="{ active: currentThemeColor === color.name }" @click="setThemeColor(color.name); closeAllDropdowns()">
                  <span class="vp-theme-color-dot" :style="{ background: `hsl(${color.hue}, 70%, 55%)` }"></span>
                  <span class="vp-theme-color-info">
                    <span class="vp-theme-color-label">{{ color.label }}</span>
                    <span class="vp-theme-color-desc">{{ color.desc }}</span>
                  </span>
                  <svg v-if="currentThemeColor === color.name" class="vp-theme-color-check" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          </Transition>
          <!-- 移动端遮罩 -->
          <Transition name="fade">
            <div v-show="isThemeColorOpen" class="vp-nav-dropdown-overlay" @click="closeAllDropdowns"></div>
          </Transition>
        </div>

        <!-- 暗黑模式切换 -->
        <button class="vp-nav-theme-toggle" @click="toggleDark($event)" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
          <Transition name="icon-fade" mode="out-in">
            <svg v-if="isDark" key="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg v-else key="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </Transition>
        </button>

        <!-- 社交链接 -->
        <div class="vp-nav-social">
          <a v-for="social in socialLinks" :key="social.link" :href="social.link" target="_blank"
            rel="noopener noreferrer" class="vp-nav-social-link" :title="social.icon">
            <svg v-if="social.icon === 'github'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <svg v-else-if="social.icon === 'twitter'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </a>
        </div>

        <!-- 右侧内容右边插槽 -->
        <PluginSlot name="nav-bar-content-after" />

        <!-- 移动端菜单按钮 -->
        <button class="vp-nav-hamburger" @click="toggleSidebar" aria-label="打开菜单">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- 搜索弹窗 -->
  <VPSearch :is-open="isSearchOpen" @close="isSearchOpen = false" />
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useData, useDark, useSidebar, useThemeColor, useRoute } from '@ldesign/doc/client'
import { PluginSlot } from '@ldesign/doc/client'
import VPSearch from './VPSearch.vue'

const { site, theme } = useData()
const { isDark, toggle: toggleDark } = useDark()
const { toggle: toggleSidebar } = useSidebar()
const { colors: themeColors, currentColor: currentThemeColor, setColor: setThemeColor } = useThemeColor()
const route = useRoute()

// 获取当前语言环境
const currentLocale = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (!locales) return 'root'
  for (const key of Object.keys(locales)) {
    if (key === 'root') continue
    const locale = locales[key]
    if (locale.link && route.path.startsWith(locale.link)) {
      return key
    }
  }
  return 'root'
})

// 获取语言环境感知的主题配置
const localeTheme = computed(() => {
  const baseTheme = theme.value as Record<string, unknown>
  const locales = site.value.locales as Record<string, { themeConfig?: Record<string, unknown> }> | undefined
  const localeConfig = locales?.[currentLocale.value]?.themeConfig

  if (!localeConfig) return baseTheme

  // 合并配置，locale 配置覆盖基础配置
  return { ...baseTheme, ...localeConfig }
})

// 获取当前 locale 的首页链接
const homeLink = computed(() => {
  const locales = site.value.locales as Record<string, { link?: string }> | undefined
  if (currentLocale.value === 'root') return '/'
  return locales?.[currentLocale.value]?.link || '/'
})

// 站点标题
const siteTitle = computed(() => {
  const config = localeTheme.value as { siteTitle?: string | false }
  if (config.siteTitle === false) return ''
  return config.siteTitle || site.value.title
})

// Logo
const logo = computed(() => {
  const config = localeTheme.value as { logo?: string | { light: string; dark: string } }
  if (!config.logo) return ''
  if (typeof config.logo === 'string') return config.logo
  return isDark.value ? config.logo.dark : config.logo.light
})

// 导航项接口
interface NavSubItem {
  text: string
  link: string
}

interface NavItem {
  text: string
  link?: string
  items?: NavSubItem[]
}

// 导航项 - 使用语言环境感知配置
const navItems = computed<NavItem[]>(() => {
  const config = localeTheme.value as { nav?: NavItem[] }
  return config.nav || []
})

// 社交链接
const socialLinks = computed(() => {
  const config = localeTheme.value as { socialLinks?: Array<{ icon: string; link: string }> }
  return config.socialLinks || []
})

// 多语言配置
interface LocaleConfig {
  label: string
  lang?: string
  link?: string
}

const locales = computed<Record<string, LocaleConfig> | undefined>(() => {
  const config = site.value as { locales?: Record<string, LocaleConfig> }
  return config.locales
})

// 当前语言标签
const currentLocaleLabel = computed(() => {
  if (!locales.value) return ''
  const currentPath = route.path

  // 检查是否是某个语言路径
  for (const key in locales.value) {
    if (key === 'root') continue
    const locale = locales.value[key]
    if (locale.link && currentPath.startsWith(locale.link)) {
      return locale.label
    }
  }

  // 默认返回 root 语言
  return locales.value.root?.label || '简体中文'
})

// 判断是否为当前语言
const isCurrentLocale = (key: string) => {
  const currentPath = route.path

  if (key === 'root') {
    // root 语言：不以任何其他语言前缀开头
    if (!locales.value) return true
    for (const k in locales.value) {
      if (k !== 'root') {
        const locale = locales.value[k]
        if (locale.link && currentPath.startsWith(locale.link)) {
          return false
        }
      }
    }
    return true
  }

  const locale = locales.value?.[key]
  return locale?.link ? currentPath.startsWith(locale.link) : false
}

// 获取语言链接
const getLocaleLink = (key: string) => {
  const currentPath = route.path

  // 1. 找出当前路径中的语言前缀
  let currentPrefix = '/'
  if (locales.value) {
    for (const k in locales.value) {
      if (k === 'root') continue
      const loc = locales.value[k]
      if (loc.link && currentPath.startsWith(loc.link)) {
        currentPrefix = loc.link
        break
      }
    }
  }

  // 2. 获取不带语言前缀的相对路径
  let relativePath = currentPath
  if (currentPrefix !== '/' && currentPath.startsWith(currentPrefix)) {
    relativePath = currentPath.slice(currentPrefix.length)
  }
  // 确保相对路径以 / 开头
  if (!relativePath.startsWith('/')) {
    relativePath = '/' + relativePath
  }

  // 3. 构建目标语言路径
  if (key === 'root') {
    // 切换到 root (中文): 仅保留相对路径
    return relativePath
  }

  const targetLocale = locales.value?.[key]
  if (!targetLocale?.link) return relativePath

  // 切换到其他语言: 拼接目标语言前缀 + 相对路径
  // 此时 targetLocale.link 通常为 '/en/'，relativePath 为 '/guide/...'
  // 我们需要去掉其中一个斜杠，或者确保拼接正确
  const prefix = targetLocale.link.endsWith('/')
    ? targetLocale.link.slice(0, -1)
    : targetLocale.link

  return prefix + relativePath
}

// 判断是否为外部链接
const isExternalLink = (link: string) => {
  return /^https?:\/\//.test(link)
}

// 判断导航是否激活
const isNavActive = (link: string) => {
  if (!link) return false
  // 获取当前路径
  const currentPath = route?.path || (typeof window !== 'undefined' ? window.location.pathname : '/')
  // 标准化路径 - 移除结尾的斜杠
  const normalizePath = (p: string) => p.replace(/\/$/, '') || '/'
  const normalizedLink = normalizePath(link)
  const normalizedCurrent = normalizePath(currentPath)

  // 精确匹配
  if (normalizedCurrent === normalizedLink) return true
  // 路径前缀匹配（不包括首页）
  if (normalizedLink !== '/' && normalizedCurrent.startsWith(normalizedLink + '/')) return true
  if (normalizedLink !== '/' && normalizedCurrent.startsWith(normalizedLink)) return true
  return false
}

// 搜索
const isSearchOpen = ref(false)

const openSearch = () => {
  isSearchOpen.value = true
}

// 下拉菜单状态管理
const isLangMenuOpen = ref(false)
const isThemeColorOpen = ref(false)

const toggleLangMenu = () => {
  isLangMenuOpen.value = !isLangMenuOpen.value
  if (isLangMenuOpen.value) {
    isThemeColorOpen.value = false
  }
}

const toggleThemeColor = () => {
  isThemeColorOpen.value = !isThemeColorOpen.value
  if (isThemeColorOpen.value) {
    isLangMenuOpen.value = false
  }
}

const closeAllDropdowns = () => {
  isLangMenuOpen.value = false
  isThemeColorOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // 检查是否点击在下拉菜单内部
  if (!target.closest('.vp-nav-lang') && !target.closest('.vp-nav-theme-color')) {
    closeAllDropdowns()
  }
}

// 全局快捷键 Ctrl+K 打开搜索
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    isSearchOpen.value = !isSearchOpen.value
  }
  // ESC 关闭下拉菜单
  if (e.key === 'Escape') {
    closeAllDropdowns()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.vp-nav {
  position: sticky;
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
  /* 导航栏宽度跟随内容宽度配置 */
  width: var(--ldoc-content-width, 100%);
  max-width: var(--ldoc-layout-max-width, 1440px);
  margin: 0 auto;
  padding: 0;
}

/* Logo 区域与侧边栏对齐 */
.vp-nav-left {
  display: flex;
  align-items: center;
  width: var(--ldoc-sidebar-width, 260px);
  flex-shrink: 0;
  padding-left: 24px;
  box-sizing: border-box;
}

/* 中间导航区域 - 与内容区左侧对齐 */
.vp-nav-center {
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: var(--ldoc-content-gap, 32px);
}

/* 右侧区域 */
.vp-nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  padding-right: 24px;
  box-sizing: border-box;
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
  display: flex;
  align-items: center;
  color: var(--ldoc-c-text-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.vp-nav-link:hover {
  color: var(--ldoc-c-text-1);
  background: var(--ldoc-c-bg-soft);
}

.vp-nav-link.active {
  color: var(--ldoc-c-brand);
  background: var(--ldoc-c-brand-soft);
}

.vp-nav-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.vp-nav-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--ldoc-c-text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.vp-nav-dropdown-trigger:hover {
  color: var(--ldoc-c-text-1);
  background: var(--ldoc-c-bg-soft);
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
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.vp-nav-search:hover {
  border-color: var(--ldoc-c-brand);
  background: var(--ldoc-c-bg-mute);
}

.vp-nav-search-text {
  font-weight: 500;
  display: none;
}

@media (min-width: 960px) {
  .vp-nav-search-text {
    display: inline;
  }
}

.vp-nav-search-shortcut {
  display: none;
  align-items: center;
  padding: 2px 6px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--ldoc-c-text-3);
}

@media (min-width: 960px) {
  .vp-nav-search-shortcut {
    display: flex;
  }
}

/* 语言切换器 */
.vp-nav-lang {
  position: relative;
}

.vp-nav-lang-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: none;
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  cursor: pointer;
  color: var(--ldoc-c-text-1);
  font-size: 13px;
  transition: all 0.2s;
}

.vp-nav-lang-trigger:hover {
  border-color: var(--ldoc-c-brand);
  background: var(--ldoc-c-bg-soft);
}

.vp-nav-lang-label {
  display: none;
}

@media (min-width: 960px) {
  .vp-nav-lang-label {
    display: inline;
  }
}

.vp-nav-lang-arrow {
  opacity: 0.6;
}

.vp-nav-lang-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  padding: 8px 0;
  margin-top: 8px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

/* 下拉菜单遮罩 - 默认隐藏 */
.vp-nav-dropdown-overlay {
  display: none;
}

.vp-nav-lang-item {
  display: block;
  padding: 8px 16px;
  color: var(--ldoc-c-text-1);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.vp-nav-lang-item:hover {
  background: var(--ldoc-c-bg-soft);
  color: var(--ldoc-c-brand);
}

.vp-nav-lang-item.active {
  color: var(--ldoc-c-brand);
  font-weight: 600;
  background: var(--ldoc-c-brand-soft);
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
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  padding: 0;
  margin-top: 8px;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

/* 下拉菜单过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.vp-theme-color-header {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ldoc-c-text-2);
  border-bottom: 1px solid var(--ldoc-c-divider);
}

.vp-theme-color-grid {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vp-theme-color-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.vp-theme-color-card:hover {
  background: var(--ldoc-c-bg-soft);
}

.vp-theme-color-card.active {
  background: var(--ldoc-c-brand-soft);
  border-color: var(--ldoc-c-brand);
}

.vp-theme-color-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.vp-theme-color-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.vp-theme-color-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
}

.vp-theme-color-desc {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}

.vp-theme-color-check {
  flex-shrink: 0;
  color: var(--ldoc-c-brand);
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
  display: flex;
  align-items: center;
}

.vp-nav-hamburger {
  display: none;
  padding: 8px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* ==================== 移动端导航优化 ==================== */
@media (max-width: 768px) {
  .vp-nav {
    height: var(--ldoc-nav-height, 56px);
  }

  .vp-nav-container {
    padding: 0 12px;
  }

  .vp-nav-left {
    width: auto;
    padding-left: 0;
    flex: 1;
  }

  .vp-nav-logo {
    font-size: 16px;
  }

  .vp-nav-logo-img {
    height: 28px;
  }

  .vp-nav-center {
    display: none;
  }

  .vp-nav-links,
  .vp-nav-search-text,
  .vp-nav-search-shortcut,
  .vp-nav-lang-label,
  .vp-nav-lang-arrow,
  .vp-nav-social {
    display: none !important;
  }

  .vp-nav-right {
    gap: 2px;
    padding-right: 0;
  }

  /* 搜索按钮 - 仅图标 */
  .vp-nav-search {
    width: 36px;
    height: 36px;
    padding: 0;
    justify-content: center;
    border-radius: 8px;
    background: transparent;
    border: none;
  }

  /* 语言选择 - 仅图标 */
  .vp-nav-lang-trigger {
    width: 36px;
    height: 36px;
    padding: 0;
    justify-content: center;
  }

  /* 主题色选择 - 统一尺寸 */
  .vp-nav-theme-color-trigger {
    width: 36px;
    height: 36px;
  }

  /* 暗黑模式切换 - 统一尺寸 */
  .vp-nav-theme-toggle {
    width: 36px;
    height: 36px;
  }

  .vp-nav-theme-toggle svg,
  .vp-nav-theme-color-trigger svg,
  .vp-nav-lang-trigger svg,
  .vp-nav-search svg {
    width: 18px;
    height: 18px;
  }

  /* 汉堡菜单 - 统一尺寸 */
  .vp-nav-hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin-left: 0;
    padding: 0;
    background: none;
    border: none;
    border-radius: 8px;
    color: var(--ldoc-c-text-1);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .vp-nav-hamburger svg {
    width: 18px;
    height: 18px;
  }

  .vp-nav-hamburger:hover {
    background: var(--ldoc-c-bg-soft);
  }

  .vp-nav-hamburger:active {
    background: var(--ldoc-c-bg-mute);
  }

  /* 下拉菜单移动端优化 */
  .vp-nav-theme-color-panel,
  .vp-nav-lang-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 75vh;
    border-radius: 20px 20px 0 0;
    margin-top: 0;
    z-index: 1001;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }

  /* 移动端遮罩层 - 移动端显示 */
  .vp-nav-dropdown-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
  }

  /* 主题色面板内边距调整 */
  .vp-theme-color-header {
    padding: 16px 20px;
    font-size: 16px;
  }

  .vp-theme-color-grid {
    padding: 8px 12px 24px;
  }

  .vp-theme-color-card {
    padding: 14px 16px;
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  .vp-nav-left {
    width: auto;
    min-width: 200px;
    padding-left: 16px;
  }

  .vp-nav-center {
    padding-left: 20px;
  }

  .vp-nav-right {
    padding-right: 16px;
    gap: 6px;
  }
}

/* 大屏显示器优化 */
@media (min-width: 1920px) {
  .vp-nav {
    height: var(--ldoc-nav-height, 68px);
  }

  .vp-nav-logo {
    font-size: 20px;
  }

  .vp-nav-logo-img {
    height: 36px;
  }

  .vp-nav-link {
    font-size: 15px;
    padding: 6px 12px;
  }

  .vp-nav-search {
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 4K 显示器优化 */
@media (min-width: 2560px) {
  .vp-nav {
    height: var(--ldoc-nav-height, 72px);
  }

  .vp-nav-container {
    padding: 0 48px;
  }

  .vp-nav-logo {
    font-size: 22px;
  }

  .vp-nav-logo-img {
    height: 40px;
  }

  .vp-nav-link {
    font-size: 16px;
    padding: 8px 14px;
  }

  .vp-nav-search {
    padding: 10px 20px;
    font-size: 15px;
  }

  .vp-nav-theme-toggle,
  .vp-nav-theme-color-trigger {
    width: 44px;
    height: 44px;
  }

  .vp-nav-theme-toggle svg,
  .vp-nav-theme-color-trigger svg {
    width: 24px;
    height: 24px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .vp-nav-hamburger,
  .vp-nav-theme-toggle,
  .vp-nav-theme-color-trigger,
  .vp-nav-search {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
