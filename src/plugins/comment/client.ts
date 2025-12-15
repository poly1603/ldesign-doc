/**
 * 评论插件客户端配置
 * 
 * 此文件导出评论组件和 slots 配置，供客户端使用
 */
import { defineComponent, h, ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { PluginSlots, PluginGlobalComponent } from '../../shared/types'

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
  darkMode?: boolean | 'auto'
  editorTravel?: boolean
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
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/gitalk/dist/gitalk.css'
  document.head.appendChild(link)

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
  // 直接使用 CDN 加载，避免 Vite 静态分析问题
  {
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
  // 先加载 CSS
  await new Promise<void>((resolve) => {
    // 检查是否已加载
    if (document.querySelector('link[href*="Artalk.css"]')) {
      resolve()
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/artalk/dist/Artalk.css'
    link.onload = () => resolve()
    link.onerror = () => resolve() // 即使失败也继续
    document.head.appendChild(link)
  })

  // 再加载 JS
  await new Promise<void>((resolve, reject) => {
    // 检查是否已加载
    if ((window as any).Artalk) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/artalk/dist/Artalk.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Artalk.js'))
    document.body.appendChild(script)
  })

    // 初始化 Artalk
    ; (window as any).Artalk.init({
      el: container,
      server: options.server,
      site: options.site,
      pageKey: options.pageKey || location.pathname,
      pageTitle: options.pageTitle || document.title,
      darkMode: options.darkMode ?? 'auto'
    })
}

// ============== 检查配置 ==============

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

// ============== 演示模式组件 ==============

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

// ============== 评论组件 ==============

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
    const route = useRoute()

    const configured = computed(() => isConfigured(props.options))

    const loadComment = async () => {
      if (!containerRef.value || !configured.value) return

      // 清空容器
      containerRef.value.innerHTML = ''
      loaded.value = false
      error.value = null

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
    }

    onMounted(() => {
      loadComment()
    })

    // 路由变化时重新加载评论
    watch(() => route.path, () => {
      loadComment()
    })

    return () => {
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

// ============== 导出 ==============

// 全局组件列表
export const globalComponents: PluginGlobalComponent[] = [
  { name: 'LDocComment', component: CommentBox },
  { name: 'LDocDemoComment', component: DemoCommentBox }
]

// 创建 slots 的工厂函数
export function createCommentSlots(options: CommentPluginOptions): (ctx: any) => PluginSlots {
  const {
    position = 'doc-after',
    exclude = [],
    include,
    showOnHome = false,
    title = '💬 评论'
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
export { CommentBox, DemoCommentBox }

export default {
  globalComponents
}
