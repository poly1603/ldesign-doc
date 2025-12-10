/**
 * 主题定义辅助函数
 */

import type { Theme } from '../shared/types'

/**
 * 定义主题
 * 
 * @example
 * ```ts
 * import { defineTheme } from '@ldesign/doc'
 * import Layout from './Layout.vue'
 * import NotFound from './NotFound.vue'
 * 
 * export default defineTheme({
 *   Layout,
 *   NotFound,
 *   
 *   enhanceApp({ app, router, siteData }) {
 *     // 注册全局组件
 *     app.component('MyComponent', MyComponent)
 *   }
 * })
 * ```
 */
export function defineTheme(theme: Theme): Theme {
  return theme
}

/**
 * 定义主题工厂函数
 * 
 * @example
 * ```ts
 * import { defineThemeFactory } from '@ldesign/doc'
 * 
 * export default defineThemeFactory<{ primaryColor: string }>((options) => ({
 *   Layout,
 *   NotFound,
 *   
 *   enhanceApp({ app }) {
 *     // 使用 options.primaryColor
 *   }
 * }))
 * ```
 */
export function defineThemeFactory<T extends Record<string, unknown>>(
  factory: (options: T) => Theme
): (options: T) => Theme {
  return factory
}
