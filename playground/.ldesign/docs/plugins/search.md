# 搜索插件

本地全文搜索插件。

## 安装

```ts
import { searchPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin()
  ]
})
```

## 配置选项

```ts
searchPlugin({
  // 快捷键
  hotkeys: ['/', 'Ctrl+K', 'Meta+K'],
  
  // 最大结果数
  maxResults: 10,
  
  // 搜索框占位符
  placeholder: '搜索文档...',
  
  // 显示搜索按钮
  showButton: true,
  
  // 排除的路径
  exclude: ['/changelog'],
  
  // 高亮颜色
  highlightColor: 'var(--ldoc-c-brand-1)'
})
```

## 配置详解

### hotkeys

- **类型**: `string[]`
- **默认值**: `['/', 'Ctrl+K', 'Meta+K']`

触发搜索的快捷键。

### maxResults

- **类型**: `number`
- **默认值**: `10`

搜索结果的最大数量。

### placeholder

- **类型**: `string`
- **默认值**: `'搜索文档...'`

搜索输入框的占位符。

### showButton

- **类型**: `boolean`
- **默认值**: `true`

是否在导航栏显示搜索按钮。

### exclude

- **类型**: `string[]`
- **默认值**: `[]`

从搜索索引中排除的路径。

```ts
exclude: [
  '/changelog',
  '/internal/*'
]
```

### highlightColor

- **类型**: `string`
- **默认值**: `'var(--ldoc-c-brand-1)'`

搜索结果中匹配文本的高亮颜色。

## 功能特点

### 全文索引

- 自动索引所有页面内容
- 支持标题、正文、代码块
- 中英文分词支持

### 快捷键

- `/` - 打开搜索（文档模式）
- `Ctrl+K` / `⌘+K` - 打开搜索
- `Esc` - 关闭搜索
- `↑↓` - 选择结果
- `Enter` - 跳转到结果

### 搜索结果

- 显示匹配的标题和内容
- 高亮匹配的关键词
- 显示所属章节

## 自定义样式

```css
/* 搜索按钮 */
.ldoc-search-button {
  /* ... */
}

/* 搜索弹窗 */
.ldoc-search-modal {
  /* ... */
}

/* 搜索结果项 */
.ldoc-search-result-item {
  /* ... */
}
```

## 国际化

```ts
searchPlugin({
  placeholder: '搜索文档...',
  translations: {
    noResults: '没有找到结果',
    resetSearch: '清除搜索',
    footer: {
      selectText: '选择',
      navigateText: '导航',
      closeText: '关闭'
    }
  }
})
```
