---
title: API 参考
---

# API 参考

本章节包含 @ldesign/doc 的完整 API 参考。

## 模块导出

@ldesign/doc 提供以下导出模块：

| 模块 | 描述 |
|------|------|
| `@ldesign/doc` | 核心 API 和类型 |
| `@ldesign/doc/client` | 客户端运行时 API |
| `@ldesign/doc/plugins` | 内置插件 |
| `@ldesign/doc/theme` | 主题 API |
| `@ldesign/doc/node` | Node.js API |

## 核心 API

### defineConfig

定义文档配置的辅助函数，提供完整的类型提示。

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  description: 'A documentation site',
  themeConfig: {
    // ...
  }
})
```

**类型定义：**

```ts
function defineConfig(config: UserConfig): UserConfig
```

### definePlugin

定义插件的辅助函数。

```ts
import { definePlugin } from '@ldesign/doc'

export const myPlugin = definePlugin({
  name: 'my-plugin',
  // ...
})
```

**类型定义：**

```ts
function definePlugin(plugin: LDocPlugin): LDocPlugin
```

### definePluginFactory

定义插件工厂函数。

```ts
import { definePluginFactory } from '@ldesign/doc'

export const myPlugin = definePluginFactory<MyPluginOptions>((options) => ({
  name: 'my-plugin',
  // 使用 options
}))
```

**类型定义：**

```ts
function definePluginFactory<T>(
  factory: (options: T) => LDocPlugin
): (options?: T) => LDocPlugin
```

## 配置类型

### UserConfig

用户配置类型。

```ts
interface UserConfig {
  // 基础配置
  title?: string
  description?: string
  lang?: string
  base?: string
  
  // 目录配置
  srcDir?: string
  outDir?: string
  cacheDir?: string
  
  // 功能配置
  cleanUrls?: boolean
  lastUpdated?: boolean
  ignoreDeadLinks?: boolean | 'localhostLinks'
  
  // 扩展配置
  head?: HeadConfig[]
  markdown?: MarkdownOptions
  vite?: ViteUserConfig
  plugins?: LDocPlugin[]
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
}
```

### ThemeConfig

主题配置类型。

```ts
interface ThemeConfig {
  logo?: string | { light: string; dark: string }
  siteTitle?: string | false
  nav?: NavItem[]
  sidebar?: Sidebar
  socialLinks?: SocialLink[]
  footer?: Footer
  editLink?: EditLink
  search?: SearchConfig
  outline?: OutlineConfig
  appearance?: boolean | 'dark' | 'light'
}
```

### LDocPlugin

插件类型定义。

```ts
interface LDocPlugin {
  name: string
  enforce?: 'pre' | 'post' | number
  
  // 配置钩子
  config?: (config: UserConfig, env: ConfigEnv) => UserConfig | void
  configResolved?: (config: SiteConfig) => void
  
  // Vite 扩展
  vitePlugins?: () => VitePlugin[]
  
  // Markdown 扩展
  extendMarkdown?: (md: MarkdownRenderer) => void
  
  // 数据扩展
  extendPageData?: (pageData: PageData, ctx: PluginPageContext) => void
  extendSiteData?: (siteData: SiteData) => void
  
  // 路由扩展
  extendRoutes?: (routes: Route[]) => Route[] | void
  onBeforeRouteChange?: (to: string, from: string) => boolean | void
  onAfterRouteChange?: (to: string) => void
  
  // 构建钩子
  buildStart?: (config: SiteConfig) => void
  onBeforePageRender?: (page: PageRenderContext) => void
  onAfterPageRender?: (page: PageRenderContext) => void
  generateBundle?: (config: SiteConfig) => void
  buildEnd?: (config: SiteConfig) => void
  
  // 客户端钩子
  onClientInit?: (ctx: ClientPluginContext) => void
  onClientMounted?: (ctx: ClientPluginContext) => void
  onClientUpdated?: (ctx: ClientPluginContext) => void
  
  // UI 注入
  slots?: PluginSlots | ((ctx: ClientPluginContext) => PluginSlots)
  globalComponents?: PluginGlobalComponent[]
  globalDirectives?: PluginGlobalDirective[]
  
  // 代码注入
  clientConfigFile?: string
  headScripts?: string[] | ((ctx: TransformContext) => string[])
  headStyles?: string[] | ((ctx: TransformContext) => string[])
  
  // 热更新
  handleHotUpdate?: (ctx: HotUpdateContext) => void
  
  // 清理
  onDestroy?: () => void
}
```

## 数据类型

### PageData

页面数据类型。

```ts
interface PageData {
  title: string
  description: string
  frontmatter: Record<string, unknown>
  headers: Header[]
  relativePath: string
  filePath: string
  lastUpdated?: number
}
```

### SiteData

站点数据类型。

```ts
interface SiteData {
  base: string
  title: string
  description: string
  lang: string
  locales: Record<string, LocaleConfig>
  themeConfig: ThemeConfig
  head: HeadConfig[]
}
```

### Header

标题类型。

```ts
interface Header {
  level: number
  title: string
  slug: string
  children?: Header[]
}
```

## 客户端 API

详见 [客户端 API](/api/client)。

## 插件 API

详见 [插件 API](/api/plugin)。
