# 插件 API

插件开发的完整 API 参考。

## definePlugin

创建插件的辅助函数。

```ts
import { definePlugin } from '@ldesign/doc'

export const myPlugin = definePlugin({
  name: 'my-plugin',
  // ...其他配置
})
```

## definePluginFactory

创建带配置选项的插件工厂函数。

```ts
import { definePluginFactory } from '@ldesign/doc'

interface Options {
  foo?: string
}

export const myPlugin = definePluginFactory<Options>((options = {}) => {
  return {
    name: 'my-plugin',
    // 使用 options
  }
})
```

## 插件属性

### name

- **类型**: `string`
- **必需**: 是

插件名称，用于日志和调试。

### enforce

- **类型**: `'pre' | 'post' | number`
- **默认值**: 无

执行顺序：
- `'pre'` - 最先执行
- `'post'` - 最后执行
- `number` - 数值越小越先执行

## 生命周期钩子

| 钩子 | 参数 | 说明 |
|------|------|------|
| `config` | `(config, env)` | 修改配置 |
| `configResolved` | `(config)` | 配置解析完成 |
| `buildStart` | `(config)` | 构建开始 |
| `onBeforePageRender` | `(ctx)` | 页面渲染前 |
| `onAfterPageRender` | `(ctx)` | 页面渲染后 |
| `generateBundle` | `(config)` | 生成完成 |
| `buildEnd` | `(config)` | 构建完成 |
| `onClientInit` | `(ctx)` | 客户端初始化 |
| `onClientMounted` | `(ctx)` | 客户端挂载 |
| `onClientUpdated` | `(ctx)` | 客户端更新 |
| `onBeforeRouteChange` | `(to, from)` | 路由切换前 |
| `onAfterRouteChange` | `(to)` | 路由切换后 |
| `handleHotUpdate` | `(ctx)` | 热更新 |
| `onDestroy` | `()` | 插件销毁 |

## 扩展钩子

| 钩子 | 参数 | 说明 |
|------|------|------|
| `vitePlugins` | `()` | 返回 Vite 插件 |
| `extendMarkdown` | `(md)` | 扩展 Markdown |
| `extendPageData` | `(pageData, ctx)` | 扩展页面数据 |
| `extendSiteData` | `(siteData)` | 扩展站点数据 |
| `extendRoutes` | `(routes)` | 扩展路由 |

## UI 注入

### slots

```ts
type PluginSlots = Record<PluginSlotName, PluginSlotComponent | PluginSlotComponent[]>

interface PluginSlotComponent {
  component: Component
  props?: Record<string, unknown>
  order?: number
}
```

### PluginSlotName

```ts
type PluginSlotName =
  | 'nav-bar-logo-after'
  | 'nav-bar-content-before'
  | 'nav-bar-content-after'
  | 'sidebar-top'
  | 'sidebar-bottom'
  | 'aside-top'
  | 'aside-bottom'
  | 'doc-before'
  | 'doc-after'
  | 'doc-top'
  | 'doc-bottom'
  | 'doc-footer-before'
  | 'doc-footer-after'
  | 'layout-top'
  | 'layout-bottom'
  | 'home-hero-before'
  | 'home-hero-after'
  | 'home-features-before'
  | 'home-features-after'
```

### globalComponents

```ts
interface PluginGlobalComponent {
  name: string
  component: Component
}
```

### globalDirectives

```ts
interface PluginGlobalDirective {
  name: string
  directive: Directive
}
```

## 代码注入

### headScripts

```ts
headScripts: string[] | ((ctx: TransformContext) => string[])
```

### headStyles

```ts
headStyles: string[] | ((ctx: TransformContext) => string[])
```

### clientConfigFile

```ts
clientConfigFile: string  // 文件路径或内联代码
```

## 上下文类型

### ConfigEnv

```ts
interface ConfigEnv {
  mode: 'development' | 'production'
  command: 'serve' | 'build'
}
```

### PageRenderContext

```ts
interface PageRenderContext {
  pageData: PageData
  siteConfig: SiteConfig
  html?: string  // 仅 onAfterPageRender 可用
}
```

### PluginPageContext

```ts
interface PluginPageContext {
  siteConfig: SiteConfig
  content: string
  filePath: string
  relativePath: string
}
```

### ClientPluginContext

```ts
interface ClientPluginContext {
  app: App
  router: Router
  siteData: SiteData
  pageData: PageData
  route: ClientRouteUtils
  data: ClientDataUtils
  ui: ClientUIUtils
  storage: ClientStorageUtils
  events: ClientEventBus
}
```

### TransformContext

```ts
interface TransformContext {
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
}
```

### HotUpdateContext

```ts
interface HotUpdateContext {
  file: string
  timestamp: number
  modules: Set<ModuleNode>
  read: () => Promise<string>
  server: ViteDevServer
}
```

## 客户端工具

### route

```ts
interface ClientRouteUtils {
  path: string
  hash: string
  query: Record<string, string>
  go: (path: string) => void
  replace: (path: string) => void
  back: () => void
  forward: () => void
  scrollToAnchor: (anchor: string) => void
}
```

### data

```ts
interface ClientDataUtils {
  getPageData: () => PageData
  getSiteData: () => SiteData
  getThemeConfig: () => ThemeConfig
  getFrontmatter: () => Record<string, unknown>
  getHeaders: () => Header[]
  getLang: () => string
  isDark: () => boolean
}
```

### ui

```ts
interface ClientUIUtils {
  showToast: (message: string, options?: ToastOptions) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
  showModal: (options: ModalOptions) => Promise<boolean>
  copyToClipboard: (text: string) => Promise<void>
}
```

### storage

```ts
interface ClientStorageUtils {
  get: <T>(key: string) => T | null
  set: (key: string, value: unknown) => void
  remove: (key: string) => void
  clear: () => void
}
```

### events

```ts
interface ClientEventBus {
  on: (event: string, handler: Function) => void
  off: (event: string, handler?: Function) => void
  emit: (event: string, ...args: unknown[]) => void
  once: (event: string, handler: Function) => void
}
```
