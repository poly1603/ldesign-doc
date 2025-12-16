/**
 * 评论系统插件 - 支持多种评论服务
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'

export type CommentProvider = 'giscus' | 'gitalk' | 'waline' | 'twikoo' | 'artalk' | 'custom'

export interface CommentPluginOptions {
  /** 评论服务提供者 */
  provider: CommentProvider

  /** Giscus 配置 */
  giscus?: GiscusOptions

  /** Gitalk 配置 */
  gitalk?: GitalkOptions

  /** Waline 配置 */
  waline?: WalineOptions

  /** Twikoo 配置 */
  twikoo?: TwikooOptions

  /** Artalk 配置 */
  artalk?: ArtalkOptions

  /** 自定义评论组件 */
  customComponent?: unknown

  /** 评论显示位置 */
  position?: 'doc-after' | 'doc-footer-before' | 'doc-footer-after'

  /** 排除的页面路径 */
  exclude?: string[]

  /** 仅在这些页面显示 */
  include?: string[]

  /** 是否在首页显示 */
  showOnHome?: boolean

  /** 评论区标题 */
  title?: string
}

export interface GiscusOptions {
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
  strict?: boolean
  reactionsEnabled?: boolean
  emitMetadata?: boolean
  inputPosition?: 'top' | 'bottom'
  theme?: string
  lang?: string
}

export interface GitalkOptions {
  clientID: string
  clientSecret: string
  repo: string
  owner: string
  admin: string[]
  id?: string
  labels?: string[]
  title?: string
  body?: string
  language?: string
  perPage?: number
  distractionFreeMode?: boolean
}

export interface WalineOptions {
  serverURL: string
  path?: string
  lang?: string
  locale?: Record<string, string>
  emoji?: string[] | false
  dark?: string
  meta?: string[]
  requiredMeta?: string[]
  login?: 'enable' | 'disable' | 'force'
  wordLimit?: number | [number, number]
  pageSize?: number
  imageUploader?: boolean | ((image: File) => Promise<string>)
  highlighter?: boolean | ((code: string, lang: string) => string)
}

export interface TwikooOptions {
  envId: string
  region?: string
  path?: string
  lang?: string
}

export interface ArtalkOptions {
  server: string
  site: string
  pageKey?: string
  pageTitle?: string
  darkMode?: boolean | 'auto'
  editorTravel?: boolean
  locale?: string
}

/**
 * 序列化配置选项（过滤掉不可序列化的属性）
 */
function serializeOptions(options: CommentPluginOptions): string {
  const safeOptions = { ...options }
  // 移除不可序列化的属性
  delete safeOptions.customComponent
  if (safeOptions.waline) {
    const waline = { ...safeOptions.waline }
    if (typeof waline.imageUploader === 'function') {
      delete waline.imageUploader
    }
    if (typeof waline.highlighter === 'function') {
      delete waline.highlighter
    }
    safeOptions.waline = waline
  }
  return JSON.stringify(safeOptions)
}

/**
 * 评论插件
 */
export function commentPlugin(options: CommentPluginOptions): LDocPlugin {
  const {
    position = 'doc-after',
    exclude = [],
    include,
    showOnHome = false,
    title = '评论'
  } = options

  // 序列化配置用于客户端
  const serializedOptions = serializeOptions({ ...options, title })

  return definePlugin({
    name: 'ldoc:comment',

    // 客户端配置 - 生成内联代码，导入客户端组件并传入配置
    clientConfigFile: `
import { createCommentSlots, globalComponents } from '@ldesign/doc/plugins/comment/client'

// 评论插件配置
const commentOptions = ${serializedOptions}

// 创建 slots 函数
const slots = createCommentSlots(commentOptions)

export { slots, globalComponents }
export default { slots, globalComponents }
`,

    // 注入评论样式 - 完全自定义 UI
    headStyles: []
  })
}

export default commentPlugin
