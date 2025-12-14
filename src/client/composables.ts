/**
 * 客户端组合式函数
 */

import { ref, computed, inject, type Ref, type ComputedRef, type InjectionKey } from 'vue'
import { useRoute as useVueRoute, useRouter as useVueRouter } from 'vue-router'
import type { PageData, SiteData, Header } from '../shared/types'

// Injection keys - 使用全局 Symbol 以确保跨模块共享
export const pageDataSymbol: InjectionKey<Ref<PageData>> = Symbol.for('ldoc:pageData')
export const siteDataSymbol: InjectionKey<Ref<SiteData>> = Symbol.for('ldoc:siteData')

/**
 * 页面数据接口
 */
export interface Data {
  page: ComputedRef<PageData>
  site: ComputedRef<SiteData>
  theme: ComputedRef<unknown>
  frontmatter: ComputedRef<Record<string, unknown>>
  title: ComputedRef<string>
  description: ComputedRef<string>
  headers: ComputedRef<Header[]>
  lang: ComputedRef<string>
  isDark: Ref<boolean>
}

/**
 * 获取当前语言环境
 */
function getCurrentLocale(path: string, locales?: Record<string, { link?: string; lang?: string }>): string {
  if (!locales) return 'root'

  for (const key of Object.keys(locales)) {
    if (key === 'root') continue
    const locale = locales[key]
    if (locale.link && path.startsWith(locale.link)) {
      return key
    }
  }
  return 'root'
}

/**
 * 合并主题配置（locale 配置覆盖基础配置）
 */
function mergeThemeConfig(baseConfig: Record<string, unknown>, localeConfig?: Record<string, unknown>): Record<string, unknown> {
  if (!localeConfig) return baseConfig

  const merged = { ...baseConfig }

  for (const key of Object.keys(localeConfig)) {
    const baseValue = baseConfig[key]
    const localeValue = localeConfig[key]

    // 对于数组（如 nav, sidebar），直接使用 locale 值替换
    if (Array.isArray(localeValue)) {
      merged[key] = localeValue
    }
    // 对于对象（如 sidebar 的路径映射），合并
    else if (typeof localeValue === 'object' && localeValue !== null && typeof baseValue === 'object' && baseValue !== null && !Array.isArray(baseValue)) {
      merged[key] = { ...baseValue as Record<string, unknown>, ...localeValue as Record<string, unknown> }
    }
    // 其他情况直接覆盖
    else {
      merged[key] = localeValue
    }
  }

  return merged
}

/**
 * 获取页面和站点数据
 */
export function useData(): Data {
  const pageData = inject(pageDataSymbol)
  const siteData = inject(siteDataSymbol)
  const route = useVueRoute()
  const isDark = ref(false)

  // 检测暗色模式
  if (typeof window !== 'undefined') {
    isDark.value = document.documentElement.classList.contains('dark')

    // 监听变化
    const observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  }

  // 当前语言环境 - 使用响应式路由路径
  const currentLocale = computed(() => {
    const locales = siteData?.value?.locales as Record<string, { link?: string; lang?: string }> | undefined
    return getCurrentLocale(route.path, locales)
  })

  // 合并后的主题配置（基础 + 当前语言环境）
  const theme = computed(() => {
    const baseTheme = siteData?.value?.themeConfig || {}
    const locales = siteData?.value?.locales as Record<string, { themeConfig?: Record<string, unknown> }> | undefined
    const localeTheme = locales?.[currentLocale.value]?.themeConfig
    return mergeThemeConfig(baseTheme as Record<string, unknown>, localeTheme)
  })

  // 当前语言
  const lang = computed(() => {
    const locales = siteData?.value?.locales as Record<string, { lang?: string }> | undefined
    return locales?.[currentLocale.value]?.lang || siteData?.value?.lang || 'zh-CN'
  })

  return {
    page: computed(() => pageData?.value || {} as PageData),
    site: computed(() => siteData?.value || {} as SiteData),
    theme,
    frontmatter: computed(() => pageData?.value?.frontmatter || {}),
    title: computed(() => pageData?.value?.title || ''),
    description: computed(() => pageData?.value?.description || ''),
    headers: computed(() => pageData?.value?.headers || []),
    lang,
    isDark
  }
}

