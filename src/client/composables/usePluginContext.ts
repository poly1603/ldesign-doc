/**
 * 插件上下文系统
 * 
 * 提供完整的客户端 API，让插件可以访问路由、数据、UI、存储等功能
 */

import {
  ref,
  computed,
  inject,
  provide,
  type Ref,
  type InjectionKey,
  type App
} from 'vue'
import { useRouter, useRoute, type Router, type RouteLocationNormalizedLoaded } from 'vue-router'
import type {
  ClientPluginContext,
  ClientRouteUtils,
  ClientDataUtils,
  ClientUIUtils,
  ClientStorageUtils,
  ClientEventBus,
  ToastOptions,
  ModalOptions,
  PageData,
  SiteData,
  ThemeConfig,
  Header
} from '../../shared/types'
import { pageDataSymbol, siteDataSymbol } from '../composables'

// ============== 事件总线实现 ==============

type EventCallback<T = unknown> = (data: T) => void

class EventBusImpl implements ClientEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map()

  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as EventCallback)
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.listeners.delete(event)
    } else {
      this.listeners.get(event)?.delete(callback)
    }
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.listeners.get(event)?.forEach(cb => cb(data))
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): void {
    const wrapper: EventCallback<T> = (data) => {
      callback(data)
      this.off(event, wrapper as EventCallback)
    }
    this.on(event, wrapper)
  }
}

// 全局事件总线实例
const globalEventBus = new EventBusImpl()

// ============== 存储工具实现 ==============

const STORAGE_PREFIX = 'ldoc:'

class StorageUtilsImpl implements ClientStorageUtils {
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof localStorage === 'undefined') return defaultValue ?? null
    try {
      const value = localStorage.getItem(STORAGE_PREFIX + key)
      if (value === null) return defaultValue ?? null
      return JSON.parse(value) as T
    } catch {
      return defaultValue ?? null
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('[ldoc] Storage set failed:', e)
    }
  }

  remove(key: string): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(STORAGE_PREFIX + key)
  }

  clear(): void {
    if (typeof localStorage === 'undefined') return
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}

// 全局存储实例
const globalStorage = new StorageUtilsImpl()

// ============== UI 工具实现 ==============

// Toast 状态
const toastState = ref<{
  visible: boolean
  message: string
  type: ToastOptions['type']
  position: ToastOptions['position']
}>({
  visible: false,
  message: '',
  type: 'info',
  position: 'top'
})

// Loading 状态
const loadingState = ref<{
  visible: boolean
  message: string
}>({
  visible: false,
  message: ''
})

// Modal 状态
const modalState = ref<{
  visible: boolean
  options: ModalOptions | null
  resolve: ((value: boolean) => void) | null
}>({
  visible: false,
  options: null,
  resolve: null
})

class UIUtilsImpl implements ClientUIUtils {
  showToast(message: string, options: ToastOptions = {}): void {
    toastState.value = {
      visible: true,
      message,
      type: options.type || 'info',
      position: options.position || 'top'
    }

    const duration = options.duration ?? 3000
    if (duration > 0) {
      setTimeout(() => {
        toastState.value.visible = false
      }, duration)
    }
  }

  showLoading(message = '加载中...'): void {
    loadingState.value = {
      visible: true,
      message
    }
  }

  hideLoading(): void {
    loadingState.value.visible = false
  }

  showModal(options: ModalOptions): Promise<boolean> {
    return new Promise(resolve => {
      modalState.value = {
        visible: true,
        options,
        resolve
      }
    })
  }

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      }
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

// 全局 UI 工具实例
const globalUI = new UIUtilsImpl()

// 导出状态供 UI 组件使用
export { toastState, loadingState, modalState }

// ============== 路由工具实现 ==============

