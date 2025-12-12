/**
 * 客户端代码
 * 此文件在浏览器端执行
 */

import type { EnhanceAppContext } from '@ldesign/doc'

/**
 * 增强 Vue 应用
 */
export function enhanceApp({ app, router, siteData }: EnhanceAppContext) {
  // 注册全局组件
  // app.component('MyComponent', MyComponent)
  
  // 添加全局属性
  // app.config.globalProperties.$myPlugin = {}
  
  // 路由守卫
  // router.beforeEach((to, from, next) => {
  //   next()
  // })
  
  console.log('[ldoc-plugin-word-count] Client enhanced')
}

export default {
  enhanceApp
}
