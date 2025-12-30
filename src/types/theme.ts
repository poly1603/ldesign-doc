/**
 * @ldesign/doc - 主题系统类型定义
 * 
 * 定义主题、布局、导航、侧边栏等相关类型
 */

import type { SiteData } from './page'

// ============== 主题类型 ==============

/**
 * 主题定义
 * 用于创建自定义主题
 * 
 * @example
 * ```ts
 * import { defineTheme } from '@ldesign/doc'
 * 
 * export default defineTheme({
 *   Layout: MyLayout,
 *   NotFound: My404Page,
 *   enhanceApp({ app, router, siteData }) {
 *     app.component('MyGlobalComponent', MyComponent)
 *   }
 * })
 * ```
 */
export interface Theme {
  /** 主题布局组件 */
  Layout: unknown
  /** 404 页面组件 */
  NotFound?: unknown
  /** 增强 App 实例 */
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>
  /** 主题扩展（继承另一个主题） */
  extends?: Theme
  /** 自定义样式文件 */
  styles?: string[]
}

/**
 * 主题增强上下文
 */
export interface EnhanceAppContext {
  /** Vue App 或 React Root */
  app: unknown
  /** 路由实例 */
  router: unknown
  /** 站点数据 */
  siteData: SiteData
}

// ============== 主题配置类型 ==============

/**
 * 主题配置
 * 配置导航、侧边栏、页脚等主题元素
 * 
 * @example
 * ```ts
 * const themeConfig: ThemeConfig = {
 *   logo: '/logo.svg',
 *   nav: [
 *     { text: '指南', link: '/guide/' },
 *     { text: 'API', link: '/api/' }
 *   ],
 *   sidebar: {
 *     '/guide/': [
 *       { text: '开始', items: [...] }
 *     ]
 *   },
 *   footer: {
 *     message: 'Released under the MIT License.',
 *     copyright: 'Copyright © 2024 LDesign'
 *   }
 * }
 * ```
 */
export interface ThemeConfig {
  /** 导航菜单 */
  nav?: NavItem[]
  /** 侧边栏配置 */
  sidebar?: Sidebar
  /** Logo 配置 */
  logo?: string | ThemeLogo
  /** 站点标题（false 隐藏） */
  siteTitle?: string | false
  /** 社交链接 */
  socialLinks?: SocialLink[]
  /** 页脚配置 */
  footer?: FooterConfig
  /** 编辑链接配置 */
  editLink?: EditLinkConfig
  /** 最后更新时间配置 */
  lastUpdated?: LastUpdatedConfig
  /** 搜索配置 */
  search?: SearchConfig
  /** 大纲配置 */
  outline?: OutlineConfig
  /** 布局配置 */
  layout?: LayoutConfig
  /** UI 配置 */
  ui?: UIConfig
  /** 文档页脚配置 */
  docFooter?: DocFooterConfig
  /** 自定义扩展 */
  [key: string]: unknown
}

/**
 * 布局配置
 * 控制页面布局尺寸
 */
export interface LayoutConfig {
  /** 侧边栏宽度，默认 260px */
  sidebarWidth?: number
  /** TOC 宽度，默认 220px */
  outlineWidth?: number
  /** 内容与侧边栏/TOC 的间距，默认 32px */
  contentGap?: number
  /** 导航栏高度，默认 64px */
  navHeight?: number
  /** 最大内容宽度，默认 1400px */
  maxWidth?: number
  /** 
   * 内容区域宽度
   * 支持百分比或固定像素值，如: '100%', '1200px', '90vw'
   * @default '100%'
   */
  contentWidth?: string
  /**
   * 导航栏是否与内容宽度保持一致
   * @default true
   */
  navFullWidth?: boolean
}

// ============== UI 配置 ==============

/**
 * 主题切换动画类型
 */
export type ThemeTransitionType = 'none' | 'fade' | 'circle' | 'slide' | 'flip' | 'dissolve'

/**
 * 暗黑模式 UI 配置
 */
export interface DarkModeUIOptions {
  /** 切换动画类型 */
  transition?: ThemeTransitionType
  /** 动画持续时间（毫秒） */
  duration?: number
}

/**
 * 模态框动画配置
 */
export interface ModalAnimationOptions {
  /** 动画类型 */
  type?: 'fade' | 'scale' | 'zoom' | 'slide-up'
  /** 进入动画时长（毫秒） */
  enterDuration?: number
  /** 离开动画时长（毫秒） */
  leaveDuration?: number
  /** 缓动函数 */
  easing?: string
}

/**
 * 顶部进度条配置
 */
export interface ProgressBarOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 高度（像素） */
  height?: number
  /** 颜色 */
  color?: string
  /** 是否跟踪 Fetch 请求 */
  trackFetch?: boolean
  /** 是否跟踪 XHR 请求 */
  trackXHR?: boolean
}

/**
 * UI 配置
 */
