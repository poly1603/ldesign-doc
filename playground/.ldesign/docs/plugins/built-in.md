---
title: 内置插件
---

# 内置插件

@ldesign/doc 提供了多个开箱即用的内置插件。

## searchPlugin

本地全文搜索插件。

### 安装

```ts
import { searchPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin({
      hotkeys: ['/', 'Ctrl+K', 'Meta+K'],
      maxResults: 10,
      placeholder: '搜索文档...'
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `hotkeys` | `string[]` | `['/', 'Ctrl+K', 'Meta+K']` | 快捷键 |
| `maxResults` | `number` | `10` | 最大结果数 |
| `placeholder` | `string` | `'搜索文档...'` | 搜索框占位符 |
| `showButton` | `boolean` | `true` | 是否显示搜索按钮 |
| `exclude` | `string[]` | `[]` | 排除的路径 |
| `highlightColor` | `string` | `'var(--ldoc-c-brand-1)'` | 高亮颜色 |

---

## commentPlugin

评论系统插件，支持多种评论服务。

### 基础用法

```ts
import { commentPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    commentPlugin({
      provider: 'giscus',
      giscus: {
        repo: 'owner/repo',
        repoId: 'R_xxx',
        category: 'Announcements',
        categoryId: 'DIC_xxx'
      }
    })
  ]
})
```

### 支持的评论服务

#### Giscus

基于 GitHub Discussions 的评论系统。

```ts
commentPlugin({
  provider: 'giscus',
  giscus: {
    repo: 'owner/repo',
    repoId: 'R_xxx',
    category: 'Announcements',
    categoryId: 'DIC_xxx',
    mapping: 'pathname',
    strict: true,
    reactionsEnabled: true,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'zh-CN'
  }
})
```

#### Gitalk

基于 GitHub Issues 的评论系统。

```ts
commentPlugin({
  provider: 'gitalk',
  gitalk: {
    clientID: 'xxx',
    clientSecret: 'xxx',
    repo: 'repo-name',
    owner: 'owner',
    admin: ['owner']
  }
})
```

#### Waline

独立部署的评论系统。

```ts
commentPlugin({
  provider: 'waline',
  waline: {
    serverURL: 'https://your-waline.vercel.app',
    lang: 'zh-CN',
    dark: 'auto'
  }
})
```

#### Twikoo

腾讯云/Vercel 部署的评论系统。

```ts
commentPlugin({
  provider: 'twikoo',
  twikoo: {
    envId: 'your-env-id',
    region: 'ap-shanghai'
  }
})
```

#### Artalk

自托管评论系统。

```ts
commentPlugin({
  provider: 'artalk',
  artalk: {
    server: 'https://your-artalk.com',
    site: 'My Site'
  }
})
```

### 通用配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `position` | `string` | `'doc-after'` | 评论位置 |
| `exclude` | `string[]` | `[]` | 排除的页面 |
| `include` | `string[]` | - | 仅在这些页面显示 |
| `showOnHome` | `boolean` | `false` | 首页是否显示 |
| `title` | `string` | `'💬 评论'` | 评论区标题 |

---

## progressPlugin

阅读进度条插件。

### 安装

```ts
import { progressPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    progressPlugin({
      color: 'var(--ldoc-c-brand-1)',
      height: 3,
      position: 'top'
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `color` | `string` | `'var(--ldoc-c-brand-1)'` | 进度条颜色 |
| `height` | `number` | `3` | 进度条高度（px） |
| `position` | `'top' \| 'bottom'` | `'top'` | 位置 |
| `showPercentage` | `boolean` | `false` | 显示百分比 |
| `exclude` | `string[]` | `['/']` | 排除的页面 |

---

## imageViewerPlugin

图片预览插件，点击图片可放大查看。

### 安装

```ts
import { imageViewerPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    imageViewerPlugin({
      zoom: true,
      maxZoom: 5
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `zoom` | `boolean` | `true` | 启用缩放 |
| `maxZoom` | `number` | `5` | 最大缩放倍数 |
| `showClose` | `boolean` | `true` | 显示关闭按钮 |
| `showInfo` | `boolean` | `true` | 显示图片信息 |
| `bgOpacity` | `number` | `0.9` | 背景透明度 |
| `selector` | `string` | `'.ldoc-content img'` | 图片选择器 |
| `excludeSelector` | `string` | `'.no-preview'` | 排除选择器 |

### 功能

- 🔍 滚轮缩放
- 🖱️ 拖拽移动
- ⌨️ ESC 关闭
- 📊 缩放控制按钮
- 🔄 重置视图

---

## copyCodePlugin

代码复制插件，为代码块添加复制按钮。

### 安装

```ts
import { copyCodePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    copyCodePlugin({
      buttonText: '复制',
      successText: '已复制!'
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `buttonText` | `string` | `'复制'` | 按钮文本 |
| `successText` | `string` | `'已复制!'` | 成功文本 |
| `successDuration` | `number` | `2000` | 成功显示时长（ms） |
| `selector` | `string` | `'pre[class*="language-"]'` | 代码块选择器 |
| `showLanguage` | `boolean` | `true` | 显示语言标签 |
| `excludeLanguages` | `string[]` | `[]` | 排除的语言 |

---

## lastUpdatedPlugin

最后更新时间插件。

### 安装

```ts
import { lastUpdatedPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    lastUpdatedPlugin({
      useGitTime: true,
      prefix: '最后更新于'
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `useGitTime` | `boolean` | `false` | 使用 Git 提交时间 |
| `prefix` | `string` | `'最后更新于'` | 前缀文本 |
| `position` | `string` | `'doc-bottom'` | 显示位置 |
| `exclude` | `string[]` | `['/']` | 排除的页面 |
| `formatOptions` | `Intl.DateTimeFormatOptions` | - | 日期格式化选项 |

### 日期格式化

```ts
lastUpdatedPlugin({
  formatOptions: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
})
```

---

## readingTimePlugin

阅读时间插件。

### 安装

```ts
import { readingTimePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    readingTimePlugin({
      wordsPerMinute: 200,
      showWords: true
    })
  ]
})
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `wordsPerMinute` | `number` | `200` | 每分钟阅读字数 |
| `showWords` | `boolean` | `true` | 显示字数统计 |
| `position` | `string` | `'doc-top'` | 显示位置 |
| `exclude` | `string[]` | `['/']` | 排除的页面 |
| `template` | `function` | - | 自定义文本模板 |

### 自定义模板

```ts
readingTimePlugin({
  template: (minutes, words) => {
    return `📖 ${words} 字 · 约 ${minutes} 分钟`
  }
})
```

---

## 组合使用示例

```ts
import { defineConfig } from '@ldesign/doc'
import {
  searchPlugin,
  commentPlugin,
  progressPlugin,
  imageViewerPlugin,
  copyCodePlugin,
  lastUpdatedPlugin,
  readingTimePlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    // 搜索
    searchPlugin(),
    
    // 评论
    commentPlugin({
      provider: 'giscus',
      giscus: { /* ... */ }
    }),
    
    // 阅读体验
    progressPlugin(),
    readingTimePlugin(),
    lastUpdatedPlugin({ useGitTime: true }),
    
    // 交互增强
    imageViewerPlugin(),
    copyCodePlugin()
  ]
})
```
