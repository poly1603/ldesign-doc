/**
 * 创建 LDoc 实例
 */

import type { SiteConfig, LDocPlugin, PageData } from '../shared/types'
import { resolveConfig } from './config'
import { createDevServer } from './server/devServer'
import { createBuilder } from './build'
import { createMarkdownRenderer } from '../markdown/createMarkdown'
import { createPluginContainer } from '../plugin/pluginContainer'
import { createAdminServer } from './admin'
import { createBuildCache } from './cache'
import * as logger from './logger'

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
  logger.printBuildStep('Loading plugins', `${config.userPlugins.length} registered`)
  for (const plugin of config.userPlugins) {
    await pluginContainer.register(plugin)
  }

  // 调用 configResolved 钩子
  await pluginContainer.callHook('configResolved', config)

  // 创建构建缓存（dev 模式也可以使用缓存提升性能）
  const cacheEnabled = config.build.cache?.enabled !== false
  const cache = cacheEnabled
    ? createBuildCache(root, {
        cacheDir: config.build.cache?.cacheDir || config.cacheDir,
        maxAge: config.build.cache?.maxAge,
        enabled: true
      })
    : undefined

  // 创建 Markdown 渲染器
  const md = await createMarkdownRenderer(config, cache)

  // 扩展 Markdown（通过插件）
  await pluginContainer.callHook('extendMarkdown', md)

  // 更新回调列表
  const updateCallbacks: Array<() => void> = []

  // 服务器实例引用
  let server: Awaited<ReturnType<typeof createDevServer>> | null = null
  let adminServer: ReturnType<typeof createAdminServer> | null = null

  const instance: LDocInstance = {
    config,

    async serve() {
      server = await createDevServer(config, {
        md,
        pluginContainer,
        onUpdate: () => updateCallbacks.forEach(cb => cb())
      })

      // 启动管理系统服务器
      const adminPort = server.port + 1
      adminServer = createAdminServer(config, { port: adminPort, docsPort: server.port })

      // 打印额外信息
      logger.printKeyValues([
        { key: '📄 Docs', value: `http://localhost:${server.port}${config.base}` },
        { key: '⚙️  Admin', value: `http://localhost:${adminPort}/` }
      ])
      logger.printNewLine()

      return {
        close: async () => {
          await server!.close()
          adminServer?.close()
        },
        port: server.port
      }
    },

    async build() {
      const builder = createBuilder(config, {
        md,
        pluginContainer,
        cache
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
      if (adminServer) {
        adminServer.close()
      }
    }
  }

  return instance
}
