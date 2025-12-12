/**
 * 默认主题入口
 */

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导入默认主题样式（供继承的主题使用）
import './styles/index.css'

// Markdown 全局组件
import Demo from './components/Demo.vue'
import CodeGroup from './components/CodeGroup.vue'

// 内联 defineTheme 以避免构建时的路径解析问题
interface Theme {
  Layout: unknown
  NotFound?: unknown
  enhanceApp?: (ctx: { app: unknown; router: unknown; siteData: unknown }) => void | Promise<void>
  extends?: Theme
  styles?: string[]
}

function defineTheme(theme: Theme): Theme {
  return theme
}

// 导出组件
export { default as Layout } from './Layout.vue'
export { default as NotFound } from './NotFound.vue'
export { default as VPNav } from './components/VPNav.vue'
export { default as VPSidebar } from './components/VPSidebar.vue'
export { default as VPContent } from './components/VPContent.vue'
export { default as VPFooter } from './components/VPFooter.vue'
export { default as VPHome } from './components/VPHome.vue'
export { default as VPDoc } from './components/VPDoc.vue'
export { default as VPOutline } from './components/VPOutline.vue'
export { default as VPBanner } from './components/VPBanner.vue'
export { default as Demo } from './components/Demo.vue'
export { default as CodeGroup } from './components/CodeGroup.vue'

// 导出组合式函数
export * from './composables'

// 默认主题
export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app }) {
    // 注册全局 Markdown 组件
    const vueApp = app as { component: (name: string, component: unknown) => void }
    vueApp.component('Demo', Demo)
    vueApp.component('CodeGroup', CodeGroup)
  }
})
