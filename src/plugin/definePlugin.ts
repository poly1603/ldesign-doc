/**
 * 插件定义辅助函数
 */

import type { LDocPlugin } from '../shared/types'

/**
 * 定义 LDoc 插件
 * 
 * @example
 * ```ts
 * import { definePlugin } from '@ldesign/doc'
 * 
 * export default definePlugin({
 *   name: 'my-plugin',
 *   
 *   // 配置钩子
 *   config(config) {
 *     return {
 *       ...config,
 *       title: 'Modified Title'
 *     }
 *   },
 *   
 *   // 扩展 Markdown
 *   extendMarkdown(md) {
 *     md.use(myMarkdownPlugin)
 *   },
 *   
 *   // 构建钩子
 *   buildEnd(config) {
 *     console.log('Build completed!')
 *   }
 * })
 * ```
 */
export function definePlugin(plugin: LDocPlugin): LDocPlugin {
  return plugin
}

/**
 * 定义插件工厂函数
 * 
 * @example
 * ```ts
 * import { definePluginFactory } from '@ldesign/doc'
 * 
 * export default definePluginFactory<{ prefix: string }>((options) => ({
 *   name: 'my-plugin',
 *   
 *   extendMarkdown(md) {
 *     // 使用 options.prefix
 *   }
 * }))
 * 
 * // 使用
 * import myPlugin from './my-plugin'
 * 
 * export default defineConfig({
 *   plugins: [
 *     myPlugin({ prefix: 'custom' })
 *   ]
 * })
 * ```
 */
export function definePluginFactory<T extends Record<string, unknown>>(
  factory: (options: T) => LDocPlugin
): (options: T) => LDocPlugin {
  return factory
}
