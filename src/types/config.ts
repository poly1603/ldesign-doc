/**
 * @ldesign/doc - 配置系统类型定义
 * 
 * 定义用户配置、站点配置、构建配置等相关类型
 */

import type { UserConfig as ViteUserConfig } from 'vite'
import type { PageData, HeadConfig, SiteData } from './page'
import type { Theme, ThemeConfig, LocaleConfig } from './theme'
import type { LDocPlugin } from './plugin'
import type { MarkdownOptions } from './markdown'
import type { AuthConfig } from './auth'

// ============== 框架类型 ==============

/**
 * 支持的框架类型
 */
export type Framework = 'vue' | 'react' | 'auto'

// ============== 额外文档源 ==============

/**
 * 额外文档源配置
 * 用于从多个目录加载文档
 * 
 * @example
 * ```ts
 * const extraDocs: ExtraDocsSource[] = [
 *   {
 *     dir: 'src/components',
 *     prefix: '/components',
 *     pattern: '**\/*.md'
 *   }
 * ]
 * ```
 */
export interface ExtraDocsSource {
  /** 目录路径（相对于项目根目录） */
  dir: string
  /** URL 前缀，如 '/components' */
  prefix?: string
  /** 文件匹配模式，默认 '**\/*.md' */
  pattern?: string
}

// ============== 用户配置 ==============

/**
 * 用户配置
 * 在 doc.config.ts 中使用
 * 
 * @example
 * ```ts
 * import { defineConfig } from '@ldesign/doc'
 * 
 * export default defineConfig({
 *   title: '我的文档站',
 *   description: '这是一个使用 LDoc 构建的文档站点',
 *   
 *   themeConfig: {
 *     nav: [
 *       { text: '指南', link: '/guide/' },
 *       { text: 'API', link: '/api/' }
 *     ],
 *     sidebar: {
 *       '/guide/': [
 *         { text: '开始', items: [...] }
 *       ]
 *     }
 *   },
 *   
 *   plugins: [
 *     searchPlugin(),
 *     commentPlugin({ provider: 'giscus' })
 *   ]
 * })
 * ```
 */
export interface UserConfig {
  // ========== 基础配置 ==========
  
  /** 
   * 文档源目录
   * @default 'docs'
   */
  srcDir?: string
  
  /** 额外的文档源目录 */
  extraDocs?: ExtraDocsSource[]
  
  /** 
   * 输出目录
   * @default '.ldesign/.doc-cache/dist'
   */
  outDir?: string
  
  /** 
   * 站点基础路径
   * @default '/'
   */
  base?: string
  
  /** 站点标题 */
  title?: string
  
  /** 站点描述 */
  description?: string
  
  /** 
   * 默认语言
   * @default 'zh-CN'
   */
  lang?: string
  
  /** HTML head 标签 */
  head?: HeadConfig[]

  // ========== 框架配置 ==========
  
  /** 
   * 组件框架
   * @default 'auto'
   */
  framework?: Framework

  // ========== 主题配置 ==========
  
  /** 主题（包名、路径或 Theme 对象） */
  theme?: string | Theme | ThemeConfig
  
  /**
   * 默认/根语言的主题配置
   * 包含 nav、sidebar、footer 等配置
   */
  themeConfig?: ThemeConfig

  /**
   * 多语言配置
   * key 为语言标识（如 'en'、'zh'）
   */
  locales?: Record<string, LocaleConfig>

  // ========== Markdown 配置 ==========
  
  /** Markdown 渲染配置 */
  markdown?: MarkdownOptions

  // ========== Vite 配置 ==========
  
  /** Vite 配置 */
  vite?: ViteUserConfig

  // ========== 插件系统 ==========
  
  /** 插件列表 */
  plugins?: LDocPlugin[]

  // ========== 构建配置 ==========
  
  /** 构建配置 */
  build?: BuildConfig

  // ========== 认证配置 ==========
  
  /** 认证配置 */
  auth?: AuthConfig

  // ========== 部署配置 ==========
  
  /** 部署配置 */
  deploy?: DeployConfig

  // ========== 扩展钩子 ==========
  
  /** 转换 head 标签 */
  transformHead?: (ctx: TransformContext) => Promise<HeadConfig[]> | HeadConfig[]
  
  /** 转换 HTML */
  transformHtml?: (code: string, id: string, ctx: TransformContext) => Promise<string> | string
  
  /** 转换页面数据 */
  transformPageData?: (pageData: PageData, ctx: TransformContext) => Promise<Partial<PageData> | void> | Partial<PageData> | void
  
  /** 构建完成后调用 */
  buildEnd?: (siteConfig: SiteConfig) => Promise<void> | void
}

// ============== 站点配置（内部） ==============

/**
 * 站点配置
 * UserConfig 解析后的完整配置
 */
