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
    title = '💬 评论'
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

    // 注入评论样式
    headStyles: [
      `
      .ldoc-comment {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid var(--ldoc-c-divider, #e5e7eb);
      }
      .ldoc-comment__title {
        margin-bottom: 24px;
        font-size: 20px;
        font-weight: 600;
        color: var(--ldoc-c-text-1, #1f2937);
      }
      .ldoc-comment__container {
        min-height: 200px;
      }
      /* Artalk 样式覆盖修复 */
      .artalk {
        --at-color-bg: var(--ldoc-c-bg, #ffffff) !important;
        --at-color-font: var(--ldoc-c-text-1, #1f2937) !important;
        --at-color-meta: var(--ldoc-c-text-2, #4b5563) !important;
        --at-color-border: var(--ldoc-c-divider, #e5e7eb) !important;
        --at-color-main: var(--ldoc-c-brand, #3b82f6) !important;
        background: transparent !important;
      }
      .dark .artalk {
        --at-color-bg: var(--ldoc-c-bg, #1f2937) !important;
        --at-color-font: var(--ldoc-c-text-1, #f9fafb) !important;
        --at-color-meta: var(--ldoc-c-text-2, #9ca3af) !important;
        --at-color-border: var(--ldoc-c-divider, #374151) !important;
      }
      /* 强制修复黑色背景问题 */
      .atk-layer-wrap {
         background: transparent !important;
      }
      .atk-main-editor {
         background: var(--ldoc-c-bg, #ffffff) !important;
      }
      .dark .atk-main-editor {
         background: var(--ldoc-c-bg, #1f2937) !important;
      }
      
      .ldoc-comment__error {
        padding: 16px;
        color: var(--ldoc-c-red-1, #ef4444);
        background: var(--ldoc-c-red-soft, #fef2f2);
        border-radius: 8px;
      }
      .dark .ldoc-comment__title {
        color: var(--ldoc-c-text-1, #f9fafb);
      }
      /* Demo mode styles */
      .ldoc-comment--demo {
        background: var(--ldoc-c-bg-soft, #f9fafb);
        border-radius: 12px;
        padding: 24px;
      }
      .ldoc-comment__demo-notice {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--ldoc-c-yellow-soft, #fef3c7);
        border-radius: 8px;
        font-size: 14px;
        color: var(--ldoc-c-yellow-dark, #92400e);
      }
      .ldoc-comment__demo-badge {
        padding: 2px 8px;
        background: var(--ldoc-c-yellow, #f59e0b);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
      }
      .ldoc-comment__input-area {
        margin-bottom: 24px;
      }
      .ldoc-comment__input {
        width: 100%;
        min-height: 100px;
        padding: 12px 16px;
        border: 1px solid var(--ldoc-c-divider, #e5e7eb);
        border-radius: 8px;
        background: var(--ldoc-c-bg, white);
        font-size: 14px;
        resize: vertical;
        font-family: inherit;
      }
      .ldoc-comment__input:focus {
        outline: none;
        border-color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment__input-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 12px;
      }
      .ldoc-comment__submit {
        padding: 8px 20px;
        background: var(--ldoc-c-brand, #3b82f6);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        opacity: 0.6;
      }
      .ldoc-comment__list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .ldoc-comment__item {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: var(--ldoc-c-bg, white);
        border-radius: 8px;
        border: 1px solid var(--ldoc-c-divider, #e5e7eb);
      }
      .ldoc-comment__avatar {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ldoc-c-bg-soft, #f3f4f6);
        border-radius: 50%;
        font-size: 20px;
      }
      .ldoc-comment__body {
        flex: 1;
      }
      .ldoc-comment__meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .ldoc-comment__author {
        font-weight: 600;
        color: var(--ldoc-c-text-1, #1f2937);
      }
      .ldoc-comment__time {
        font-size: 12px;
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment__content {
        font-size: 14px;
        color: var(--ldoc-c-text-2, #4b5563);
        line-height: 1.6;
      }
      .dark .ldoc-comment--demo {
        background: var(--ldoc-c-bg-soft, #1f2937);
      }
      .dark .ldoc-comment__demo-notice {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
      }
      .dark .ldoc-comment__input {
        background: var(--ldoc-c-bg, #111827);
        border-color: var(--ldoc-c-divider, #374151);
        color: var(--ldoc-c-text-1, #f9fafb);
      }
      .dark .ldoc-comment__item {
        background: var(--ldoc-c-bg, #111827);
        border-color: var(--ldoc-c-divider, #374151);
      }
      `
    ]
  })
}

export default commentPlugin