/**
 * 获取当前路由
 */
export function useRoute() {
  return useVueRoute()
}

/**
 * 获取路由实例
 */
export function useRouter() {
  return useVueRouter()
}

/**
 * 获取站点数据
 */
export function useSiteData(): ComputedRef<SiteData> {
  const siteData = inject(siteDataSymbol)
  return computed(() => siteData?.value || {} as SiteData)
}

/**
 * 获取页面数据
 */
export function usePageData(): ComputedRef<PageData> {
  const pageData = inject(pageDataSymbol)
  return computed(() => pageData?.value || {} as PageData)
}

/**
 * 滚动到锚点
 */
export function useScrollToAnchor() {
  const route = useVueRoute()

  const scrollToAnchor = (hash?: string) => {
    const targetHash = hash || route.hash
    if (!targetHash) return

    const target = document.querySelector(decodeURIComponent(targetHash))
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return { scrollToAnchor }
}

/**
 * 页面加载状态
 */
export function usePageLoading() {
  const isLoading = ref(false)
  const router = useVueRouter()

  router.beforeEach(() => {
    isLoading.value = true
  })

  router.afterEach(() => {
    isLoading.value = false
  })

  return { isLoading }
}

/**
 * View Transition 动画类型
 */
export type ThemeTransitionType = 'none' | 'fade' | 'circle' | 'slide' | 'flip' | 'dissolve'

/**
 * 暗色模式切换配置
 */
export interface DarkModeOptions {
  transition?: ThemeTransitionType
  duration?: number
}

// 全局配置
let themeTransitionType: ThemeTransitionType = 'circle'
let themeTransitionDuration = 300

/**
 * 设置主题切换动画配置
 */
export function setThemeTransition(type: ThemeTransitionType, duration?: number) {
  themeTransitionType = type
  if (duration) themeTransitionDuration = duration
}

/**
 * 暗色模式切换
 */
export function useDark() {
  const isDark = ref(false)

  if (typeof window !== 'undefined') {
    // 从 localStorage 或系统偏好读取
    const stored = localStorage.getItem('ldoc-theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // 应用主题
    updateTheme(isDark.value)
  }

  const toggle = (event?: MouseEvent) => {
    // 使用 View Transition API 实现炫酷切换动画
    if (themeTransitionType !== 'none' && 'startViewTransition' in document) {
      const x = event?.clientX ?? window.innerWidth / 2
      const y = event?.clientY ?? window.innerHeight / 2

      // 计算最大半径
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      )

      // 判断方向：当前是暗色模式则收缩，当前是亮色模式则扩散
      const isCollapse = isDark.value

      // 创建动态样式表，直接注入动画规则
      const styleId = 'theme-transition-style'
      let style = document.getElementById(styleId) as HTMLStyleElement
      if (!style) {
        style = document.createElement('style')
        style.id = styleId
        document.head.appendChild(style)
      }

      const duration = `${themeTransitionDuration}ms`
      const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
      const clipStart = `circle(0px at ${x}px ${y}px)`
      const clipEnd = `circle(${maxRadius}px at ${x}px ${y}px)`

      // 在 startViewTransition 之前注入完整的动画样式
      if (isCollapse) {
        // 收缩：旧视图（暗色）在上面执行收缩动画，新视图（亮色）在下面不动
        style.textContent = `
          *, *::before, *::after { transition: none !important; }
          ::view-transition-old(root) {
            z-index: 2 !important;
            animation: theme-collapse ${duration} ${easing} forwards !important;
          }
          ::view-transition-new(root) {
            z-index: 1 !important;
            animation: none !important;
          }
          @keyframes theme-collapse {
            from { clip-path: ${clipEnd}; }
            to { clip-path: ${clipStart}; }
          }
        `
      } else {
        // 扩散：新视图（暗色）在上面执行扩散动画，旧视图（亮色）在下面不动
        style.textContent = `
          *, *::before, *::after { transition: none !important; }
          ::view-transition-old(root) {
            z-index: 1 !important;
            animation: none !important;
          }
          ::view-transition-new(root) {
            z-index: 2 !important;
            animation: theme-expand ${duration} ${easing} forwards !important;
          }
          @keyframes theme-expand {
            from { clip-path: ${clipStart}; }
            to { clip-path: ${clipEnd}; }
          }
        `
      }

      const transition = (document as any).startViewTransition(() => {
        isDark.value = !isDark.value
        updateTheme(isDark.value)
        localStorage.setItem('ldoc-theme', isDark.value ? 'dark' : 'light')
      })

      // 动画完成后清理
      const cleanup = () => {
        // 延迟移除样式，确保动画完成
        setTimeout(() => {
          if (style && style.parentNode) {
            style.textContent = ''
          }
        }, 50)
      }

      transition.finished.then(cleanup).catch(cleanup)
    } else {
      // 降级到普通切换
      isDark.value = !isDark.value
      updateTheme(isDark.value)
      localStorage.setItem('ldoc-theme', isDark.value ? 'dark' : 'light')
    }
  }

  return { isDark, toggle, setTransition: setThemeTransition }
}

function updateTheme(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }
}

