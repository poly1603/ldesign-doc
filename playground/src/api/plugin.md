---
title: 插件 API
---

# 插件 API

本章节详细介绍插件开发中可用的 API。

## 生命周期钩子

### config

修改用户配置，在配置解析前调用。

```ts
{
  config(config, env) {
    // config: UserConfig
    // env: { mode: 'development' | 'production', command: 'serve' | 'build' }
    
    return {
      ...config,
      title: config.title + ' - Modified'
    }
  }
}
```

### configResolved

配置解析完成后调用，可以读取最终配置。

```ts
{
  configResolved(config) {
    // config: SiteConfig - 完整的解析后配置
    console.log('Site title:', config.site.title)
  }
}
```

### buildStart

构建开始时调用。

```ts
{
  async buildStart(config) {
    // 初始化构建资源
    await initBuildResources()
  }
}
```

### onBeforePageRender

每个页面渲染前调用。

```ts
{
  onBeforePageRender(page) {
    // page.pageData: PageData
    // page.siteConfig: SiteConfig
    console.log('Rendering:', page.pageData.relativePath)
  }
}
```

### onAfterPageRender

每个页面渲染后调用。

```ts
{
  onAfterPageRender(page) {
    // page.html: 渲染后的 HTML
    console.log('Rendered HTML length:', page.html?.length)
  }
}
```

### generateBundle

所有页面生成后调用。

```ts
{
  async generateBundle(config) {
    // 生成额外的文件
    await writeFile('dist/sitemap.xml', sitemapContent)
  }
}
```

### buildEnd

构建完成后调用。

```ts
{
  async buildEnd(config) {
    // 清理资源
    console.log('Build completed!')
  }
}
```

### onClientInit

客户端应用初始化时调用。

```ts
{
  onClientInit(ctx) {
    // 注册全局属性
    ctx.app.config.globalProperties.$myPlugin = {}
  }
}
```

### onClientMounted

客户端应用挂载完成后调用。

```ts
{
  onClientMounted(ctx) {
    // DOM 已就绪
    initThirdPartyLibrary()
  }
}
```

### onClientUpdated

页面切换后调用。

```ts
{
  onClientUpdated(ctx) {
    // 页面内容已更新
    trackPageView(ctx.route.path)
  }
}
```

### onBeforeRouteChange

路由切换前调用（客户端）。

```ts
{
  onBeforeRouteChange(to, from) {
    // 返回 false 可阻止导航
    if (hasUnsavedChanges()) {
      return false
    }
  }
}
```

### onAfterRouteChange

路由切换后调用（客户端）。

```ts
{
  onAfterRouteChange(to) {
    // 更新分析
    analytics.track(to)
  }
}
```

### handleHotUpdate

处理热更新。

```ts
{
  handleHotUpdate(ctx) {
    // ctx.file: 变更的文件
    // ctx.modules: 受影响的模块
    if (ctx.file.endsWith('.config.ts')) {
      // 重新加载配置
    }
  }
}
```

### onDestroy

插件销毁时调用。

```ts
{
  onDestroy() {
    // 清理资源
    clearInterval(timerId)
  }
}
```

## 扩展钩子

### vitePlugins

返回额外的 Vite 插件。

```ts
{
  vitePlugins() {
    return [
      myVitePlugin(),
      anotherVitePlugin()
    ]
  }
}
```

### extendMarkdown

扩展 Markdown 渲染器。

```ts
{
  extendMarkdown(md) {
    // md: MarkdownIt 实例
    md.use(markdownItPlugin)
    
    // 添加自定义规则
    md.renderer.rules.custom = (tokens, idx) => {
      return '<div class="custom">' + tokens[idx].content + '</div>'
    }
  }
}
```

### extendPageData

扩展页面数据。

```ts
{
  async extendPageData(pageData, ctx) {
    // pageData: PageData
    // ctx: { siteConfig, content, filePath, relativePath }
    
    // 添加自定义字段
    pageData.frontmatter.wordCount = ctx.content.length
    
    // 添加计算数据
    pageData.frontmatter.readingTime = calculateReadingTime(ctx.content)
  }
}
```

### extendSiteData

扩展站点数据。

```ts
{
  async extendSiteData(siteData) {
    // 添加全局数据
    siteData.customData = await fetchGlobalData()
  }
}
```

### extendRoutes

