/**
 * @ldesign/doc - 核心类型定义
 */

import type { Plugin as VitePlugin, UserConfig as ViteUserConfig } from 'vite'

// ============== 基础类型 ==============

export type Framework = 'vue' | 'react' | 'auto'

export interface PageData {
  title: string
  description: string
  frontmatter: Record<string, unknown>
  headers: Header[]
  relativePath: string
  filePath: string
  lastUpdated?: number
}

export interface Header {
  level: number
  title: string
  slug: string
  children?: Header[]
}

export interface SiteData {
  base: string
  title: string
  description: string
  lang: string
  locales: Record<string, LocaleConfig>
  themeConfig: ThemeConfig
  head: HeadConfig[]
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

// ============== 配置类型 ==============

/**
 * 额外文档源配置
 */
export interface ExtraDocsSource {
  /** 目录路径（相对于项目根目录） */
  dir: string
  /** URL 前缀，如 '/components' */
  prefix?: string
  /** 文件匹配模式，默认 '**\/*.md' */
  pattern?: string
}

export interface UserConfig {
  // 基础配置
  srcDir?: string
  /** 额外的文档源目录，用于从 src 等目录加载组件文档 */
  extraDocs?: ExtraDocsSource[]
  outDir?: string
  base?: string
  title?: string
  description?: string
  lang?: string
  head?: HeadConfig[]

  // 框架配置
  framework?: Framework

  // 主题配置
  theme?: string | ThemeConfig
  themeConfig?: ThemeConfig

  // 多语言配置
  locales?: Record<string, LocaleConfig>

  // Markdown 配置
  markdown?: MarkdownOptions

  // Vite 配置
  vite?: ViteUserConfig

  // 插件系统
  plugins?: LDocPlugin[]

  // 构建配置
  build?: BuildConfig

  // 认证配置
  auth?: AuthConfig

  // 扩展钩子
  transformHead?: (ctx: TransformContext) => Promise<HeadConfig[]> | HeadConfig[]
  transformHtml?: (code: string, id: string, ctx: TransformContext) => Promise<string> | string
  transformPageData?: (pageData: PageData, ctx: TransformContext) => Promise<Partial<PageData> | void> | Partial<PageData> | void
  buildEnd?: (siteConfig: SiteConfig) => Promise<void> | void
}

export interface SiteConfig extends Required<Omit<UserConfig, 'theme' | 'plugins' | 'transformHead' | 'transformHtml' | 'transformPageData' | 'buildEnd'>> {
  root: string
  configPath: string | undefined
  configDeps: string[]
  themeDir: string
  tempDir: string
  cacheDir: string
  userPlugins: LDocPlugin[]

  // 可选的扩展钩子
  transformHead?: (ctx: TransformContext) => Promise<HeadConfig[]> | HeadConfig[]
  transformHtml?: (code: string, id: string, ctx: TransformContext) => Promise<string> | string
  transformPageData?: (pageData: PageData, ctx: TransformContext) => Promise<Partial<PageData> | void> | Partial<PageData> | void
  buildEnd?: (siteConfig: SiteConfig) => Promise<void> | void
}

export interface LocaleConfig {
  label?: string
  lang?: string
  dir?: string
  link?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
}

// ============== 主题系统类型 ==============

export interface ThemeConfig {
  // 导航配置
  nav?: NavItem[]
  sidebar?: Sidebar

  // 页面配置
  logo?: string | ThemeLogo
  siteTitle?: string | false

  // 社交链接
  socialLinks?: SocialLink[]

  // 页脚配置
  footer?: FooterConfig

  // 编辑链接
  editLink?: EditLinkConfig

  // 上次更新
  lastUpdated?: LastUpdatedConfig

  // 搜索配置
  search?: SearchConfig

  // 大纲配置
  outline?: OutlineConfig

  // 布局配置
  layout?: LayoutConfig

  // 自定义扩展
  [key: string]: unknown
}

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
}

export interface ThemeLogo {
  light?: string
  dark?: string
  alt?: string
}

