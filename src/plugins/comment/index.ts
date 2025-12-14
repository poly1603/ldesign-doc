/**
 * 评论系统插件 - 支持多种评论服务
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData } from '../../shared/types'
import { defineComponent, h, ref, computed, onMounted } from 'vue'

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
 * 检查是否配置了有效的评论服务
 */
function isConfigured(options: CommentPluginOptions): boolean {
  switch (options.provider) {
    case 'giscus':
      return !!(options.giscus?.repo && options.giscus?.repoId)
    case 'gitalk':
      return !!(options.gitalk?.clientID && options.gitalk?.repo)
    case 'waline':
      return !!options.waline?.serverURL
    case 'twikoo':
      return !!options.twikoo?.envId
    case 'artalk':
      return !!(options.artalk?.server && options.artalk?.site)
    case 'custom':
      return !!options.customComponent
    default:
      return false
  }
}

/**
 * 演示模式评论组件 - 未配置时显示
 */
const DemoCommentBox = defineComponent({
  name: 'LDocDemoComment',
  props: {
    title: { type: String, default: '💬 评论' },
    provider: { type: String, default: 'giscus' }
  },
  setup(props) {
    const comments = ref([
      { id: 1, author: '张三', avatar: '👨', time: '2 小时前', content: '这篇文档写得非常清晰，帮助我快速上手了！' },
      { id: 2, author: '李四', avatar: '👩', time: '1 小时前', content: '请问这个功能支持自定义主题吗？' },
      { id: 3, author: '作者', avatar: '✍️', time: '30 分钟前', content: '@李四 支持的，可以在配置中设置 theme 参数。' }
    ])
    const inputValue = ref('')

    return () => h('div', { class: 'ldoc-comment ldoc-comment--demo' }, [
      h('h3', { class: 'ldoc-comment__title' }, props.title),
      h('div', { class: 'ldoc-comment__demo-notice' }, [
        h('span', { class: 'ldoc-comment__demo-badge' }, '演示模式'),
        h('span', {}, `评论系统尚未配置 (${props.provider})，以下为演示效果`)
      ]),
      h('div', { class: 'ldoc-comment__input-area' }, [
        h('textarea', {
          class: 'ldoc-comment__input',
          placeholder: '写下你的评论...',
          value: inputValue.value,
          onInput: (e: Event) => { inputValue.value = (e.target as HTMLTextAreaElement).value }
        }),
        h('div', { class: 'ldoc-comment__input-actions' }, [
          h('button', { class: 'ldoc-comment__submit', disabled: true }, '发表评论')
        ])
      ]),
      h('div', { class: 'ldoc-comment__list' },
        comments.value.map(c =>
          h('div', { class: 'ldoc-comment__item', key: c.id }, [
            h('div', { class: 'ldoc-comment__avatar' }, c.avatar),
            h('div', { class: 'ldoc-comment__body' }, [
              h('div', { class: 'ldoc-comment__meta' }, [
                h('span', { class: 'ldoc-comment__author' }, c.author),
                h('span', { class: 'ldoc-comment__time' }, c.time)
              ]),
              h('div', { class: 'ldoc-comment__content' }, c.content)
            ])
          ])
        )
      )
    ])
  }
})

/**
 * 评论组件
 */