扩展或修改路由。

```ts
{
  extendRoutes(routes) {
    // 添加新路由
    routes.push({
      path: '/api-docs',
      component: '/path/to/ApiDocs.vue'
    })
    
    // 修改现有路由
    const homeRoute = routes.find(r => r.path === '/')
    if (homeRoute) {
      homeRoute.meta = { ...homeRoute.meta, custom: true }
    }
    
    return routes
  }
}
```

## UI 注入

### slots

在预定义位置注入组件。

```ts
{
  // 对象形式
  slots: {
    'doc-after': {
      component: MyComponent,
      props: { message: 'Hello' },
      order: 100
    },
    'nav-bar-content-before': [
      { component: SearchButton, order: 0 },
      { component: ThemeToggle, order: 10 }
    ]
  }
}
```

```ts
{
  // 函数形式（可访问上下文）
  slots: (ctx) => {
    const shouldShow = ctx.data.getFrontmatter().showComments !== false
    
    return shouldShow ? {
      'doc-after': {
        component: CommentSection,
        props: { pageId: ctx.route.path }
      }
    } : {}
  }
}
```

**PluginSlotComponent 类型：**

```ts
interface PluginSlotComponent {
  component: Component
  props?: Record<string, unknown>
  order?: number  // 数字越小越靠前
}
```

### globalComponents

注册全局组件。

```ts
{
  globalComponents: [
    {
      name: 'Badge',
      component: BadgeComponent
    },
    {
      name: 'CodeDemo',
      component: CodeDemoComponent
    }
  ]
}
```

使用：

```md
<Badge text="新功能" type="tip" />

<CodeDemo src="./examples/demo.vue" />
```

### globalDirectives

注册全局指令。

```ts
{
  globalDirectives: [
    {
      name: 'tooltip',
      directive: {
        mounted(el, binding) {
          // 添加 tooltip
        }
      }
    }
  ]
}
```

使用：

```vue
<button v-tooltip="'提示文本'">按钮</button>
```

## 代码注入

### clientConfigFile

客户端配置文件路径或内容。

```ts
{
  // 文件路径
  clientConfigFile: '/path/to/client-config.ts'
}
```

```ts
{
  // 直接内容
  clientConfigFile: `
    export default {
      enhance({ app }) {
        app.config.globalProperties.$myPlugin = {}
      }
    }
  `
}
```

### headScripts

在 `<head>` 中注入脚本。

```ts
{
  headScripts: [
    // 内联脚本
    `console.log('Hello from plugin')`,
    
    // 外部脚本（使用完整标签）
    `<script src="https://example.com/analytics.js" async></script>`
  ]
}
```

```ts
{
  // 函数形式
  headScripts: (ctx) => {
    if (ctx.pageData.frontmatter.analytics) {
      return [`trackPage('${ctx.pageData.relativePath}')`]
    }
    return []
  }
}
```

### headStyles

在 `<head>` 中注入样式。

```ts
{
  headStyles: [
    `.my-plugin { color: red; }`,
    `@import url('https://fonts.googleapis.com/css2?family=...');`
  ]
}
```

## 上下文类型

### PluginPageContext

页面数据扩展上下文。

```ts
interface PluginPageContext {
  siteConfig: SiteConfig
  content: string      // Markdown 源内容
  filePath: string     // 绝对文件路径
  relativePath: string // 相对路径
}
```

### PageRenderContext

页面渲染上下文。

```ts
interface PageRenderContext {
  pageData: PageData
  siteConfig: SiteConfig
  html?: string  // 仅 onAfterPageRender 可用
}
```

### ClientPluginContext

客户端插件上下文。

```ts
interface ClientPluginContext {
  app: App              // Vue 应用实例
  router: Router        // Vue Router 实例
  siteData: SiteData    // 站点数据
  pageData: PageData    // 页面数据
  route: ClientRouteUtils
  data: ClientDataUtils
  ui: ClientUIUtils
  storage: ClientStorageUtils
  events: ClientEventBus
}
```

### TransformContext

转换上下文（用于 headScripts/headStyles）。

```ts
interface TransformContext {
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
}
```

### HotUpdateContext

热更新上下文。

```ts
interface HotUpdateContext {
  file: string
  timestamp: number
  modules: Set<ModuleNode>
  read: () => Promise<string>
  server: ViteDevServer
}
```
