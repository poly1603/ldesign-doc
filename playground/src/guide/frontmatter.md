---
title: Frontmatter
---

# Frontmatter

Frontmatter 是每个 Markdown 文件开头的 YAML 块，用于配置页面元数据。

## 基本语法

```yaml
---
title: 页面标题
description: 页面描述
---

# 正文内容
```

## 通用配置

### title

- 类型：`string`

页面标题，会显示在浏览器标签页和导航中。

```yaml
---
title: 快速开始
---
```

### description

- 类型：`string`

页面描述，用于 SEO 的 meta 标签。

```yaml
---
description: 本指南将帮助你快速上手 @ldesign/doc
---
```

### head

- 类型：`HeadConfig[]`

额外的 `<head>` 标签。

```yaml
---
head:
  - - meta
    - name: keywords
      content: documentation, vue, vite
  - - link
    - rel: canonical
      href: https://example.com/guide/
---
```

## 布局配置

### layout

- 类型：`'doc' | 'home' | 'page' | false`
- 默认值：`'doc'`

页面布局类型。

```yaml
---
layout: home  # 首页布局
---
```

```yaml
---
layout: page  # 纯净页面布局（无侧边栏）
---
```

```yaml
---
layout: false  # 完全自定义布局
---
```

### sidebar

- 类型：`boolean`
- 默认值：`true`

是否显示侧边栏。

```yaml
---
sidebar: false
---
```

### aside

- 类型：`boolean | 'left'`
- 默认值：`true`

是否显示右侧大纲栏。

```yaml
---
aside: false  # 隐藏
---
```

```yaml
---
aside: left  # 显示在左侧
---
```

### outline

- 类型：`number | [number, number] | 'deep' | false`
- 默认值：`2`

大纲显示的标题级别。

```yaml
---
outline: [2, 3]  # 显示 h2 和 h3
---
```

```yaml
---
outline: deep  # 显示所有级别
---
```

```yaml
---
outline: false  # 禁用大纲
---
```

## 导航配置

### navbar

- 类型：`boolean`
- 默认值：`true`

是否显示导航栏。

```yaml
---
navbar: false
---
```

### prev / next

自定义上一页/下一页链接。

```yaml
---
prev:
  text: 上一章
  link: /guide/chapter-1
next:
  text: 下一章
  link: /guide/chapter-3
---
```

禁用：

```yaml
---
prev: false
next: false
---
```

### editLink

- 类型：`boolean`
- 默认值：`true`

是否显示编辑链接。

```yaml
---
editLink: false
---
```

### lastUpdated

- 类型：`boolean`
- 默认值：继承站点配置

是否显示最后更新时间。

```yaml
---
lastUpdated: false
---
```

## 首页配置

首页使用特殊的 frontmatter 配置：

```yaml
---
layout: home

hero:
  name: '@ldesign/doc'
  text: 现代化文档框架
  tagline: 基于 Vite，极速开发体验
  image:
    src: /logo.svg
    alt: Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/xxx

features:
  - icon: ⚡️
    title: Vite 驱动
    details: 毫秒级热更新
  - icon: 📝
    title: Markdown 优先
    details: 专注内容编写
  - icon: 🎨
    title: 高度可定制
    details: 灵活的主题系统
---
```

### hero

首页 Hero 区域配置。

| 属性 | 类型 | 描述 |
|------|------|------|
| `name` | `string` | 主标题 |
| `text` | `string` | 副标题 |
| `tagline` | `string` | 标语 |
| `image` | `{ src: string, alt?: string }` | 图片 |
| `actions` | `HeroAction[]` | 操作按钮 |

### features

特性列表配置。

| 属性 | 类型 | 描述 |
|------|------|------|
| `icon` | `string` | 图标（emoji 或图片路径） |
| `title` | `string` | 标题 |
| `details` | `string` | 描述 |
| `link` | `string` | 链接 |
| `linkText` | `string` | 链接文本 |

## 自定义数据

可以在 frontmatter 中添加任意自定义数据：

```yaml
---
title: 组件文档
component:
  name: Button
  version: 1.2.0
  status: stable
tags:
  - UI
  - 表单
---
```

在 Vue 组件中访问：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { frontmatter } = useData()
console.log(frontmatter.value.component.name) // 'Button'
</script>
```

## 类型支持

创建 `env.d.ts` 获得类型提示：

```ts
/// <reference types="@ldesign/doc/client" />

declare module '@ldesign/doc/client' {
  interface PageData {
    frontmatter: {
      title?: string
      description?: string
      component?: {
        name: string
        version: string
        status: 'stable' | 'beta' | 'deprecated'
      }
      tags?: string[]
    }
  }
}
```