export interface NavItem {
  text: string
  link?: string
  items?: NavItem[]
  activeMatch?: string
}

export type Sidebar = SidebarItem[] | SidebarMulti

export interface SidebarMulti {
  [path: string]: SidebarItem[]
}

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
}

export interface FooterConfig {
  message?: string
  copyright?: string
}

export interface EditLinkConfig {
  pattern: string
  text?: string
}

export interface LastUpdatedConfig {
  text?: string
  formatOptions?: Intl.DateTimeFormatOptions
}

export interface SearchConfig {
  provider: 'local' | 'algolia' | 'custom'
  options?: Record<string, unknown>
}

export interface OutlineConfig {
  level?: number | [number, number] | 'deep'
  label?: string
}

// ============== 主题开发 API ==============

export interface Theme {
  // 主题布局组件
  Layout: unknown

  // 404 页面组件
  NotFound?: unknown

  // 增强 App 实例
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>

  // 主题扩展
  extends?: Theme

  // 自定义样式
  styles?: string[]
}

export interface EnhanceAppContext {
  app: unknown // Vue App 或 React Root
  router: unknown
  siteData: SiteData
}

// ============== 插件系统类型 ==============

/**
 * 插件 Slot 位置
 * 插件可以将 UI 组件注入到这些预定义位置
 */
export type PluginSlotName =
  // ========== 导航栏区域 ==========
  | 'nav-bar-logo-after'       // Logo 后面
  | 'nav-bar-nav-after'        // 导航菜单后面
  | 'nav-bar-content-before'   // 头部右边内容的左边
  | 'nav-bar-content-after'    // 头部右边内容的右边
  | 'nav-bar-title-before'     // 标题前
  | 'nav-bar-title-after'      // 标题后

  // ========== 侧边栏区域 ==========
  | 'sidebar-top'              // 侧边菜单顶部
  | 'sidebar-bottom'           // 侧边菜单底部
  | 'sidebar-nav-before'       // 侧边栏导航前
  | 'sidebar-nav-after'        // 侧边栏导航后

  // ========== 右侧栏区域 ==========
  | 'aside-top'                // 右侧栏顶部
  | 'aside-bottom'             // 右侧栏底部
  | 'aside-outline-before'     // 大纲前
  | 'aside-outline-after'      // 大纲后

  // ========== 文档内容区域 ==========
  | 'doc-before'               // 文档内容前（整个文档区域上方）
  | 'doc-after'                // 文档内容后（整个文档区域下方）
  | 'doc-top'                  // 文档标题下方（元信息区域）
  | 'doc-bottom'               // 文档内容底部
  | 'doc-footer-before'        // 文档页脚前（上下页导航前）
  | 'doc-footer-after'         // 文档页脚后

  // ========== 页脚区域 ==========
  | 'footer-before'            // 页脚上方
  | 'footer-after'             // 页脚下方

  // ========== 返回顶部 ==========
  | 'back-to-top-before'       // 返回顶部按钮上方
  | 'back-to-top-after'        // 返回顶部按钮下方

  // ========== 布局级别 ==========
  | 'layout-top'               // 布局顶部（导航栏上方，可用于公告栏）
  | 'layout-bottom'            // 布局底部（页脚下方）

  // ========== 首页区域 ==========
  | 'home-hero-before'         // 首页 Hero 前
  | 'home-hero-after'          // 首页 Hero 后
  | 'home-hero-info'           // 首页 Hero 信息区（标题描述下方）
  | 'home-hero-actions-after'  // 首页 Hero 按钮后
  | 'home-features-before'     // 首页特性前
  | 'home-features-after'      // 首页特性后

  // ========== 其他 ==========
  | 'not-found'                // 404 页面

/**
 * 插件 UI 组件定义
 */
export interface PluginSlotComponent {
  /** 组件（Vue 组件或函数组件） */
  component: unknown
  /** 组件 props */
  props?: Record<string, unknown>
  /** 排序权重，数字越小越靠前 */
  order?: number
}

/**
 * 插件 Slots 配置
 */