function createRouteUtils(
  router: Router,
  route: RouteLocationNormalizedLoaded
): ClientRouteUtils {
  return {
    get path() {
      return route.path
    },
    get hash() {
      return route.hash
    },
    get query() {
      const result: Record<string, string> = {}
      for (const [key, value] of Object.entries(route.query)) {
        if (typeof value === 'string') {
          result[key] = value
        } else if (Array.isArray(value)) {
          result[key] = value[0] || ''
        }
      }
      return result
    },
    go(path: string) {
      router.push(path)
    },
    replace(path: string) {
      router.replace(path)
    },
    back() {
      router.back()
    },
    forward() {
      router.forward()
    },
    scrollToAnchor(hash: string) {
      const target = document.querySelector(decodeURIComponent(hash))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}

// ============== 数据工具实现 ==============

function createDataUtils(
  pageData: Ref<PageData>,
  siteData: Ref<SiteData>
): ClientDataUtils {
  const isDarkRef = ref(false)

  // 检测暗色模式
  if (typeof window !== 'undefined') {
    isDarkRef.value = document.documentElement.classList.contains('dark')

    const observer = new MutationObserver(() => {
      isDarkRef.value = document.documentElement.classList.contains('dark')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
  }

  return {
    getPageData() {
      return pageData.value
    },
    getSiteData() {
      return siteData.value
    },
    getThemeConfig() {
      return (siteData.value?.themeConfig || {}) as ThemeConfig
    },
    getFrontmatter() {
      return pageData.value?.frontmatter || {}
    },
    getHeaders() {
      return pageData.value?.headers || []
    },
    getLang() {
      return siteData.value?.lang || 'zh-CN'
    },
    isDark() {
      return isDarkRef.value
    }
  }
}

// ============== 插件上下文 ==============

export const pluginContextSymbol: InjectionKey<ClientPluginContext> = Symbol.for('ldoc:pluginContext')

/**
 * 创建插件上下文
 */
export function createPluginContext(options: {
  app: App
  router: Router
  pageData: Ref<PageData>
  siteData: Ref<SiteData>
}): ClientPluginContext {
  const { app, router, pageData, siteData } = options
  const route = router.currentRoute.value

  const context: ClientPluginContext = {
    app,
    router,
    siteData: siteData.value,
    pageData: pageData.value,
    route: createRouteUtils(router, route),
    data: createDataUtils(pageData, siteData),
    ui: globalUI,
    storage: globalStorage,
    events: globalEventBus
  }

  return context
}

/**
 * 提供插件上下文
 */
export function providePluginContext(context: ClientPluginContext): void {
  provide(pluginContextSymbol, context)
}

/**
 * 使用插件上下文
 * 
 * @example
 * ```ts
 * import { usePluginContext } from '@ldesign/doc/client'
 * 
 * export default {
 *   setup() {
 *     const ctx = usePluginContext()
 *     
 *     // 使用路由
 *     ctx.route.go('/docs/guide')
 *     
 *     // 使用数据
 *     const page = ctx.data.getPageData()
 *     
 *     // 使用 UI
 *     ctx.ui.showToast('操作成功', { type: 'success' })
 *     
 *     // 使用存储
 *     ctx.storage.set('key', 'value')
 *     
 *     // 使用事件
 *     ctx.events.on('custom-event', (data) => {
 *       console.log('收到事件:', data)
 *     })
 *   }
 * }
 * ```
 */
export function usePluginContext(): ClientPluginContext {
  const context = inject(pluginContextSymbol)

  if (context) {
    return context
  }

  // 如果没有注入上下文，创建一个基础版本
  const router = useRouter()
  const route = useRoute()
  const pageData = inject(pageDataSymbol)
  const siteData = inject(siteDataSymbol)

  return {
    app: null,
    router,
    siteData: siteData?.value || {} as SiteData,
    pageData: pageData?.value || {} as PageData,
    route: createRouteUtils(router, route),
    data: createDataUtils(
      pageData || ref({} as PageData),
      siteData || ref({} as SiteData)
    ),
    ui: globalUI,
    storage: globalStorage,
    events: globalEventBus
  }
}

// ============== 便捷 Hooks ==============

/**
 * 使用路由工具
 */
export function usePluginRoute(): ClientRouteUtils {
  const ctx = usePluginContext()
  return ctx.route
}

/**
 * 使用数据工具
 */
export function usePluginData(): ClientDataUtils {
  const ctx = usePluginContext()
  return ctx.data
}

/**
 * 使用 UI 工具
 */
export function usePluginUI(): ClientUIUtils {
  return globalUI
}

/**
 * 使用存储工具
 */
export function usePluginStorage(): ClientStorageUtils {
  return globalStorage
}

/**
 * 使用事件总线
 */
export function usePluginEvents(): ClientEventBus {
  return globalEventBus
}

// ============== 预定义事件类型 ==============

/**
 * 预定义的事件名称
 */
export const PluginEvents = {
  // 路由事件
  ROUTE_BEFORE_CHANGE: 'route:before-change',
  ROUTE_AFTER_CHANGE: 'route:after-change',

  // 页面事件
  PAGE_LOADED: 'page:loaded',
  PAGE_SCROLL: 'page:scroll',
  PAGE_RESIZE: 'page:resize',

  // 主题事件
  THEME_CHANGE: 'theme:change',
  DARK_MODE_CHANGE: 'dark-mode:change',

  // 搜索事件
  SEARCH_OPEN: 'search:open',
  SEARCH_CLOSE: 'search:close',
  SEARCH_QUERY: 'search:query',

  // 侧边栏事件
  SIDEBAR_TOGGLE: 'sidebar:toggle',
  SIDEBAR_OPEN: 'sidebar:open',
  SIDEBAR_CLOSE: 'sidebar:close',

  // TOC 事件
  TOC_ACTIVE_CHANGE: 'toc:active-change',

  // 评论事件
  COMMENT_SUBMIT: 'comment:submit',
  COMMENT_REPLY: 'comment:reply',
  COMMENT_DELETE: 'comment:delete',

  // 自定义事件
  CUSTOM: 'custom'
} as const

export type PluginEventName = typeof PluginEvents[keyof typeof PluginEvents]
