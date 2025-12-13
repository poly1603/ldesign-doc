---
title: 资源处理
---

# 资源处理

本章节介绍如何在文档中使用图片、样式等静态资源。

## 静态资源目录

将静态资源放在 `src/public` 目录中：

```
src/
├── public/
│   ├── logo.svg
│   ├── images/
│   │   ├── hero.png
│   │   └── screenshot.png
│   └── fonts/
│       └── custom.woff2
└── guide/
    └── index.md
```

`public` 目录中的文件会被原样复制到构建输出目录：

```
src/public/logo.svg → dist/logo.svg
src/public/images/hero.png → dist/images/hero.png
```

## 引用静态资源

### 在 Markdown 中

使用绝对路径引用 `public` 目录中的资源：

```md
![Logo](/logo.svg)
![Hero](/images/hero.png)
```

### 在 Vue 组件中

```vue
<template>
  <img src="/logo.svg" alt="Logo" />
</template>
```

### 在 CSS 中

```css
.hero {
  background-image: url('/images/hero.png');
}

@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
}
```

## 相对路径

也可以使用相对路径引用同目录或子目录的资源：

```
src/
├── guide/
│   ├── index.md
│   └── images/
│       └── diagram.png
```

```md
<!-- src/guide/index.md -->
![Diagram](./images/diagram.png)
```

## Base URL

如果站点部署在子目录下，资源路径会自动添加 base 前缀：

```ts
// doc.config.ts
export default defineConfig({
  base: '/docs/'
})
```

```md
<!-- 源码 -->
![Logo](/logo.svg)

<!-- 输出 -->
<img src="/docs/logo.svg" />
```

## 图片优化

### 自动优化

@ldesign/doc 会自动优化图片：

- 自动添加 `loading="lazy"` 属性
- 响应式图片支持
- 图片压缩（构建时）

### 禁用优化

在 frontmatter 中禁用：

```yaml
---
imageOptimization: false
---
```

### 手动控制

```md
<!-- 禁用懒加载 -->
![Logo](/logo.svg){loading="eager"}

<!-- 指定尺寸 -->
![Screenshot](/screenshot.png){width="800" height="600"}
```

## 导入资源

### 在 Vue 组件中导入

```vue
<script setup>
import logoUrl from '/logo.svg'
import heroImg from '../assets/hero.png'
</script>

<template>
  <img :src="logoUrl" />
  <img :src="heroImg" />
</template>
```

### 导入 CSS

```vue
<style>
@import '/styles/custom.css';
</style>
```

或在 `doc.config.ts` 中全局引入：

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'stylesheet', href: '/styles/custom.css' }]
  ]
})
```

## 字体

### 使用 Google Fonts

```ts
// doc.config.ts
export default defineConfig({
  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
      }
    ]
  ]
})
```

### 使用本地字体

```css
/* src/public/styles/fonts.css */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/MyFont.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## SVG 图标

### 内联 SVG

```vue
<template>
  <svg viewBox="0 0 24 24" width="24" height="24">
    <path d="..." fill="currentColor" />
  </svg>
</template>
```

### 作为组件使用

```vue
<script setup>
import IconGithub from '../components/icons/Github.vue'
</script>

<template>
  <IconGithub />
</template>
```

### 使用图标库

推荐使用 [Iconify](https://iconify.design/)：

```bash
pnpm add -D @iconify/vue
```

```vue
<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
  <Icon icon="mdi:github" />
</template>
```

## 外部资源

### CDN 资源

```ts
// doc.config.ts
export default defineConfig({
  head: [
    ['script', { src: 'https://cdn.example.com/lib.js' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.example.com/style.css' }]
  ]
})
```

### 预连接

优化外部资源加载：

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }]
  ]
})
```

## 资源哈希

构建时，资源文件会自动添加内容哈希：

```
logo.svg → logo.abc123.svg
styles.css → styles.def456.css
```

这确保了浏览器缓存的正确失效。
