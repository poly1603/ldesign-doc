# Plugin API

Complete API reference for LDoc plugins.

## LDocPlugin Interface

```ts
interface LDocPlugin {
  // Plugin name (required)
  name: string
  
  // Execution order
  enforce?: 'pre' | 'post' | number
  
  // Server-side hooks
  transformMarkdown?: (code: string, id: string, ctx: Context) => string
  extendPageData?: (pageData: PageData, ctx: Context) => void
  extendSiteData?: (siteData: SiteData, ctx: Context) => void
  
  // Client-side hooks
  onClientInit?: (ctx: ClientContext) => void
  onClientMounted?: (ctx: ClientContext) => void
  onClientUpdated?: (ctx: ClientContext) => void
  onBeforeRouteChange?: (to: Route, from: Route, ctx: ClientContext) => void
  onAfterRouteChange?: (to: Route, from: Route, ctx: ClientContext) => void
  onDestroy?: (ctx: ClientContext) => void
  
  // Slots
  slots?: PluginSlots | ((ctx: ClientContext) => PluginSlots)
  
  // Global components
  globalComponents?: Record<string, Component>
  
  // Global directives
  globalDirectives?: Record<string, Directive>
  
  // Head injection
  headScripts?: string[]
  headStyles?: string[]
}
```

## Context Objects

### Server Context

```ts
interface Context {
  config: SiteConfig
  pages: PageData[]
  isDev: boolean
}
```

### Client Context

```ts
interface ClientContext {
  app: App
  router: Router
  siteData: SiteData
  pageData: PageData
  route: RouteUtils
  data: DataUtils
  ui: UIUtils
  storage: StorageUtils
  events: EventBus
}
```

## Route Utilities

```ts
interface RouteUtils {
  path: string
  hash: string
  query: Record<string, string>
  go: (path: string) => void
  replace: (path: string) => void
  back: () => void
  forward: () => void
  scrollToAnchor: (hash: string) => void
}
```

## Data Utilities

```ts
interface DataUtils {
  getPageData: () => PageData
  getSiteData: () => SiteData
  getThemeConfig: () => ThemeConfig
  getFrontmatter: () => Record<string, unknown>
  getHeaders: () => Header[]
  getLang: () => string
  isDark: () => boolean
}
```

## UI Utilities

```ts
interface UIUtils {
  showToast: (message: string, options?: ToastOptions) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
  showModal: (options: ModalOptions) => Promise<boolean>
  copyToClipboard: (text: string) => Promise<boolean>
}
```

## Storage Utilities

```ts
interface StorageUtils {
  get: <T>(key: string) => T | null
  set: <T>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
}
```

## Event Bus

```ts
interface EventBus {
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  emit: (event: string, ...args: any[]) => void
  once: (event: string, handler: Function) => void
}
```

## PageData

```ts
interface PageData {
  title: string
  description: string
  frontmatter: Record<string, unknown>
  headers: Header[]
  relativePath: string
  content?: string
  lastUpdated?: number
  readingTime?: number
  wordCount?: number
  // Custom fields added by plugins
  [key: string]: unknown
}
```

## SiteData

```ts
interface SiteData {
  base: string
  title: string
  description: string
  lang: string
  locales: Record<string, LocaleConfig>
  themeConfig: ThemeConfig
  head: HeadConfig[]
  // Custom fields
  [key: string]: unknown
}
```

## Slot Names

```ts
type SlotName =
  | 'layout-top'
  | 'layout-bottom'
  | 'nav-bar-title-before'
  | 'nav-bar-title-after'
  | 'sidebar-nav-before'
  | 'sidebar-nav-after'
  | 'doc-before'
  | 'doc-after'
  | 'doc-footer-before'
  | 'doc-top'
  | 'doc-bottom'
  | 'home-hero-before'
  | 'home-hero-after'
  | 'home-hero-info'
  | 'home-hero-actions-after'
  | 'home-features-before'
  | 'home-features-after'
  | 'footer-before'
  | 'footer-after'
  | 'back-to-top-before'
  | 'back-to-top-after'
```
