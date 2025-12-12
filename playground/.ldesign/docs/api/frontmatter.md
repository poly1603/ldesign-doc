# Frontmatter 配置

Frontmatter 是页面级别的配置。

## 页面元数据

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 页面标题 |
| `titleTemplate` | `string \| false` | - | 标题模板 |
| `description` | `string` | - | 页面描述 |

```yaml
---
title: 快速开始
titleTemplate: ':title - My Docs'
description: 5分钟上手指南
---
```

## 布局配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `layout` | `'doc' \| 'home' \| 'page' \| false` | `'doc'` | 布局类型 |
| `navbar` | `boolean` | `true` | 显示导航栏 |
| `sidebar` | `boolean` | `true` | 显示侧边栏 |
| `aside` | `boolean \| 'left'` | `true` | 显示大纲栏 |
| `outline` | `number \| [number, number] \| 'deep' \| false` | `2` | 大纲级别 |
| `footer` | `boolean` | `true` | 显示页脚 |
| `pageClass` | `string` | - | 页面 CSS 类 |

```yaml
---
layout: page
sidebar: false
aside: false
pageClass: custom-page
---
```

## 导航配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `prev` | `boolean \| { text: string, link: string }` | 上一页 |
| `next` | `boolean \| { text: string, link: string }` | 下一页 |
| `editLink` | `boolean` | 显示编辑链接 |
| `lastUpdated` | `boolean \| Date` | 显示更新时间 |

```yaml
---
prev:
  text: 介绍
  link: /guide/
next: false
editLink: false
---
```

## HEAD 配置

```yaml
---
head:
  - - meta
    - name: keywords
      content: documentation, vue
  - - link
    - rel: canonical
      href: https://example.com/page
---
```

## 首页配置

### hero

```yaml
---
layout: home
hero:
  name: LDoc
  text: 文档框架
  tagline: 基于 Vite
  image:
    src: /logo.svg
    alt: Logo
  actions:
    - theme: brand
      text: 开始
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com
---
```

### features

```yaml
---
layout: home
features:
  - icon: ⚡️
    title: 极速
    details: 基于 Vite
    link: /guide/
    linkText: 了解更多
  - icon:
      src: /icons/ts.svg
    title: TypeScript
    details: 完整类型支持
---
```

## 自定义数据

```yaml
---
author: John Doe
tags: [教程, 入门]
component:
  name: Button
  version: 1.0.0
---
```

访问方式：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'
const { frontmatter } = useData()
</script>

<template>
  <p>作者：{{ frontmatter.author }}</p>
</template>
```
