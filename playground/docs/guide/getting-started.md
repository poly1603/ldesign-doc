# 快速开始

本节将帮助你从零开始搭建一个 LDoc 文档站点。

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

## 下一步

了解更多配置选项，请查看 [配置](/guide/configuration) 页面。
