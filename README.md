# @ldesign/doc

> 🚀 现代化文档系统 - 支持 Vue/React 组件渲染、主题系统、插件系统、多评论系统支持

## 特性

- ⚡️ **基于 Vite** - 极速冷启动，即时热更新
- 📝 **Markdown 优先** - 支持 Vue/React 组件在文档中渲染，支持 Frontmatter 配置
- 🎨 **主题系统** - 内置精美主题，支持深色模式，自定义主题色，莫兰迪色系配色
- 🔌 **插件系统** - 强大的插件架构，提供丰富的内置插件
- 💬 **评论支持** - 完美支持 Artalk, Giscus, Gitalk, Waline, Twikoo 等主流评论系统
- 📱 **响应式** - 完美适配移动端
- 🔍 **搜索** - 客户端全文搜索
- 📊 **统计** - 内置阅读时间估算、字数统计
- 🛠 **开发体验** - TypeScript 支持，类型友好的配置

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

## 配置指南

创建 `.ldesign/doc.config.ts`：

```ts
import { defineConfig } from '@ldesign/doc'
import { 
  searchPlugin, 
  readingTimePlugin, 
  commentPlugin 
} from '@ldesign/doc/plugins'

export default defineConfig({
  title: 'My Documentation',
  description: 'A documentation site powered by LDoc',
  
  // 主题配置
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
    
    // 主题色配置
    themeColors: {
      default: 'blue', // 默认主题色
    }
  },

  // 插件配置
  plugins: [
    searchPlugin(),
    readingTimePlugin(),
    // 评论插件配置 (支持 Artalk, Giscus, Gitalk, Waline, Twikoo)
    commentPlugin({
      provider: 'artalk',
      artalk: {
        server: 'https://your-artalk-server.com',
        site: 'My Docs'
      }
    })
  ]
})
```

## 内置插件

LDoc 提供多个开箱即用的内置插件：

| 插件 | 功能 | 配置示例 |
|------|------|----------|
| `commentPlugin` | 多平台评论支持 | 见下文详细配置 |
| `searchPlugin` | 客户端搜索 | `searchPlugin({ hotkeys: ['/'] })` |
| `readingTimePlugin` | 阅读时间估算 | `readingTimePlugin({ wordsPerMinute: 300 })` |
| `wordCountPlugin` | 字数统计 | `wordCountPlugin()` |
| `lastUpdatedPlugin` | 最后更新时间 | `lastUpdatedPlugin({ useGitTime: true })` |
| `copyCodePlugin` | 代码块复制 | `copyCodePlugin({ showLanguage: true })` |
| `imageViewerPlugin` | 图片预览放大 | `imageViewerPlugin({ zoom: true })` |
| `demoPlugin` | 代码演示容器 | `demoPlugin()` |
| `progressPlugin` | 阅读进度条 | `progressPlugin({ color: 'var(--ldoc-c-brand)' })` |

### 评论插件配置

#### Artalk (推荐)
支持自定义 UI 风格适配、深色模式自动切换。

```ts
commentPlugin({
  provider: 'artalk',
  artalk: {
    server: 'https://your-artalk-server.com',
    site: 'Site Name'
  }
})
```

#### Giscus
基于 GitHub Discussions。

```ts
commentPlugin({
  provider: 'giscus',
  giscus: {
    repo: 'user/repo',
    repoId: 'R_...',
    category: 'Announcements',
    categoryId: 'DIC_...'
  }
})
```

#### Gitalk
基于 GitHub Issues。

```ts
commentPlugin({
  provider: 'gitalk',
  gitalk: {
    clientID: 'GitHub Application Client ID',
    clientSecret: 'GitHub Application Client Secret',
    repo: 'GitHub repo',
    owner: 'GitHub repo owner',
    admin: ['GitHub repo owner and collaborators']
  }
})
```

#### Waline
```ts
commentPlugin({
  provider: 'waline',
  waline: {
    serverURL: 'https://your-waline-server.vercel.app'
  }
})
```

#### Twikoo
```ts
commentPlugin({
  provider: 'twikoo',
  twikoo: {
    envId: 'your-env-id'
  }
})
```

## Markdown 扩展

### 提示容器

```md
::: tip 提示
这是一个提示信息
:::

::: warning 警告
这是一个警告信息
:::

::: danger 危险
这是一个危险信息
:::
```

### 代码演示

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

### 图片缩放

在 Markdown 中插入图片自动支持点击放大预览。

## 目录结构

```
my-docs/
├── docs/
│   ├── index.md          # 首页
│   ├── guide/            # 指南文档
│   └── public/           # 静态资源
├── .ldesign/
│   ├── doc.config.ts     # 主配置文件
│   ├── configs/          # 分拆配置 (可选)
│   │   ├── nav.ts
│   │   └── sidebar.ts
└── package.json
```

## License

MIT