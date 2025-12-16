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
/* 评论容器 */
.ldoc-comment { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--ldoc-c-divider, #e5e7eb); }
.ldoc-comment__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.ldoc-comment__title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 20px; font-weight: 600; color: var(--ldoc-c-text-1, #1f2937); }
.ldoc-comment__title svg { color: var(--ldoc-c-brand, #3b82f6); }
.ldoc-comment__container { min-height: 100px; }

/* Artalk 主题适配 (覆盖默认 CSS 变量) */
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
  
  /* 阴影与圆角 */
  --at-border-radius: 8px !important;
  
  /* 输入框 */
  --at-color-input-bg: var(--ldoc-c-bg-soft) !important;
  --at-color-input-text: var(--ldoc-c-text-1) !important;
}

/* 深色模式适配 */
.dark .artalk {
  --at-color-bg: var(--ldoc-c-bg) !important;
  --at-color-bg-transl: rgba(0, 0, 0, 0) !important;
  --at-color-input-bg: var(--ldoc-c-bg-soft) !important;
  --at-color-border: var(--ldoc-c-divider) !important;
}

/* 隐藏 Artalk 自带的深色模式切换按钮，交由文档系统控制 */
.atk-header .atk-dark-mode-btn { display: none !important; }

/* 状态组件 */
.ldoc-comment__loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 40px; color: var(--ldoc-c-text-3, #9ca3af); font-size: 14px; }
.ldoc-comment__spinner { width: 20px; height: 20px; border: 2px solid var(--ldoc-c-divider, #e5e7eb); border-top-color: var(--ldoc-c-brand, #3b82f6); border-radius: 50%; animation: ldoc-comment-spin 0.8s linear infinite; }
@keyframes ldoc-comment-spin { to { transform: rotate(360deg); } }
.ldoc-comment__error-box { display: flex; flex-direction: column; align-items: center; padding: 40px; background: var(--ldoc-c-bg-soft, #fef2f2); border: 1px solid var(--ldoc-c-divider, #fecaca); border-radius: 16px; text-align: center; }
.ldoc-comment__error-icon { margin-bottom: 16px; color: #ef4444; opacity: 0.8; }
.ldoc-comment__error-title { font-size: 16px; font-weight: 600; color: #dc2626; margin: 0 0 8px; }
.ldoc-comment__error-text { font-size: 14px; color: #b91c1c; margin-bottom: 24px; opacity: 0.8; }
.ldoc-comment__retry { padding: 10px 24px; background: var(--ldoc-c-brand, #3b82f6); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.ldoc-comment__retry:hover { opacity: 0.9; transform: translateY(-1px); }

/* 深色模式状态组件 */
.dark .ldoc-comment__title { color: var(--ldoc-c-text-1, #f9fafb); }
.dark .ldoc-comment__error-box { background: rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.2); }
.dark .ldoc-comment__error-icon { color: #f87171; }
.dark .ldoc-comment__error-title { color: #fca5a5; }
.dark .ldoc-comment__error-text { color: #fecaca; }
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
      // 标题
      h('div', { class: 'ldoc-comment__header' }, [
        h('h3', { class: 'ldoc-comment__title' }, [
          h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
            h('path', { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' })
          ]),
          ' ',
          props.options.title || '评论'
        ])
      ]),

      // 加载状态
      loading.value && h('div', { class: 'ldoc-comment__loading' }, [
        h('div', { class: 'ldoc-comment__spinner' }),
        '评论加载中...'
      ]),

      // 错误提示
      error.value && h('div', { class: 'ldoc-comment__error-box' }, [
        h('svg', { class: 'ldoc-comment__error-icon', width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
          h('circle', { cx: 12, cy: 12, r: 10 }),
          h('line', { x1: 12, y1: 8, x2: 12, y2: 12 }),
          h('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 })
        ]),
        h('h4', { class: 'ldoc-comment__error-title' }, '无法加载评论'),
        h('div', { class: 'ldoc-comment__error-text' }, error.value),
        h('button', {
          class: 'ldoc-comment__retry',
          onClick: loadComment
        }, '重新加载')
      ]),

      // 评论容器（各个 SDK 会渲染到这里）
      h('div', {
        ref: containerRef,
        class: 'ldoc-comment__container',
        style: { minHeight: loading.value ? '0' : '200px' }
      })
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
