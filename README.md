# @ldesign/doc

> 🚀 现代化文档系统 - 支持 Vue/React 组件渲染、主题系统、插件系统

## 特性

- ⚡️ **基于 Vite** - 极速冷启动，即时热更新
- 📝 **Markdown 优先** - 支持 Vue/React 组件在文档中渲染
- 🎨 **主题系统** - 完全可定制的主题，支持暗色模式
- 🔌 **插件系统** - 强大的插件架构，轻松扩展功能
- 🔒 **认证支持** - 内置登录认证，保护私有文档
- 📱 **响应式** - 完美适配移动端
- 🔍 **搜索** - 内置全文搜索（开发中）
- 🌍 **国际化** - 多语言支持

## 快速开始

### 安装

```bash
# pnpm
pnpm add @ldesign/doc

# npm
npm install @ldesign/doc

# yarn
yarn add @ldesign/doc
```

### 初始化项目

```bash
# 创建新的文档站点
npx ldoc init my-docs

cd my-docs
pnpm install
pnpm dev
```

### 手动配置

创建 `ldoc.config.ts`：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Documentation',
  description: 'A documentation site powered by LDoc',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024'
    }
  }
})
```

### 命令

```bash
# 启动开发服务器
ldoc dev [root]

# 构建生产版本
ldoc build [root]

# 预览生产构建
ldoc preview [root]

# 初始化新项目
ldoc init [root]

# 创建插件项目
ldoc create plugin <name>

# 创建主题项目
ldoc create theme <name>
```

## 配置

### 站点配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `title` | `string` | `'LDoc'` | 站点标题 |
| `description` | `string` | `''` | 站点描述 |
| `base` | `string` | `'/'` | 站点基础路径 |
| `lang` | `string` | `'zh-CN'` | 站点语言 |
| `srcDir` | `string` | `'docs'` | 文档源目录 |
| `outDir` | `string` | `'.ldoc/dist'` | 构建输出目录 |

### 主题配置

```ts
interface ThemeConfig {
  // 导航栏
  nav?: NavItem[]
  
  // 侧边栏
  sidebar?: Sidebar | SidebarMulti
  
  // Logo
  logo?: string | { light: string; dark: string }
  
  // 社交链接
  socialLinks?: SocialLink[]
  
  // 页脚
  footer?: {
    message?: string
    copyright?: string
  }
  
  // 编辑链接
  editLink?: {
    pattern: string
    text?: string
  }
  
  // 搜索
  search?: {
    provider: 'local' | 'algolia'
    options?: object
  }
  
  // 大纲
  outline?: {
    level?: number | [number, number] | 'deep'
    label?: string
  }
}
```

## 主题开发

### 创建自定义主题

```ts
// .ldoc/theme/index.ts
import { defineTheme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('MyComponent', MyComponent)
  }
})
```

### 使用主题组件

默认主题提供以下组件可供覆盖：

- `VPNav` - 导航栏
- `VPSidebar` - 侧边栏
- `VPHome` - 首页布局
- `VPDoc` - 文档布局
- `VPFooter` - 页脚

## 插件系统

### 创建插件

```ts
import { definePlugin } from '@ldesign/doc'

export default definePlugin({
  name: 'my-plugin',
  
  // 修改配置
  config(config) {
    return {
      ...config,
      title: 'Modified Title'
    }
  },
  
  // 扩展 Markdown
  extendMarkdown(md) {
    md.use(myMarkdownPlugin)
  },
  
  // 扩展页面数据
  extendPageData(pageData) {
    pageData.customField = 'value'
  },
  
  // 构建钩子
  buildStart(config) {
    console.log('Build started')
  },
  
  buildEnd(config) {
    console.log('Build completed')
  }
})
```

### 使用插件

```ts
import { defineConfig } from '@ldesign/doc'
import myPlugin from './my-plugin'

