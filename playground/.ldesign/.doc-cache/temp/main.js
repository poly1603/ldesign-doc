
import { createApp, ref, provide, h, Transition } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { routes } from './routes'
import { siteData } from './siteData'
// 从虚拟模块导入主题（支持 npm 包和本地主题）
import theme from '@theme'
const Layout = theme.Layout

// 导入主题样式
import '@theme-styles'

// 导入插件系统
import { createPluginSlotsContext, providePluginSlots, collectPluginSlots, cachePlugins, recollectPluginSlots } from '@ldesign/doc/client'
import { createPluginContext, providePluginContext } from '@ldesign/doc/client'

// 导入插件客户端配置
import clientPlugins from 'virtual:ldoc/plugins'

// 创建响应式数据
const siteDataRef = ref(siteData)
const pageDataRef = ref({
  title: '',
  description: '',
  frontmatter: {},
  relativePath: ''
})

// 注入符号
const pageDataSymbol = Symbol.for('ldoc:pageData')
const siteDataSymbol = Symbol.for('ldoc:siteData')

// 全局变量
window.__LDOC_PAGE_DATA__ = pageDataRef
window.__LDOC_SITE_DATA__ = siteDataRef

// 创建插件 Slot 上下文
const pluginSlotsContext = createPluginSlotsContext()

// 缓存插件定义,用于路由变化时重新收集 slots
cachePlugins(clientPlugins)

// 创建路由
const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 初始收集插件 slots(不传上下文,让动态 slots 返回空)
collectPluginSlots(clientPlugins, pluginSlotsContext)

// 路由守卫
router.beforeResolve(async (to) => {
  const meta = to.meta || {}
  pageDataRef.value = {
    title: meta.title || siteData.title,
    description: meta.description || siteData.description,
    frontmatter: meta.frontmatter || {},
    relativePath: to.path
  }
  
  document.title = pageDataRef.value.title 
    ? pageDataRef.value.title + ' | ' + siteData.title
    : siteData.title
})

// 路由变化后重新收集插件 slots
router.afterEach((to) => {
  // 创建插件上下文
  const pluginContext = {
    app: null,
    router,
    siteData: siteDataRef.value,
    pageData: pageDataRef.value,
    route: {
      path: to.path,
      hash: to.hash,
      query: to.query
    }
  }
  
  // 重新收集插件 slots
  recollectPluginSlots(pluginSlotsContext, pluginContext)
})

// 根组件
const RootComponent = {
  setup() {
    provide(pageDataSymbol, pageDataRef)
    provide(siteDataSymbol, siteDataRef)
    
    // 提供插件 Slots 上下文
    providePluginSlots(pluginSlotsContext)
    
    return () => h(Layout)
  }
}

// 创建应用
const app = createApp(RootComponent)

// 注册插件全局组件
pluginSlotsContext.globalComponents.value.forEach(comp => {
  app.component(comp.name, comp.component)
})

app.use(router)

// 等待路由就绪后挂载应用
router.isReady().then(() => {
  // 初始加载时也需要收集一次 slots
  const currentRoute = router.currentRoute.value
  const pluginContext = {
    app: null,
    router,
    siteData: siteDataRef.value,
    pageData: pageDataRef.value,
    route: {
      path: currentRoute.path,
      hash: currentRoute.hash,
      query: currentRoute.query
    }
  }
  recollectPluginSlots(pluginSlotsContext, pluginContext)
  
  app.mount('#app')
})

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
