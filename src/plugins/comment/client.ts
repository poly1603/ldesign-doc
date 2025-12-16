/**
 * 评论插件客户端配置
 * 
 * 使用各评论系统的官方 SDK 实现
 */
import { defineComponent, h, ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { PluginSlots, PluginGlobalComponent } from '../../shared/types'

// ============== 样式注入 ==============

const COMMENT_STYLES = `
/* ==================== 评论系统 - 现代化设计 ==================== */

/* 评论容器 */
.ldoc-comment {
  margin-top: clamp(32px, 5vw, 64px);
  padding: 0;
}

/* 评论头部 */
.ldoc-comment__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: clamp(20px, 3vw, 32px);
}

.ldoc-comment__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 700;
  color: var(--ldoc-c-text-1, #1f2937);
  letter-spacing: -0.02em;
}

.ldoc-comment__title svg {
  color: var(--ldoc-c-brand, #3b82f6);
  flex-shrink: 0;
  width: clamp(20px, 3vw, 28px);
  height: clamp(20px, 3vw, 28px);
}

.ldoc-comment__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ldoc-comment__title-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.08));
  color: var(--ldoc-c-brand, #3b82f6);
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  margin-left: 8px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.ldoc-comment__subtitle {
  width: 100%;
  margin: 0;
  font-size: 14px;
  color: var(--ldoc-c-text-3, #94a3b8);
  line-height: 1.6;
}

.ldoc-comment__info-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--ldoc-c-text-3, #94a3b8);
}

.ldoc-comment__separator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ldoc-c-divider, #e5e7eb);
}

.ldoc-comment__help-link {
  font-weight: 600;
  color: var(--ldoc-c-brand, #2563eb);
  text-decoration: none;
}

/* 评论容器 */
.ldoc-comment__container {
  min-height: 120px;
  border-radius: 18px;
  background: var(--ldoc-c-bg-soft, #f7f8fa);
  border: 1px solid var(--ldoc-c-divider, #e5e7eb);
  padding: 20px;
}

/* ==================== Artalk 主题适配 ==================== */
.artalk {
  --at-color-main: var(--ldoc-c-brand) !important;
  --at-color-font: var(--ldoc-c-text-1) !important;
  --at-color-deep: var(--ldoc-c-text-2) !important;
  --at-color-sub: var(--ldoc-c-text-3) !important;
  --at-color-grey: var(--ldoc-c-text-3) !important;
  --at-color-meta: var(--ldoc-c-text-3) !important;
  --at-color-border: var(--ldoc-c-divider) !important;
  --at-color-bg: var(--ldoc-c-bg) !important;
  --at-color-bg-transl: rgba(255, 255, 255, 0) !important;
  --at-border-radius: 12px !important;
  --at-color-input-bg: var(--ldoc-c-bg) !important;
  --at-color-input-text: var(--ldoc-c-text-1) !important;
  font-family: inherit !important;
}

/* ==================== Artalk 深度样式覆盖 ==================== */

/* 1. 编辑器整体容器 */
.artalk .atk-editor {
  border: 1px solid var(--ldoc-c-divider, #e5e7eb) !important;
  border-radius: 12px !important;
  background: var(--ldoc-c-bg, #fff) !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden !important;
  padding: 0 !important; /* 清除默认 padding */
}

.artalk .atk-editor-plug-manager {
  border-top: 1px solid var(--ldoc-c-divider, #e5e7eb) !important;
  background: var(--ldoc-c-bg-soft, #f9fafb) !important;
}

/* 2. 输入框区域 */
.artalk .atk-textarea-wrap {
  padding: 16px !important;
  background: transparent !important;
}

.artalk textarea.atk-textarea {
  min-height: 120px !important;
  padding: 0 !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  color: var(--ldoc-c-text-1, #1f2937) !important;
  background: transparent !important;
  border: none !important;
  resize: vertical !important;
  box-shadow: none !important; /* 移除可能存在的内部阴影 */
  width: 100% !important;
}

.artalk textarea.atk-textarea::placeholder {
  color: var(--ldoc-c-text-3, #9ca3af) !important;
}

.artalk textarea.atk-textarea:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* 3. 底部操作栏（包含按钮） */
.artalk .atk-bottom {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 12px 16px !important;
  background: var(--ldoc-c-bg-soft, #f9fafb) !important;
  border-top: 1px solid var(--ldoc-c-divider, #e5e7eb) !important;
}

/* 4. 发送按钮 */
.artalk .atk-send-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 36px !important;
  padding: 0 24px !important;
  background: var(--ldoc-c-brand, #3b82f6) !important;
  color: #ffffff !important; /* 强制白色文字 */
  font-size: 14px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2) !important;
  min-width: 80px !important;
}

.artalk .atk-send-btn:hover {
  background: var(--ldoc-c-brand-dark, #2563eb) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
}

.artalk .atk-send-btn:active {
  transform: translateY(0) !important;
}

/* 5. 头部输入框（昵称/邮箱/网址） */
.artalk .atk-header {
  display: flex !important;
  gap: 12px !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid var(--ldoc-c-divider, #e5e7eb) !important;
  background: var(--ldoc-c-bg-soft, #f9fafb) !important;
}

.artalk .atk-header input {
  height: 32px !important;
  padding: 0 12px !important;
  border: 1px solid var(--ldoc-c-divider, #e5e7eb) !important;
  border-radius: 6px !important;
  background: var(--ldoc-c-bg, #fff) !important;
  font-size: 13px !important;
  color: var(--ldoc-c-text-1, #1f2937) !important;
  transition: border-color 0.2s !important;
  width: auto !important;
  flex: 1 !important;
}

.artalk .atk-header input:focus {
  border-color: var(--ldoc-c-brand, #3b82f6) !important;
  outline: none !important;
}

/* 6. 版权/徽章隐藏 (可选) */
.artalk .atk-copyright {
  display: none !important;
}

/* 7. 评论列表样式修复 */
.artalk .atk-list-comments-wrap {
  margin-top: 24px !important;
}

.artalk .atk-comment {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin-bottom: 24px !important;
}

.artalk .atk-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  margin-right: 16px !important;
}

.artalk .atk-avatar img {
  border-radius: 50% !important;
}

.artalk .atk-main {
  background: var(--ldoc-c-bg-soft, #f9fafb) !important;
  padding: 16px !important;
  border-radius: 12px !important;
  position: relative !important;
}

.artalk .atk-main::before {
  content: '' !important;
  position: absolute !important;
  left: -8px !important;
  top: 14px !important;
  width: 0 !important;
  height: 0 !important;
  border-top: 8px solid transparent !important;
  border-bottom: 8px solid transparent !important;
  border-right: 8px solid var(--ldoc-c-bg-soft, #f9fafb) !important;
}

/* ==================== 深色模式覆盖 ==================== */
.dark .artalk .atk-editor {
  background: var(--ldoc-c-bg, #1e293b) !important;
  border-color: var(--ldoc-c-divider, #334155) !important;
}

.dark .artalk .atk-header,
.dark .artalk .atk-bottom,
.dark .artalk .atk-editor-plug-manager {
  background: rgba(30, 41, 59, 0.5) !important;
  border-color: var(--ldoc-c-divider, #334155) !important;
}

.dark .artalk textarea.atk-textarea {
  color: var(--ldoc-c-text-1, #f1f5f9) !important;
}

.dark .artalk .atk-header input {
  background: var(--ldoc-c-bg, #0f172a) !important;
  border-color: var(--ldoc-c-divider, #334155) !important;
  color: var(--ldoc-c-text-1, #f1f5f9) !important;
}

.dark .artalk .atk-main {
  background: var(--ldoc-c-bg-soft, #1e293b) !important;
}

.dark .artalk .atk-main::before {
  border-right-color: var(--ldoc-c-bg-soft, #1e293b) !important;
}




/* ==================== Artalk 错误层美化 ==================== */
.artalk .atk-list-error,
.artalk .atk-error-layer {
  padding: 32px 24px !important;
  margin: 16px 0 !important;
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(248, 113, 113, 0.02)) !important;
  border: 1px solid rgba(248, 113, 113, 0.25) !important;
  border-radius: 16px !important;
  text-align: center !important;
}

.artalk .atk-list-error-title,
.artalk .atk-error-layer .atk-error-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #dc2626 !important;
  margin-bottom: 8px !important;
}

.artalk .atk-list-error-text,
.artalk .atk-error-layer .atk-error-text {
  font-size: 14px !important;
  color: #b91c1c !important;
  margin-bottom: 16px !important;
}

.artalk .atk-list-error-retry,
.artalk .atk-error-layer .atk-retry-btn,
.artalk .atk-error-layer button {
  padding: 10px 28px !important;
  background: #dc2626 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 999px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25) !important;
}

.artalk .atk-list-error-retry:hover,
.artalk .atk-error-layer .atk-retry-btn:hover,
.artalk .atk-error-layer button:hover {
  background: #b91c1c !important;
  transform: translateY(-1px) !important;
}

/* Artalk 加载状态 */
.artalk .atk-list-loading,
.artalk .atk-loading-layer {
  padding: 40px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 16px !important;
}

.artalk .atk-loading-icon {
  width: 32px !important;
  height: 32px !important;
  border: 3px solid rgba(59, 130, 246, 0.2) !important;
  border-top-color: var(--ldoc-c-brand, #3b82f6) !important;
  border-radius: 50% !important;
}

/* ==================== Giscus 主题适配 ==================== */
.giscus {
  width: 100%;
}

.giscus-frame {
  border-radius: 12px !important;
  border: none !important;
}

/* ==================== 状态反馈 ==================== */
.ldoc-comment__status-card {
  margin-top: clamp(20px, 3vw, 36px);
  padding: clamp(28px, 4vw, 48px) clamp(20px, 4vw, 56px);
  border-radius: 18px;
  border: 1px solid var(--ldoc-c-divider, rgba(148, 163, 184, 0.4));
  background: var(--ldoc-c-bg, #fff);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.ldoc-comment__status-card--loading {
  border-color: rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.02));
}

.ldoc-comment__status-card--error {
  border-color: rgba(248, 113, 113, 0.35);
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.08), rgba(248, 113, 113, 0.02));
}

.ldoc-comment__status-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: var(--ldoc-c-brand, #3b82f6);
  background: rgba(59, 130, 246, 0.12);
}

.ldoc-comment__status-card--error .ldoc-comment__status-icon {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.ldoc-comment__status-title {
  margin: 0;
  font-size: clamp(18px, 2vw, 22px);
  font-weight: 600;
  color: var(--ldoc-c-text-1, #111827);
}

.ldoc-comment__status-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ldoc-c-text-2, #475467);
  max-width: 420px;
}

.ldoc-comment__status-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.ldoc-comment__status-btn {
  padding: 10px 28px;
  border-radius: 999px;
  border: none;
  background: var(--ldoc-c-brand, #2563eb);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25);
}

.ldoc-comment__status-btn:active {
  transform: scale(0.97);
}

.ldoc-comment__status-link {
  font-size: 13px;
  color: var(--ldoc-c-text-3, #64748b);
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px dashed rgba(100, 116, 139, 0.4);
  transition: all 0.2s ease;
}

.ldoc-comment__status-link:hover {
  color: var(--ldoc-c-brand, #2563eb);
  border-color: var(--ldoc-c-brand, #2563eb);
}

.ldoc-comment__spinner {
  width: 26px;
  height: 26px;
  border: 3px solid rgba(148, 163, 184, 0.4);
  border-top-color: var(--ldoc-c-brand, #2563eb);
  border-radius: 50%;
  animation: ldoc-comment-spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

@keyframes ldoc-comment-spin {
  to { transform: rotate(360deg); }
}

/* ==================== 深色模式状态组件 ==================== */
.dark .ldoc-comment__title { color: var(--ldoc-c-text-1, #f9fafb); }
.dark .ldoc-comment__container { background: var(--ldoc-c-bg-soft, #1f1f1f); }
.dark .ldoc-comment__status-card {
  background: var(--ldoc-c-bg, #0f172a);
  border-color: rgba(148, 163, 184, 0.3);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
}
.dark .ldoc-comment__status-card--loading {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.08));
}
.dark .ldoc-comment__status-card--error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.08));
}
.dark .ldoc-comment__status-title { color: var(--ldoc-c-text-1, #f9fafb); }
.dark .ldoc-comment__status-text { color: var(--ldoc-c-text-2, #cfd8e3); }
.dark .ldoc-comment__status-link {
  color: var(--ldoc-c-text-3, #9ca3af);
  border-color: rgba(148, 163, 184, 0.35);
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .ldoc-comment__container {
    padding: 12px;
    border-radius: 12px;
  }
  
  .artalk .atk-comment {
    padding: 14px !important;
    margin-bottom: 12px !important;
  }
  
  .artalk .atk-avatar {
    width: 36px !important;
    height: 36px !important;
    border-radius: 8px !important;
  }
  
  .artalk .atk-editor-textarea {
    min-height: 80px !important;
    padding: 12px !important;
    font-size: 14px !important;
  }
}

@media (max-width: 480px) {
  .ldoc-comment__header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .ldoc-comment__title-badge {
    margin-left: 0;
    margin-top: 8px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .ldoc-comment__retry {
    min-height: 48px;
    padding: 14px 32px;
  }
  
  .artalk .atk-btn {
    min-height: 48px !important;
  }
}
`

// 注入样式（只执行一次）
if (typeof window !== 'undefined' && !document.getElementById('ldoc-comment-styles')) {
  const style = document.createElement('style')
  style.id = 'ldoc-comment-styles'
  style.textContent = COMMENT_STYLES
  document.head.appendChild(style)
}

// ============== 类型定义 ==============

export type CommentProvider = 'giscus' | 'gitalk' | 'waline' | 'twikoo' | 'artalk' | 'custom'

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
  locale?: string
}