export type PluginSlots = {
  [K in PluginSlotName]?: PluginSlotComponent | PluginSlotComponent[]
}

/**
 * 插件全局组件
 */
export interface PluginGlobalComponent {
  /** 组件名称 */
  name: string
  /** 组件实现 */
  component: unknown
}

export interface LDocPlugin {
  /** 插件名称，必须唯一 */
  name: string

  /** 插件执行顺序，数字越小越先执行，默认 100 */
  enforce?: 'pre' | 'post' | number

  // ============== 配置阶段钩子 ==============

  /** 修改用户配置，在配置解析前调用 */
  config?: (config: UserConfig, env: ConfigEnv) => UserConfig | null | void | Promise<UserConfig | null | void>

  /** 配置解析完成后调用 */
  configResolved?: (config: SiteConfig) => void | Promise<void>

  // ============== Vite 扩展 ==============

  /** 返回额外的 Vite 插件 */
  vitePlugins?: () => VitePlugin[] | Promise<VitePlugin[]>

  // ============== Markdown 扩展 ==============

  /** 扩展 Markdown 渲染器 */
  extendMarkdown?: (md: MarkdownRenderer) => void

  // ============== 数据扩展 ==============

  /** 扩展页面数据，可以添加自定义字段 */
  extendPageData?: (pageData: PageData, ctx: PluginPageContext) => void | Promise<void>

  /** 扩展站点数据 */
  extendSiteData?: (siteData: SiteData) => void | Promise<void>

  // ============== 路由扩展 ==============

  /** 扩展或修改路由 */
  extendRoutes?: (routes: Route[]) => Route[] | void

  /** 路由切换前调用（客户端） */
  onBeforeRouteChange?: (to: string, from: string) => boolean | void | Promise<boolean | void>

  /** 路由切换后调用（客户端） */
  onAfterRouteChange?: (to: string) => void | Promise<void>

  // ============== 构建生命周期 ==============

  /** 构建开始时调用 */
  buildStart?: (config: SiteConfig) => void | Promise<void>

  /** 每个页面渲染前调用 */
  onBeforePageRender?: (page: PageRenderContext) => void | Promise<void>

  /** 每个页面渲染后调用 */
  onAfterPageRender?: (page: PageRenderContext) => void | Promise<void>

  /** 所有页面生成后调用 */
  generateBundle?: (config: SiteConfig) => void | Promise<void>

  /** 构建完成后调用 */
  buildEnd?: (config: SiteConfig) => void | Promise<void>

  // ============== 客户端生命周期 ==============

  /** 客户端应用初始化 */
  onClientInit?: (ctx: ClientPluginContext) => void | Promise<void>

  /** 客户端挂载完成 */
  onClientMounted?: (ctx: ClientPluginContext) => void | Promise<void>

  /** 客户端更新（页面切换后） */
  onClientUpdated?: (ctx: ClientPluginContext) => void | Promise<void>

  // ============== UI 注入系统 ==============

  /**
   * 注入到预定义 Slot 位置的组件
   * 无需主题支持，框架自动渲染
   */
  slots?: PluginSlots | ((ctx: ClientPluginContext) => PluginSlots)

  /**
   * 注册全局组件
   * 用户可以在 Markdown 或 Vue 组件中直接使用
   */
  globalComponents?: PluginGlobalComponent[]

  /**
   * 注册全局指令
   */
  globalDirectives?: PluginGlobalDirective[]

  // ============== 客户端代码注入 ==============

  /** 客户端配置文件内容（字符串）或文件路径 */
  clientConfigFile?: string

  /** 在 head 中注入的脚本 */
  headScripts?: string[] | ((ctx: TransformContext) => string[])

  /** 在 head 中注入的样式 */
  headStyles?: string[] | ((ctx: TransformContext) => string[])

  // ============== 热更新 ==============

  /** 处理热更新 */
  handleHotUpdate?: (ctx: HotUpdateContext) => void | Promise<void>

  // ============== 清理 ==============

  /** 插件销毁时调用 */
  onDestroy?: () => void | Promise<void>
}

/**
 * 页面数据扩展上下文
 */
