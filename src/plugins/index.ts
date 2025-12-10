/**
 * 内置插件导出
 */

export { vuePlugin } from './vue'
export type { VuePluginOptions } from './vue'

export { reactPlugin } from './react'
export type { ReactPluginOptions } from './react'

export { authPlugin, createLocalStorageAuthProvider, defineAuthProvider } from './auth'
export type { AuthPluginOptions } from './auth'
