/**
 * @ldesign/doc - 插件系统类型定义
 * 
 * 定义插件、钩子、Slot 等相关类型
 */

import type { Plugin as VitePlugin } from 'vite'
import type { PageData, Route, Header, HeadConfig, SiteData } from './page'
import type { ThemeConfig } from './theme'
import type { MarkdownRenderer, MarkdownOptions } from './markdown'
import type { SiteConfig, UserConfig, ConfigEnv, TransformContext } from './config'

// ============== 插件 Slot 类型 ==============

/**
 * 插件 Slot 位置
 * 插件可以将 UI 组件注入到这些预定义位置
 * 
 * @example
 * ```ts
 * const plugin: LDocPlugin = {
 *   name: 'my-plugin',
 *   slots: {
 *     'nav-bar-content-after': {
 *       component: MyComponent,
 *       order: 10
 *     }
 *   }
 * }
 * ```
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

/**
 * 插件全局指令
 */
export interface PluginGlobalDirective {
  /** 指令名称 */
  name: string
  /** 指令实现 */
  directive: unknown
}

// ============== 插件依赖 ==============

/**
 * 插件依赖声明
 * 
 * @example
 * ```ts
 * const plugin: LDocPlugin = {
 *   name: 'my-plugin',
 *   dependencies: [
 *     { name: 'ldoc:search', version: '^1.0.0' },
 *     { name: 'ldoc:analytics', optional: true }
 *   ]
 * }
 * ```
 */
export interface PluginDependency {
  /** 依赖的插件名称 */
  name: string
  /** 版本约束（可选），支持 semver 格式 */
  version?: string
  /** 是否为可选依赖 */
  optional?: boolean
}

/**
 * 插件冲突信息
 */
export interface PluginConflict {
  /** 冲突的插件名称 */
  plugins: string[]
  /** 冲突类型 */
  type: 'slot' | 'hook' | 'name'
  /** 冲突位置 */
  location: string
  /** 解决建议 */
  suggestions: string[]
}

/**
 * 插件验证错误
 */
export interface PluginValidationError {
  /** 插件名称 */
  pluginName: string
  /** 错误字段 */
  field: string
  /** 错误消息 */
  message: string
  /** 期望值 */
  expected?: string
  /** 实际值 */
  actual?: string
}

// ============== 插件元数据 ==============

/**
 * 插件元数据
 * 用于描述插件的基本信息
 */
export interface PluginMeta {
  /** 插件描述 */
  description?: string
  /** 作者 */
  author?: string
  /** 主页 */
  homepage?: string
  /** 仓库地址 */
  repository?: string
  /** 关键词 */
  keywords?: string[]
  /** 更新日志 */
  changelog?: string
  /** 许可证 */
  license?: string
}

// ============== 插件上下文类型 ==============

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
 * 热更新上下文
 */
export interface HotUpdateContext {
  /** 变更的文件路径 */
  file: string
  /** 时间戳 */
  timestamp: number
  /** 受影响的模块 */
  modules: unknown[]
}

// ============== 客户端插件上下文 ==============

/**
 * 客户端插件上下文
 * 在客户端钩子中可用
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
  /** 类型 */
  type?: 'success' | 'error' | 'warning' | 'info'
  /** 持续时间（毫秒） */
  duration?: number
  /** 位置 */
  position?: 'top' | 'bottom' | 'center'
}

/**
 * 模态框选项
 */
export interface ModalOptions {
  /** 标题 */
  title?: string
  /** 内容 */
  content: string | unknown
  /** 确认按钮文本 */
  confirmText?: string
  /** 取消按钮文本 */
  cancelText?: string
  /** 是否显示取消按钮 */
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

// ============== 插件定义 ==============

/**
 * LDoc 插件定义
 * 
 * @example
 * ```ts
 * import { definePlugin } from '@ldesign/doc'
 * 
 * export default definePlugin({
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   
 *   // 插件元数据
 *   meta: {
 *     description: '我的自定义插件',
 *     author: 'Your Name'
 *   },
 *   
 *   // 配置钩子
 *   config(config, env) {
 *     return { ...config, title: 'Modified' }
 *   },
 *   
 *   // 扩展 Markdown
 *   extendMarkdown(md) {
 *     md.use(myMarkdownPlugin)
 *   },
 *   
 *   // 注入 UI 组件
 *   slots: {
 *     'nav-bar-content-after': {
 *       component: MyComponent
 *     }
 *   }
 * })
 * ```
 */
export interface LDocPlugin {
  /** 插件名称，必须唯一 */
  name: string

  /** 插件版本 */
  version?: string

  /** 插件元数据 */
  meta?: PluginMeta

  /** 插件执行顺序，数字越小越先执行，默认 100 */
  enforce?: 'pre' | 'post' | number

  /** 插件依赖声明 */
  dependencies?: PluginDependency[]

  /** 插件扩展配置（用于插件组合） */
  extends?: string

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
 * 旧版插件上下文（兼容）
 * @deprecated 请使用 ClientPluginContext
 */
export interface PluginContext {
  siteConfig: SiteConfig
  pageData?: PageData
}
