# @ldesign/doc

> 现代化文档系统 - 支持 Vue/React 组件渲染、主题系统、插件系统、多评论系统支持

## 特性

- 基于 Vite - 极速冷启动，即时热更新
- Markdown 优先 - 支持 Vue/React 组件在文档中渲染，支持 Frontmatter 配置
- 主题系统 - 内置精美主题，支持深色模式，自定义主题色，莫兰迪色系配色
- 插件系统 - 强大的插件架构，提供丰富的内置插件
- 评论支持 - 完美支持 Artalk, Giscus, Gitalk, Waline, Twikoo 等主流评论系统
- 响应式 - 完美适配移动端
- 搜索 - 客户端全文搜索
- 统计 - 内置阅读时间估算、字数统计
- 开发体验 - TypeScript 支持，类型友好的配置

## 环境要求

- Node.js: >= 18.0.0
- 包管理器: 推荐 pnpm >= 9.0.0
- 浏览器: 支持 ES Modules 的现代浏览器

## 快速开始

### 安装

```bash
# pnpm (推荐)
pnpm add @ldesign/doc

# npm
npm install @ldesign/doc

# yarn
yarn add @ldesign/doc
```

### 初始化项目

LDoc 提供了一个交互式的初始化命令，可以快速创建一个基于最佳实践的文档项目。

```bash
# 在当前目录下初始化（或指定目录）
npx ldoc init my-docs

cd my-docs
pnpm install
pnpm dev
```

## CLI 命令详解

LDoc 提供了一套简洁一致的命令行工具：

| 命令 | 说明 | 常用选项 |
|------|------|----------|
| ldoc dev [root] | 启动开发服务器 | --port <port>, --open, --host |
| ldoc build [root] | 构建生产环境静态资源 | -- |
| ldoc preview [root] | 预览构建产物 | --port <port>, --open |
| ldoc init [root] | 初始化新项目 | -- |
| ldoc version | 查看当前版本 | -- |
| ldoc upgrade | 升级 ldoc 到最新版本 | -- |
| ldoc deploy | 部署文档 (需配置 deploy 选项) | -- |

> 提示：[root] 参数默认为当前目录。

## 配置指南

配置文件通常位于 .ldesign/doc.config.ts。

### 完整配置示例

```ts
import { defineConfig } from '@ldesign/doc'
import { 
  searchPlugin, 
  readingTimePlugin, 
  commentPlugin,
  progressPlugin,
  copyCodePlugin,
  imageViewerPlugin,
  demoPlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  // 站点基础信息
  title: 'LDesign Doc',
  description: 'A modern documentation system',
  lang: 'zh-CN',
  
  // 框架支持: 'auto' | 'vue' | 'react' (auto 会自动检测)
  framework: 'auto',

  // 文档源目录
  srcDir: 'docs',

  // 主题配置
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'LDesign',
    
    // 顶部导航
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      { 
        text: '相关链接',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/doc' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速上手', link: '/guide/quick-start' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],

    // 顶部公告栏 (支持多条滚动消息)
    announcement: {
      content: [
        { text: ' LDoc 1.0 正式发布！', link: '/guide/introduction' },
        { text: ' 支持 Vue / React 组件混合渲染', link: '/guide/features' },
        { text: ' 基于 Vite 5 的极速体验' }
      ],
      type: 'info', // 'info' | 'warning' | 'success' | 'error'
      closable: true,
      storageKey: 'ldoc-announcement-v1' // 用于记录关闭状态
    },
    
    // 底部页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024-present LDesign Team'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    }
  },

  // 插件配置
  plugins: [
    searchPlugin({ hotkeys: ['/', 'k'] }),
    progressPlugin(),
    copyCodePlugin(),
    imageViewerPlugin(),
    demoPlugin(), // 开启代码演示功能
    readingTimePlugin(),
    // 评论系统配置
    commentPlugin({
      provider: 'giscus',
      giscus: {
        repo: 'user/repo',
        repoId: 'R_...',
        category: 'Announcements',
        categoryId: 'DIC_...'
      }
    })
  ],

  // Vite 配置透传
  vite: {
    server: {
      port: 3000
    }
  }
})
```

## Markdown 与扩展功能

LDoc 对 Markdown 进行了深度扩展，支持多种实用功能。

### 1. 提示容器 (Admonitions)

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