export interface CommentPluginOptions {
  provider: CommentProvider
  giscus?: GiscusOptions
  gitalk?: GitalkOptions
  waline?: WalineOptions
  twikoo?: TwikooOptions
  artalk?: ArtalkOptions
  customComponent?: unknown
  position?: 'doc-after' | 'doc-footer-before' | 'doc-footer-after'
  exclude?: string[]
  include?: string[]
  showOnHome?: boolean
  title?: string
}

// ============== 加载函数 ==============

// Artalk 实例引用
let artalkInstance: any = null

// 加载 Artalk（使用官方 SDK）
async function loadArtalk(container: HTMLElement, options: ArtalkOptions, isDark: boolean): Promise<void> {
  // 加载 CSS
  if (!document.querySelector('link[href*="Artalk.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/artalk/dist/Artalk.css'
    document.head.appendChild(link)
  }

  // 加载 JS
  if (!(window as any).Artalk) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/artalk/dist/Artalk.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Artalk'))
      document.body.appendChild(script)
    })
  }

  // 销毁旧实例
  if (artalkInstance) {
    artalkInstance.destroy()
    artalkInstance = null
  }

  // 初始化 Artalk
  artalkInstance = (window as any).Artalk.init({
    el: container,
    server: options.server,
    site: options.site,
    pageKey: options.pageKey || location.pathname,
    pageTitle: options.pageTitle || document.title,
    darkMode: isDark,
    locale: options.locale || 'zh-CN'
  })

  // 初始化深色模式监听
  initDarkModeObserver()
}

