/**
 * ldoc-theme-minimal
 * LDoc theme - minimal
 */

import type { Theme, EnhanceAppContext } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导入样式
import './styles/index.css'

/**
 * 主题配置选项
 */
export interface MinimalThemeOptions {
  /**
   * 主色调
   */
  primaryColor?: string
}

/**
 * 创建主题
 */
export function createMinimalTheme(options: MinimalThemeOptions = {}): Theme {
  return {
    Layout,
    NotFound,
    
    enhanceApp({ app, router, siteData }: EnhanceAppContext) {
      // 注册全局组件
      // app.component('CustomComponent', CustomComponent)
      
      // 设置主色调
      if (options.primaryColor && typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--theme-primary', options.primaryColor)
      }
    }
  }
}

// 导出默认主题
export const theme: Theme = {
  Layout,
  NotFound
}

// 导出组件供自定义使用
export { Layout, NotFound }

export default theme