/**
 * 侧边栏状态 - 全局共享
 */
const sidebarState = ref(false)

export function useSidebar() {
  const open = () => { sidebarState.value = true }
  const close = () => { sidebarState.value = false }
  const toggle = () => { sidebarState.value = !sidebarState.value }

  return { isOpen: sidebarState, open, close, toggle }
}

/**
 * 主题色切换
 */
export function useThemeColor() {
  const colors = [
    { name: 'blue', hue: 217, label: '海蓝', desc: '专业沉稳，科技感' },
    { name: 'indigo', hue: 231, label: '靛蓝', desc: '深邃典雅，高端大气' },
    { name: 'purple', hue: 262, label: '紫罗兰', desc: '神秘优雅，创意灵感' },
    { name: 'pink', hue: 330, label: '樱花粉', desc: '温柔浪漫，活力可爱' },
    { name: 'rose', hue: 350, label: '玫瑰红', desc: '热情奔放，时尚前卫' },
    { name: 'red', hue: 0, label: '中国红', desc: '喜庆吉祥，热烈大气' },
    { name: 'orange', hue: 25, label: '橙韵', desc: '活力四射，温暖阳光' },
    { name: 'amber', hue: 38, label: '琥珀金', desc: '尊贵典雅，成熟稳重' },
    { name: 'green', hue: 142, label: '翡翠绿', desc: '清新自然，生机盎然' },
    { name: 'emerald', hue: 160, label: '祖母绿', desc: '高贵典雅，沉稳大气' },
    { name: 'teal', hue: 175, label: '青瓷', desc: '清雅脱俗，东方韵味' },
    { name: 'cyan', hue: 190, label: '天青', desc: '清澈明亮，现代简约' }
  ]

  const currentColor = ref('blue')

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ldoc-theme-color')
    if (stored && colors.find(c => c.name === stored)) {
      currentColor.value = stored
      document.documentElement.setAttribute('data-theme', stored)
    }
  }

  const setColor = (colorName: string) => {
    const color = colors.find(c => c.name === colorName)
    if (color) {
      currentColor.value = colorName
      document.documentElement.setAttribute('data-theme', colorName)
      localStorage.setItem('ldoc-theme-color', colorName)
    }
  }

  return { colors, currentColor, setColor }
}
