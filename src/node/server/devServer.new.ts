/**
 * 开发服务器 - 重构版
 */

import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import type { SiteConfig, MarkdownRenderer } from '../../shared/types'
import type { PluginContainer } from '../../plugin/pluginContainer'
import { createVitePlugins } from '../vitePlugin'
import { generateRoutes, generateRoutesCode, generateSiteDataCode, generateMainCode, generateHtmlTemplate } from '../core/siteData'
import pc from 'picocolors'

export interface DevServerOptions {
  md: MarkdownRenderer
  pluginContainer: PluginContainer
  onUpdate?: () => void
}

export interface DevServer {
  server: ViteDevServer
  port: number
  close: () => Promise<void>
  restart: () => Promise<void>
}

/**
 * 创建开发服务器
 */
export async function createDevServer(
  config: SiteConfig,
  options: DevServerOptions
): Promise<DevServer> {
  const { md, pluginContainer } = options

  // 生成临时文件
  await generateTempFiles(config)

  // 创建 Vite 插件
  const vitePlugins = await createVitePlugins(config, {
    md,
    pluginContainer,
    command: 'serve'
  })

  // 创建 Vite 开发服务器
  const server = await createViteServer({
    root: config.tempDir,
    base: config.base,
    mode: 'development',
    plugins: vitePlugins,
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      open: false,
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**']
      }
    },
    resolve: {
      alias: {
        '@theme': config.themeDir,
        '@': config.srcDir,
        '@ldesign/doc/client': resolve(config.root, 'node_modules/@ldesign/doc/dist/es/client/index.js')
      }
    },
    optimizeDeps: {
      include: ['vue', 'vue-router']
    }
  })

  // 启动服务器
  await server.listen()

  const address = server.httpServer?.address()
  const port = typeof address === 'object' && address ? address.port : 5173

  // 打印服务器信息
  console.log()
  console.log(pc.green('  ✓ LDoc dev server running at:'))
  console.log()
  console.log(`    ${pc.cyan('Local:')}   ${pc.blue(`http://localhost:${port}${config.base}`)}`)
  console.log(`    ${pc.cyan('Network:')} ${pc.blue(`http://0.0.0.0:${port}${config.base}`)}`)
  console.log()
  console.log(pc.gray('  press h to show help'))
  console.log()

  return {
    server,
    port,

    async close() {
      await server.close()
    },

    async restart() {
      await generateTempFiles(config)
      await server.restart()
    }
  }
}

/**
 * 生成临时文件
 */
async function generateTempFiles(config: SiteConfig): Promise<void> {
  const tempDir = config.tempDir

  // 确保临时目录存在
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  // 生成路由数据
  const routes = await generateRoutes(config)

  // 写入路由文件
  const routesCode = generateRoutesCode(routes, 'dev')
  writeFileSync(resolve(tempDir, 'routes.ts'), routesCode)

  // 写入站点数据文件
  const siteDataCode = generateSiteDataCode(config)
  writeFileSync(resolve(tempDir, 'siteData.ts'), siteDataCode)

  // 写入主入口文件
  const mainCode = generateMainCode(config)
  writeFileSync(resolve(tempDir, 'main.ts'), mainCode)

  // 写入 HTML 模板
  const htmlTemplate = generateHtmlTemplate(config)
  writeFileSync(resolve(tempDir, 'index.html'), htmlTemplate)
}
