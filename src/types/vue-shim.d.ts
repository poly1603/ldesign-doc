/**
 * Vue 单文件组件类型声明
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// 虚拟模块声明
declare module 'virtual:ldoc/site-data' {
  export const siteData: import('../shared/types').SiteData
}

declare module 'virtual:ldoc/theme-config' {
  export const themeConfig: import('../shared/types').ThemeConfig
}

declare module 'virtual:ldoc/page-data' {
  export function usePageData(): import('../shared/types').PageData
}

declare module '@theme' {
  import type { Theme } from '../shared/types'
  const theme: Theme
  export default theme
}

declare module '@theme/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
