/**
 * @ldesign/doc - 现代化文档系统
 * 
 * 基于 Vue 3 + Vite + TypeScript 构建的文档框架，提供完整的文档站点解决方案。
 * 
 * ## 核心特性
 * - 🎯 **类型安全**: 完整的 TypeScript 类型支持
 * - 🔌 **插件系统**: 25+ 内置插件，支持自定义插件
 * - 🎨 **主题系统**: 支持主题继承、组件覆盖和样式自定义
 * - 📦 **Markdown 增强**: 代码高亮、容器语法、数学公式
 * - 🚀 **构建优化**: 增量构建、缓存系统、SSR 支持
 * - 🌍 **国际化**: 内置多语言支持
 * 
 * ## 快速开始
 * 
 * ### 安装
 * ```bash
 * pnpm add @ldesign/doc
 * ```
 * 
 * ### 创建配置文件
 * ```ts
 * // doc.config.ts
 * import { defineConfig } from '@ldesign/doc'
 * 
 * export default defineConfig({
 *   title: '我的文档',
 *   description: '使用 LDoc 构建的文档站点',
 *   themeConfig: {
 *     nav: [{ text: '指南', link: '/guide/' }],
 *     sidebar: {
 *       '/guide/': [
 *         { text: '开始', link: '/guide/' }
 *       ]
 *     }
 *   }
 * })
 * ```
 * 
 * ### 启动开发服务器
 * ```bash
 * pnpm ldoc dev
 * ```
 * 
 * ## 核心 API
 * 
 * ### 配置
 * - {@link defineConfig} - 定义文档配置
 * - {@link defineConfigWithTheme} - 定义带自定义主题类型的配置
 * - {@link defineThemeConfig} - 定义主题配置
 * - {@link defineNav} - 定义导航配置
 * - {@link defineSidebar} - 定义侧边栏配置
 * 
 * ### 插件
 * - {@link definePlugin} - 定义插件
 * - {@link definePluginFactory} - 定义插件工厂函数
 * 
 * ### 主题
 * - {@link defineTheme} - 定义主题
 * - {@link defineThemeFactory} - 定义主题工厂函数
 * 
 * ### 构建
 * - {@link createLDoc} - 创建 LDoc 实例
 * - {@link build} - 构建生产版本
 * - {@link serve} - 启动开发服务器
 * 
 * @module @ldesign/doc
 * @packageDocumentation
 */

// 导出类型
export type * from './shared/types'

// 导出核心功能
export {
  defineConfig,
  defineConfigWithTheme,
  defineThemeConfig,
  defineLocaleConfig,
  defineNav,
  defineSidebar,
  resolvePlugins
} from './node/config'
export { createLDoc } from './node/createLDoc'
export { build } from './node/build'
export { serve } from './node/serve'
export { deploy, getSupportedPlatforms, getPlatformDisplayName } from './node/deploy'

// 导出主题 API
export { defineTheme, defineThemeFactory } from './theme/defineTheme'
export type { Theme, EnhanceAppContext } from './shared/types'

// 导出插件 API
export { definePlugin, definePluginFactory } from './plugin/definePlugin'
export type {
  LDocPlugin,
  PluginContext,
  ConfigEnv,
  HotUpdateContext,
  // 插件 Slot 系统类型
  PluginSlotName,
  PluginSlotComponent,
  PluginSlots,
  PluginGlobalComponent
} from './shared/types'

// 导出 Markdown API
export { createMarkdownRenderer } from './markdown/createMarkdown'
export type { MarkdownRenderer, MarkdownOptions } from './shared/types'

// 导出构建缓存 API
export {
  BuildCache,
  createBuildCache,
  computeContentHash,
  createMarkdownCacheKey,
  createHighlightCacheKey
} from './node/cache'
export type {
  CacheOptions,
  CacheEntry,
  CacheStats,
  MarkdownCacheData,
  HighlightCacheData
} from './node/cache'

// 导出构建分析器 API
export {
  BuildAnalyzer,
  createBuildAnalyzer,
  analyzeOutputDir
} from './node/buildAnalyzer'
export type {
  BuildPhase,
  FileAnalysis,
  BuildAnalysisReport,
  Bottleneck,
  Suggestion
} from './node/buildAnalyzer'

// 导出诊断工具 API
export {
  runDiagnostics,
  printDiagnosticReport,
  builtinChecks
} from './node/doctor'
export type {
  DiagnosticCheck,
  DiagnosticResult,
  DiagnosticContext,
  DiagnosticReport
} from './node/doctor'

// 导出 Sitemap 生成 API
export {
  buildSitemapData,
  generateSitemapPageData,
  generateSitemapXml,
  generateSitemapXmlFromData,
  generateRobotsTxt
} from './node/sitemap'

// 导出 Data Loader API
export { createContentLoader } from './node/dataLoader'
export type { ContentData, ContentLoaderOptions, ContentLoader } from './types/dataLoader'

// 导出侧边栏生成 API
export { generateSidebar, resolveSidebarAuto } from './node/sidebarGenerator'

// 导出社交 Meta 生成 API
export { generateSocialMeta } from './node/socialMeta'
export type {
  SitemapPage,
  SitemapCategory,
  SitemapData,
  SitemapXmlOptions,
  SitemapXmlPage,
  RobotsTxtOptions
} from './node/sitemap'

// 导出 Changelog 生成 API
export {
  generateChangelog,
  getLatestTag,
  getAllTags,
  getCommitStats,
  DEFAULT_COMMIT_TYPES
} from './node/changelog'
export type {
  ChangelogOptions,
  CommitType,
  ParsedCommit,
  VersionInfo
} from './node/changelog'

// 导出工具函数
export * from './shared/utils'

// 导出内置插件
export * from './plugins'
