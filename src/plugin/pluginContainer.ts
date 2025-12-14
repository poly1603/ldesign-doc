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
export function createPluginContainer(config: SiteConfig): PluginContainer {
  const plugins: LDocPlugin[] = []

  return {
    async register(plugin: LDocPlugin) {
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

      plugins.push(plugin)
    },

    async callHook(name, ...args) {
      for (const plugin of plugins) {
        const hook = plugin[name as keyof LDocPlugin]
        if (typeof hook === 'function') {
          await (hook as (...args: unknown[]) => unknown)(...args)
        }
      }
    },

    async getVitePlugins() {
      const vitePlugins: VitePlugin[] = []

      for (const plugin of plugins) {
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
  // 内置插件优先级最高，然后是用户插件
  return [...plugins].sort((a, b) => {
    const aBuiltin = a.name.startsWith('ldoc:') ? 0 : 1
    const bBuiltin = b.name.startsWith('ldoc:') ? 0 : 1
    return aBuiltin - bBuiltin
  })
}
