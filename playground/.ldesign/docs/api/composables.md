# Composables

客户端 Composables 用于在 Vue 组件中访问文档数据。

## useData

获取页面完整数据。

```ts
import { useData } from '@ldesign/doc/client'

const { site, page, theme, frontmatter, lang, title, description } = useData()
```

**返回值**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `site` | `Ref<SiteData>` | 站点数据 |
| `page` | `Ref<PageData>` | 页面数据 |
| `theme` | `Ref<ThemeConfig>` | 主题配置 |
| `frontmatter` | `Ref<Record<string, unknown>>` | 页面 frontmatter |
| `lang` | `Ref<string>` | 当前语言 |
| `title` | `Ref<string>` | 页面标题 |
| `description` | `Ref<string>` | 页面描述 |

## useRoute

获取当前路由信息。

```ts
import { useRoute } from '@ldesign/doc/client'

const route = useRoute()

console.log(route.path)   // '/guide/'
console.log(route.hash)   // '#section'
console.log(route.data)   // PageData
```

## useRouter

获取路由器实例。

```ts
import { useRouter } from '@ldesign/doc/client'

const router = useRouter()

router.go('/guide/')
router.replace('/api/')
router.back()
router.forward()
```

## useSiteData

获取站点数据。

```ts
import { useSiteData } from '@ldesign/doc/client'

const siteData = useSiteData()
console.log(siteData.value.title)
```

## usePageData

获取页面数据。

```ts
import { usePageData } from '@ldesign/doc/client'

const pageData = usePageData()
console.log(pageData.value.title)
console.log(pageData.value.headers)
```

## useDark

暗色模式状态。

```ts
import { useDark } from '@ldesign/doc/client'

const isDark = useDark()

// 切换
isDark.value = !isDark.value
```

## useSidebar

侧边栏状态。

```ts
import { useSidebar } from '@ldesign/doc/client'

const { isOpen, open, close, toggle } = useSidebar()

toggle()
```

## usePluginContext

插件上下文（用于插件开发）。

```ts
import { usePluginContext } from '@ldesign/doc/client'

const ctx = usePluginContext()

// 路由工具
ctx.route.go('/path')
ctx.route.scrollToAnchor('#section')

// 数据工具
ctx.data.getPageData()
ctx.data.getFrontmatter()
ctx.data.isDark()

// UI 工具
ctx.ui.showToast('消息', { type: 'success' })
ctx.ui.copyToClipboard('文本')

// 存储工具
ctx.storage.set('key', value)
ctx.storage.get('key')

// 事件总线
ctx.events.on('event', handler)
ctx.events.emit('event', data)
```

## usePluginUI

UI 工具。

```ts
import { usePluginUI } from '@ldesign/doc/client'

const ui = usePluginUI()

// Toast
ui.showToast('消息', { 
  type: 'success',  // 'success' | 'error' | 'warning' | 'info'
  duration: 3000 
})

// Loading
ui.showLoading('加载中...')
ui.hideLoading()

// Modal
const confirmed = await ui.showModal({
  title: '确认',
  content: '确定要执行吗？',
  showCancel: true
})

// 复制
await ui.copyToClipboard('文本')
```

## usePluginStorage

本地存储（带 `ldoc:` 前缀）。

```ts
import { usePluginStorage } from '@ldesign/doc/client'

const storage = usePluginStorage()

storage.set('key', { foo: 'bar' })
const value = storage.get<{ foo: string }>('key')
storage.remove('key')
storage.clear()
```

## usePluginEvents

事件总线。

```ts
import { usePluginEvents, PluginEvents } from '@ldesign/doc/client'

const events = usePluginEvents()

// 自定义事件
events.on('custom-event', (data) => console.log(data))
events.emit('custom-event', { foo: 'bar' })

// 预定义事件
events.on(PluginEvents.ROUTE_AFTER_CHANGE, (to) => {
  console.log('路由变化:', to)
})

events.on(PluginEvents.DARK_MODE_CHANGE, () => {
  console.log('主题切换')
})
```

### 预定义事件

| 事件 | 说明 |
|------|------|
| `ROUTE_BEFORE_CHANGE` | 路由切换前 |
| `ROUTE_AFTER_CHANGE` | 路由切换后 |
| `PAGE_LOADED` | 页面加载完成 |
| `PAGE_SCROLL` | 页面滚动 |
| `THEME_CHANGE` | 主题切换 |
| `DARK_MODE_CHANGE` | 暗色模式切换 |
| `SEARCH_OPEN` | 搜索打开 |
| `SEARCH_CLOSE` | 搜索关闭 |
| `SIDEBAR_TOGGLE` | 侧边栏切换 |
| `TOC_ACTIVE_CHANGE` | 目录活动项变化 |
