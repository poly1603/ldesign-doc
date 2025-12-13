/**
 * 构建系统
 */

import { resolve, join, dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'fs'
import { build as viteBuild, type InlineConfig } from 'vite'
import { fileURLToPath } from 'url'
import type { SiteConfig, PageData } from '../shared/types'
import type { MarkdownRenderer } from '../shared/types'
import type { PluginContainer } from '../plugin/pluginContainer'
import { normalizePath } from '../shared/utils'
import { createVitePlugins } from './vitePlugin'
import { scanPages } from './pages'
import { generateRoutes, generateRoutesCode, generateSiteDataCode, generateMainCode, generateHtmlTemplate, pageDataToRoutes } from './core/siteData'
import pc from 'picocolors'

// 获取当前包的根目录
const __dirname = dirname(fileURLToPath(import.meta.url))
// 构建后目录结构是 dist/es/node/build.js，需要向上 3 层
// 开发时是 src/node/build.ts，向上 2 层
const LDOC_PKG_ROOT = __dirname.includes('dist')
  ? resolve(__dirname, '../../..')
  : resolve(__dirname, '../..')

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

      // 调用 extendPageData 钩子，让插件扩展页面数据
      console.log(pc.gray(`  Extending page data with plugins (${config.userPlugins.length} plugins)...`))
      for (const page of pages) {
        const pageContext = {
          siteConfig: config,
          content: '', // build 时内容已处理
          filePath: page.filePath,
          relativePath: page.relativePath
        }
        await pluginContainer.callHook('extendPageData', page, pageContext)
      }
      // 验证扩展结果
      const pagesWithReadingTime = pages.filter(p => p.frontmatter?.readingTime)
      if (pagesWithReadingTime.length > 0) {
        console.log(pc.gray(`  ${pagesWithReadingTime.length} pages have reading time data`))
      }

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
            '@': config.srcDir,
            // 解析 @ldesign/doc 子路径，支持自定义主题导入默认主题
            '@ldesign/doc/theme-default': resolve(LDOC_PKG_ROOT, 'dist/es/theme-default'),
            '@ldesign/doc/client': resolve(LDOC_PKG_ROOT, 'dist/es/client'),
            '@ldesign/doc': resolve(LDOC_PKG_ROOT, 'dist/es')
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

  // 注册用户插件
  for (const plugin of config.userPlugins) {
    await pluginContainer.register(plugin)
  }

  // 调用 configResolved 钩子
  await pluginContainer.callHook('configResolved', config)

  const md = await createMarkdownRenderer(config)

  // 扩展 Markdown
  await pluginContainer.callHook('extendMarkdown', md)

  const builder = createBuilder(config, { md, pluginContainer })
  await builder.build()
}

/**
 * 生成临时文件 - 使用统一的路由生成
 */
async function generateTempFiles(config: SiteConfig, pages: PageData[]): Promise<void> {
  const tempDir = config.tempDir

  // 确保临时目录存在
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true })
  }

  // 使用已扩展的 pages 数据生成路由（保留插件添加的 frontmatter 数据）
  const routes = pageDataToRoutes(pages)

  // 写入路由文件 - build 模式使用静态导入
  const routesCode = generateRoutesCode(routes, 'build')
  writeFileSync(resolve(tempDir, 'routes.js'), routesCode)

  // 写入站点数据文件
  const siteDataCode = generateSiteDataCode(config)
  writeFileSync(resolve(tempDir, 'siteData.js'), siteDataCode)

  // 写入主入口文件
  const mainCode = generateMainCode(config)
  writeFileSync(resolve(tempDir, 'main.js'), mainCode)

  // 写入 HTML 模板
  const htmlTemplate = generateHtmlTemplate(config, './main.js')
  writeFileSync(resolve(tempDir, 'index.html'), htmlTemplate)
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
    },
    resolve: {
      alias: {
        '@theme': config.themeDir,
        '@': config.srcDir,
        // 解析 @ldesign/doc 子路径，支持自定义主题导入默认主题
        '@ldesign/doc/theme-default': resolve(LDOC_PKG_ROOT, 'dist/es/theme-default'),
        '@ldesign/doc/client': resolve(LDOC_PKG_ROOT, 'dist/es/client'),
        '@ldesign/doc': resolve(LDOC_PKG_ROOT, 'dist/es')
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
