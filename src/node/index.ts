/**
 * Node.js 端模块导出
 */

export {
  resolveConfig,
  defineConfig,
  defineConfigWithTheme,
  defineThemeConfig,
  defineLocaleConfig,
  defineNav,
  defineSidebar,
  watchConfig,
  stopConfigWatcher,
  defaultConfig
} from './config'
export { createLDoc } from './createLDoc'
export { build } from './build'
export { serve } from './serve'
export { scanPages, processPage } from './pages'
export { initProject } from './init'
export { createDevServer } from './server/devServer'
export { createVitePlugins } from './vitePlugin'
export type { VitePluginOptions } from './vitePlugin'
export {
  extractTags,
  buildTagIndex,
  getTagList,
  getTagByName,
  getRelatedPagesByTags,
  generateTagPageData
} from './tags'
export type { TagInfo, TaggedPage, TagIndex } from './tags'
export {
  lintDocumentation,
  generateLintSummary,
  extractLinks,
  isInternalLink,
  isValidInternalLink,
  checkSpellingInContent,
  checkStyleInContent
} from './linter'
export type {
  LinterOptions,
  StyleRuleConfig,
  LintReport,
  BrokenLinkIssue,
  SpellingIssue,
  StyleIssue
} from './linter'
export {
  generateBuildReport,
  printBuildReport,
  saveBuildReport
} from './buildReport'
export type {
  BuildReport,
  BuildWarning,
  BuildSuggestion
} from './buildReport'

// Data Loader
export { createContentLoader } from './dataLoader'
export type { ContentData, ContentLoaderOptions, ContentLoader } from '../types/dataLoader'

// 侧边栏自动生成
export { generateSidebar, resolveSidebarAuto } from './sidebarGenerator'

// 社交 Meta
export { generateSocialMeta } from './socialMeta'
