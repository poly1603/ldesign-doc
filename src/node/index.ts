/**
 * Node.js 端模块导出
 */

export {
  resolveConfig,
  defineConfig,
  defineConfigWithTheme,
  defineThemeConfig,
  defineLocaleConfig,
  defineNav,
  defineSidebar,
  watchConfig,
  stopConfigWatcher,
  defaultConfig
} from './config'
export { createLDoc } from './createLDoc'
export { build } from './build'
export { serve } from './serve'
export { scanPages, processPage } from './pages'
export { initProject } from './init'
export { createDevServer } from './server/devServer'
export { createVitePlugins } from './vitePlugin'
export type { VitePluginOptions } from './vitePlugin'
