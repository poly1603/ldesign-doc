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
  padding-top: clamp(24px, 4vw, 48px);
  border-top: 1px solid var(--ldoc-c-divider, #e5e7eb);
}

/* 评论头部 */
.ldoc-comment__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(20px, 3vw, 32px);
  flex-wrap: wrap;
  gap: 12px;
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

.ldoc-comment__title-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1));
  color: var(--ldoc-c-brand, #3b82f6);
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  margin-left: 8px;
}

/* 评论容器 */
.ldoc-comment__container {
  min-height: 120px;
  border-radius: var(--ldoc-radius-xl, 16px);
  background: var(--ldoc-c-bg-soft, #f9fafb);
  padding: clamp(16px, 3vw, 24px);
  transition: all 0.3s ease;
}

.ldoc-comment__container:empty {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Artalk 输入框优化 */
.artalk .atk-editor {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  border: 1px solid var(--ldoc-c-divider) !important;
  transition: all 0.2s ease !important;
}

.artalk .atk-editor:focus-within {
  border-color: var(--ldoc-c-brand) !important;
  box-shadow: 0 0 0 3px var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.15)) !important;
}

.artalk .atk-editor-textarea {
  min-height: 100px !important;
  padding: 16px !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
}

/* Artalk 按钮优化 */
.artalk .atk-btn {
  border-radius: 8px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  min-height: 40px !important;
  padding: 8px 20px !important;
}

.artalk .atk-btn-primary {
  background: var(--ldoc-c-brand) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25) !important;
}

.artalk .atk-btn-primary:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
}

/* Artalk 评论列表优化 */
.artalk .atk-list {
  margin-top: 24px !important;
}

.artalk .atk-comment {
  padding: 20px !important;
  margin-bottom: 16px !important;
  background: var(--ldoc-c-bg) !important;
  border-radius: 12px !important;
  border: 1px solid var(--ldoc-c-divider) !important;
  transition: all 0.2s ease !important;
}

.artalk .atk-comment:hover {
  border-color: var(--ldoc-c-brand-light, #93c5fd) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
}

/* Artalk 头像优化 */
.artalk .atk-avatar {
  width: 44px !important;
  height: 44px !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.artalk .atk-avatar img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Artalk 用户名优化 */
.artalk .atk-nick {
  font-weight: 600 !important;
  color: var(--ldoc-c-text-1) !important;
  font-size: 15px !important;
}

/* Artalk 时间戳优化 */
.artalk .atk-date {
  font-size: 13px !important;
  color: var(--ldoc-c-text-3) !important;
}

/* Artalk 评论内容优化 */
.artalk .atk-content {
  font-size: 15px !important;
  line-height: 1.7 !important;
  color: var(--ldoc-c-text-2) !important;
  margin-top: 12px !important;
}

.artalk .atk-content p {
  margin: 0 0 12px !important;
}

.artalk .atk-content p:last-child {
  margin-bottom: 0 !important;
}

/* 深色模式适配 */
.dark .artalk {
  --at-color-bg: var(--ldoc-c-bg) !important;
  --at-color-bg-transl: rgba(0, 0, 0, 0) !important;
  --at-color-input-bg: var(--ldoc-c-bg-soft) !important;
  --at-color-border: var(--ldoc-c-divider) !important;
}

.dark .artalk .atk-editor {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.dark .artalk .atk-comment:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

/* 隐藏 Artalk 自带的深色模式切换按钮 */
.atk-header .atk-dark-mode-btn { display: none !important; }

/* ==================== Giscus 主题适配 ==================== */
.giscus {
  width: 100%;
}

.giscus-frame {
  border-radius: 12px !important;
  border: none !important;
}

/* ==================== 加载状态 ==================== */
.ldoc-comment__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: clamp(40px, 8vw, 80px) 24px;
  color: var(--ldoc-c-text-3, #9ca3af);
  text-align: center;
}

.ldoc-comment__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--ldoc-c-divider, #e5e7eb);
  border-top-color: var(--ldoc-c-brand, #3b82f6);
  border-radius: 50%;
  animation: ldoc-comment-spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.ldoc-comment__loading-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-text-2);
}

@keyframes ldoc-comment-spin {
  to { transform: rotate(360deg); }
}

/* ==================== 错误状态 ==================== */
.ldoc-comment__error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(32px, 6vw, 56px) clamp(20px, 4vw, 40px);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: var(--ldoc-radius-xl, 16px);
  text-align: center;
}

.ldoc-comment__error-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  color: #ef4444;
  opacity: 0.8;
  animation: ldoc-error-shake 0.5s ease-in-out;
}

@keyframes ldoc-error-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

.ldoc-comment__error-title {
  font-size: clamp(16px, 2vw, 18px);
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 8px;
}

.ldoc-comment__error-text {
  font-size: 14px;
  color: #b91c1c;
  margin-bottom: 24px;
  opacity: 0.8;
  max-width: 300px;
  line-height: 1.5;
}

.ldoc-comment__retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.ldoc-comment__retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.ldoc-comment__retry:active {
  transform: translateY(0);
}

/* ==================== 深色模式状态组件 ==================== */
.dark .ldoc-comment__title { color: var(--ldoc-c-text-1, #f9fafb); }
.dark .ldoc-comment__container { background: var(--ldoc-c-bg-soft, #1f1f1f); }
.dark .ldoc-comment__error-box {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border-color: rgba(239, 68, 68, 0.2);
}
.dark .ldoc-comment__error-icon { color: #f87171; }
.dark .ldoc-comment__error-title { color: #fca5a5; }
.dark .ldoc-comment__error-text { color: #fecaca; }

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
    darkMode: isDark
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
        h('h3', { class: 'ldoc-comment__title' }, [
          // 聊天气泡图标
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
        ])
      ]),

      // 评论容器 - 必须始终存在以便加载评论系统
      h('div', {
        ref: containerRef,
        class: 'ldoc-comment__container',
        style: { display: error.value ? 'none' : 'block' }
      }),

      // 加载状态 - 更现代的设计
      loading.value && h('div', { class: 'ldoc-comment__loading' }, [
        h('div', { class: 'ldoc-comment__spinner' }),
        h('span', { class: 'ldoc-comment__loading-text' }, '正在加载评论系统...')
      ]),

      // 错误提示 - 更友好的设计
      error.value && h('div', { class: 'ldoc-comment__error-box' }, [
        h('svg', {
          class: 'ldoc-comment__error-icon',
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
        ]),
        h('h4', { class: 'ldoc-comment__error-title' }, '评论加载失败'),
        h('div', { class: 'ldoc-comment__error-text' }, error.value),
        h('button', {
          class: 'ldoc-comment__retry',
          onClick: loadComment
        }, [
          h('svg', {
            width: 16,
            height: 16,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, [
            h('path', { d: 'M21 2v6h-6' }),
            h('path', { d: 'M3 12a9 9 0 0 1 15-6.7L21 8' }),
            h('path', { d: 'M3 22v-6h6' }),
            h('path', { d: 'M21 12a9 9 0 0 1-15 6.7L3 16' })
          ]),
          '重新加载'
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
