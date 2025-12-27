# Tags Plugin

标签系统插件，为文档添加标签功能，支持标签索引、标签页面和标签云。

## 功能特性

- ✅ 从页面 frontmatter 中提取标签
- ✅ 自动构建标签索引
- ✅ 生成独立的标签页面
- ✅ 生成标签云页面
- ✅ 支持标签相关页面推荐
- ✅ 客户端标签数据注入

## 安装使用

### 1. 配置插件

在 `doc.config.ts` 中启用标签插件：

```typescript
import { defineConfig } from '@ldesign/doc'
import { tagsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    tagsPlugin({
      enabled: true,
      tagPagePrefix: '/tags',
      generateTagCloud: true,
      tagCloudPath: '/tags.html'
    })
  ]
})
```

### 2. 在页面中添加标签

在 Markdown 文件的 frontmatter 中添加 `tags` 字段：

```markdown
---
title: Getting Started
tags:
  - guide
  - tutorial
  - beginner
---

# Getting Started

Your content here...
```

也支持字符串格式（单个标签）：

```markdown
---
title: API Reference
tags: api
---
```

### 3. 使用标签组件

在 Vue 组件或 Markdown 中使用标签组件：

```vue
<script setup>
import { VPTag, VPTagList, VPTagCloud } from '@ldesign/doc/theme-default'
import { useTags } from '@ldesign/doc/theme-default'

const { allTags, getPagesByTag } = useTags()
</script>

<template>
  <!-- 单个标签 -->
  <VPTag tag="vue" size="medium" variant="primary" />

  <!-- 标签列表 -->
  <VPTagList :tags="['vue', 'react', 'typescript']" />

  <!-- 标签云 -->
  <VPTagCloud :tags="allTags" title="Popular Tags" />
</template>
```

## 配置选项

### TagsPluginOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否启用标签系统 |
| `tagPagePrefix` | `string` | `'/tags'` | 标签页面路径前缀 |
| `generateTagCloud` | `boolean` | `true` | 是否生成标签云页面 |
| `tagCloudPath` | `string` | `'/tags.html'` | 标签云页面路径 |

## API

### 组件

#### VPTag

单个标签组件。

**Props:**
- `tag?: string` - 标签名称
- `size?: 'small' | 'medium' | 'large'` - 标签大小
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'` - 标签样式
- `clickable?: boolean` - 是否可点击

**Events:**
- `click: (tag: string) => void` - 点击事件

#### VPTagList

标签列表组件。

**Props:**
- `tags: string[]` - 标签数组
- `size?: 'small' | 'medium' | 'large'` - 标签大小
- `variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'` - 标签样式
- `clickable?: boolean` - 是否可点击
- `wrap?: boolean` - 是否换行

**Events:**
- `tagClick: (tag: string) => void` - 标签点击事件

#### VPTagCloud

标签云组件。

**Props:**
- `tags: TagInfo[]` - 标签信息数组
- `title?: string` - 标题
- `minSize?: number` - 最小字体大小
- `maxSize?: number` - 最大字体大小

#### VPTagPage

标签页面组件。

**Props:**
- `tagName: string` - 标签名称
- `pages: TaggedPage[]` - 标签下的页面列表

### Composables

#### useTags()

获取标签数据的 composable。

**返回值:**
```typescript
{
  allTags: ComputedRef<TagInfo[]>           // 所有标签
  allTaggedPages: ComputedRef<TaggedPage[]> // 所有带标签的页面
  getTag: (tagName: string) => TagInfo | undefined
  getPagesByTag: (tagName: string) => TaggedPage[]
  getRelatedPages: (currentPath: string, limit?: number) => TaggedPage[]
}
```

#### usePageTags()

获取当前页面标签的 composable。

**返回值:**
```typescript
{
  pageTags: ComputedRef<string[]>  // 当前页面的标签
}
```

### 类型定义

```typescript
interface TagInfo {
  name: string        // 标签名称
  count: number       // 页面数量
  pages: TaggedPage[] // 页面列表
}

interface TaggedPage {
  title: string       // 页面标题
  description: string // 页面描述
  relativePath: string // 相对路径
  path: string        // URL 路径
  tags: string[]      // 标签列表
  lastUpdated?: number // 最后更新时间
}
```

## 生成的页面

### 标签页面

每个标签会生成一个独立页面，路径为 `/tags/{tagName}.html`，显示该标签下的所有页面。

### 标签云页面

所有标签的汇总页面，路径为 `/tags.html`，以标签云的形式展示所有标签。

## 示例

### 完整示例

```typescript
// doc.config.ts
import { defineConfig } from '@ldesign/doc'
import { tagsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  title: 'My Documentation',
  plugins: [
    tagsPlugin({
      enabled: true,
      generateTagCloud: true
    })
  ]
})
```

```markdown
---
title: Vue 3 Composition API
description: Learn about Vue 3 Composition API
tags:
  - vue
  - composition-api
  - tutorial
---

# Vue 3 Composition API

Content here...
```

```vue
<!-- CustomPage.vue -->
<script setup>
import { VPTagCloud } from '@ldesign/doc/theme-default'
import { useTags } from '@ldesign/doc/theme-default'

const { allTags } = useTags()
</script>

<template>
  <div class="custom-page">
    <h1>Browse by Tags</h1>
    <VPTagCloud :tags="allTags" />
  </div>
</template>
```

## 注意事项

1. 标签名称区分大小写
2. 标签名称会被 URL 编码用于生成页面路径
3. 标签索引在构建时生成，开发模式下可能需要重启服务器才能看到更新
4. 标签数据通过 `window.__TAG_INDEX__` 注入到客户端

## 相关文档

- [Requirements 8.3](../../.kiro/specs/doc-system-enhancement/requirements.md#requirement-8-增强的导航与结构)
- [Design: Navigation Properties](../../.kiro/specs/doc-system-enhancement/design.md#navigation-properties)
