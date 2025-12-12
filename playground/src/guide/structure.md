---
title: 目录结构
---

# 目录结构

@ldesign/doc 采用约定优于配置的原则，以下是推荐的目录结构：

## 基础结构

```
my-docs/
├── src/                      # 📁 文档源文件
│   ├── index.md             # 首页
│   ├── guide/               # 指南目录
│   │   ├── index.md
│   │   └── getting-started.md
│   ├── api/                 # API 文档目录
│   │   └── index.md
│   └── public/              # 静态资源目录
│       ├── logo.svg
│       └── images/
├── .ldesign/                # 📁 构建缓存（自动生成）
├── dist/                    # 📁 构建输出（自动生成）
├── doc.config.ts            # 📄 文档配置
├── package.json
└── tsconfig.json
```

## 核心目录说明

### `src/` - 文档源目录

所有 Markdown 文件都放在这个目录中。目录结构将直接映射为 URL 路径：

| 文件路径 | URL 路径 |
|---------|---------|
| `src/index.md` | `/` |
| `src/guide/index.md` | `/guide/` |
| `src/guide/getting-started.md` | `/guide/getting-started` |
| `src/api/reference.md` | `/api/reference` |

### `src/public/` - 静态资源

此目录下的文件会被原样复制到构建输出目录：

```
src/public/logo.svg  →  dist/logo.svg
src/public/images/   →  dist/images/
```

在 Markdown 中引用：

```md
![Logo](/logo.svg)
```

### `.ldesign/` - 缓存目录

自动生成的缓存目录，包含：

- 编译后的临时文件
- 主题和插件的缓存
- 开发服务器数据

> 💡 此目录应添加到 `.gitignore`

### `dist/` - 构建输出

运行 `pnpm build` 后生成的静态文件，可直接部署到任何静态托管服务。

## 配置文件

### `doc.config.ts`

主配置文件，支持 TypeScript，提供完整的类型提示：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  description: 'A documentation site',
  
  // 源文件目录，默认 'src'
  srcDir: 'src',
  
  // 输出目录，默认 'dist'
  outDir: 'dist',
  
  // 主题配置
  themeConfig: {
    // ...
  },
  
  // 插件配置
  plugins: [
    // ...
  ]
})
```

### `package.json`

推荐的脚本配置：

```json
{
  "scripts": {
    "dev": "ldoc dev",
    "build": "ldoc build",
    "preview": "ldoc preview"
  }
}
```

## 多语言目录结构

如果需要支持多语言，推荐以下结构：

```
src/
├── en/                    # 英文版本
│   ├── index.md
│   └── guide/
├── zh/                    # 中文版本
│   ├── index.md
│   └── guide/
└── index.md              # 默认首页（可重定向）
```

配置多语言：

```ts
export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/'
    }
  }
})
```

## 组件目录结构

如果你的文档包含 Vue/React 组件演示：

```
src/
├── components/           # 📁 可复用的 Vue/React 组件
│   ├── Button.vue
│   └── Card.vue
├── examples/             # 📁 示例组件
│   └── ButtonDemo.vue
└── guide/
    └── components.md     # 在文档中使用组件
```

## 下一步

- 了解 [Markdown 扩展](/guide/markdown) 语法
- 配置 [站点信息](/config/)
- 探索 [插件系统](/plugins/)
