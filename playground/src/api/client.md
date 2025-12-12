---
title: 客户端 API
---

# 客户端 API

客户端 API 用于在 Vue 组件或插件中访问文档数据和功能。

## 导入

```ts
import {
  // 基础 Composables
  useData,
  useRoute,
  useRouter,
  useSiteData,
  usePageData,
  useDark,
  useSidebar,
  
  // 插件 API
  usePluginContext,
  usePluginRoute,
  usePluginData,
  usePluginUI,
  usePluginStorage,
  usePluginEvents,
  PluginEvents
} from '@ldesign/doc/client'
```

## 基础 Composables

### useData

获取当前页面的完整数据。

```ts
const { 
  site,      // 站点数据
  page,      // 页面数据
  theme,     // 主题配置
  frontmatter, // 当前页面 frontmatter
  lang,      // 当前语言
  title,     // 页面标题
  description // 页面描述
} = useData()
```

**返回值：**

```ts
interface Data {
  site: Ref<SiteData>
  page: Ref<PageData>
  theme: Ref<ThemeConfig>
  frontmatter: Ref<Record<string, unknown>>
  lang: Ref<string>
  title: Ref<string>
  description: Ref<string>
}
```

### useRoute

获取当前路由信息。

```ts
const route = useRoute()

console.log(route.path)   // '/guide/'
console.log(route.hash)   // '#section'
console.log(route.data)   // PageData
```

**返回值：**

```ts
interface Route {
  path: string
  hash: string
  query: Record<string, string>
  data: PageData
}
```

### useRouter

获取路由器实例。

```ts
const router = useRouter()

// 导航
router.go('/guide/')
router.replace('/api/')
router.back()
router.forward()
```

### useSiteData

获取站点数据。

```ts
const siteData = useSiteData()

console.log(siteData.value.title)
console.log(siteData.value.description)
```

### usePageData

获取当前页面数据。

```ts
const pageData = usePageData()

console.log(pageData.value.title)
console.log(pageData.value.frontmatter)
console.log(pageData.value.headers)
```

### useDark

暗色模式状态。

```ts
const isDark = useDark()

// 切换
isDark.value = !isDark.value

// 或使用 toggle
const { isDark, toggle } = useDark()
toggle()
```

### useSidebar

侧边栏状态。

```ts
const { isOpen, open, close, toggle } = useSidebar()

// 打开侧边栏
open()

// 关闭
close()

// 切换
toggle()
```

## 插件 Composables

### usePluginContext

获取完整的插件上下文。

```ts
const ctx = usePluginContext()

// 应用实例
ctx.app
ctx.router

// 数据
ctx.siteData
ctx.pageData

// 工具
ctx.route
ctx.data
ctx.ui
ctx.storage
ctx.events
```

**类型定义：**

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

### usePluginRoute

路由工具。

```ts
const route = usePluginRoute()

// 属性
route.path     // 当前路径
route.hash     // 当前 hash
route.query    // 查询参数

// 方法
route.go('/path')
route.replace('/path')
route.back()
route.forward()
route.scrollToAnchor('#section')
```

**类型定义：**

```ts
interface ClientRouteUtils {
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

### usePluginData

数据工具。

```ts
const data = usePluginData()

// 获取数据
data.getPageData()
data.getSiteData()
data.getThemeConfig()
data.getFrontmatter()
data.getHeaders()
data.getLang()
data.isDark()
```

**类型定义：**

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

### usePluginUI

UI 工具。

```ts
const ui = usePluginUI()

// Toast
ui.showToast('消息', {
  type: 'success',  // 'success' | 'error' | 'warning' | 'info'
  duration: 3000,
  position: 'top'   // 'top' | 'bottom' | 'center'
})

// Loading
ui.showLoading('加载中...')
ui.hideLoading()

// Modal
const confirmed = await ui.showModal({
  title: '确认',
  content: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true
})

// 复制到剪贴板
const success = await ui.copyToClipboard('要复制的文本')
```

**类型定义：**

```ts
interface ClientUIUtils {
  showToast: (message: string, options?: ToastOptions) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
  showModal: (options: ModalOptions) => Promise<boolean>
  copyToClipboard: (text: string) => Promise<boolean>
}

interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'bottom' | 'center'
}

interface ModalOptions {
  title?: string
  content: string | Component
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}
```

### usePluginStorage

本地存储工具（带 `ldoc:` 前缀）。

```ts
const storage = usePluginStorage()

// 存储
storage.set('key', { foo: 'bar' })

// 读取
const value = storage.get<{ foo: string }>('key')

// 删除
storage.remove('key')

// 清空所有 ldoc 存储
storage.clear()
```

**类型定义：**

```ts
interface ClientStorageUtils {
  get: <T>(key: string, defaultValue?: T) => T | null
  set: <T>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
}
```

### usePluginEvents

事件总线。

```ts
const events = usePluginEvents()

// 监听
events.on('custom-event', (data) => {
  console.log('收到事件:', data)
})

// 触发
events.emit('custom-event', { foo: 'bar' })

// 只监听一次
events.once('one-time-event', handler)

// 取消监听
events.off('custom-event', handler)
```

**类型定义：**

```ts
interface ClientEventBus {
  on: <T>(event: string, callback: (data: T) => void) => void
  off: (event: string, callback?: (data: unknown) => void) => void
  emit: <T>(event: string, data?: T) => void
  once: <T>(event: string, callback: (data: T) => void) => void
}
```

### PluginEvents

预定义的事件名称常量。

```ts
import { PluginEvents } from '@ldesign/doc/client'

events.on(PluginEvents.ROUTE_AFTER_CHANGE, handler)
events.on(PluginEvents.DARK_MODE_CHANGE, handler)
events.on(PluginEvents.SEARCH_OPEN, handler)
```

**可用事件：**

```ts
const PluginEvents = {
  // 路由
  ROUTE_BEFORE_CHANGE: 'route:before-change',
  ROUTE_AFTER_CHANGE: 'route:after-change',
  
  // 页面
  PAGE_LOADED: 'page:loaded',
  PAGE_SCROLL: 'page:scroll',
  PAGE_RESIZE: 'page:resize',
  
  // 主题
  THEME_CHANGE: 'theme:change',
  DARK_MODE_CHANGE: 'dark-mode:change',
  
  // 搜索
  SEARCH_OPEN: 'search:open',
  SEARCH_CLOSE: 'search:close',
  SEARCH_QUERY: 'search:query',
  
  // 侧边栏
  SIDEBAR_TOGGLE: 'sidebar:toggle',
  SIDEBAR_OPEN: 'sidebar:open',
  SIDEBAR_CLOSE: 'sidebar:close',
  
  // TOC
  TOC_ACTIVE_CHANGE: 'toc:active-change',
  
  // 评论
  COMMENT_SUBMIT: 'comment:submit',
  COMMENT_REPLY: 'comment:reply',
  COMMENT_DELETE: 'comment:delete'
}
```

## 组件

### Content

渲染当前页面的 Markdown 内容。

```vue
<template>
  <Content />
</template>

<script setup>
import { Content } from '@ldesign/doc/client'
</script>
```

### PluginSlot

渲染指定位置的插件组件。

```vue
<template>
  <PluginSlot name="doc-after" />
</template>

<script setup>
import { PluginSlot } from '@ldesign/doc/client'
</script>
```

### PluginUI

渲染 Toast、Loading、Modal 等 UI 组件。

```vue
<template>
  <PluginUI />
</template>

<script setup>
import { PluginUI } from '@ldesign/doc/client'
</script>
```

> 💡 主题布局通常已经包含了这个组件，无需手动添加。
