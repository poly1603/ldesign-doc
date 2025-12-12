/**
 * @ldesign/doc - 现代化文档系统
 * 
 * 支持 Vue/React 组件渲染、主题系统、插件系统
 */

// 导出类型
export type * from './shared/types'

// 导出核心功能
export { defineConfig, defineConfigWithTheme, resolvePlugins } from './node/config'
export { createLDoc } from './node/createLDoc'
export { build } from './node/build'
export { serve } from './node/serve'

// 导出主题 API
export { defineTheme, defineThemeFactory } from './theme/defineTheme'
export type { Theme, EnhanceAppContext } from './shared/types'

// 导出插件 API
export { definePlugin, definePluginFactory } from './plugin/definePlugin'
export type {
  LDocPlugin,
  PluginContext,
  ConfigEnv,
  HotUpdateContext,
  // 插件 Slot 系统类型
  PluginSlotName,
  PluginSlotComponent,
  PluginSlots,
  PluginGlobalComponent
} from './shared/types'

// 导出 Markdown API
export { createMarkdownRenderer } from './markdown/createMarkdown'
export type { MarkdownRenderer, MarkdownOptions } from './shared/types'

// 导出工具函数
export * from './shared/utils'

// 导出内置插件
export * from './plugins'