export interface PluginPageContext {
  /** 站点配置 */
  siteConfig: SiteConfig
  /** Markdown 源内容 */
  content: string
  /** 文件路径 */
  filePath: string
  /** 相对路径 */
  relativePath: string
}

/**
 * 页面渲染上下文
 */
export interface PageRenderContext {
  /** 页面数据 */
  pageData: PageData
  /** 站点配置 */
  siteConfig: SiteConfig
  /** 渲染后的 HTML（仅 onAfterPageRender 可用） */
  html?: string
}

/**
 * 客户端插件上下文
 */
export interface ClientPluginContext {
  /** Vue 应用实例 */
  app: unknown
  /** Vue Router 实例 */
  router: unknown
  /** 站点数据（响应式） */
  siteData: SiteData
  /** 当前页面数据（响应式） */
  pageData: PageData
  /** 路由工具 */
  route: ClientRouteUtils
  /** 数据工具 */
  data: ClientDataUtils
  /** UI 工具 */
  ui: ClientUIUtils
  /** 存储工具 */
  storage: ClientStorageUtils
  /** 事件总线 */
  events: ClientEventBus
}

/**
 * 客户端路由工具
 */
export interface ClientRouteUtils {
  /** 当前路由路径 */
  path: string
  /** 当前路由 hash */
  hash: string
  /** 当前路由查询参数 */
  query: Record<string, string>
  /** 导航到指定路径 */
  go: (path: string) => void
  /** 替换当前路由 */
  replace: (path: string) => void
  /** 后退 */
  back: () => void
  /** 前进 */
  forward: () => void
  /** 滚动到锚点 */
  scrollToAnchor: (hash: string) => void
}

/**
 * 客户端数据工具
 */
export interface ClientDataUtils {
  /** 获取页面数据 */
  getPageData: () => PageData
  /** 获取站点数据 */
  getSiteData: () => SiteData
  /** 获取主题配置 */
  getThemeConfig: () => ThemeConfig
  /** 获取 frontmatter */
  getFrontmatter: () => Record<string, unknown>
  /** 获取标题列表 */
  getHeaders: () => Header[]
  /** 获取当前语言 */
  getLang: () => string
  /** 是否暗色模式 */
  isDark: () => boolean
}

/**
 * 客户端 UI 工具
 */
export interface ClientUIUtils {
  /** 显示 Toast 消息 */
  showToast: (message: string, options?: ToastOptions) => void
  /** 显示加载状态 */
  showLoading: (message?: string) => void
  /** 隐藏加载状态 */
  hideLoading: () => void
  /** 显示模态框 */
  showModal: (options: ModalOptions) => Promise<boolean>
  /** 复制文本到剪贴板 */
  copyToClipboard: (text: string) => Promise<boolean>
}

/**
 * Toast 选项
 */
export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'bottom' | 'center'
}

/**
 * 模态框选项
 */
export interface ModalOptions {
  title?: string
  content: string | unknown
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

/**
 * 客户端存储工具
 */
export interface ClientStorageUtils {
  /** 获取存储值 */
  get: <T>(key: string, defaultValue?: T) => T | null
  /** 设置存储值 */
  set: <T>(key: string, value: T) => void
  /** 删除存储值 */
  remove: (key: string) => void
  /** 清空存储 */
  clear: () => void
}

/**
 * 客户端事件总线
 */
export interface ClientEventBus {
  /** 监听事件 */
  on: <T = unknown>(event: string, callback: (data: T) => void) => void
  /** 取消监听 */
  off: (event: string, callback?: (data: unknown) => void) => void
  /** 触发事件 */
  emit: <T = unknown>(event: string, data?: T) => void
  /** 监听一次 */
  once: <T = unknown>(event: string, callback: (data: T) => void) => void
}

/**
 * 全局指令定义
 */
export interface PluginGlobalDirective {
  /** 指令名称 */
  name: string
  /** 指令实现 */
  directive: unknown
}

/**
 * 旧版插件上下文（兼容）
 * @deprecated 请使用 ClientPluginContext
 */
export interface PluginContext {
  siteConfig: SiteConfig
  pageData?: PageData
}

export interface ConfigEnv {
  mode: 'development' | 'production'
  command: 'serve' | 'build'
}

export interface HotUpdateContext {
  file: string
  timestamp: number
  modules: unknown[]
}

// ============== Markdown 类型 ==============

export interface MarkdownOptions {
  // 基础配置
  lineNumbers?: boolean
  preWrapper?: boolean

