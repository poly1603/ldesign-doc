/**
 * 构建系统
 */

import { resolve, join } from 'path'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'fs'
import { build as viteBuild, type InlineConfig } from 'vite'
import type { SiteConfig, PageData } from '../shared/types'
import type { MarkdownRenderer } from '../shared/types'
import type { PluginContainer } from '../plugin/pluginContainer'
import { normalizePath } from '../shared/utils'
import { createVitePlugins } from './vitePlugin'
import { scanPages } from './pages'
import pc from 'picocolors'

export interface BuildOptions {
  md: MarkdownRenderer
  pluginContainer: PluginContainer
}

export interface Builder {
  build: () => Promise<void>
}

/**
 * 创建构建器
 */
export function createBuilder(config: SiteConfig, options: BuildOptions): Builder {
  const { md, pluginContainer } = options

  return {
    async build() {
      console.log(pc.cyan('\n📦 Building for production...\n'))

      const startTime = Date.now()

      // 调用 buildStart 钩子
      await pluginContainer.callHook('buildStart', config)

      // 扫描所有页面
      const pages = await scanPages(config)
      console.log(pc.gray(`  Found ${pages.length} pages`))

      // 确保输出目录存在
      if (!existsSync(config.outDir)) {
        mkdirSync(config.outDir, { recursive: true })
      }

      // 生成临时文件
      await generateTempFiles(config, pages)

      // 获取 Vite 插件
      const vitePlugins = await createVitePlugins(config, {
        md,
        pluginContainer,
        command: 'build'
      })

      // 构建客户端
      const clientConfig: InlineConfig = {
        root: config.tempDir,
        base: config.base,
        mode: 'production',
        plugins: vitePlugins,
        build: {
          outDir: config.outDir,
          emptyOutDir: true,
          minify: config.build.minify,
          sourcemap: config.build.sourcemap,
          rollupOptions: {
            input: resolve(config.tempDir, 'index.html'),
            output: {
              chunkFileNames: 'assets/[name].[hash].js',
              entryFileNames: 'assets/[name].[hash].js',
              assetFileNames: 'assets/[name].[hash].[ext]'
            }
          },
          chunkSizeWarningLimit: config.build.chunkSizeWarningLimit || 500
        },
        resolve: {
          alias: {
            '@theme': config.themeDir,
            '@': config.srcDir
          }
        }
      }

      // 合并用户 Vite 配置
      if (config.vite) {
        Object.assign(clientConfig, config.vite)
      }

      // 执行构建
      await viteBuild(clientConfig)

      // SSR 构建（如果启用）
      if (config.build.ssr) {
        console.log(pc.gray('  Building SSR bundle...'))
        await buildSSR(config, vitePlugins)
      }

      // 生成静态页面
      await generateStaticPages(config, pages, md)

      // 复制公共资源
      await copyPublicAssets(config)

      // 调用 buildEnd 钩子
      await pluginContainer.callHook('buildEnd', config)

      // 调用用户钩子
      if (config.buildEnd) {
        await config.buildEnd(config)
      }

      const endTime = Date.now()
      console.log(pc.green(`\n✓ Build completed in ${endTime - startTime}ms`))
      console.log(pc.gray(`  Output: ${config.outDir}\n`))
    }
  }
}

/**
 * 导出 build 函数
 */
export async function build(root: string = process.cwd()): Promise<void> {
  const { resolveConfig } = await import('./config')
  const { createMarkdownRenderer } = await import('../markdown/createMarkdown')
  const { createPluginContainer } = await import('../plugin/pluginContainer')

  const config = await resolveConfig(root, 'build', 'production')
  const pluginContainer = createPluginContainer(config)
  const md = await createMarkdownRenderer(config)

  const builder = createBuilder(config, { md, pluginContainer })
  await builder.build()
}

/**
 * 生成临时文件
 */
async function generateTempFiles(config: SiteConfig, pages: PageData[]): Promise<void> {
  const tempDir = config.tempDir

  // 确保临时目录存在
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  // 生成路由文件
  const routes = pages.map((page, index) => ({
    path: '/' + page.relativePath.replace(/\.md$/, '.html').replace(/index\.html$/, ''),
    component: `Page${index}`,
    meta: {
      frontmatter: page.frontmatter,
      title: page.title
    }
  }))

  const routesContent = `
// Auto-generated routes
${pages.map((page, index) => `import Page${index} from '${normalizePath(page.filePath)}'`).join('\n')}

export const routes = [
${routes.map((route, index) => `  {
    path: '${route.path || '/'}',
    component: Page${index},
    meta: ${JSON.stringify(route.meta)}
  }`).join(',\n')}
]
`

  writeFileSync(resolve(tempDir, 'routes.js'), routesContent)

  // 生成入口文件
  const entryContent = `
import { createApp } from '@ldesign/doc/client'
import { routes } from './routes.js'
import Theme from '@theme'

const app = createApp({
  routes,
  theme: Theme
})

app.mount('#app')
`

  writeFileSync(resolve(tempDir, 'main.js'), entryContent)

  // 生成 HTML 模板
  const htmlContent = `<!DOCTYPE html>
<html lang="${config.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description}">
  ${config.head.map(tag => {
    const [tagName, attrs, content] = tag
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    return content ? `<${tagName} ${attrStr}>${content}</${tagName}>` : `<${tagName} ${attrStr}>`
  }).join('\n  ')}
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
`

  writeFileSync(resolve(tempDir, 'index.html'), htmlContent)
}

/**
 * SSR 构建
 */
async function buildSSR(config: SiteConfig, vitePlugins: unknown[]): Promise<void> {
  const ssrConfig: InlineConfig = {
    root: config.tempDir,
    base: config.base,
    mode: 'production',
    plugins: vitePlugins as never,
    build: {
      outDir: resolve(config.outDir, '.server'),
      ssr: resolve(config.tempDir, 'main.js'),
      minify: false,
      rollupOptions: {
        output: {
          format: 'esm'
        }
      }
    }
  }

  await viteBuild(ssrConfig)
}

/**
 * 生成静态页面
 */
async function generateStaticPages(
  config: SiteConfig,
  pages: PageData[],
  md: MarkdownRenderer
): Promise<void> {
  // TODO: 实现静态页面生成（SSG）
  console.log(pc.gray(`  Generating ${pages.length} static pages...`))
}

/**
 * 复制公共资源
 */
async function copyPublicAssets(config: SiteConfig): Promise<void> {
  const publicDir = resolve(config.srcDir, 'public')
  if (!existsSync(publicDir)) return

  const copyDir = (src: string, dest: string) => {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true })
    }

    const items = readdirSync(src)
    for (const item of items) {
      const srcPath = join(src, item)
      const destPath = join(dest, item)

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  copyDir(publicDir, config.outDir)
}
