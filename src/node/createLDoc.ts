/**
 * 创建 LDoc 实例
 */

import type { SiteConfig, LDocPlugin, PageData } from '../shared/types'
import { resolveConfig } from './config'
import { createDevServer } from './server/devServer'
import { createBuilder } from './build'
import { createMarkdownRenderer } from '../markdown/createMarkdown'
import { createPluginContainer } from '../plugin/pluginContainer'

export interface LDocInstance {
  config: SiteConfig

  // 服务器相关
  serve: () => Promise<{ close: () => Promise<void>; port: number }>

  // 构建相关
  build: () => Promise<void>

  // Markdown 渲染
  renderMarkdown: (content: string, filePath?: string) => Promise<string>

  // 插件系统
  use: (plugin: LDocPlugin) => LDocInstance

  // 页面数据
  getPageData: (filePath: string) => Promise<PageData | null>

  // 热更新
  onUpdate: (callback: () => void) => void

  // 关闭实例
  close: () => Promise<void>
}

/**
 * 创建 LDoc 实例
 */
export async function createLDoc(
  root: string = process.cwd(),
  options: {
    command?: 'serve' | 'build'
    mode?: 'development' | 'production'
  } = {}
): Promise<LDocInstance> {
  const { command = 'serve', mode = 'development' } = options

  // 解析配置
  const config = await resolveConfig(root, command, mode)

  // 创建插件容器
  const pluginContainer = createPluginContainer(config)

  // 应用用户插件
  for (const plugin of config.userPlugins) {
    await pluginContainer.register(plugin)
  }

  // 调用 configResolved 钩子
  await pluginContainer.callHook('configResolved', config)

  // 创建 Markdown 渲染器
  const md = await createMarkdownRenderer(config)

  // 扩展 Markdown（通过插件）
  await pluginContainer.callHook('extendMarkdown', md)

  // 更新回调列表
  const updateCallbacks: Array<() => void> = []

  // 服务器实例引用
  let server: Awaited<ReturnType<typeof createDevServer>> | null = null

  const instance: LDocInstance = {
    config,

    async serve() {
      server = await createDevServer(config, {
        md,
        pluginContainer,
        onUpdate: () => updateCallbacks.forEach(cb => cb())
      })
      return {
        close: () => server!.close(),
        port: server.port
      }
    },

    async build() {
      const builder = createBuilder(config, {
        md,
        pluginContainer
      })
      await builder.build()
    },

    async renderMarkdown(content: string, filePath?: string) {
      const env = filePath ? { path: filePath } : {}
      return md.render(content, env)
    },

    use(plugin: LDocPlugin) {
      pluginContainer.register(plugin)
      return instance
    },

    async getPageData(filePath: string) {
      // TODO: 实现页面数据获取
      return null
    },

    onUpdate(callback: () => void) {
      updateCallbacks.push(callback)
    },

    async close() {
      if (server) {
        await server.close()
      }
    }
  }

  return instance
}
