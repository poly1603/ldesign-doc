---
title: 插件开发
---

# 插件开发

本指南将帮助你开发自己的 @ldesign/doc 插件。

## 基础结构

一个插件是一个返回 `LDocPlugin` 对象的函数：

```ts
import { definePlugin } from '@ldesign/doc'
import type { LDocPlugin } from '@ldesign/doc'

export interface MyPluginOptions {
  // 插件配置项
  message?: string
}

export function myPlugin(options: MyPluginOptions = {}): LDocPlugin {
  const { message = 'Hello' } = options

  return definePlugin({
    name: 'my-plugin',

    // 生命周期钩子
    configResolved(config) {
      console.log(message, config.title)
    }
  })
}
```

## 完整的插件模板

```ts
import { definePlugin } from '@ldesign/doc'
import type { 
  LDocPlugin, 
  UserConfig, 
  SiteConfig, 
  PageData,
  ClientPluginContext 
} from '@ldesign/doc'

export interface MyPluginOptions {
  enabled?: boolean
}

export function myPlugin(options: MyPluginOptions = {}): LDocPlugin {
  const { enabled = true } = options

  if (!enabled) {
    return definePlugin({ name: 'my-plugin-disabled' })
  }

  return definePlugin({
    name: 'my-plugin',
    enforce: 'pre',  // 'pre' | 'post' | number

    // ============== 配置阶段 ==============

    config(config, env) {
      // 修改用户配置
      return {
        ...config,
        // 你的修改
      }
    },

    configResolved(config) {
      // 配置解析完成，可以访问最终配置
    },

    // ============== Vite 扩展 ==============

    vitePlugins() {
      return [
        // 返回额外的 Vite 插件
      ]
    },

    // ============== Markdown 扩展 ==============

    extendMarkdown(md) {
      // 扩展 markdown-it 实例
      md.use(someMarkdownPlugin)
    },

    // ============== 数据扩展 ==============

    extendPageData(pageData, ctx) {
      // 扩展页面数据
      pageData.frontmatter.customField = 'value'
    },

    extendSiteData(siteData) {
      // 扩展站点数据
    },

    // ============== 路由扩展 ==============

    extendRoutes(routes) {
      // 修改或添加路由
      routes.push({
        path: '/custom',
        component: '/path/to/component.vue'
      })
      return routes
    },

    onBeforeRouteChange(to, from) {
      // 路由切换前（客户端）
      // 返回 false 可阻止导航
    },

    onAfterRouteChange(to) {
      // 路由切换后（客户端）
    },

    // ============== 构建生命周期 ==============

    buildStart(config) {
      // 构建开始
    },

    onBeforePageRender(page) {
      // 页面渲染前
    },

    onAfterPageRender(page) {
      // 页面渲染后，可访问 page.html
    },

    generateBundle(config) {
      // 所有页面生成后
    },

    buildEnd(config) {
      // 构建完成
    },

    // ============== 客户端生命周期 ==============

    onClientInit(ctx) {
      // Vue 应用初始化
    },

    onClientMounted(ctx) {
      // Vue 应用挂载完成
    },

    onClientUpdated(ctx) {
      // 页面更新后
    },

    // ============== UI 注入 ==============

    slots: {
      'doc-after': {
        component: MyComponent,
        props: { /* ... */ },
        order: 100
      }
    },

    // 或使用函数形式（可访问上下文）
    // slots: (ctx) => ({
    //   'doc-after': { ... }
    // }),

    globalComponents: [
      {
        name: 'MyGlobalComponent',
        component: MyGlobalComponent
      }
    ],

    globalDirectives: [
      {
        name: 'my-directive',
        directive: myDirective
      }
    ],

    // ============== 代码注入 ==============

    headScripts: [
      `console.log('Hello from plugin')`
    ],

    headStyles: [
      `.my-class { color: red; }`
    ],

    // ============== 热更新 ==============

    handleHotUpdate(ctx) {
      // 处理热更新
    },

    // ============== 清理 ==============

    onDestroy() {
      // 插件销毁时的清理工作
    }
  })
}
```

## 使用插件上下文

客户端钩子会收到 `ClientPluginContext`：

```ts
onClientMounted(ctx) {
  // Vue 应用实例
  const app = ctx.app

  // Vue Router 实例
  const router = ctx.router

  // 响应式数据
  const siteData = ctx.siteData
  const pageData = ctx.pageData

  // 路由工具
  ctx.route.path        // 当前路径
  ctx.route.hash        // 当前 hash
  ctx.route.query       // 查询参数
  ctx.route.go('/path') // 导航
  ctx.route.replace('/path')
  ctx.route.back()
  ctx.route.forward()
  ctx.route.scrollToAnchor('#id')

  // 数据工具
  ctx.data.getPageData()
  ctx.data.getSiteData()
  ctx.data.getThemeConfig()
  ctx.data.getFrontmatter()
  ctx.data.getHeaders()
  ctx.data.getLang()
  ctx.data.isDark()

  // UI 工具
  ctx.ui.showToast('消息', { type: 'success' })
  ctx.ui.showLoading('加载中...')
  ctx.ui.hideLoading()
  await ctx.ui.showModal({ title: '确认', content: '...' })
  await ctx.ui.copyToClipboard('text')

  // 存储工具
  ctx.storage.set('key', value)
  ctx.storage.get('key')
  ctx.storage.remove('key')
  ctx.storage.clear()

  // 事件总线
  ctx.events.on('event', handler)
  ctx.events.off('event', handler)
  ctx.events.emit('event', data)
  ctx.events.once('event', handler)
}
```