export interface SiteConfig extends Required<Omit<UserConfig, 'theme' | 'plugins' | 'deploy' | 'transformHead' | 'transformHtml' | 'transformPageData' | 'buildEnd'>> {
  /** 项目根目录 */
  root: string
  /** 配置文件路径 */
  configPath: string | undefined
  /** 配置文件依赖 */
  configDeps: string[]
  /** 主题目录 */
  themeDir: string
  /** 临时文件目录 */
  tempDir: string
  /** 缓存目录 */
  cacheDir: string
  /** 用户插件列表 */
  userPlugins: LDocPlugin[]

  /** 主题 npm 包名（如果从 npm 包解析） */
  themePkg?: string
  /** 解析后的主题对象 */
  theme?: Theme
  /** 部署配置 */
  deploy?: DeployConfig

  /** 图片优化配置（由性能插件使用） */
  imageOptimization?: {
    lazyLoadImages?: string[]
    [key: string]: unknown
  }

  // 可选的扩展钩子
  transformHead?: (ctx: TransformContext) => Promise<HeadConfig[]> | HeadConfig[]
  transformHtml?: (code: string, id: string, ctx: TransformContext) => Promise<string> | string
  transformPageData?: (pageData: PageData, ctx: TransformContext) => Promise<Partial<PageData> | void> | Partial<PageData> | void
  buildEnd?: (siteConfig: SiteConfig) => Promise<void> | void
}

// ============== 构建配置 ==============

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 输出目录 */
  outDir?: string
  /** 资源目录 */
  assetsDir?: string
  /** 是否压缩 */
  minify?: boolean | 'terser' | 'esbuild'
  /** Source Map */
  sourcemap?: boolean
  /** SSR 配置 */
  ssr?: boolean
  /** 目标浏览器 */
  target?: string | string[]
  /** 分块警告限制 */
  chunkSizeWarningLimit?: number
  /** MPA 模式 */
  mpa?: boolean
  /** 构建钩子 */
  hooks?: BuildHooks
  /** 缓存配置 */
  cache?: BuildCacheConfig
}

/**
 * 构建缓存配置
 */
export interface BuildCacheConfig {
  /**
   * 是否启用缓存
   * @default true
   */
  enabled?: boolean
  /**
   * 缓存目录
   * @default '.ldoc-cache'
   */
  cacheDir?: string
  /**
   * 缓存过期时间（毫秒）
   * @default 604800000 (7天)
   */
  maxAge?: number
  /**
   * 是否在构建完成后打印缓存统计
   * @default true
   */
  printStats?: boolean
}

/**
 * 构建钩子配置
 */
export interface BuildHooks {
  /**
   * 构建开始前执行
   * 可用于准备构建环境、清理旧文件等
   */
  preBuild?: BuildHookFunction | BuildHookFunction[]

  /**
   * 构建完成后执行
   * 可用于后处理、文件复制、通知等
   */
  postBuild?: BuildHookFunction | BuildHookFunction[]
}

/**
 * 构建钩子函数
 */
export type BuildHookFunction = (config: SiteConfig) => void | Promise<void>

// ============== 部署配置 ==============

/**
 * 支持的部署平台
 */
export type DeployPlatform = 'netlify' | 'vercel' | 'github-pages' | 'cloudflare' | 'surge'

/**
 * 部署配置
 */
export interface DeployConfig {
  /** 部署平台 */
  platform: DeployPlatform

  /** 构建输出目录 */
  outDir?: string

  /** Netlify 配置 */
  netlify?: {
    siteId?: string
    token?: string
    prod?: boolean
  }

  /** Vercel 配置 */
  vercel?: {
    projectName?: string
    orgId?: string
    token?: string
    prod?: boolean
  }

  /** GitHub Pages 配置 */
  githubPages?: {
    repo?: string
    branch?: string
    cname?: string
  }

  /** Cloudflare Pages 配置 */
  cloudflare?: {
    projectName?: string
    accountId?: string
    apiToken?: string
  }

  /** Surge 配置 */
  surge?: {
    domain: string
    token?: string
  }
}

// ============== 转换上下文 ==============

/**
 * 转换上下文
 * 在 transformHead、transformHtml 等钩子中可用
 */
export interface TransformContext {
  /** 站点配置 */
  siteConfig: SiteConfig
  /** 站点数据 */
  siteData: SiteData
  /** 页面数据 */
  pageData: PageData
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description: string
  /** head 标签 */
  head: HeadConfig[]
  /** 页面内容 */
  content: string
}

// ============== 配置环境 ==============

/**
 * 配置环境
 */
export interface ConfigEnv {
  /** 模式 */
  mode: 'development' | 'production'
  /** 命令 */
  command: 'serve' | 'build'
}
