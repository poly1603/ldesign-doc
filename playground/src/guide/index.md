---
title: 介绍
---

# 介绍

@ldesign/doc 是一个现代化的静态文档生成框架，基于 Vite 构建，专为技术文档而设计。

## 动机

在开发组件库和工具库时，我们需要一个能够：

- **快速启动** - 开发者不想等待漫长的编译时间
- **专注内容** - 使用 Markdown 编写，而不是复杂的模板语法
- **组件演示** - 在文档中直接展示和运行组件
- **易于扩展** - 通过插件系统添加自定义功能

@ldesign/doc 就是为解决这些问题而生。

## 核心特性

### ⚡️ 极速开发体验

基于 Vite，享受毫秒级的热模块替换（HMR）。修改文档后，页面即时更新，无需等待。

### 📝 Markdown 优先

以 Markdown 为中心的内容编写体验：

```md
# 我的文档

这是一段普通的文字。

:::tip 提示
这是一个提示容器。
:::

​```vue
<template>
  <button @click="count++">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
​```
```

### 🎨 高度可定制

- 主题系统支持完全自定义
- 支持 Vue 和 React 组件
- CSS 变量驱动的样式系统

### 🔌 插件系统

完善的插件架构，内置多种实用插件：

- 评论系统
- 搜索功能
- 阅读进度
- 代码复制
- 图片预览
- 更多...

## 与其他工具对比

| 特性 | @ldesign/doc | VitePress | Docusaurus |
|------|-------------|-----------|------------|
| 构建工具 | Vite | Vite | Webpack |
| 框架支持 | Vue/React | Vue | React |
| 插件系统 | ✅ 完善 | ✅ 基础 | ✅ 完善 |
| 组件演示 | ✅ 原生 | ❌ 需插件 | ❌ 需插件 |
| TypeScript | ✅ 原生 | ✅ 原生 | ✅ 原生 |

## 开始使用

准备好了吗？让我们开始创建你的第一个文档站点！

<div class="tip custom-block">
  <p class="custom-block-title">下一步</p>
  <p>查看 <a href="/guide/getting-started">快速开始</a> 指南，5 分钟内启动你的文档站点。</p>
</div>
