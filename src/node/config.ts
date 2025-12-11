/**
 * 配置系统
 */

import { resolve, dirname } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { createRequire } from 'module'
import type { UserConfig, SiteConfig, ThemeConfig } from '../shared/types'
import { deepMerge, normalizePath } from '../shared/utils'

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

  // 解析路径
  const srcDir = resolve(root, mergedConfig.srcDir!)
  const outDir = resolve(root, mergedConfig.outDir || mergedConfig.build?.outDir || '.ldesign/.doc-cache/dist')
  const tempDir = resolve(root, '.ldesign/.doc-cache/temp')
  const cacheDir = resolve(root, '.ldesign/.doc-cache')

  // 解析主题目录
  const themeDir = await resolveThemeDir(root, mergedConfig.theme)

  // 构建最终配置
  const siteConfig: SiteConfig = {
    root: normalizePath(root),
    srcDir: normalizePath(srcDir),
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

    // 内部使用
    configPath,
    configDeps,
    themeDir: normalizePath(themeDir),
    tempDir: normalizePath(tempDir),
    cacheDir: normalizePath(cacheDir),
    userPlugins: mergedConfig.plugins || [],

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
 */
async function loadConfigFile(configPath: string): Promise<UserConfig> {
  try {
    // 使用动态 import 加载 ESM 配置
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
 * 解析主题目录
 */
async function resolveThemeDir(root: string, theme?: string | ThemeConfig): Promise<string> {
  // 获取当前模块所在目录
  const currentDir = dirname(fileURLToPath(import.meta.url))

  // 如果没有指定主题或主题是对象配置，使用默认主题
  if (!theme || typeof theme === 'object') {
    // 检查本地 .ldesign/doc-theme 目录
    const localThemeDir = resolve(root, '.ldesign/doc-theme')
    if (existsSync(localThemeDir)) {
      return localThemeDir
    }

    // 使用内置默认主题
    return resolve(currentDir, '../theme-default')
  }

  // 如果是字符串，尝试解析为包名或路径
  if (theme.startsWith('.') || theme.startsWith('/')) {
    return resolve(root, theme)
  }

  // 尝试解析为 npm 包
  try {
    const themePkg = require.resolve(`${theme}/package.json`, { paths: [root] })
    return dirname(themePkg)
  } catch {
    // 尝试作为 @ldesign/doc-theme-xxx 解析
    try {
      const themePkg = require.resolve(`@ldesign/doc-theme-${theme}/package.json`, { paths: [root] })
      return dirname(themePkg)
    } catch {
      console.warn(`Theme "${theme}" not found, using default theme`)
      return resolve(currentDir, '../theme-default')
    }
  }
}

/**
 * 监听配置变化
 */
export function watchConfig(
  root: string,
  callback: (config: SiteConfig) => void
): () => void {
  // TODO: 实现配置热更新
  return () => { }
}
