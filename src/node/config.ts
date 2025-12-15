/**
 * 配置系统
 */

import { resolve, dirname } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, watch as fsWatch, FSWatcher } from 'fs'
import { createRequire } from 'module'
import { build } from 'esbuild'
import type { UserConfig, SiteConfig, ThemeConfig, LDocPlugin, Theme, LocaleConfig, NavItem, Sidebar } from '../shared/types'
import { deepMerge, normalizePath } from '../shared/utils'
import * as logger from './logger'

const require = createRequire(import.meta.url)

/**
 * 支持的配置文件名（按优先级排序）
 */
const CONFIG_FILES = [
  '.ldesign/doc.config.ts',
  '.ldesign/doc.config.js',
  '.ldesign/doc.config.mts',
  '.ldesign/doc.config.mjs',
  'ldoc.config.ts',
  'ldoc.config.js',
  'ldoc.config.mts',
  'ldoc.config.mjs'
]

/**
 * 默认配置
 */
export const defaultConfig: UserConfig = {
  srcDir: 'docs',
  extraDocs: [],
  outDir: '.ldesign/.doc-cache/dist',
  base: '/',
  title: 'LDoc',
  description: 'A LDesign Documentation Site',
  lang: 'zh-CN',
  head: [],
  framework: 'auto',
  themeConfig: {},
  locales: {},
  markdown: {
    lineNumbers: false,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  vite: {},
  plugins: [],
  build: {
    outDir: '.ldesign/.doc-cache/dist',
    assetsDir: 'assets',
    minify: true,
    sourcemap: false,
    ssr: true
  },
  auth: {
    enabled: false
  }
}

/**
 * 定义配置（带类型提示）
 */
export function defineConfig(config: UserConfig): UserConfig {
  return config
}

/**
 * 定义带主题配置的配置
 */
export function defineConfigWithTheme<T extends ThemeConfig>(
  config: UserConfig & { themeConfig?: T }
): UserConfig & { themeConfig?: T } {
  return config
}

/**
 * 定义主题配置（带类型提示）
 * 可用于单独定义 nav、sidebar 等配置
 * 
 * @example
 * ```ts
 * const themeConfig = defineThemeConfig({
 *   nav: [...],
 *   sidebar: {...}
 * })
 * ```
 */
export function defineThemeConfig(config: ThemeConfig): ThemeConfig {
  return config
}

/**
 * 定义语言配置（带类型提示）
 * 用于单独定义某个语言的配置
 * 
 * @example
 * ```ts
 * const enLocale = defineLocaleConfig({
 *   label: 'English',
 *   lang: 'en-US',
 *   link: '/en/',
 *   themeConfig: {
 *     nav: [...],
 *     sidebar: {...}
 *   }
 * })
 * 
 * // 在配置中使用
 * defineConfig({
 *   locales: {
 *     en: enLocale
 *   }
 * })
 * ```
 */
export function defineLocaleConfig(config: LocaleConfig): LocaleConfig {
  return config
}

/**
 * 定义导航配置（带类型提示）
 * 
 * @example
 * ```ts
 * const nav = defineNav([
 *   { text: '指南', link: '/guide/' },
 *   { text: 'API', link: '/api/' }
 * ])
 * ```
 */
export function defineNav(nav: NavItem[]): NavItem[] {
  return nav
}

/**
 * 定义侧边栏配置（带类型提示）
 * 
 * @example
 * ```ts
 * const sidebar = defineSidebar({
 *   '/guide/': [
 *     { text: '开始', items: [...] }
 *   ]
 * })
 * ```
 */
export function defineSidebar(sidebar: Sidebar): Sidebar {
  return sidebar
}

/**
 * 解析用户配置
 */
export async function resolveConfig(
  root: string = process.cwd(),
  command: 'serve' | 'build' = 'serve',
  mode: 'development' | 'production' = 'development'
): Promise<SiteConfig> {
  // 查找配置文件
  const { configPath, configDeps } = await findConfigFile(root)

  // 加载用户配置
  let userConfig: UserConfig = {}
  if (configPath) {
    userConfig = await loadConfigFile(configPath)
  }

  // 合并默认配置
  const mergedConfig = deepMerge({} as UserConfig, defaultConfig, userConfig)

  // 如果配置在 .ldesign 目录且未指定 srcDir，使用 .ldesign/docs
  let srcDirPath = mergedConfig.srcDir!
  if (configPath && configPath.includes('.ldesign') && !userConfig.srcDir) {
    srcDirPath = '.ldesign/docs'
  }

  // 解析路径
  const srcDir = resolve(root, srcDirPath)
  const outDir = resolve(root, mergedConfig.outDir || mergedConfig.build?.outDir || '.ldesign/.doc-cache/dist')
  const tempDir = resolve(root, '.ldesign/.doc-cache/temp')
  const cacheDir = resolve(root, '.ldesign/.doc-cache')

  // 解析主题
  const { themeDir, themePkg } = await resolveTheme(root, mergedConfig.theme)

  // 检测是否直接传入 Theme 对象
  const themeObject = isThemeObject(mergedConfig.theme) ? mergedConfig.theme : undefined
  if (themeObject) {
    // Using custom theme object
  }

  // 构建最终配置
  const siteConfig: SiteConfig = {
    root: normalizePath(root),
    srcDir: normalizePath(srcDir),
    extraDocs: mergedConfig.extraDocs || [],
    outDir: normalizePath(outDir),
    base: mergedConfig.base!,
    title: mergedConfig.title!,
    description: mergedConfig.description!,
    lang: mergedConfig.lang!,
    head: mergedConfig.head || [],
    framework: mergedConfig.framework!,
    themeConfig: mergedConfig.themeConfig || {},
    locales: mergedConfig.locales || {},
    markdown: mergedConfig.markdown || {},
    vite: mergedConfig.vite || {},
    build: mergedConfig.build || {},
    auth: mergedConfig.auth || { enabled: false },
    deploy: mergedConfig.deploy,

    // 内部使用
    configPath,
    configDeps,
    themeDir: normalizePath(themeDir),
    themePkg,
    tempDir: normalizePath(tempDir),
    cacheDir: normalizePath(cacheDir),
    userPlugins: mergedConfig.plugins || [],
    theme: themeObject,

    // 钩子函数
    transformHead: mergedConfig.transformHead,
    transformHtml: mergedConfig.transformHtml,
    transformPageData: mergedConfig.transformPageData,
    buildEnd: mergedConfig.buildEnd
  }

  return siteConfig
}

/**
 * 查找配置文件
 */
async function findConfigFile(root: string): Promise<{
  configPath: string | undefined
  configDeps: string[]
}> {
  for (const file of CONFIG_FILES) {
    const configPath = resolve(root, file)
    if (existsSync(configPath)) {
      return {
        configPath: normalizePath(configPath),
        configDeps: [normalizePath(configPath)]
      }
    }
  }

  return {
    configPath: undefined,
    configDeps: []
  }
}

/**
 * 加载配置文件
 * 支持 .ts/.mts 文件通过 esbuild 即时编译
 */
async function loadConfigFile(configPath: string): Promise<UserConfig> {
  try {
    const ext = configPath.split('.').pop()?.toLowerCase()

    // 对于 TypeScript 配置文件，使用 esbuild 编译后加载
    if (ext === 'ts' || ext === 'mts') {
      return await loadTsConfigFile(configPath)
    }

    // 对于 JS/MJS 配置文件，直接加载
    const configUrl = pathToFileURL(configPath).href
    const mod = await import(configUrl)
    return mod.default || mod
  } catch (error) {
    console.error(`Failed to load config file: ${configPath}`)
    console.error(error)
    return {}
  }
}

/**
 * 使用 esbuild 编译并加载 TypeScript 配置文件
 */
async function loadTsConfigFile(configPath: string): Promise<UserConfig> {
  const configDir = dirname(configPath)
  const tempDir = resolve(configDir, '.doc-cache', 'config-temp')
  const tempFile = resolve(tempDir, `config-${Date.now()}.mjs`)

  try {
    // 确保临时目录存在
    mkdirSync(tempDir, { recursive: true })

    // 使用 esbuild 编译 TypeScript 配置
    const result = await build({
      entryPoints: [configPath],
      outfile: tempFile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      write: true,
      // 外部化所有 node_modules 依赖
      packages: 'external',
      // 不包含 source map
      sourcemap: false,
      // 静默模式
      logLevel: 'silent'
    })

    // 加载编译后的配置
    const configUrl = pathToFileURL(tempFile).href
    // 添加时间戳避免缓存
    const mod = await import(`${configUrl}?t=${Date.now()}`)

    return mod.default || mod
  } finally {
    // 清理临时文件
    try {
      rmSync(tempFile, { force: true })
    } catch {
      // 忽略清理错误
    }
  }
}

/**
 * 检测是否为 Theme 对象（包含 Layout 组件）
 */
function isThemeObject(theme: unknown): theme is Theme {
  return (
    typeof theme === 'object' &&
    theme !== null &&
    'Layout' in theme &&
    typeof (theme as Theme).Layout !== 'undefined'
  )
}

/**
 * 主题解析结果
 */
interface ThemeResolveResult {
  themeDir: string
  themePkg?: string  // npm 包名（如果是从包解析的）
}

/**
 * 解析主题目录
 * 支持的格式：
 * - Theme 对象 - 直接使用主题对象
 * - 'ldoc-theme-xxx' - npm 包名
 * - '@scope/ldoc-theme-xxx' - 带 scope 的 npm 包名
 * - './path/to/theme' - 相对路径
 * - '/absolute/path' - 绝对路径
 * - 'xxx' - 简写，自动尝试 ldoc-theme-xxx
 */
async function resolveTheme(root: string, theme?: string | Theme | ThemeConfig): Promise<ThemeResolveResult> {
  // 获取当前模块所在目录
  const currentDir = dirname(fileURLToPath(import.meta.url))

  // 如果没有指定主题或主题是对象配置，使用默认主题
  if (!theme || typeof theme === 'object') {
    // 检查本地 .ldesign/doc-theme 目录
    const localThemeDir = resolve(root, '.ldesign/doc-theme')
    if (existsSync(localThemeDir)) {
      return { themeDir: localThemeDir }
    }

    // 使用内置默认主题
    return { themeDir: resolve(currentDir, '../theme-default') }
  }

  // 如果是字符串，尝试解析为包名或路径
  if (theme.startsWith('.') || theme.startsWith('/')) {
    return { themeDir: resolve(root, theme) }
  }

  // 尝试解析为 npm 包
  const packageNames = [
    theme,                           // 完整包名: ldoc-theme-xxx 或 @scope/ldoc-theme-xxx
    `ldoc-theme-${theme}`,          // 简写: xxx -> ldoc-theme-xxx
    `@ldesign/doc-theme-${theme}`   // @ldesign scope
  ]

  for (const pkgName of packageNames) {
    try {
      const themePkgPath = require.resolve(`${pkgName}/package.json`, { paths: [root] })
      return { themeDir: dirname(themePkgPath), themePkg: pkgName }
    } catch {
      // 继续尝试下一个包名
    }
  }

  console.warn(`[ldoc] Theme "${theme}" not found, using default theme`)
  return { themeDir: resolve(currentDir, '../theme-default') }
}

/**
 * 加载插件
 * 支持的格式：
 * - LDocPlugin 对象
 * - 'ldoc-plugin-xxx' - npm 包名
 * - '@scope/ldoc-plugin-xxx' - 带 scope 的 npm 包名
 * - 'xxx' - 简写，自动尝试 ldoc-plugin-xxx
 */
export async function resolvePlugins(
  root: string,
  plugins: (LDocPlugin | string)[] = []
): Promise<LDocPlugin[]> {
  const resolved: LDocPlugin[] = []

  for (const plugin of plugins) {
    if (typeof plugin === 'string') {
      // 字符串格式，需要从 npm 包加载
      const loadedPlugin = await loadPluginFromPackage(root, plugin)
      if (loadedPlugin) {
        resolved.push(loadedPlugin)
      }
    } else {
      // 已经是 LDocPlugin 对象
      resolved.push(plugin)
    }
  }

  return resolved
}

/**
 * 从 npm 包加载插件
 */
async function loadPluginFromPackage(root: string, pluginName: string): Promise<LDocPlugin | null> {
  const packageNames = [
    pluginName,                        // 完整包名: ldoc-plugin-xxx
    `ldoc-plugin-${pluginName}`,      // 简写: xxx -> ldoc-plugin-xxx
    `@ldesign/doc-plugin-${pluginName}` // @ldesign scope
  ]

  for (const pkgName of packageNames) {
    try {
      // 尝试 require.resolve 找到包路径
      const pkgPath = require.resolve(pkgName, { paths: [root] })

      // 动态导入插件
      const mod = await import(pkgPath)
      const plugin = mod.default || mod

      // 如果导出的是函数（工厂函数），调用它
      if (typeof plugin === 'function') {
        const result = plugin()
        if (result && typeof result === 'object' && 'name' in result) {
          return result as LDocPlugin
        }
      }

      // 如果直接是插件对象
      if (plugin && typeof plugin === 'object' && 'name' in plugin) {
        return plugin as LDocPlugin
      }
    } catch {
      // 继续尝试下一个包名
    }
  }

  console.warn(`[ldoc] Plugin "${pluginName}" not found`)
  return null
}

/**
 * 配置文件监听器
 */
let configWatcher: FSWatcher | null = null
let configWatcherCallbacks: Array<(config: SiteConfig) => void> = []
let lastConfigHash = ''

/**
 * 计算配置内容的哈希值
 */
function getConfigHash(configPath: string): string {
  if (!existsSync(configPath)) return ''
  try {
    const content = readFileSync(configPath, 'utf-8')
    // 简单哈希：使用内容长度和部分内容
    return `${content.length}-${content.slice(0, 100)}-${content.slice(-100)}`
  } catch {
    return ''
  }
}

/**
 * 监听配置变化
 * 支持热更新配置而无需重启整个服务器
 */
export function watchConfig(
  root: string,
  callback: (config: SiteConfig) => void
): () => void {
  configWatcherCallbacks.push(callback)

  // 如果已经有监听器在运行，直接返回
  if (configWatcher) {
    return () => {
      const index = configWatcherCallbacks.indexOf(callback)
      if (index > -1) configWatcherCallbacks.splice(index, 1)
    }
  }

  // 查找配置文件
  findConfigFile(root).then(({ configPath }) => {
    if (!configPath) return

    lastConfigHash = getConfigHash(configPath)

    // 使用 fs.watch 监听配置文件变化
    configWatcher = fsWatch(configPath, { persistent: true }, async (eventType) => {
      if (eventType !== 'change') return

      // 检查内容是否真的变化（防止重复触发）
      const newHash = getConfigHash(configPath)
      if (newHash === lastConfigHash) return
      lastConfigHash = newHash

      logger.printInfo('Config file changed, reloading...')

      try {
        // 重新解析配置
        const newConfig = await resolveConfig(root, 'serve', 'development')

        // 通知所有监听者
        for (const cb of configWatcherCallbacks) {
          try {
            cb(newConfig)
          } catch (err) {
            logger.printError('Config reload callback error', String(err))
          }
        }

        logger.printSuccess('Config reloaded successfully')
      } catch (err) {
        logger.printError('Failed to reload config', String(err))
      }
    })
  })

  // 返回清理函数
  return () => {
    const index = configWatcherCallbacks.indexOf(callback)
    if (index > -1) configWatcherCallbacks.splice(index, 1)

    // 如果没有更多监听者，停止监听
    if (configWatcherCallbacks.length === 0 && configWatcher) {
      configWatcher.close()
      configWatcher = null
    }
  }
}

/**
 * 停止所有配置监听
 */
export function stopConfigWatcher(): void {
  if (configWatcher) {
    configWatcher.close()
    configWatcher = null
  }
  configWatcherCallbacks = []
  lastConfigHash = ''
}
