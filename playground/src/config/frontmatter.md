---
title: Frontmatter 配置
---

# Frontmatter 配置

Frontmatter 是页面级别的配置，通过 YAML 格式定义在 Markdown 文件开头。

## 完整配置参考

```yaml
---
# ========== 页面元数据 ==========
title: string           # 页面标题
titleTemplate: string   # 标题模板
description: string     # 页面描述

# ========== 布局配置 ==========
layout: 'doc' | 'home' | 'page' | false
navbar: boolean         # 显示导航栏，默认 true
sidebar: boolean        # 显示侧边栏，默认 true
aside: boolean | 'left' # 显示/隐藏右侧栏
outline: number | [number, number] | 'deep' | false

# ========== 导航配置 ==========
prev: boolean | { text: string, link: string }
next: boolean | { text: string, link: string }
editLink: boolean
lastUpdated: boolean | Date

# ========== 页面特性 ==========
pageClass: string       # 自定义页面 class
footer: boolean         # 显示页脚

# ========== HEAD 配置 ==========
head: HeadConfig[]

# ========== 首页配置 ==========
hero: HeroConfig
features: FeatureConfig[]

# ========== 自定义数据 ==========
# 任意自定义字段...
---
```

## 页面元数据

### title

页面标题，用于：
- 浏览器标签页
- SEO `<title>` 标签
- 社交分享标题

```yaml
---
title: 快速开始指南
---
```

### titleTemplate

标题模板，用于自定义完整标题格式：

```yaml
---
title: 快速开始
titleTemplate: ':title - 我的文档'
---
# 结果：快速开始 - 我的文档
```

```yaml
---
title: 首页
titleTemplate: false  # 禁用模板，只显示 title
---
```

### description

页面描述，用于 SEO：

```yaml
---
description: 这是一份详细的快速开始指南，帮助你在 5 分钟内搭建文档站点。
---
```

## 布局配置

### layout

| 值 | 描述 |
|---|---|
| `'doc'` | 默认文档布局，包含侧边栏和大纲 |
| `'home'` | 首页布局，支持 hero 和 features |
| `'page'` | 纯净页面布局，无侧边栏 |
| `false` | 无布局，完全自定义 |

```yaml
---
layout: page
---

<div class="custom-page">
  完全自定义的页面内容
</div>
```

### navbar

控制导航栏显示：

```yaml
---
navbar: false  # 隐藏导航栏
---
```

### sidebar

控制侧边栏显示：

```yaml
---
sidebar: false  # 隐藏侧边栏
---
```

### aside

控制右侧大纲栏：

```yaml
---
aside: false   # 隐藏
aside: true    # 显示（默认）
aside: 'left'  # 显示在左侧
---
```

### outline

控制大纲显示的标题级别：

```yaml
---
# 只显示 h2
outline: 2

# 显示 h2 和 h3
outline: [2, 3]

# 显示所有级别
outline: deep

# 禁用大纲
outline: false
---
```

## 导航配置

### prev / next

自定义上一页/下一页链接：

```yaml
---
prev:
  text: '← 介绍'
  link: '/guide/'
next:
  text: '配置 →'
  link: '/guide/config'
---
```

禁用链接：

```yaml
---
prev: false
next: false
---
```

### editLink

控制编辑链接显示：

```yaml
---
editLink: false  # 隐藏编辑链接
---
```

### lastUpdated

控制最后更新时间：

```yaml
---
lastUpdated: false  # 隐藏

# 或指定时间
lastUpdated: 2024-01-15
---
```

## 页面特性

### pageClass

添加自定义 CSS 类：

```yaml
---
pageClass: custom-page-class
---
```

```css
/* 在 CSS 中使用 */
.custom-page-class {
  /* 自定义样式 */
}

.custom-page-class .content {
  max-width: 1400px;
}
```

### footer

控制页脚显示：

```yaml
---
footer: false  # 隐藏页脚
---
```

## HEAD 配置

添加页面级别的 `<head>` 标签：

```yaml
---
head:
  # meta 标签
  - - meta
    - name: author
      content: John Doe
  
  # link 标签
  - - link
    - rel: canonical
      href: https://example.com/page
  
  # script 标签
  - - script
    - src: /scripts/page-specific.js
---
```

## 首页配置

### hero

首页 Hero 区域：

```yaml
---
layout: home
hero:
  name: 项目名称
  text: 主标语
  tagline: 副标语描述
  image:
    src: /hero-image.svg
    alt: Hero Image
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/xxx
---
```

#### hero.actions

| 属性 | 类型 | 描述 |
|------|------|------|
| `theme` | `'brand' \| 'alt'` | 按钮样式 |
| `text` | `string` | 按钮文本 |
| `link` | `string` | 链接地址 |

### features

特性列表：

```yaml
---
layout: home
features:
  - icon: 🚀
    title: 极速
    details: 基于 Vite，毫秒级热更新
    link: /guide/performance
    linkText: 了解更多
  
  - icon:
      src: /icons/typescript.svg
    title: TypeScript 支持
    details: 完整的类型定义和智能提示
  
  - icon:
      dark: /icons/dark.svg
      light: /icons/light.svg
    title: 主题切换
    details: 支持亮色和暗色主题
---
```

#### feature 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `icon` | `string \| { src: string } \| { dark: string, light: string }` | 图标 |
| `title` | `string` | 标题 |
| `details` | `string` | 描述 |
| `link` | `string` | 链接 |
| `linkText` | `string` | 链接文本 |

## 自定义数据

可以添加任意自定义字段：

```yaml
---
# 组件文档
component:
  name: Button
  category: 基础组件
  status: stable

# 标签
tags:
  - UI
  - 交互

# API 版本
apiVersion: v2

# 作者信息
author:
  name: John
  github: johndoe
---
```

在组件中访问：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { frontmatter } = useData()

const component = frontmatter.value.component
const tags = frontmatter.value.tags
</script>

<template>
  <div class="component-meta">
    <h1>{{ component.name }}</h1>
    <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
  </div>
</template>
```
