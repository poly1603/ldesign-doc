/**
 * 开发服务器
 */

import { resolve } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import type { SiteConfig, MarkdownRenderer } from '../../shared/types'
import type { PluginContainer } from '../../plugin/pluginContainer'
import { createVitePlugins } from '../vitePlugin'
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
  const { md, pluginContainer, onUpdate } = options

  // 确保临时目录存在
  await prepareTempDir(config)

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
        // 监听源目录和主题目录
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
      await server.restart()
    }
  }
}

/**
 * 准备临时目录
 */
async function prepareTempDir(config: SiteConfig): Promise<void> {
  const { tempDir, srcDir, themeDir, title, description, lang, head, base } = config

  // 创建临时目录
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  // 生成入口 HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${head.map(tag => {
    const [tagName, attrs, content] = tag
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    return content ? `<${tagName} ${attrStr}>${content}</${tagName}>` : `<${tagName} ${attrStr}>`
  }).join('\n  ')}
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.ts"></script>
</body>
</html>
`

  writeFileSync(resolve(tempDir, 'index.html'), htmlContent)

  // 生成主入口文件
  const mainContent = `
import { createApp, ref, provide, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import Layout from '@theme/Layout.vue'

// 导入主题样式
import '@theme/styles/index.css'

// 站点数据
const siteData = ref({
  base: '${base}',
  title: '${title}',
  description: '${description}',
  lang: '${lang}',
  themeConfig: ${JSON.stringify(config.themeConfig)},
  locales: {},
  head: []
})

// 页面数据
const pageData = ref({
  title: '',
  description: '',
  frontmatter: {},
  headers: [],
  relativePath: '',
  filePath: ''
})

// Injection symbols - 使用 Symbol.for 确保跨模块共享
const pageDataSymbol = Symbol.for('ldoc:pageData')
const siteDataSymbol = Symbol.for('ldoc:siteData')

// 提供给 @ldesign/doc/client 使用
window.__LDOC_PAGE_DATA__ = pageData
window.__LDOC_SITE_DATA__ = siteData

const router = createRouter({
  history: createWebHistory('${base}'),
  routes
})

// 路由守卫 - 更新页面数据
router.beforeResolve(async (to) => {
  const meta = to.meta || {}
  pageData.value = {
    title: meta.title || siteData.value.title,
    description: meta.description || siteData.value.description,
    frontmatter: meta.frontmatter || {},
    headers: meta.headers || [],
    relativePath: to.path,
    filePath: to.path
  }
  
  document.title = pageData.value.title 
    ? pageData.value.title + ' | ' + siteData.value.title
    : siteData.value.title
})

// 创建根组件
const RootComponent = {
  setup() {
    provide(pageDataSymbol, pageData)
    provide(siteDataSymbol, siteData)
    return () => h(Layout)
  }
}

const app = createApp(RootComponent)
app.use(router)
app.mount('#app')

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
`

  writeFileSync(resolve(tempDir, 'main.ts'), mainContent)

  // 扫描 markdown 文件生成路由
  const routes = await generateRoutes(srcDir)

  const routesContent = `
// Auto-generated routes
export const routes = [
${routes.map(r => `  {
    path: '${r.path}',
    component: () => import('${r.file}'),
    meta: { title: '${r.title || ''}' }
  }`).join(',\n')},
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@theme/NotFound.vue')
  }
]
`

  writeFileSync(resolve(tempDir, 'routes.ts'), routesContent)
}

/**
 * 扫描目录生成路由
 */
async function generateRoutes(srcDir: string): Promise<Array<{ path: string; file: string; title?: string }>> {
  const routes: Array<{ path: string; file: string; title?: string }> = []

  const scanDir = async (dir: string, prefix: string = '') => {
    const entries = await import('fs').then(fs => fs.promises.readdir(dir, { withFileTypes: true }))

    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name)

      if (entry.isDirectory()) {
        // 递归扫描子目录
        await scanDir(fullPath, `${prefix}/${entry.name}`)
      } else if (entry.name.endsWith('.md')) {
        // 转换路径
        let routePath = prefix
        const baseName = entry.name.replace(/\.md$/, '')

        if (baseName === 'index') {
          routePath = prefix || '/'
        } else {
          routePath = `${prefix}/${baseName}`
        }

        // 确保路径以 / 开头
        if (!routePath.startsWith('/')) {
          routePath = '/' + routePath
        }

        routes.push({
          path: routePath,
          file: fullPath.replace(/\\/g, '/'),
          title: baseName === 'index' ? '' : baseName
        })
      }
    }
  }

  await scanDir(srcDir)
  return routes
}