const CommentBox = defineComponent({
  name: 'LDocComment',
  props: {
    options: {
      type: Object as () => CommentPluginOptions,
      required: true
    }
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null)
    const loaded = ref(false)
    const error = ref<string | null>(null)

    // 检查是否已配置
    const configured = computed(() => isConfigured(props.options))

    onMounted(async () => {
      if (!containerRef.value || !configured.value) return

      try {
        switch (props.options.provider) {
          case 'giscus':
            await loadGiscus(containerRef.value, props.options.giscus!)
            break
          case 'gitalk':
            await loadGitalk(containerRef.value, props.options.gitalk!)
            break
          case 'waline':
            await loadWaline(containerRef.value, props.options.waline!)
            break
          case 'twikoo':
            await loadTwikoo(containerRef.value, props.options.twikoo!)
            break
          case 'artalk':
            await loadArtalk(containerRef.value, props.options.artalk!)
            break
        }
        loaded.value = true
      } catch (e) {
        error.value = (e as Error).message
        console.error('[ldoc:comment] Failed to load comment:', e)
      }
    })

    return () => {
      // 未配置时显示演示模式
      if (!configured.value) {
        return h(DemoCommentBox, {
          title: props.options.title || '💬 评论',
          provider: props.options.provider
        })
      }

      return h('div', { class: 'ldoc-comment' }, [
        props.options.title && h('h3', { class: 'ldoc-comment__title' }, props.options.title),
        h('div', {
          ref: containerRef,
          class: 'ldoc-comment__container'
        }),
        error.value && h('div', { class: 'ldoc-comment__error' }, `评论加载失败: ${error.value}`)
      ])
    }
  }
})

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
  // 动态加载 CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/gitalk/dist/gitalk.css'
  document.head.appendChild(link)

  // 动态加载 JS
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/gitalk/dist/gitalk.min.js'
  script.onload = () => {
    const gitalk = new (window as any).Gitalk({
      ...options,
      id: options.id || location.pathname
    })
    gitalk.render(container)
  }
  document.body.appendChild(script)
}

// 加载 Waline
async function loadWaline(container: HTMLElement, options: WalineOptions) {
  try {
    // 动态导入 Waline（用户需要安装 @waline/client）
    const walineModule = await import('@waline/client' as string)
    const init = walineModule.init || walineModule.default?.init
    if (init) {
      init({
        el: container,
        serverURL: options.serverURL,
        path: options.path || location.pathname,
        lang: options.lang || 'zh-CN',
        dark: options.dark || 'auto'
      })
    }
  } catch {
    // 如果 Waline 未安装，使用脚本方式加载
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/@waline/client@v2/dist/waline.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@waline/client@v2/dist/waline.js'
    script.onload = () => {
      const Waline = (window as any).Waline
      if (Waline) {
        Waline.init({
          el: container,
          serverURL: options.serverURL,
          path: options.path || location.pathname,
          lang: options.lang || 'zh-CN',
          dark: options.dark || 'auto'
        })
      }
    }
    document.body.appendChild(script)
  }
}

// 加载 Twikoo
async function loadTwikoo(container: HTMLElement, options: TwikooOptions) {
  const script = document.createElement('script')
  script.src = 'https://cdn.staticfile.org/twikoo/1.6.16/twikoo.all.min.js'
  script.onload = () => {
    (window as any).twikoo.init({
      envId: options.envId,
      el: container,
      region: options.region,
      path: options.path || location.pathname,
      lang: options.lang || 'zh-CN'
    })
  }
  document.body.appendChild(script)
}

// 加载 Artalk
async function loadArtalk(container: HTMLElement, options: ArtalkOptions) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/artalk/dist/Artalk.css'
  document.head.appendChild(link)

  const script = document.createElement('script')
  script.src = 'https://unpkg.com/artalk/dist/Artalk.js'
  script.onload = () => {
    (window as any).Artalk.init({
      el: container,
      server: options.server,
      site: options.site,
      pageKey: options.pageKey || location.pathname,
      pageTitle: options.pageTitle || document.title,
      darkMode: options.darkMode ?? 'auto'
    })
  }
  document.body.appendChild(script)
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

  return definePlugin({
    name: 'ldoc:comment',

    slots: (ctx) => {
      const path = ctx.route.path

      // 检查是否应该显示
      if (!showOnHome && path === '/') {
        return {}
      }

      if (include && !include.some(p => path.startsWith(p))) {
        return {}
      }

      if (exclude.some(p => path.startsWith(p))) {
        return {}
      }

      return {
        [position]: {
          component: CommentBox,
          props: { options: { ...options, title } },
          order: 100
        }
      }
    },

    globalComponents: [
      { name: 'LDocComment', component: CommentBox }
    ],

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
