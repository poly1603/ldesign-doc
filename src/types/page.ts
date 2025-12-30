/**
 * @ldesign/doc - 页面数据类型定义
 * 
 * 定义页面、头部、路由等相关类型
 */

/**
 * 页面数据
 * 包含页面的所有元数据和内容信息
 * 
 * @example
 * ```ts
 * const pageData: PageData = {
 *   title: '快速开始',
 *   description: '5分钟上手 LDoc',
 *   frontmatter: { layout: 'doc' },
 *   headers: [{ level: 2, title: '安装', slug: 'install' }],
 *   relativePath: 'guide/getting-started.md',
 *   filePath: '/docs/guide/getting-started.md'
 * }
 * ```
 */
export interface PageData {
  /** 页面标题 */
  title: string
  /** 页面描述 */
  description: string
  /** Frontmatter 元数据 */
  frontmatter: Record<string, unknown>
  /** 页面标题层级结构 */
  headers: Header[]
  /** 相对路径（相对于 srcDir） */
  relativePath: string
  /** 文件绝对路径 */
  filePath: string
  /** 最后更新时间戳 */
  lastUpdated?: number
  /** Markdown 原始内容（用于健康检查和其他插件） */
  content?: string
}

/**
 * 标题信息
 * 用于生成目录和锚点导航
 * 
 * @example
 * ```ts
 * const header: Header = {
 *   level: 2,
 *   title: '安装指南',
 *   slug: 'installation-guide',
 *   children: [
 *     { level: 3, title: 'npm 安装', slug: 'npm-install' }
 *   ]
 * }
 * ```
 */
export interface Header {
  /** 标题层级（1-6） */
  level: number
  /** 标题文本 */
  title: string
  /** URL slug（用于锚点链接） */
  slug: string
  /** 子标题 */
  children?: Header[]
}

/**
 * 站点数据
 * 全局站点配置信息，客户端可访问
 */
export interface SiteData {
  /** 站点基础路径 */
  base: string
  /** 站点标题 */
  title: string
  /** 站点描述 */
  description: string
  /** 默认语言 */
  lang: string
  /** 多语言配置 */
  locales: Record<string, LocaleConfig>
  /** 主题配置 */
  themeConfig: ThemeConfig
  /** HTML head 标签 */
  head: HeadConfig[]
}

/**
 * Head 配置
 * 用于在 HTML head 中注入标签
 * 
 * @example
 * ```ts
 * // 简单标签
 * const meta: HeadConfig = ['meta', { name: 'author', content: 'LDesign' }]
 * 
 * // 带内容的标签
 * const script: HeadConfig = ['script', { type: 'text/javascript' }, 'console.log("hello")']
 * ```
 */
export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

/**
 * 路由定义
 */
export interface Route {
  /** 路由路径 */
  path: string
  /** 组件路径或组件 */
  component: string
  /** 路由元数据 */
  meta?: RouteMeta
  /** 子路由 */
  children?: Route[]
}

/**
 * 路由元数据
 */
export interface RouteMeta {
  /** Frontmatter 数据 */
  frontmatter?: Record<string, unknown>
  /** 页面标题列表 */
  headers?: Header[]
  /** 页面标题 */
  title?: string
  /** 自定义元数据 */
  [key: string]: unknown
}

// 导入需要的类型（避免循环依赖）
import type { LocaleConfig, ThemeConfig } from './theme'
