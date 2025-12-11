
import { createApp, ref, provide, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import Layout from '@theme/Layout.vue'

// 导入主题样式
import '@theme/styles/index.css'

// 站点数据
const siteData = ref({
  base: '/',
  title: 'LDoc',
  description: 'A LDesign Documentation Site',
  lang: 'zh-CN',
  themeConfig: {},
  locales: {},
  head: []
})

// 页面数据
const pageData = ref({
  title: '',
  description: '',
  frontmatter: {},
  headers: [],
  relativePath: '',
  filePath: ''
})

// Injection symbols - 使用 Symbol.for 确保跨模块共享
const pageDataSymbol = Symbol.for('ldoc:pageData')
const siteDataSymbol = Symbol.for('ldoc:siteData')

// 提供给 @ldesign/doc/client 使用
window.__LDOC_PAGE_DATA__ = pageData
window.__LDOC_SITE_DATA__ = siteData

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

// 路由守卫 - 更新页面数据
router.beforeResolve(async (to) => {
  const meta = to.meta || {}
  pageData.value = {
    title: meta.title || siteData.value.title,
    description: meta.description || siteData.value.description,
    frontmatter: meta.frontmatter || {},
    headers: meta.headers || [],
    relativePath: to.path,
    filePath: to.path
  }
  
  document.title = pageData.value.title 
    ? pageData.value.title + ' | ' + siteData.value.title
    : siteData.value.title
})

// 创建根组件
const RootComponent = {
  setup() {
    provide(pageDataSymbol, pageData)
    provide(siteDataSymbol, siteData)
    return () => h(Layout)
  }
}

const app = createApp(RootComponent)
app.use(router)
app.mount('#app')

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