export interface UIConfig {
  /** 暗黑模式切换配置 */
  darkMode?: DarkModeUIOptions
  /** 通用模态框配置 */
  modal?: ModalAnimationOptions
  /** 搜索模态框配置 */
  searchModal?: ModalAnimationOptions
  /** 登录模态框配置 */
  loginModal?: ModalAnimationOptions
  /** 顶部进度条配置 */
  progressBar?: ProgressBarOptions
}

// ============== 导航配置 ==============

/**
 * Logo 配置
 */
export interface ThemeLogo {
  /** 亮色模式 Logo */
  light?: string
  /** 暗色模式 Logo */
  dark?: string
  /** Alt 文本 */
  alt?: string
}

/**
 * 导航项
 * 
 * @example
 * ```ts
 * // 简单链接
 * { text: '首页', link: '/' }
 * 
 * // 下拉菜单
 * {
 *   text: '指南',
 *   items: [
 *     { text: '快速开始', link: '/guide/getting-started' },
 *     { text: '配置', link: '/guide/config' }
 *   ]
 * }
 * ```
 */
export interface NavItem {
  /** 显示文本 */
  text: string
  /** 链接地址 */
  link?: string
  /** 子菜单 */
  items?: NavItem[]
  /** 激活匹配规则 */
  activeMatch?: string
}

// ============== 侧边栏配置 ==============

/**
 * 侧边栏配置
 * 可以是数组或按路径分组的对象
 */
export type Sidebar = SidebarItem[] | SidebarMulti

/**
 * 多路径侧边栏配置
 */
export interface SidebarMulti {
  [path: string]: SidebarItem[]
}

/**
 * 侧边栏项
 * 
 * @example
 * ```ts
 * const sidebarItem: SidebarItem = {
 *   text: '开始使用',
 *   collapsed: false,
 *   items: [
 *     { text: '安装', link: '/guide/installation' },
 *     { text: '配置', link: '/guide/configuration' }
 *   ]
 * }
 * ```
 */
export interface SidebarItem {
  /** 显示文本 */
  text: string
  /** 链接地址 */
  link?: string
  /** 子项 */
  items?: SidebarItem[]
  /** 是否默认折叠 */
  collapsed?: boolean
  /** 描述文本 */
  description?: string
}

// ============== 社交链接 ==============

/**
 * 社交链接
 */
export interface SocialLink {
  /** 图标名称或自定义 SVG */
  icon: string | { svg: string }
  /** 链接地址 */
  link: string
  /** 无障碍标签 */
  ariaLabel?: string
}

// ============== 页脚配置 ==============

/**
 * 页脚配置
 */
export interface FooterConfig {
  /** 页脚消息 */
  message?: string
  /** 版权信息 */
  copyright?: string
}

/**
 * 编辑链接配置
 */
export interface EditLinkConfig {
  /** 编辑链接模式，如 'https://github.com/user/repo/edit/main/docs/:path' */
  pattern: string
  /** 链接文本 */
  text?: string
}

/**
 * 最后更新时间配置
 */
export interface LastUpdatedConfig {
  /** 显示文本 */
  text?: string
  /** 日期格式化选项 */
  formatOptions?: Intl.DateTimeFormatOptions
}

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 搜索提供者 */
  provider: 'local' | 'algolia' | 'custom'
  /** 提供者特定选项 */
  options?: Record<string, unknown>
}

/**
 * 大纲配置
 */
export interface OutlineConfig {
  /** 显示层级，如 2 或 [2, 3] 或 'deep' */
  level?: number | [number, number] | 'deep'
  /** 大纲标题 */
  label?: string
}

/**
 * 文档页脚配置（上下页导航）
 */
export interface DocFooterConfig {
  /** 上一页文本（false 禁用） */
  prev?: string | false
  /** 下一页文本（false 禁用） */
  next?: string | false
  /** 自定义阅读顺序 */
  readingOrder?: ReadingOrderItem[]
}

/**
 * 阅读顺序项
 */
export interface ReadingOrderItem {
  /** 页面链接 */
  link: string
  /** 页面标题 */
  text: string
  /** 页面描述 */
  description?: string
}

// ============== 语言配置 ==============

/**
 * 单个语言的配置
 * 
 * @example
 * ```ts
 * const enLocale: LocaleConfig = {
 *   label: 'English',
 *   lang: 'en-US',
 *   link: '/en/',
 *   themeConfig: {
 *     nav: [
 *       { text: 'Guide', link: '/en/guide/' },
 *       { text: 'API', link: '/en/api/' }
 *     ]
 *   }
 * }
 * ```
 */
export interface LocaleConfig {
  /** 语言切换器中显示的标签 */
  label?: string
  /** 语言代码，如 'en-US'、'zh-CN' */
  lang?: string
  /** 文本方向，'ltr' 或 'rtl' */
  dir?: string
  /** 该语言的链接前缀，如 '/en/' */
  link?: string
  /** 该语言的站点标题 */
  title?: string
  /** 该语言的站点描述 */
  description?: string
  /** 该语言特有的 head 标签 */
  head?: import('./page').HeadConfig[]
  /** 该语言的主题配置 */
  themeConfig?: ThemeConfig
}
