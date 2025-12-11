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

export interface LDocPlugin {
  name: string

  // 配置钩子
  config?: (config: UserConfig, env: ConfigEnv) => UserConfig | null | void | Promise<UserConfig | null | void>
  configResolved?: (config: SiteConfig) => void | Promise<void>

  // Vite 插件扩展
  vitePlugins?: () => VitePlugin[] | Promise<VitePlugin[]>

  // Markdown 扩展
  extendMarkdown?: (md: MarkdownRenderer) => void

  // 页面数据扩展
  extendPageData?: (pageData: PageData) => void | Promise<void>

  // 路由扩展
  extendRoutes?: (routes: Route[]) => Route[] | void

  // 构建钩子
  buildStart?: (config: SiteConfig) => void | Promise<void>
  buildEnd?: (config: SiteConfig) => void | Promise<void>

  // 生成钩子
  generateBundle?: (config: SiteConfig) => void | Promise<void>

  // 客户端代码注入
  clientConfigFile?: string

  // 热更新
  handleHotUpdate?: (ctx: HotUpdateContext) => void | Promise<void>
}

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
