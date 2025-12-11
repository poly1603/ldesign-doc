---
title: API 参考
description: LDoc 的完整 API 文档
---

# API 参考

本节包含 LDoc 的完整 API 文档，包括配置 API、主题 API、插件 API 和客户端 API。

## 概述

LDoc 提供了丰富的 API 来满足不同的定制需求：

| API 类型 | 说明 | 使用场景 |
|---------|------|---------|
| 配置 API | 定义站点配置 | 基础配置、主题配置 |
| 主题 API | 自定义主题 | 更改布局、样式 |
| 插件 API | 扩展功能 | 添加 Markdown 插件、Vite 插件 |
| 客户端 API | 运行时功能 | 页面数据、路由、组合式函数 |

## 配置 API

### defineConfig

用于定义配置文件，提供类型提示：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  // ...
})
```

### defineConfigWithTheme

带自定义主题配置类型的配置定义：

```ts
import { defineConfigWithTheme } from '@ldesign/doc'
import type { MyThemeConfig } from './theme'

export default defineConfigWithTheme<MyThemeConfig>({
  themeConfig: {
    // 自定义主题配置，带类型提示
  }
})
```

## 主题 API

### defineTheme

用于定义自定义主题：

```ts
import { defineTheme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app, router, siteData }) {
    // 增强应用
  }
})
```

## 插件 API

### definePlugin

用于定义插件：

```ts
import { definePlugin } from '@ldesign/doc'

export default definePlugin({
  name: 'my-plugin',
  
  config(config) {
    return config
  },
  
  extendMarkdown(md) {
    // 扩展 Markdown
  }
})
```
