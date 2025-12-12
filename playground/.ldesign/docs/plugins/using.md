# 使用插件

本章介绍如何安装和配置插件。

## 安装插件

### 内置插件

内置插件直接从 `@ldesign/doc/plugins` 导入：

```ts
import { searchPlugin, commentPlugin } from '@ldesign/doc/plugins'
```

### 社区插件

使用包管理器安装：

```bash
pnpm add ldoc-plugin-xxx
```

```ts
import xxxPlugin from 'ldoc-plugin-xxx'

export default defineConfig({
  plugins: [xxxPlugin()]
})
```

## 配置插件

大多数插件支持配置选项：

```ts
import { progressPlugin, copyCodePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    // 使用默认配置
    progressPlugin(),
    
    // 自定义配置
    copyCodePlugin({
      buttonText: '复制',
      successText: '已复制!',
      showLanguage: true
    })
  ]
})
```

## 禁用插件

在特定页面禁用插件功能，通过 frontmatter：

```yaml
---
# 禁用评论
comments: false

# 禁用阅读进度
progress: false
---
```

## 条件启用

根据环境启用插件：

```ts
export default defineConfig({
  plugins: [
    // 仅生产环境
    process.env.NODE_ENV === 'production' && analyticsPlugin(),
    
    // 开发环境
    process.env.NODE_ENV === 'development' && devToolsPlugin()
  ].filter(Boolean)
})
```

## 插件冲突

某些插件可能存在冲突，注意：

- 同类型插件不要重复使用（如多个搜索插件）
- 检查插件的 `enforce` 顺序
- 查看控制台警告信息

## 调试插件

开发环境下查看插件日志：

```ts
export default defineConfig({
  plugins: [
    myPlugin({
      debug: true  // 如果插件支持
    })
  ]
})
```

控制台会输出插件的执行信息。

## 常见组合

### 文档增强

```ts
plugins: [
  searchPlugin(),
  progressPlugin(),
  copyCodePlugin(),
  imageViewerPlugin(),
  readingTimePlugin(),
  lastUpdatedPlugin({ useGitTime: true })
]
```

### 社区互动

```ts
plugins: [
  commentPlugin({
    provider: 'giscus',
    giscus: { /* ... */ }
  }),
  searchPlugin()
]
```

### 最小配置

```ts
plugins: [
  copyCodePlugin(),
  progressPlugin()
]
```
