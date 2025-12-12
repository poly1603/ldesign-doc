# 最后更新时间插件

显示页面的最后更新时间。

## 安装

```ts
import { lastUpdatedPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    lastUpdatedPlugin()
  ]
})
```

## 配置选项

```ts
lastUpdatedPlugin({
  // 使用 Git 提交时间
  useGitTime: true,
  
  // 前缀文本
  prefix: '最后更新于',
  
  // 显示位置
  position: 'doc-bottom',
  
  // 排除的页面
  exclude: ['/'],
  
  // 日期格式化选项
  formatOptions: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
})
```

## 配置详解

### useGitTime

- **类型**: `boolean`
- **默认值**: `false`

是否使用 Git 提交时间。如果为 `false`，使用文件修改时间。

> 使用 Git 时间需要项目在 Git 仓库中。

### prefix

- **类型**: `string`
- **默认值**: `'最后更新于'`

时间前的文本。

### position

- **类型**: `string`
- **默认值**: `'doc-bottom'`

显示位置：
- `'doc-bottom'` - 文档底部
- `'doc-footer-before'` - 页脚之前

### exclude

- **类型**: `string[]`
- **默认值**: `['/']`

排除的页面路径。

### formatOptions

- **类型**: `Intl.DateTimeFormatOptions`

日期格式化选项，使用 `Intl.DateTimeFormat` API。

```ts
// 完整日期时间
formatOptions: {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}
// 输出：2024年1月15日 14:30

// 简短格式
formatOptions: {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}
// 输出：2024/01/15
```

## Git 时间获取

使用 Git 时间时，插件会执行：

```bash
git log -1 --format=%at <filepath>
```

获取文件最后一次提交的时间戳。

### 注意事项

- 需要在 Git 仓库中
- CI/CD 环境需要完整 Git 历史（`fetch-depth: 0`）
- 新文件使用当前时间

## 页面禁用

在 frontmatter 中禁用：

```yaml
---
lastUpdated: false
---
```

或指定固定时间：

```yaml
---
lastUpdated: 2024-01-15
---
```

## 自定义样式

```css
/* 容器 */
.ldoc-last-updated {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--ldoc-c-divider);
}

/* 图标 */
.ldoc-last-updated-icon {
  font-size: 16px;
}

/* 时间 */
.ldoc-last-updated-time {
  /* ... */
}
```

## 访问数据

在 Vue 组件中访问：

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { page } = useData()
const lastUpdated = page.value.lastUpdated
// Unix 时间戳
</script>
```
