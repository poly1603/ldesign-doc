
import { createApp, ref, provide, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import Layout from '@theme/Layout.vue'

// 导入主题样式
import '@theme/styles/index.css'

// 站点数据
const siteData = ref({
  base: '/',
  title: 'LDoc 演示站点',
  description: '现代化文档系统演示',
  lang: 'zh-CN',
  themeConfig: {"logo":"📚","siteTitle":"LDoc","nav":[{"text":"指南","link":"/guide/"},{"text":"API","link":"/api/"},{"text":"组件","link":"/components/"},{"text":"更多","items":[{"text":"GitHub","link":"https://github.com/ldesign/doc"},{"text":"更新日志","link":"/changelog"}]}],"sidebar":{"/guide/":[{"text":"开始使用","items":[{"text":"介绍","link":"/guide/"},{"text":"快速开始","link":"/guide/getting-started"},{"text":"配置","link":"/guide/configuration"}]},{"text":"进阶","items":[{"text":"主题开发","link":"/guide/theme"},{"text":"插件开发","link":"/guide/plugin"}]}],"/api/":[{"text":"API 参考","items":[{"text":"配置 API","link":"/api/"},{"text":"客户端 API","link":"/api/client"},{"text":"主题 API","link":"/api/theme"}]}],"/components/":[{"text":"组件演示","items":[{"text":"概述","link":"/components/"},{"text":"Button 按钮","link":"/components/button"}]}]},"socialLinks":[{"icon":"github","link":"https://github.com/ldesign/doc"}],"footer":{"message":"Released under the MIT License.","copyright":"Copyright 2024 LDesign Team"},"editLink":{"pattern":"https://github.com/ldesign/doc/edit/main/playground/docs/:path","text":"在 GitHub 上编辑此页"},"outline":{"level":[2,3],"label":"本页目录"}},
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