export default defineConfig({
  plugins: [
    myPlugin()
  ]
})
```

### 内置插件

LDoc 提供多个开箱即用的内置插件：

| 插件 | 功能 | 使用方式 |
|------|------|----------|
| `readingTimePlugin` | 显示文章阅读时间 | `readingTimePlugin({ wordsPerMinute: 300 })` |
| `lastUpdatedPlugin` | 显示最后更新时间 | `lastUpdatedPlugin({ format: 'YYYY-MM-DD' })` |
| `copyCodePlugin` | 代码块复制按钮 | `copyCodePlugin()` |
| `imageViewerPlugin` | 图片预览放大 | `imageViewerPlugin({ zoom: true })` |
| `progressPlugin` | 阅读进度条 | `progressPlugin({ color: '#3b82f6' })` |
| `commentPlugin` | 评论系统 | `commentPlugin({ provider: 'giscus' })` |
| `searchPlugin` | 全文搜索 | `searchPlugin()` |

#### 使用示例

```ts
import { defineConfig } from '@ldesign/doc'
import readingTimePlugin from 'ldoc-plugin-reading-time'

export default defineConfig({
  plugins: [
    readingTimePlugin({
      wordsPerMinute: 300,
      includeCode: true
    })
  ]
})
```

#### Vue 组件演示

```ts
import { vuePlugin } from '@ldesign/doc/plugin-vue'

export default defineConfig({
  plugins: [
    vuePlugin()
  ]
})
```

#### React 组件演示

```ts
import { reactPlugin } from '@ldesign/doc/plugin-react'

export default defineConfig({
  plugins: [
    reactPlugin()
  ]
})
```

## 认证系统

### 启用认证

```ts
import { defineConfig } from '@ldesign/doc'
import { authPlugin } from '@ldesign/doc/plugins/auth'

export default defineConfig({
  plugins: [
    authPlugin({
      protectedRoutes: ['/admin/*', '/private/*'],
      loginPage: '/login'
    })
  ]
})
```

### 自定义认证提供者

```ts
import { defineAuthProvider } from '@ldesign/doc/plugins/auth'

const myAuthProvider = defineAuthProvider({
  name: 'custom',
  
  async login(credentials) {
    // 调用你的 API
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    
    const data = await response.json()
    return {
      success: data.success,
      user: data.user,
      token: data.token
    }
  },
  
  async logout() {
    await fetch('/api/logout', { method: 'POST' })
  },
  
  async getUser() {
    const response = await fetch('/api/user')
    return response.json()
  },
  
  async isAuthenticated() {
    const user = await this.getUser()
    return !!user
  }
})

export default defineConfig({
  plugins: [
    authPlugin({
      provider: myAuthProvider
    })
  ]
})
```

## Markdown 扩展

### Frontmatter

```md
---
title: 页面标题
description: 页面描述
layout: doc | home | custom
sidebar: true | false
outline: [2, 3]
---
```

### 自定义容器

```md
::: tip 提示
这是一个提示
:::

::: warning 警告
这是一个警告
:::

::: danger 危险
这是一个危险提示
:::

::: details 点击展开
隐藏的内容
:::
```

### 代码组

```md
::: code-group

```js [JavaScript]
console.log('Hello')
```

```ts [TypeScript]
console.log('Hello')
```

:::
```

### Vue 组件演示

```md
::: demo
```vue
<template>
  <button @click="count++">Count: {{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```
:::
```

## API

### 客户端 API

```ts
import { useData, useRoute, useRouter, useDark } from '@ldesign/doc/client'

// 获取页面和站点数据
const { page, site, theme, frontmatter } = useData()

// 路由
const route = useRoute()
const router = useRouter()

// 暗色模式
const { isDark, toggle } = useDark()
```

### Node API

```ts
import { createLDoc, build, serve } from '@ldesign/doc'

// 创建实例
const ldoc = await createLDoc('./', {
  command: 'serve',
  mode: 'development'
})

// 启动开发服务器
await ldoc.serve()

// 构建
await build('./')

// 预览
await serve('./')
```

## 目录结构

```
my-docs/
├── docs/
│   ├── index.md          # 首页
│   ├── guide/
│   │   ├── index.md
│   │   └── getting-started.md
│   └── public/           # 静态资源
├── .ldoc/
│   ├── theme/            # 自定义主题
│   └── config.ts         # 配置文件（可选位置）
├── ldoc.config.ts        # 配置文件
└── package.json
```

## License

MIT