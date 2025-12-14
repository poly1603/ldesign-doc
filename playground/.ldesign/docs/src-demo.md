---
title: 源码示例
---

# 源码示例

这是一个从项目源码目录导入 Markdown 内容的示例。

## 功能说明

LDoc 支持从项目的 `src` 目录导入 Markdown 文件，这对于以下场景非常有用：

- **组件文档**：直接展示组件源码中的 README
- **API 文档**：导入自动生成的 API 文档
- **变更日志**：直接引用项目的 CHANGELOG.md

## 使用方法

在 Markdown 文件中使用 `<script setup>` 导入：

```vue
<script setup>
import Demo from '../../src/demo.md'
</script>

<Demo />
```

## 注意事项

1. 导入路径相对于当前文件
2. 支持 `.md` 和 `.mdx` 文件
3. 导入的内容会作为 Vue 组件渲染
4. 支持热更新，修改源文件后自动刷新
