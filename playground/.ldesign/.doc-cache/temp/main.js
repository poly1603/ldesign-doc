
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
import { createPluginSlotsContext, providePluginSlots, collectPluginSlots } from '@ldesign/doc/client'

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

// 收集插件的 slots 和全局组件
console.log('[ldoc] Client plugins:', clientPlugins)
collectPluginSlots(clientPlugins, pluginSlotsContext)

// 创建路由
const router = createRouter({
  history: createWebHistory('/'),
  routes
})

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
app.use(router)
app.mount('#app')

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
