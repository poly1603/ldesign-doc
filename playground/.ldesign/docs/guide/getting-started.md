---
title: 快速开始
---

# 快速开始

本页面将帮助你在 5 分钟内启动一个 @ldesign/doc 文档站点。

## 前置条件

- [Node.js](https://nodejs.org/) 18.0 或更高版本
- 终端，用于运行命令行
- 支持 Markdown 语法的文本编辑器，推荐 [VS Code](https://code.visualstudio.com/)

## 安装

### 使用脚手架（推荐）

```bash
# npm
npm create @ldesign/doc@latest my-docs

# pnpm
pnpm create @ldesign/doc my-docs

# yarn
yarn create @ldesign/doc my-docs
```

### 手动安装

如果你更喜欢手动配置，可以按以下步骤操作：

1. **创建并进入项目目录**

```bash
mkdir my-docs && cd my-docs
```

2. **初始化项目**

```bash
pnpm init
```

3. **安装 @ldesign/doc**

```bash
pnpm add -D @ldesign/doc
```

4. **创建第一篇文档**

```bash
mkdir src && echo '# Hello World' > src/index.md
```

5. **添加脚本命令**

在 `package.json` 中添加：

```json
{
  "scripts": {
    "dev": "ldoc dev",
    "build": "ldoc build",
    "preview": "ldoc preview"
  }
}
```

## 目录结构

脚手架会创建以下目录结构：

```
my-docs/
├── src/                    # 文档源文件目录
│   ├── index.md           # 首页
│   ├── guide/             # 指南目录
│   │   └── index.md
│   └── public/            # 静态资源
│       └── logo.svg
├── doc.config.ts          # 文档配置文件
├── package.json
└── tsconfig.json
```

## 配置文件

在项目根目录创建 `doc.config.ts`：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  // 站点标题
  title: 'My Docs',
  
  // 站点描述
  description: '我的文档站点',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/' }
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' }
          ]
        }
      ]
    }
  }
})
```

## 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:5173` 启动。

## 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

## 预览构建结果

```bash
pnpm preview
```

## 下一步

- 了解如何编写 [Markdown 内容](/guide/markdown)
- 配置你的 [站点信息](/config/)
- 探索 [插件系统](/plugins/)