## 使用 Composables

在插件组件中使用内置 composables：

```vue
<script setup>
import { 
  usePluginContext,
  usePluginRoute,
  usePluginData,
  usePluginUI,
  usePluginStorage,
  usePluginEvents
} from '@ldesign/doc/client'

// 完整上下文
const ctx = usePluginContext()

// 或单独使用
const route = usePluginRoute()
const data = usePluginData()
const ui = usePluginUI()
const storage = usePluginStorage()
const events = usePluginEvents()
</script>
```

## 预定义事件

使用预定义的事件名称：

```ts
import { PluginEvents } from '@ldesign/doc/client'

ctx.events.on(PluginEvents.ROUTE_AFTER_CHANGE, (to) => {
  console.log('Route changed to:', to)
})

ctx.events.on(PluginEvents.THEME_CHANGE, () => {
  console.log('Theme changed')
})

ctx.events.on(PluginEvents.SEARCH_OPEN, () => {
  console.log('Search opened')
})
```

可用的预定义事件：

| 事件 | 描述 |
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

## 创建 UI 组件

### Vue 组件

```vue
<!-- MyPluginComponent.vue -->
<script setup lang="ts">
import { usePluginContext } from '@ldesign/doc/client'

const props = defineProps<{
  message: string
}>()

const ctx = usePluginContext()
const pageTitle = ctx.data.getPageData().title

function handleClick() {
  ctx.ui.showToast('Clicked!', { type: 'success' })
}
</script>

<template>
  <div class="my-plugin">
    <h3>{{ message }}</h3>
    <p>当前页面: {{ pageTitle }}</p>
    <button @click="handleClick">点击我</button>
  </div>
</template>

<style scoped>
.my-plugin {
  padding: 16px;
  background: var(--ldoc-c-bg-soft);
  border-radius: 8px;
}
</style>
```

### 使用 defineComponent

```ts
import { defineComponent, h } from 'vue'
import { usePluginContext } from '@ldesign/doc/client'

export const MyComponent = defineComponent({
  name: 'MyComponent',
  props: {
    message: String
  },
  setup(props) {
    const ctx = usePluginContext()

    return () => h('div', { class: 'my-component' }, [
      h('span', props.message),
      h('button', {
        onClick: () => ctx.ui.showToast('Clicked!')
      }, 'Click')
    ])
  }
})
```

## 扩展 Markdown

```ts
extendMarkdown(md) {
  // 添加自定义容器
  md.use(require('markdown-it-container'), 'custom', {
    validate: (params) => params.trim() === 'custom',
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        return '<div class="custom-container">\n'
      }
      return '</div>\n'
    }
  })

  // 添加自定义规则
  md.core.ruler.push('custom-rule', (state) => {
    // 处理 tokens
  })
}
```

## 发布插件

### package.json

```json
{
  "name": "ldoc-plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "@ldesign/doc": "^1.0.0"
  },
  "keywords": ["ldoc", "ldoc-plugin"]
}
```

### 命名约定

- 包名：`ldoc-plugin-*` 或 `@scope/ldoc-plugin-*`
- 插件名：`ldoc:plugin-name` 或 `my-org:plugin-name`

## 调试技巧

```ts
definePlugin({
  name: 'my-plugin',

  configResolved(config) {
    if (process.env.DEBUG) {
      console.log('[my-plugin] Config:', config)
    }
  },

  onClientMounted(ctx) {
    if (import.meta.env.DEV) {
      console.log('[my-plugin] Mounted')
      // @ts-ignore
      window.__myPlugin = { ctx }
    }
  }
})
```

## 示例：阅读时间插件

完整的插件示例：

```ts
import { definePlugin } from '@ldesign/doc'
import { defineComponent, h, computed } from 'vue'
import type { LDocPlugin, PageData, PluginPageContext } from '@ldesign/doc'

export interface ReadingTimeOptions {
  wordsPerMinute?: number
}

const ReadingTime = defineComponent({
  props: {
    minutes: Number,
    words: Number
  },
  setup(props) {
    const text = computed(() => 
      `📖 ${props.words} 字 · 约 ${props.minutes} 分钟`
    )
    
    return () => h('div', { 
      class: 'reading-time',
      style: { color: 'var(--ldoc-c-text-3)' }
    }, text.value)
  }
})

export function readingTimePlugin(options: ReadingTimeOptions = {}): LDocPlugin {
  const { wordsPerMinute = 200 } = options

  return definePlugin({
    name: 'ldoc:reading-time',

    extendPageData(pageData: PageData, ctx: PluginPageContext) {
      const text = ctx.content.replace(/<[^>]*>/g, '')
      const words = (text.match(/[\u4e00-\u9fa5]/g) || []).length +
                    (text.match(/[a-zA-Z]+/g) || []).length
      const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
      
      pageData.frontmatter.readingTime = { minutes, words }
    },

    slots: (ctx) => {
      const rt = ctx.data.getFrontmatter().readingTime as any
      if (!rt) return {}
      
      return {
        'doc-top': {
          component: ReadingTime,
          props: { minutes: rt.minutes, words: rt.words }
        }
      }
    }
  })
}
```