// 销毁 Artalk 实例
function destroyArtalk() {
  if (artalkInstance) {
    artalkInstance.destroy()
    artalkInstance = null
  }
}

// 监听深色模式变化
let darkModeObserver: MutationObserver | null = null

function initDarkModeObserver() {
  if (typeof window === 'undefined' || darkModeObserver) return

  const updateDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark')
    if (artalkInstance) {
      artalkInstance.setDarkMode(isDark)
    }
  }

  darkModeObserver = new MutationObserver(() => {
    updateDarkMode()
  })

  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
}

// 加载 Giscus
async function loadGiscus(container: HTMLElement, options: GiscusOptions) {
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', options.repo)
  script.setAttribute('data-repo-id', options.repoId)
  script.setAttribute('data-category', options.category)
  script.setAttribute('data-category-id', options.categoryId)
  script.setAttribute('data-mapping', options.mapping || 'pathname')
  script.setAttribute('data-strict', String(options.strict ?? true))
  script.setAttribute('data-reactions-enabled', String(options.reactionsEnabled ?? true))
  script.setAttribute('data-emit-metadata', String(options.emitMetadata ?? false))
  script.setAttribute('data-input-position', options.inputPosition || 'bottom')
  script.setAttribute('data-theme', options.theme || 'preferred_color_scheme')
  script.setAttribute('data-lang', options.lang || 'zh-CN')
  script.crossOrigin = 'anonymous'
  script.async = true
  container.appendChild(script)
}