::: details 点击查看详情
这里是详细内容...
:::
```

### 2. 代码演示 (Demo)

支持 Vue 和 React 组件的实时预览和代码展示。

#### 基础用法

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

#### 外部引入

```md
<!-- 引入外部组件作为演示 -->
<demo src="./components/ButtonDemo.vue" title="按钮组件演示" />
```

### 3. 图片增强

Markdown 中的图片自动支持点击放大预览 (需启用 `imageViewerPlugin`)。

```md
![Alt text](./image.png)
```

## 内置插件系统

LDoc 采用插件化架构，内置了丰富的插件：

| 插件名 | 功能 | 默认配置 |
|--------|------|----------|
| searchPlugin | 本地全文搜索 | `{ hotkeys: ['/'] }` |
| readingTimePlugin | 阅读时间估算 | `{ wordsPerMinute: 300 }` |
| wordCountPlugin | 字数统计 | `{}` |
| lastUpdatedPlugin | 最后更新时间 | `{ useGitTime: true }` |
| copyCodePlugin | 代码块复制按钮 | `{ showLanguage: true }` |
| imageViewerPlugin | 图片灯箱预览 | `{ zoom: true }` |
| demoPlugin | 代码演示容器 | `{ defaultTitle: '示例' }` |
| progressPlugin | 顶部阅读进度条 | `{ color: 'var(--ldoc-c-brand)' }` |
| commentPlugin | 评论系统集成 | 需指定 `provider` |
| authPlugin | 用户认证登录 | 需配置 `onLogin` 和 `onGetUser` |

### 认证插件 (authPlugin)

在导航栏右侧添加登录按钮，支持自定义登录面板、验证码、表单事件监听等。

```ts
import { authPlugin } from '@ldesign/doc/plugins'

authPlugin({
  // 登录按钮文本
  loginText: '登录',
  loginTextEn: 'Login',

  // 登录面板标题
  panelTitle: '用户登录',
  panelTitleEn: 'User Login',

  // 获取验证码（支持字符串、同步函数、异步函数）
  getCaptcha: async () => {
    const res = await fetch('/api/captcha')
    const data = await res.json()
    return data.imageUrl
  },

  // 登录面板打开时回调（可用于获取 session）
  onPanelOpen: async () => {
    await fetch('/api/session')
  },

  // 表单变化监听
  onFormChange: (field, value, formData) => {
    console.log('Field changed:', field, value)
  },

  // 点击登录按钮（必填，返回登录结果）
  onLogin: async (formData) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const data = await res.json()
    if (data.success) {
      return { success: true, user: data.user }
    }
    return { success: false, error: data.message }
  },

  // 插件加载时获取用户信息（必填）
  onGetUser: async () => {
    const res = await fetch('/api/user')
    const data = await res.json()
    if (data.user) {
      return { isLoggedIn: true, user: data.user }
    }
    return { isLoggedIn: false }
  },

  // 退出登录回调
  onLogout: async () => {
    await fetch('/api/logout', { method: 'POST' })
  },

  // 用户菜单项
  userMenuItems: [
    { text: '个人中心', textEn: 'Profile', icon: '👤', onClick: (user) => { /* ... */ } },
    { text: '设置', textEn: 'Settings', icon: '⚙️', onClick: (user) => { /* ... */ } }
  ],

  // 保护的路由（需要登录才能访问）
  protectedRoutes: ['/admin/*', '/dashboard']
})
```

**用户信息类型 (AuthUser)**:
```ts
interface AuthUser {
  id: string
  name: string
  email?: string
  avatar?: string
  roles?: string[]
  [key: string]: unknown
}
```

### 评论插件支持列表

- Artalk (推荐): 自托管，支持侧边栏和深色模式。
- Giscus: 基于 GitHub Discussions。
- Gitalk: 基于 GitHub Issues。
- Waline: 基于 Valine 的增强版。
- Twikoo: 腾讯云开发支持。

## 多语言支持 (i18n)

在 `doc.config.ts` 中配置 `locales`：

```ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/', // URL 前缀
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' }
        ],
        sidebar: {
          '/en/guide/': [/* ... */]
        }
      }
    }
  }
})
```

目录结构示例：
```
docs/
  index.md
  guide/
  en/
    index.md
    guide/
```

## 常见问题 (FAQ)

Q: 启动时报错 `Failed to resolve import "react-dom/client"`?
A: 请确保 `@ldesign/doc` 版本 >= 0.0.6。新版本已内置了对 Vue/React 依赖的自动别名处理，无需手动安装 peerDependencies。

Q: 顶部公告栏不显示？
A: 
1. 检查 `themeConfig.announcement` 是否配置正确。
2. 如果设置了 `storageKey` 且手动关闭过，请尝试更换 key 或在控制台清除 localStorage。
3. 确保安装了最新版本。

Q: 样式显示异常？
A: 尝试删除 `node_modules` 和 `.ldesign` 缓存目录，重新运行 `pnpm install`。

## License

MIT