  // 代码高亮
  theme?: string | { light: string; dark: string }
  languages?: string[]

  // 扩展
  anchor?: AnchorOptions
  toc?: TocOptions
  container?: ContainerOptions

  // 自定义扩展
  config?: (md: MarkdownRenderer) => void

  // 代码块配置
  codeTransformers?: CodeTransformer[]

  // 组件演示配置
  demo?: DemoOptions
}

export interface AnchorOptions {
  permalink?: boolean
  permalinkBefore?: boolean
  permalinkSymbol?: string
}

export interface TocOptions {
  includeLevel?: number[]
  containerClass?: string
}

export interface ContainerOptions {
  tipLabel?: string
  warningLabel?: string
  dangerLabel?: string
  infoLabel?: string
  detailsLabel?: string
}

export interface CodeTransformer {
  name: string
  preprocess?: (code: string, options: unknown) => string
  postprocess?: (code: string, options: unknown) => string
}

export interface DemoOptions {
  // Vue 组件演示
  vue?: boolean
  // React 组件演示
  react?: boolean
  // 自定义演示容器
  customContainers?: DemoContainer[]
}

export interface DemoContainer {
  name: string
  render: (code: string, lang: string) => string
}

export interface MarkdownRenderer {
  render: (src: string, env?: Record<string, unknown>) => string
  use: (plugin: unknown, ...options: unknown[]) => MarkdownRenderer
  // markdown-it 实例方法
  [key: string]: unknown
}

// ============== 构建配置 ==============

export interface BuildConfig {
  // 输出目录
  outDir?: string

  // 资源目录
  assetsDir?: string

  // 是否压缩
  minify?: boolean | 'terser' | 'esbuild'

  // Source Map
  sourcemap?: boolean

  // SSR 配置
  ssr?: boolean

  // 目标浏览器
  target?: string | string[]

  // 分块策略
  chunkSizeWarningLimit?: number

  // MPA 模式
  mpa?: boolean
}

// ============== 认证系统类型 ==============

export interface AuthConfig {
  // 是否启用认证
  enabled?: boolean

  // 认证提供者
  provider?: AuthProvider

  // 保护的路由
  protectedRoutes?: string[]

  // 登录页面
  loginPage?: string

  // 认证后重定向
  redirectAfterLogin?: string

  // 自定义认证逻辑
  customAuth?: CustomAuthHandler
}

export interface AuthProvider {
  name: string
  login: (credentials: AuthCredentials) => Promise<AuthResult>
  logout: () => Promise<void>
  getUser: () => Promise<AuthUser | null>
  isAuthenticated: () => Promise<boolean>
}

export interface AuthCredentials {
  username?: string
  password?: string
  token?: string
  [key: string]: unknown
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  token?: string
  error?: string
}

export interface AuthUser {
  id: string
  name: string
  email?: string
  avatar?: string
  roles?: string[]
  [key: string]: unknown
}

export type CustomAuthHandler = (ctx: AuthContext) => Promise<boolean>

export interface AuthContext {
  route: string
  user: AuthUser | null
  credentials?: AuthCredentials
}

// ============== 路由类型 ==============

export interface Route {
  path: string
  component: string
  meta?: RouteMeta
  children?: Route[]
}

export interface RouteMeta {
  frontmatter?: Record<string, unknown>
  headers?: Header[]
  title?: string
  [key: string]: unknown
}

// ============== 转换上下文 ==============

export interface TransformContext {
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}

// ============== 工具类型 ==============

export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

export type Awaitable<T> = T | Promise<T>

export type MaybeRef<T> = T | { value: T }