// 加载 Gitalk
async function loadGitalk(container: HTMLElement, options: GitalkOptions) {
  // 加载 CSS
  if (!document.querySelector('link[href*="gitalk.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/gitalk/dist/gitalk.css'
    document.head.appendChild(link)
  }

  // 加载 JS
  if (!(window as any).Gitalk) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/gitalk/dist/gitalk.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Gitalk'))
      document.body.appendChild(script)
    })
  }

  // 初始化 Gitalk
  const gitalk = new (window as any).Gitalk({
    ...options,
    id: options.id || location.pathname
  })
  gitalk.render(container)
}

// 加载 Waline
async function loadWaline(container: HTMLElement, options: WalineOptions) {
  // 加载 CSS
  if (!document.querySelector('link[href*="waline.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/@waline/client@v3/dist/waline.css'
    document.head.appendChild(link)
  }

  // 加载 JS
  if (!(window as any).Waline) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@waline/client@v3/dist/waline.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Waline'))
      document.body.appendChild(script)
    })
  }

  // 初始化 Waline
  ; (window as any).Waline.init({
    el: container,
    serverURL: options.serverURL,
    path: options.path || location.pathname,
    lang: options.lang || 'zh-CN',
    dark: options.dark || 'auto',
    meta: options.meta,
    requiredMeta: options.requiredMeta,
    login: options.login,
    wordLimit: options.wordLimit,
    pageSize: options.pageSize
  })
}

