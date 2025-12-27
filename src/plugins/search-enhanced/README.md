# Enhanced Search Plugin

增强搜索插件为 @ldesign/doc 文档系统提供高级搜索功能，包括模糊搜索、中文分词、搜索过滤器和智能建议。

## 功能特性

### 1. 模糊搜索 (Fuzzy Search)
- 基于 Levenshtein 距离算法
- 支持拼写错误容忍（最多 2 个字符差异）
- 可配置相似度阈值

### 2. 搜索结果高亮 (Highlighting)
- 自动高亮匹配的文本
- 生成带上下文的内容预览片段
- 支持多个查询词同时高亮

### 3. 搜索过滤器 (Filters)
- 按分类、标签等条件过滤
- 支持多个过滤条件组合（AND/OR 逻辑）
- 提供过滤器 UI 组件
- 动态统计每个过滤选项的文档数量

### 4. 中文分词 (CJK Segmentation)
- 自动检测 CJK 字符
- 基于规则的中文分词
- 支持单字、双字、三字组合索引
- 改善中文搜索体验

### 5. 搜索建议 (Suggestions)
- 无结果时提供相似词建议
- 拼写纠正建议
- 自动完成建议
- 相关搜索推荐
- 热门搜索词

## 使用方法

### 基础配置

```typescript
import { enhancedSearchPlugin } from '@ldesign/doc/plugins/search-enhanced'

export default {
  plugins: [
    enhancedSearchPlugin({
      // 搜索快捷键
      hotkeys: ['/', 'Ctrl+K', 'Meta+K'],
      
      // 最大搜索结果数
      maxResults: 10,
      
      // 搜索占位符
      placeholder: '搜索文档...',
      
      // 模糊搜索配置
      fuzzy: {
        enabled: true,
        threshold: 0.6,  // 相似度阈值 (0-1)
        distance: 2      // 最大编辑距离
      },
      
      // 中文分词配置
      cjk: {
        enabled: true,
        segmenter: 'jieba'
      },
      
      // 搜索过滤器
      filters: [
        {
          name: 'category',
          label: '分类',
          field: 'category',
          options: [
            { value: 'guide', label: '指南' },
            { value: 'api', label: 'API' },
            { value: 'tutorial', label: '教程' }
          ]
        },
        {
          name: 'tags',
          label: '标签',
          field: 'tags',
          options: [
            { value: 'vue', label: 'Vue' },
            { value: 'react', label: 'React' }
          ]
        }
      ],
      
      // 搜索建议配置
      suggestions: {
        enabled: true,
        maxSuggestions: 5
      },
      
      // 搜索历史
      history: {
        enabled: true,
        maxItems: 10,
        storageKey: 'ldoc-search-history'
      }
    })
  ]
}
```

### 在 Markdown 中使用

搜索插件会自动在导航栏添加搜索按钮。用户可以：

1. 点击搜索按钮打开搜索框
2. 使用快捷键（默认 `/` 或 `Ctrl+K`）
3. 输入查询词进行搜索
4. 使用过滤器缩小搜索范围
5. 查看搜索建议和相关搜索

## API 文档

### 模糊搜索 API

```typescript
import { fuzzyMatch, fuzzySearch, levenshteinDistance } from '@ldesign/doc/plugins/search-enhanced/fuzzy'

// 模糊匹配
const matched = fuzzyMatch('helo', 'hello', { distance: 2 })

// 模糊搜索
const results = fuzzySearch('query', items, item => item.text)

// 计算编辑距离
const distance = levenshteinDistance('kitten', 'sitting') // 3
```

### 高亮 API

```typescript
import { highlightMatches, generateSnippet } from '@ldesign/doc/plugins/search-enhanced/highlight'

// 高亮匹配文本
const highlighted = highlightMatches('Hello world', 'world')
// 输出: 'Hello <mark class="search-highlight">world</mark>'

// 生成预览片段
const snippet = generateSnippet(longText, 'query', { snippetLength: 150 })
```

### 过滤器 API

```typescript
import { applyFilters, FilterBuilder } from '@ldesign/doc/plugins/search-enhanced/filter'

// 应用过滤器
const filtered = applyFilters(documents, { category: 'guide' })

// 使用构建器
const results = new FilterBuilder()
  .add('category', 'guide')
  .add('tags', ['vue', 'react'])
  .apply(documents)
```

### 中文分词 API

```typescript
import { segmentCJK, matchCJK, searchCJK } from '@ldesign/doc/plugins/search-enhanced/cjk'

// 分词
const tokens = segmentCJK('你好世界')
// 输出: ['你', '你好', '你好世', '好', '好世', '好世界', '世', '世界', '界']

// CJK 匹配
const matched = matchCJK('世界', '你好世界') // true

// CJK 搜索
const results = searchCJK('搜索', documents, doc => doc.title)
```

### 建议 API

```typescript
import { generateSuggestions, generateAutocompleteSuggestions } from '@ldesign/doc/plugins/search-enhanced/suggestions'

// 生成建议
const suggestions = generateSuggestions('serch', documents, { maxSuggestions: 5 })
// 可能输出: ['search', 'server', 'service']

// 自动完成
const autocomplete = generateAutocompleteSuggestions('sea', documents)
// 可能输出: ['search', 'season', 'seat']
```

## 测试

所有功能都经过严格的属性测试（Property-Based Testing）：

```bash
# 运行所有测试
npm test -- search-enhanced

# 运行特定测试
npm test -- fuzzy.test.ts
npm test -- highlight.test.ts
npm test -- filter.test.ts
npm test -- cjk.test.ts
npm test -- suggestions.test.ts
```

## 性能优化

- 搜索索引在构建时生成，运行时无需重新索引
- 使用 Set 和 Map 数据结构优化查找性能
- 中文分词结果缓存，避免重复计算
- 过滤器使用惰性求值，只在需要时计算

## 浏览器兼容性

- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 支持 ES2015+
- 需要 Vue 3.x

## 许可证

MIT
