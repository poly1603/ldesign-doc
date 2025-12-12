/**
 * 开发服务器 - 重构版
 */

import { resolve, dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
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
 * 获取客户端别名配置
 */
function getClientAlias(config: SiteConfig, userViteConfig: any): Record<string, string> {
  const alias: Record<string, string> = {
    '@theme': config.themeDir,
    '@': config.srcDir
  }

  // 合并用户的 alias 配置（只处理对象格式）
  const userAlias = (userViteConfig.resolve as Record<string, unknown>)?.alias
  if (userAlias && typeof userAlias === 'object' && !Array.isArray(userAlias)) {
    Object.assign(alias, userAlias)
  }

  // 智能解析 @ldesign/doc/client 路径
  const nodeModulesPath = resolve(config.root, 'node_modules/@ldesign/doc/dist/es/client/index.js')
  // 检查是否在 @ldesign/doc 包内部开发
  const packageRoot = resolve(__dirname, '../../..')  // dist/es/node -> 包根目录
  const localClientPath = resolve(packageRoot, 'dist/es/client/index.js')
  const srcClientPath = resolve(packageRoot, 'src/client/index.ts')

  if (existsSync(nodeModulesPath)) {
    alias['@ldesign/doc/client'] = nodeModulesPath
  } else if (existsSync(localClientPath)) {
    alias['@ldesign/doc/client'] = localClientPath
  } else if (existsSync(srcClientPath)) {
    alias['@ldesign/doc/client'] = srcClientPath
  }

  return alias
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

  // 获取用户的 vite 配置
  const userViteConfig = config.vite || {}
  const userServerConfig = userViteConfig.server || {}

  // 创建 Vite 开发服务器（合并用户配置）
  const server = await createViteServer({
    root: config.tempDir,
    base: config.base,
    mode: 'development',
    plugins: vitePlugins,
    server: {
      port: userServerConfig.port || 5173,
      strictPort: userServerConfig.strictPort ?? false,
      host: userServerConfig.host ?? true,
      open: userServerConfig.open ?? false,
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**']
      },
      ...userServerConfig
    },
    resolve: {
      alias: getClientAlias(config, userViteConfig)
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', ...(userViteConfig.optimizeDeps?.include || [])]
    },
    // 其他用户 vite 配置
    css: userViteConfig.css,
    define: userViteConfig.define,
    esbuild: userViteConfig.esbuild
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

  // 清理旧的临时目录，确保使用最新数据
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true })
    console.log(pc.gray('[ldoc] Cleared temp directory'))
  }

  // 创建新的临时目录
  mkdirSync(tempDir, { recursive: true })

  // 生成路由数据
  const routes = await generateRoutes(config)

  // 调试：打印首页的 frontmatter
  const indexRoute = routes.find(r => r.path === '/')
  if (indexRoute) {
    console.log(pc.cyan('[ldoc] Index page frontmatter:'))
    console.log(pc.gray(`  hero.name: ${(indexRoute.frontmatter.hero as any)?.name || 'N/A'}`))
    console.log(pc.gray(`  hero.text: ${(indexRoute.frontmatter.hero as any)?.text || 'N/A'}`))
  }

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
