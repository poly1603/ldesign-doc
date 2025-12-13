/**
 * 客户端应用创建
 */

import { createApp as createVueApp, ref, provide, h, type App, type Component } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw, type Router } from 'vue-router'
import type { Theme, SiteData, PageData, Route, LDocPlugin } from '../shared/types'
import { pageDataSymbol, siteDataSymbol } from './composables'
import { createPluginSlotsContext, providePluginSlots, collectPluginSlots } from './composables/usePluginSlots'

// 导入虚拟模块的插件配置（延迟加载）
// 使用动态字符串避免构建时解析
async function loadVirtualPlugins(): Promise<LDocPlugin[]> {
  try {
    // 使用变量阻止静态分析
    const moduleId = 'virtual:ldoc/plugins'
    // @ts-ignore - 虚拟模块，仅在运行时可用
    const pluginModule = await import(/* @vite-ignore */ moduleId)
    return pluginModule.plugins || []
  } catch {
    return []
  }
}

export interface CreateAppOptions {
  routes: Route[]
  theme: Theme
  siteData?: SiteData
  plugins?: LDocPlugin[]
  enhanceApp?: (ctx: { app: App; router: Router; siteData: SiteData }) => void | Promise<void>
}

export interface AppInstance {
  app: App
  router: Router
  mount: (container: string | Element) => void
}

/**
 * 创建客户端应用
 */
export async function createApp(options: CreateAppOptions): Promise<AppInstance> {
  const { routes, theme, siteData: initialSiteData, plugins = [], enhanceApp } = options

  // 创建插件 Slots 上下文
  const pluginSlotsContext = createPluginSlotsContext()

  // 加载虚拟模块的插件配置
  const virtualPlugins = await loadVirtualPlugins()
  const allPlugins = [...plugins, ...virtualPlugins]

  // 收集插件的 slots 和全局组件
  collectPluginSlots(allPlugins, pluginSlotsContext)

  console.log('[ldoc] Client plugins loaded:', allPlugins.map(p => p.name))

  // 站点数据
  const siteData = ref<SiteData>(initialSiteData || {
    base: '/',
    title: 'LDoc',
    description: '',
    lang: 'zh-CN',
    locales: {},
    themeConfig: {},
    head: []
  })

  // 页面数据
  const pageData = ref<PageData>({
    title: '',
    description: '',
    frontmatter: {},
    headers: [],
    relativePath: '',
    filePath: ''
  })

  // 转换路由格式
  const vueRoutes: RouteRecordRaw[] = routes.map(route => ({
    path: route.path,
    component: route.component as unknown as Component,
    meta: route.meta
  } as RouteRecordRaw))

  // 添加 404 路由
  if (theme.NotFound) {
    vueRoutes.push({
      path: '/:pathMatch(.*)*',
      component: theme.NotFound as Component
    })
  }

  // 创建路由
  const router = createRouter({
    history: createWebHistory(siteData.value.base),
    routes: vueRoutes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        // 获取导航栏高度，默认为 64px
        // 加上额外的缓冲空间
        return {
          el: to.hash,
          top: 80, // Header (64px) + Padding (16px)
          behavior: 'smooth'
        }
      }
      return { top: 0 }
    }
  })

  // 路由守卫 - 更新页面数据
  router.beforeResolve(async (to) => {
    const meta = to.meta || {}
    pageData.value = {
      title: (meta.title as string) || siteData.value.title,
      description: (meta.description as string) || siteData.value.description,
      frontmatter: (meta.frontmatter as Record<string, unknown>) || {},
      headers: (meta.headers as PageData['headers']) || [],
      relativePath: to.path,
      filePath: to.path
    }

    // 更新文档标题
    if (typeof document !== 'undefined') {
      document.title = pageData.value.title
        ? `${pageData.value.title} | ${siteData.value.title}`
        : siteData.value.title
    }
  })

  // 创建 Vue 应用
  const RootComponent = {
    setup() {
      // 提供数据
      provide(pageDataSymbol, pageData)
      provide(siteDataSymbol, siteData)

      // 提供插件 Slots 上下文
      providePluginSlots(pluginSlotsContext)

      return () => h(theme.Layout as Component)
    }
  }

  const app = createVueApp(RootComponent)

  // 使用路由
  app.use(router)

  // 调用主题增强函数
  if (theme.enhanceApp) {
    theme.enhanceApp({ app, router, siteData: siteData.value })
  }

  // 调用用户增强函数
  if (enhanceApp) {
    enhanceApp({ app, router, siteData: siteData.value })
  }

  return {
    app,
    router,
    mount(container: string | Element) {
      // 等待路由就绪后挂载
      router.isReady().then(() => {
        app.mount(container)
      })
    }
  }
}

/**
 * SSR 创建应用
 */
export function createSSRApp(options: CreateAppOptions) {
  // TODO: 实现 SSR 应用创建
  return createApp(options)
}
