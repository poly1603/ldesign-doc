/**
 * 插件容器 - 管理和执行插件
 */

import type { Plugin as VitePlugin } from 'vite'
import type {
  SiteConfig,
  LDocPlugin,
  MarkdownRenderer,
  PageData,
  Route,
  HotUpdateContext,
  ConfigEnv
} from '../shared/types'
import {
  resolvePluginDependencies,
  validatePluginConfig,
  composePlugins,
  detectPluginConflicts,
  formatValidationErrors,
  formatConflicts
} from './pluginSystem'

export interface PluginContainer {
  register: (plugin: LDocPlugin) => Promise<void>
  callHook: <K extends keyof PluginHooks>(
    name: K,
    ...args: Parameters<NonNullable<PluginHooks[K]>>
  ) => Promise<void>
  getVitePlugins: () => Promise<VitePlugin[]>
}

interface PluginHooks {
  configResolved: (config: SiteConfig) => void | Promise<void>
  extendMarkdown: (md: MarkdownRenderer) => void
  extendPageData: (pageData: PageData, ctx: { siteConfig: SiteConfig; content: string; filePath: string; relativePath: string }) => void | Promise<void>
  extendRoutes: (routes: Route[]) => Route[] | void
  buildStart: (config: SiteConfig) => void | Promise<void>
  buildEnd: (config: SiteConfig) => void | Promise<void>
  generateBundle: (config: SiteConfig) => void | Promise<void>
  handleHotUpdate: (ctx: HotUpdateContext) => void | Promise<void>
}

/**
 * 创建插件容器
 */
export function createPluginContainer(config: SiteConfig, plugins: LDocPlugin[] = []): PluginContainer {
  // 验证所有插件配置
  const allErrors: string[] = []
  for (const plugin of plugins) {
    const errors = validatePluginConfig(plugin)
    if (errors.length > 0) {
      allErrors.push(formatValidationErrors(errors))
    }
  }

  if (allErrors.length > 0) {
    throw new Error(allErrors.join('\n\n'))
  }

  // 检测冲突（仅警告，不阻止）
  const conflicts = detectPluginConflicts(plugins)
  if (conflicts.length > 0) {
    console.warn(formatConflicts(conflicts))
  }

  const registeredPlugins: LDocPlugin[] = [...plugins]

  const getComposedPlugins = (): LDocPlugin[] => {
    const composed = composePlugins(registeredPlugins)
    const sorted = sortPlugins(composed)
    return resolvePluginDependencies(sorted)
  }

  return {
    async register(plugin: LDocPlugin) {
      // 验证插件配置
      const errors = validatePluginConfig(plugin)
      if (errors.length > 0) {
        throw new Error(formatValidationErrors(errors))
      }

      // 调用插件的 config 钩子
      if (plugin.config) {
        const env: ConfigEnv = {
          mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
          command: process.env.NODE_ENV === 'production' ? 'build' : 'serve'
        }

        const result = await plugin.config(config as never, env)
        if (result) {
          Object.assign(config, result)
        }
      }

      registeredPlugins.push(plugin)
    },

    async callHook(name, ...args) {
      for (const plugin of getComposedPlugins()) {
        const hook = plugin[name as keyof LDocPlugin]
        if (typeof hook === 'function') {
          await (hook as (...args: unknown[]) => unknown)(...args)
        }
      }
    },

    async getVitePlugins() {
      const vitePlugins: VitePlugin[] = []

      for (const plugin of getComposedPlugins()) {
        if (plugin.vitePlugins) {
          const pluginsFromHook = await plugin.vitePlugins()
          vitePlugins.push(...pluginsFromHook)
        }
      }

      return vitePlugins
    }
  }
}

/**
 * 排序插件（按优先级）
 */
export function sortPlugins(plugins: LDocPlugin[]): LDocPlugin[] {
  return [...plugins].sort((a, b) => {
    // 获取优先级值
    const getPriority = (plugin: LDocPlugin): number => {
      if (plugin.enforce === 'pre') return -1000
      if (plugin.enforce === 'post') return 1000
      if (typeof plugin.enforce === 'number') return plugin.enforce

      // 内置插件默认优先级较高
      return plugin.name.startsWith('ldoc:') ? 0 : 100
    }

    return getPriority(a) - getPriority(b)
  })
}
