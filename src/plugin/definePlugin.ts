/**
 * 插件定义辅助函数
 */

import type { LDocPlugin, PluginMeta } from '../shared/types'

/**
 * 插件定义选项
 * 扩展 LDocPlugin，添加开发时的额外配置
 */
export interface PluginDefinition extends LDocPlugin {
  /**
   * 插件元数据
   * 用于描述插件信息，显示在插件列表中
   */
  meta?: PluginMeta
}

/**
 * 插件验证错误
 */
export class PluginDefinitionError extends Error {
  constructor(
    public readonly pluginName: string,
    public readonly field: string,
    message: string
  ) {
    super(`插件 "${pluginName}" 定义错误: ${field} - ${message}`)
    this.name = 'PluginDefinitionError'
  }
}

/**
 * 验证插件名称格式
 */
function validatePluginName(name: string): void {
  if (!name || typeof name !== 'string') {
    throw new PluginDefinitionError(name || 'unknown', 'name', '插件名称是必需的字符串')
  }

  // 插件名称格式: 小写字母、数字、连字符、冒号、@、/
  if (!/^[a-z0-9-:@/]+$/.test(name)) {
    throw new PluginDefinitionError(
      name,
      'name',
      '插件名称只能包含小写字母、数字、连字符(-)、冒号(:)、@ 和 /'
    )
  }
}

/**
 * 验证插件 enforce 字段
 */
function validateEnforce(name: string, enforce: unknown): void {
  if (enforce === undefined) return

  if (typeof enforce === 'string') {
    if (enforce !== 'pre' && enforce !== 'post') {
      throw new PluginDefinitionError(
        name,
        'enforce',
        `enforce 字符串值必须是 "pre" 或 "post"，当前值: "${enforce}"`
      )
    }
  } else if (typeof enforce !== 'number') {
    throw new PluginDefinitionError(
      name,
      'enforce',
      'enforce 必须是 "pre"、"post" 或数字'
    )
  }
}

/**
 * 定义 LDoc 插件
 * 
 * @example
 * ```ts
 * import { definePlugin } from '@ldesign/doc'
 * 
 * export default definePlugin({
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   
 *   // 插件元数据（可选）
 *   meta: {
 *     description: '我的自定义插件',
 *     author: 'Your Name',
 *     homepage: 'https://github.com/your/repo'
 *   },
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
 *   },
 *   
 *   // UI 插槽
 *   slots: {
 *     'nav-bar-content-after': {
 *       component: MyComponent,
 *       order: 10
 *     }
 *   }
 * })
 * ```
 * 
 * @param plugin - 插件定义对象
 * @returns 验证后的插件对象
 * @throws {PluginDefinitionError} 当插件定义无效时
 */
export function definePlugin(plugin: PluginDefinition): LDocPlugin {
  // 验证插件名称
  validatePluginName(plugin.name)

  // 验证 enforce
  validateEnforce(plugin.name, plugin.enforce)

  // 验证依赖声明
  if (plugin.dependencies) {
    if (!Array.isArray(plugin.dependencies)) {
      throw new PluginDefinitionError(
        plugin.name,
        'dependencies',
        'dependencies 必须是数组'
      )
    }

    for (let i = 0; i < plugin.dependencies.length; i++) {
      const dep = plugin.dependencies[i]
      if (!dep.name || typeof dep.name !== 'string') {
        throw new PluginDefinitionError(
          plugin.name,
          `dependencies[${i}].name`,
          '依赖名称是必需的字符串'
        )
      }
    }
  }

  // 返回插件对象
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
