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

    // 注入评论样式 - 完全自定义 UI
    headStyles: [
      `
      /* ============== 评论容器 ============== */
      .ldoc-comment {
        margin-top: 48px;
        padding-top: 32px;
        border-top: 1px solid var(--ldoc-c-divider, #e5e7eb);
      }
      .ldoc-comment__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .ldoc-comment__title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--ldoc-c-text-1, #1f2937);
      }
      .ldoc-comment__title svg {
        color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment__count {
        font-size: 14px;
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment__divider {
        height: 1px;
        background: var(--ldoc-c-divider, #e5e7eb);
        margin: 32px 0;
      }
      
      /* ============== 评论编辑器 ============== */
      .ldoc-comment-editor {
        background: var(--ldoc-c-bg-soft, #f9fafb);
        border-radius: 12px;
        padding: 20px;
      }
      .ldoc-comment-editor__reply-hint {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        margin-bottom: 16px;
        background: var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1));
        border-radius: 8px;
        font-size: 14px;
        color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment-editor__cancel-reply {
        padding: 4px 12px;
        background: transparent;
        border: 1px solid var(--ldoc-c-brand, #3b82f6);
        border-radius: 4px;
        color: var(--ldoc-c-brand, #3b82f6);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ldoc-comment-editor__cancel-reply:hover {
        background: var(--ldoc-c-brand, #3b82f6);
        color: white;
      }
      .ldoc-comment-editor__user {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 12px;
      }
      .ldoc-comment-editor__input {
        padding: 12px 16px;
        border: 1px solid var(--ldoc-c-divider, #e5e7eb);
        border-radius: 8px;
        background: var(--ldoc-c-bg, #ffffff);
        font-size: 14px;
        font-family: inherit;
        color: var(--ldoc-c-text-1, #1f2937);
        transition: border-color 0.2s;
      }
      .ldoc-comment-editor__input:focus {
        outline: none;
        border-color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment-editor__input::placeholder {
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment-editor__textarea {
        width: 100%;
        min-height: 120px;
        padding: 16px;
        border: 1px solid var(--ldoc-c-divider, #e5e7eb);
        border-radius: 8px;
        background: var(--ldoc-c-bg, #ffffff);
        font-size: 14px;
        font-family: inherit;
        color: var(--ldoc-c-text-1, #1f2937);
        line-height: 1.6;
        resize: vertical;
        transition: border-color 0.2s;
      }
      .ldoc-comment-editor__textarea:focus {
        outline: none;
        border-color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment-editor__textarea::placeholder {
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment-editor__error {
        margin-top: 8px;
        padding: 10px 14px;
        background: #fef2f2;
        border-radius: 6px;
        font-size: 14px;
        color: #dc2626;
      }
      .ldoc-comment-editor__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
      }
      .ldoc-comment-editor__tip {
        font-size: 12px;
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment-editor__submit {
        padding: 10px 24px;
        background: var(--ldoc-c-brand, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ldoc-comment-editor__submit:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      .ldoc-comment-editor__submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      /* ============== 评论列表 ============== */
      .ldoc-comment__list {
        display: flex;
        flex-direction: column;
      }
      
      /* ============== 评论项 ============== */
      .ldoc-comment-item {
        display: flex;
        gap: 16px;
        padding: 20px 0;
        border-bottom: 1px solid var(--ldoc-c-divider, #e5e7eb);
      }
      .ldoc-comment-item:last-child {
        border-bottom: none;
      }
      .ldoc-comment-item__avatar {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
      }
      .ldoc-comment-item__avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--ldoc-c-bg-soft, #f3f4f6);
      }
      .ldoc-comment-item__main {
        flex: 1;
        min-width: 0;
      }
      .ldoc-comment-item__header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }
      .ldoc-comment-item__nick {
        font-weight: 600;
        font-size: 14px;
        color: var(--ldoc-c-text-1, #1f2937);
      }
      .ldoc-comment-item__badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }
      .ldoc-comment-item__badge--pinned {
        background: var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1));
        color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment-item__time {
        font-size: 12px;
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      .ldoc-comment-item__content {
        font-size: 14px;
        line-height: 1.7;
        color: var(--ldoc-c-text-2, #4b5563);
        word-break: break-word;
      }
      .ldoc-comment-item__content p {
        margin: 0 0 8px;
      }
      .ldoc-comment-item__content p:last-child {
        margin-bottom: 0;
      }
      .ldoc-comment-item__content code {
        padding: 2px 6px;
        background: var(--ldoc-c-bg-soft, #f3f4f6);
        border-radius: 4px;
        font-size: 13px;
      }
      .ldoc-comment-item__actions {
        margin-top: 12px;
      }
      .ldoc-comment-item__action {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: transparent;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        color: var(--ldoc-c-text-3, #9ca3af);
        cursor: pointer;
        transition: all 0.2s;
      }
      .ldoc-comment-item__action:hover {
        background: var(--ldoc-c-bg-soft, #f3f4f6);
        color: var(--ldoc-c-brand, #3b82f6);
      }
      .ldoc-comment-item__children {
        margin-top: 16px;
        padding-left: 20px;
        border-left: 2px solid var(--ldoc-c-divider, #e5e7eb);
      }
      
      /* ============== 状态组件 ============== */
      .ldoc-comment__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px;
        color: var(--ldoc-c-text-3, #9ca3af);
        font-size: 14px;
      }
      .ldoc-comment__spinner {
        width: 20px;
        height: 20px;
        border: 2px solid var(--ldoc-c-divider, #e5e7eb);
        border-top-color: var(--ldoc-c-brand, #3b82f6);
        border-radius: 50%;
        animation: ldoc-comment-spin 0.8s linear infinite;
      }
      @keyframes ldoc-comment-spin {
        to { transform: rotate(360deg); }
      }
      .ldoc-comment__error-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 12px;
        text-align: center;
      }
      .ldoc-comment__error-icon {
        font-size: 32px;
        margin-bottom: 12px;
      }
      .ldoc-comment__error-text {
        font-size: 14px;
        color: #dc2626;
        margin-bottom: 16px;
      }
      .ldoc-comment__retry {
        padding: 8px 20px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .ldoc-comment__retry:hover {
        background: #b91c1c;
      }
      .ldoc-comment__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        text-align: center;
      }
      .ldoc-comment__empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      .ldoc-comment__empty-text {
        font-size: 14px;
        color: var(--ldoc-c-text-3, #9ca3af);
      }
      
      /* ============== 深色模式 ============== */
      .dark .ldoc-comment__title {
        color: var(--ldoc-c-text-1, #f9fafb);
      }
      .dark .ldoc-comment-editor {
        background: var(--ldoc-c-bg-soft, #242424);
      }
      .dark .ldoc-comment-editor__input,
      .dark .ldoc-comment-editor__textarea {
        background: var(--ldoc-c-bg, #1a1a1a);
        border-color: var(--ldoc-c-divider, #374151);
        color: var(--ldoc-c-text-1, #f9fafb);
      }
      .dark .ldoc-comment-editor__error {
        background: rgba(220, 38, 38, 0.1);
        color: #fca5a5;
      }
      .dark .ldoc-comment-item__avatar img {
        border-color: var(--ldoc-c-bg-soft, #374151);
      }
      .dark .ldoc-comment-item__nick {
        color: var(--ldoc-c-text-1, #f9fafb);
      }
      .dark .ldoc-comment-item__content {
        color: var(--ldoc-c-text-2, #d1d5db);
      }
      .dark .ldoc-comment-item__content code {
        background: var(--ldoc-c-bg-soft, #374151);
      }
      .dark .ldoc-comment-item__action:hover {
        background: var(--ldoc-c-bg-soft, #374151);
      }
      .dark .ldoc-comment__error-box {
        background: rgba(220, 38, 38, 0.1);
        border-color: rgba(220, 38, 38, 0.3);
      }
      .dark .ldoc-comment__error-text {
        color: #fca5a5;
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
