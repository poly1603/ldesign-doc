# 增强搜索插件

`enhancedSearchPlugin` 在基础搜索的能力上增加了：模糊搜索、中文分词、过滤器、搜索建议、历史记录等。

## 安装

```ts
import { enhancedSearchPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    enhancedSearchPlugin({
      hotkeys: ['/', 'Ctrl+K', 'Meta+K'],
      maxResults: 10,
      placeholder: '搜索文档...',
      showButton: true
    })
  ]
})
```

## 配置选项（概览）

- **基础搜索**：`hotkeys/maxResults/placeholder/showButton/exclude/highlightColor`
- **模糊匹配**：`fuzzy: { enabled, threshold, distance }`
- **中文分词**：`cjk: { enabled, segmenter, customDict }`
- **过滤器**：`filters`
- **建议**：`suggestions`
- **历史记录**：`history`

## 注意

Playground 同时启用 `searchPlugin` 与 `enhancedSearchPlugin` 仅用于展示。实际项目建议二选一。
