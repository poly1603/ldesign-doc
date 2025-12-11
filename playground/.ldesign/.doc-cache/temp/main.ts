
import { createApp, ref, provide, h, Transition } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { routes } from './routes'
import { siteData } from './siteData'
import Layout from '@theme/Layout.vue'

// 导入主题样式
import '@theme/styles/index.css'

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