// 加载 Twikoo
async function loadTwikoo(container: HTMLElement, options: TwikooOptions) {
  // 加载 JS
  if (!(window as any).twikoo) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdn.staticfile.org/twikoo/1.6.16/twikoo.all.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Twikoo'))
      document.body.appendChild(script)
    })
  }

  // 初始化 Twikoo
  ; (window as any).twikoo.init({
    envId: options.envId,
    el: container,
    region: options.region,
    path: options.path || location.pathname,
    lang: options.lang || 'zh-CN'
  })
}

// ============== 主评论组件 ==============

const CommentBox = defineComponent({
  name: 'LDocComment',
  props: {
    options: {
      type: Object as () => CommentPluginOptions,
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const containerRef = ref<HTMLElement | null>(null)
    const loading = ref(true)
    const error = ref('')

    // 检测深色模式
    const isDark = computed(() => {
      if (typeof document === 'undefined') return false
      return document.documentElement.classList.contains('dark')
    })

    const loadComment = async () => {
      if (!containerRef.value) return

      loading.value = true
      error.value = ''
      containerRef.value.innerHTML = ''

      try {
        switch (props.options.provider) {
          case 'artalk':
            if (props.options.artalk) {
              await loadArtalk(containerRef.value, props.options.artalk, isDark.value)
            }
            break
          case 'giscus':
            if (props.options.giscus) {
              await loadGiscus(containerRef.value, props.options.giscus)
            }
            break
          case 'gitalk':
            if (props.options.gitalk) {
              await loadGitalk(containerRef.value, props.options.gitalk)
            }
            break
          case 'waline':
            if (props.options.waline) {
              await loadWaline(containerRef.value, props.options.waline)
            }
            break
          case 'twikoo':
            if (props.options.twikoo) {
              await loadTwikoo(containerRef.value, props.options.twikoo)
            }
            break
        }
        loading.value = false
      } catch (e) {
        error.value = (e as Error).message || '评论加载失败'
        loading.value = false
        console.error('[ldoc:comment]', e)
      }
    }

    onMounted(loadComment)

    // 路由变化时重新加载
    watch(() => route.path, () => {
      loadComment()
    })

    // 组件卸载时销毁 Artalk 实例
    const onUnmounted = () => {
      if (props.options.provider === 'artalk') {
        destroyArtalk()
      }
    }

    return () => h('div', { class: 'ldoc-comment' }, [
      // 标题区域
      h('div', { class: 'ldoc-comment__header' }, [
        h('div', { class: 'ldoc-comment__title-row' }, [
          h('h3', { class: 'ldoc-comment__title' }, [
            h('svg', {
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }, [
              h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
            ]),
            props.options.title || '评论交流'
          ]),
          h('span', { class: 'ldoc-comment__title-badge' }, '一起讨论 / Share Ideas')
        ]),
        h('p', { class: 'ldoc-comment__subtitle' }, '欢迎分享你的观点，和社区一起讨论、提问或反馈。')
      ]),

      h('div', { class: 'ldoc-comment__info-row' }, [
        h('span', '评论服务：' + (props.options.provider || 'Artalk')),
        h('span', { class: 'ldoc-comment__separator' }),
        h('span', '当前页面：' + route.path),
        h('span', { class: 'ldoc-comment__separator' }),
        h('a', {
          class: 'ldoc-comment__help-link',
          href: 'https://ldesign.dev/guide/comment.html',
          target: '_blank',
          rel: 'noopener'
        }, '配置指引')
      ]),

      // 评论容器 - 必须始终存在以便加载评论系统
      h('div', {
        ref: containerRef,
        class: 'ldoc-comment__container',
        style: { display: error.value ? 'none' : 'block' }
      }),

      // 加载状态 - 更现代的设计
      loading.value && h('div', { class: 'ldoc-comment__status-card ldoc-comment__status-card--loading' }, [
        h('div', { class: 'ldoc-comment__status-icon' }, [
          h('div', { class: 'ldoc-comment__spinner' })
        ]),
        h('p', { class: 'ldoc-comment__status-title' }, '正在召唤评论区...'),
        h('p', { class: 'ldoc-comment__status-text' }, '我们正在连接评论服务，请稍候片刻，马上就能和社区互动。')
      ]),

      // 错误提示 - 更友好的设计
      error.value && h('div', { class: 'ldoc-comment__status-card ldoc-comment__status-card--error' }, [
        h('div', { class: 'ldoc-comment__status-icon' }, [
          h('svg', {
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': 1.5,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('circle', { cx: 12, cy: 12, r: 10 }),
            h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }),
            h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })
          ])
        ]),
        h('p', { class: 'ldoc-comment__status-title' }, '未能连接到评论服务'),
        h('p', { class: 'ldoc-comment__status-text' }, error.value || '网络波动或服务暂不可用，请稍后再试。'),
        h('div', { class: 'ldoc-comment__status-actions' }, [
          h('button', {
            class: 'ldoc-comment__status-btn',
            onClick: loadComment
          }, [
            h('span', { style: { marginRight: '6px' } }, '↻'),
            '重新加载'
          ]),
          h('a', {
            class: 'ldoc-comment__status-link',
            href: 'https://artalk.js.org/guide/introduction.html',
            target: '_blank',
            rel: 'noopener'
          }, '了解配置')
        ])
      ])
    ])
  }
})

// ============== 导出 ==============

// 全局组件列表
export const globalComponents: PluginGlobalComponent[] = [
  { name: 'LDocComment', component: CommentBox }
]

// 创建 slots 的工厂函数
export function createCommentSlots(options: CommentPluginOptions): (ctx: any) => PluginSlots {
  const {
    position = 'doc-after',
    exclude = [],
    include,
    showOnHome = false,
    title = '评论'
  } = options

  return (ctx) => {
    const path = ctx?.route?.path || '/'

    // 检查是否应该显示
    if (!showOnHome && path === '/') {
      return {}
    }

    if (include && !include.some((p: string) => path.startsWith(p))) {
      return {}
    }

    if (exclude.some((p: string) => path.startsWith(p))) {
      return {}
    }

    return {
      [position]: {
        component: CommentBox,
        props: { options: { ...options, title } },
        order: 100
      }
    }
  }
}

// 导出组件供外部使用
export { CommentBox }

export default {
  globalComponents
}
