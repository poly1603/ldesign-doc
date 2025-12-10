/**
 * 默认主题入口
 */

import { defineTheme } from '../theme/defineTheme'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导出组件
export { default as Layout } from './Layout.vue'
export { default as NotFound } from './NotFound.vue'
export { default as VPNav } from './components/VPNav.vue'
export { default as VPSidebar } from './components/VPSidebar.vue'
export { default as VPContent } from './components/VPContent.vue'
export { default as VPFooter } from './components/VPFooter.vue'
export { default as VPHome } from './components/VPHome.vue'
export { default as VPDoc } from './components/VPDoc.vue'

// 导出组合式函数
export * from './composables'

// 默认主题
export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app }) {
    // 注册全局组件
  }
})
