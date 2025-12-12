# 阅读时间插件

显示页面的预计阅读时间。

## 安装

```ts
import { readingTimePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    readingTimePlugin()
  ]
})
```

## 配置选项

```ts
readingTimePlugin({
  // 每分钟阅读字数
  wordsPerMinute: 200,
  
  // 显示字数统计
  showWords: true,
  
  // 显示位置
  position: 'doc-top',
  
  // 排除的页面
  exclude: ['/'],
  
  // 自定义模板
  template: (minutes, words) => {
    return `📖 ${words} 字 · 约 ${minutes} 分钟`
  }
})
```

## 配置详解

### wordsPerMinute

- **类型**: `number`
- **默认值**: `200`

每分钟阅读的字数。中文建议 200-300，英文建议 200-250。

### showWords

- **类型**: `boolean`
- **默认值**: `true`

是否显示总字数。

### position

- **类型**: `string`
- **默认值**: `'doc-top'`

显示位置，可选值：
- `'doc-top'` - 文档标题下方
- `'doc-before'` - 文档内容之前
- `'aside-top'` - 右侧栏顶部

### exclude

- **类型**: `string[]`
- **默认值**: `['/']`

排除的页面路径。

### template

- **类型**: `(minutes: number, words: number) => string`

自定义显示模板。

```ts
template: (minutes, words) => {
  if (minutes < 1) {
    return '⚡ 快速阅读'
  }
  return `⏱️ 阅读约 ${minutes} 分钟（${words} 字）`
}
```

## 字数统计

### 中文

中文按字符数统计。

### 英文

英文按单词数统计（以空格分隔）。

### 代码

代码块默认不计入阅读时间。可通过配置包含：

```ts
readingTimePlugin({
  includeCode: true
})
```

## 页面禁用

在 frontmatter 中禁用：

```yaml
---
readingTime: false
---
```

## 自定义样式

```css
/* 阅读时间容器 */
.ldoc-reading-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  margin-bottom: 16px;
}

/* 图标 */
.ldoc-reading-time-icon {
  font-size: 16px;
}

/* 文本 */
.ldoc-reading-time-text {
  /* ... */
}
```

## 访问数据

在 Vue 组件中访问阅读时间数据：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { frontmatter } = useData()
const readingTime = frontmatter.value.readingTime
// { minutes: 5, words: 1000 }
</script>
```
