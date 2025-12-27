# Sitemap Plugin

站点地图插件，自动生成所有页面的列表，支持分类和搜索功能。

## 功能特性

- ✅ 自动扫描所有文档页面
- ✅ 按分类组织页面
- ✅ 支持搜索功能（标题、描述、标签）
- ✅ 支持列表视图和分组视图切换
- ✅ 显示页面元信息（分类、标签、更新时间）
- ✅ 响应式设计

## 使用方法

### 基础配置

```typescript
import { defineConfig } from '@ldesign/doc'
import { sitemapPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    sitemapPlugin({
      enabled: true,
      sitemapPath: '/sitemap.html'
    })
  ]
})
```

### 配置选项

```typescript
interface SitemapPluginOptions {
  /** 是否启用站点地图，默认 true */
  enabled?: boolean
  
  /** 站点地图页面路径，默认 '/sitemap.html' */
  sitemapPath?: string
  
  /** 是否包含隐藏页面，默认 false */
  includeHidden?: boolean
}
```

## 页面分类

插件会自动从以下来源提取页面分类：

1. **Frontmatter 中的 category 字段**：
```markdown
---
title: Getting Started
category: Guide
---
```

2. **文件路径**（如果没有指定 category）：
   - `guide/getting-started.md` → 分类为 "Guide"
   - `api/reference.md` → 分类为 "Api"
   - `index.md` → 分类为 "Root"

## 页面标签

在 frontmatter 中添加 tags 字段：

```markdown
---
title: Installation
category: Guide
tags:
  - setup
  - getting-started
---
```

## 隐藏页面

在 frontmatter 中设置 `hidden: true` 可以从站点地图中隐藏页面：

```markdown
---
title: Draft Page
hidden: true
---
```

## 使用组件

在 Vue 组件中使用站点地图数据：

```vue
<template>
  <div>
    <h2>All Pages ({{ allPages.length }})</h2>
    <ul>
      <li v-for="page in allPages" :key="page.relativePath">
        <a :href="page.path">{{ page.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useSitemap } from '@ldesign/doc/theme-default'

const { allPages, allCategories, searchPages } = useSitemap()
</script>
```

## API

### useSitemap()

```typescript
interface UseSitemap {
  /** 所有页面 */
  allPages: ComputedRef<SitemapPage[]>
  
  /** 所有分类 */
  allCategories: ComputedRef<SitemapCategory[]>
  
  /** 获取指定分类 */
  getCategory: (categoryName: string) => SitemapCategory | undefined
  
  /** 获取指定分类的所有页面 */
  getPagesByCategory: (categoryName: string) => SitemapPage[]
  
  /** 搜索页面 */
  searchPages: (query: string) => SitemapPage[]
  
  /** 按分类分组页面 */
  groupPagesByCategory: () => Record<string, SitemapPage[]>
}
```

### SitemapPage

```typescript
interface SitemapPage {
  title: string
  description: string
  path: string
  relativePath: string
  category?: string
  tags?: string[]
  lastUpdated?: number
}
```

### SitemapCategory

```typescript
interface SitemapCategory {
  name: string
  pages: SitemapPage[]
  count: number
}
```

## 样式定制

可以通过 CSS 变量自定义样式：

```css
:root {
  --vp-sitemap-header-bg: var(--vp-c-bg-soft);
  --vp-sitemap-item-hover-bg: var(--vp-c-bg-mute);
  --vp-sitemap-category-color: var(--vp-c-brand);
}
```

## 示例

### 完整配置示例

```typescript
export default defineConfig({
  plugins: [
    sitemapPlugin({
      enabled: true,
      sitemapPath: '/sitemap.html',
      includeHidden: false
    })
  ]
})
```

### 访问站点地图

构建完成后，访问 `/sitemap.html` 即可查看站点地图页面。

## 注意事项

1. 站点地图会在构建时生成，开发模式下可能不可用
2. 页面分类基于文件路径或 frontmatter，建议统一使用一种方式
3. 搜索功能是客户端实现，不需要额外的搜索服务
4. 大型文档站点（1000+ 页面）可能需要考虑性能优化

## 相关插件

- [Tags Plugin](../tags/README.md) - 标签系统
- [Search Enhanced Plugin](../search-enhanced/README.md) - 增强搜索
