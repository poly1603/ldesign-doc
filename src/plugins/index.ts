/**
 * 内置插件导出
 * 
 * 所有插件都可以在 doc.config.ts 中直接配置使用
 * 
 * @example
 * ```ts
 * import { defineConfig } from '@ldesign/doc'
 * import { 
 *   commentPlugin, 
 *   searchPlugin, 
 *   progressPlugin,
 *   imageViewerPlugin,
 *   copyCodePlugin,
 *   lastUpdatedPlugin,
 *   readingTimePlugin
 * } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     commentPlugin({ provider: 'giscus', giscus: { ... } }),
 *     searchPlugin({ hotkeys: ['/', 'Ctrl+K'] }),
 *     progressPlugin({ color: '#3b82f6' }),
 *     imageViewerPlugin({ zoom: true }),
 *     copyCodePlugin({ showLanguage: true }),
 *     lastUpdatedPlugin({ useGitTime: true }),
 *     readingTimePlugin({ wordsPerMinute: 200 })
 *   ]
 * })
 * ```
 */

// ============== 框架支持插件 ==============

export { vuePlugin } from './vue'
export type { VuePluginOptions } from './vue'

export { reactPlugin } from './react'
export type { ReactPluginOptions } from './react'

// ============== 认证插件 ==============

export { authPlugin, createLocalStorageAuthProvider, defineAuthProvider } from './auth'
export type { AuthPluginOptions } from './auth'

// ============== 搜索插件 ==============

export { searchPlugin } from './search'
export type { SearchPluginOptions } from './search'

// ============== 评论系统插件 ==============

export { commentPlugin } from './comment'
export type {
  CommentPluginOptions,
  CommentProvider,
  GiscusOptions,
  GitalkOptions,
  WalineOptions,
  TwikooOptions,
  ArtalkOptions
} from './comment'

// ============== 阅读进度条插件 ==============

export { progressPlugin } from './progress'
export type { ProgressPluginOptions } from './progress'

// ============== 图片预览插件 ==============

export { imageViewerPlugin } from './image-viewer'
export type { ImageViewerPluginOptions } from './image-viewer'

// ============== 代码复制插件 ==============

export { copyCodePlugin } from './copy-code'
export type { CopyCodePluginOptions } from './copy-code'

// ============== 最后更新时间插件 ==============

export { lastUpdatedPlugin } from './last-updated'
export type { LastUpdatedPluginOptions } from './last-updated'

// ============== 阅读时间插件 ==============

export { readingTimePlugin } from './reading-time'
export type { ReadingTimePluginOptions } from './reading-time'
