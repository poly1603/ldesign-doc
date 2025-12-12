# Frontmatter

Frontmatter 是每个 Markdown 文件开头的 YAML 元数据块，用于定义页面配置。

## 基本语法

```yaml
---
title: 页面标题
description: 页面描述
---

# 正文内容
```

## 常用配置

### 页面元数据

```yaml
---
title: 快速开始          # 页面标题
description: 5分钟上手   # 页面描述（SEO）
---
```

### 布局控制

```yaml
---
layout: doc             # 布局类型: doc | home | page | false
sidebar: true           # 显示侧边栏
aside: true             # 显示右侧大纲
outline: [2, 3]         # 大纲显示级别
navbar: true            # 显示导航栏
footer: true            # 显示页脚
---
```

### 导航链接

```yaml
---
# 自定义上一页/下一页
prev:
  text: 介绍
  link: /guide/
next:
  text: 配置
  link: /guide/configuration

# 或禁用
prev: false
next: false
---
```

### 编辑链接

```yaml
---
editLink: false         # 禁用编辑链接
lastUpdated: false      # 禁用最后更新时间
---
```

## 首页配置

```yaml
---
layout: home

hero:
  name: LDoc
  text: 现代化文档框架
  tagline: 基于 Vite，极速开发
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com

features:
  - icon: ⚡️
    title: Vite 驱动
    details: 毫秒级热更新
  - icon: 📝
    title: Markdown 优先
    details: 专注内容编写
---
```

## 自定义数据

可以添加任意自定义字段：

```yaml
---
author: John Doe
tags:
  - 教程
  - 入门
component:
  name: Button
  version: 1.0.0
---
```

在 Vue 组件中访问：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { frontmatter } = useData()
console.log(frontmatter.value.author)
</script>
```

## 完整配置参考

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | - | 页面标题 |
| `description` | `string` | - | 页面描述 |
| `layout` | `string` | `'doc'` | 布局类型 |
| `sidebar` | `boolean` | `true` | 显示侧边栏 |
| `aside` | `boolean \| 'left'` | `true` | 显示大纲栏 |
| `outline` | `number \| [number, number] \| 'deep' \| false` | `2` | 大纲级别 |
| `navbar` | `boolean` | `true` | 显示导航栏 |
| `footer` | `boolean` | `true` | 显示页脚 |
| `editLink` | `boolean` | `true` | 显示编辑链接 |
| `lastUpdated` | `boolean \| Date` | `true` | 显示更新时间 |
| `prev` | `boolean \| { text: string, link: string }` | - | 上一页 |
| `next` | `boolean \| { text: string, link: string }` | - | 下一页 |
| `pageClass` | `string` | - | 页面 CSS 类 |
