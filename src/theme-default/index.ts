/**
 * 默认主题入口
 */

import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import { setThemeTransition } from '@ldesign/doc/client'

// 导入默认主题样式（供继承的主题使用）
import './styles/index.css'
// 导入库运行时样式（包含 LDocModal/PluginUI 等全局样式）

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
  enhanceApp({ app, siteData }) {
    // 注册全局 Markdown 组件
    const vueApp = app as { component: (name: string, component: unknown) => void }
    vueApp.component('Demo', Demo)
    vueApp.component('CodeGroup', CodeGroup)

    // 根据配置设置暗黑模式切换动画与全局 UI 动画变量
    if (typeof document !== 'undefined') {
      try {
        const sd = siteData as any
        const ui = sd?.themeConfig?.ui || {}

        // 暗黑模式切换动画
        if (ui.darkMode) {
          setThemeTransition(ui.darkMode.transition || 'circle', ui.darkMode.duration)
        }

        const root = document.documentElement

        // 顶部进度条
        if (ui.progressBar) {
          if (ui.progressBar.height != null) {
            root.style.setProperty('--ldoc-progress-height', `${ui.progressBar.height}px`)
          }
          if (ui.progressBar.color) {
            root.style.setProperty('--ldoc-progress-color', ui.progressBar.color)
          }
        }

        // 公共方法：根据类型映射 transform
        const mapTransform = (type?: string) => {
          switch (type) {
            case 'fade':
              return 'scale(1) translateY(0)'
            case 'zoom':
              return 'scale(0.96) translateY(8px)'
            case 'slide-up':
              return 'translateY(16px)'
            case 'scale':
            default:
              return 'scale(0.9)'
          }
        }

        // Modal（通用模态）
        if (ui.modal) {
          if (ui.modal.enterDuration != null) root.style.setProperty('--ldoc-modal-enter-duration', `${ui.modal.enterDuration}ms`)
          if (ui.modal.easing) root.style.setProperty('--ldoc-modal-ease', ui.modal.easing)
          root.style.setProperty('--ldoc-modal-transform-from', mapTransform(ui.modal.type))
        }

        // 搜索弹窗
        if (ui.searchModal) {
          if (ui.searchModal.enterDuration != null) root.style.setProperty('--ldoc-search-enter-duration', `${ui.searchModal.enterDuration}ms`)
          if (ui.searchModal.leaveDuration != null) root.style.setProperty('--ldoc-search-leave-duration', `${ui.searchModal.leaveDuration}ms`)
          if (ui.searchModal.easing) root.style.setProperty('--ldoc-search-ease', ui.searchModal.easing)
          root.style.setProperty('--ldoc-search-transform-from', mapTransform(ui.searchModal.type))
        }

        // 登录弹窗
        if (ui.loginModal) {
          if (ui.loginModal.enterDuration != null) root.style.setProperty('--ldoc-login-enter-duration', `${ui.loginModal.enterDuration}ms`)
          if (ui.loginModal.easing) root.style.setProperty('--ldoc-login-ease', ui.loginModal.easing)
          root.style.setProperty('--ldoc-login-transform-from', mapTransform(ui.loginModal.type))
        }
      } catch (err) {
        // 忽略配置错误
        console.warn('[ldoc theme] Failed to apply UI config:', err)
      }
    }
  }
})
