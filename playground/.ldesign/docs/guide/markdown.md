---
title: Markdown 扩展
---

# Markdown 扩展

@ldesign/doc 在标准 Markdown 基础上提供了丰富的扩展语法。

## 链接

### 内部链接

内部链接会自动转换为 SPA 导航：

```md
[快速开始](/guide/getting-started)
[配置参考](/config/)
[插件开发](./plugins/development)
```

### 外部链接

外部链接会自动添加 `target="_blank"` 和外部图标：

```md
[GitHub](https://github.com)
```

## 代码块

### 语法高亮

使用 [Shiki](https://shiki.matsu.io/) 提供语法高亮：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs'
})
```

### 行高亮

使用 `{行号}` 语法高亮特定行：

```ts {2,4-5}
function hello() {
  const name = 'world' // 高亮
  console.log(name)
  return name // 高亮
  // 高亮
}
```

### 行号

代码块默认显示行号，可以在代码块中使用 `:no-line-numbers` 禁用：

```ts :no-line-numbers
const a = 1
const b = 2
```

### 代码组

使用 `code-group` 容器展示多个相关代码块：

::: code-group

```bash [npm]
npm install @ldesign/doc
```

```bash [pnpm]
pnpm add @ldesign/doc
```

```bash [yarn]
yarn add @ldesign/doc
```

:::

## 容器

### 信息容器

```md
::: info 信息
这是一条信息。
:::

::: tip 提示
这是一条提示。
:::

::: warning 警告
这是一条警告。
:::

::: danger 危险
这是一条危险警告。
:::

::: details 点击查看详情
这是详情内容。
:::
```

渲染效果：

::: info 信息
这是一条信息。
:::

::: tip 提示
这是一条提示。
:::

::: warning 警告
这是一条警告。
:::

::: danger 危险
这是一条危险警告。
:::

::: details 点击查看详情
这是详情内容。
:::

## 表格

标准 Markdown 表格语法：

```md
| 名称 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| title | string | - | 站点标题 |
| description | string | - | 站点描述 |
| lang | string | 'en-US' | 语言 |
```

渲染效果：

| 名称 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| title | string | - | 站点标题 |
| description | string | - | 站点描述 |
| lang | string | 'en-US' | 语言 |

## Emoji

支持标准 Emoji 简码：

```md
:tada: :100: :rocket:
```

渲染效果：:tada: :100: :rocket:

## 目录

使用 `[[toc]]` 插入自动生成的目录：

```md
[[toc]]
```

## 数学公式

支持 LaTeX 数学公式（需启用 `markdown.math` 选项）：

行内公式：$E = mc^2$

块级公式：

$$
\frac{d}{dx}\left( \int_{0}^{x} f(u)\,du\right)=f(x)
$$

## 在 Markdown 中使用 Vue

### 模板语法

```md
{{ 1 + 1 }}
```

渲染效果：{{ 1 + 1 }}

### 使用组件

可以在 Markdown 中直接使用 Vue 组件：

```vue
<script setup>
import { ref } from 'vue'
import MyButton from '../components/MyButton.vue'

const count = ref(0)
</script>

# 我的页面

<MyButton @click="count++">
  点击次数：{{ count }}
</MyButton>
```

### 使用全局组件

通过插件注册的全局组件可以直接使用：

```md
<Badge text="新功能" type="tip" />
```

## 导入代码片段

从文件导入代码：

```md
<<< @/snippets/example.ts
```

还可以指定行范围和高亮：

```md
<<< @/snippets/example.ts{2-5}
```

## Frontmatter

每个 Markdown 文件可以包含 YAML frontmatter：

```yaml
---
title: 页面标题
description: 页面描述
sidebar: false
outline: [2, 3]
---
```

详见 [Frontmatter 配置](/guide/frontmatter)。
