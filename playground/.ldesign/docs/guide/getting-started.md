---
title: 快速开始
description: 从零开始搭建 LDoc 文档站点
---

# 快速开始

132本节将帮助你从零开始搭建一个 LDoc 文档站点。如果你想快速体验 LDoc 的功能，可以先跳到 [在线演示](#在线演示) 部分。

## 前置要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** - 版本 >= 18.0.0
- **包管理器** - pnpm (推荐)、npm 或 yarn
- **代码编辑器** - VS Code (推荐，有更好的 Markdown 支持)

## 安装

使用你喜欢的包管理器安装 LDoc：

```bash
# pnpm
pnpm add @ldesign/doc

# npm
npm install @ldesign/doc

# yarn
yarn add @ldesign/doc
```

## 初始化项目

使用 CLI 快速初始化项目结构：

```bash
npx ldoc init my-docs
```

这将创建以下目录结构：

```
my-docs/
├── docs/
│   ├── index.md          # 首页
│   ├── guide/
│   │   └── index.md      # 指南首页
│   └── public/           # 静态资源
├── ldoc.config.ts        # 配置文件
└── package.json
```

## 配置文件

创建 `ldoc.config.ts` 配置文件：

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
    }
  }
})
```

## 启动开发服务器

```bash
cd my-docs
pnpm dev
```

现在你可以在浏览器中访问 `http://localhost:5173` 查看你的文档站点了！

::: tip 提示
开发服务器支持热更新，修改 Markdown 文件后会自动刷新页面。
:::

## 构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

## 目录结构说明

### docs 目录

`docs/` 目录是存放所有文档内容的地方：

| 文件/目录 | 说明 |
|----------|------|
| `index.md` | 首页，支持 hero 和 features 配置 |
| `guide/` | 指南目录 |
| `api/` | API 文档目录 |
| `public/` | 静态资源，会被直接复制到输出目录 |

### 配置文件

`ldoc.config.ts` 是 LDoc 的核心配置文件，支持以下主要配置项：

```ts
interface UserConfig {
  title: string           // 站点标题
  description: string     // 站点描述
  lang: string           // 语言
  base: string           // 部署基础路径
  srcDir: string         // 文档源目录
  themeConfig: object    // 主题配置
  markdown: object       // Markdown 配置
  vite: object           // Vite 配置
}
```

## 在线演示

你可以在 [StackBlitz](https://stackblitz.com) 上在线体验 LDoc：

> 即将推出在线演示链接

## 常见问题

### 如何自定义主题？

LDoc 支持完全自定义主题，你可以：

1. 使用 CSS 变量覆盖默认样式
2. 创建自定义主题组件
3. 使用第三方主题

详见 [主题开发](/guide/theme) 章节。

### 如何添加搜索功能？

LDoc 内置了基于客户端的全文搜索功能，无需额外配置即可使用。如需更强大的搜索能力，可以集成 Algolia DocSearch。

### 如何部署到 GitHub Pages？

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: dist
```

## 下一步

了解更多配置选项，请查看 [配置](/guide/configuration) 页面。
