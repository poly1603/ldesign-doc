# 静态资源

本章介绍如何在文档中使用图片、样式等静态资源。

## 公共资源目录

将静态资源放在 `public` 目录中：

```
docs/
├── public/
│   ├── logo.svg
│   ├── images/
│   │   └── screenshot.png
│   └── fonts/
│       └── custom.woff2
└── guide/
    └── index.md
```

`public` 目录中的文件会被原样复制到构建输出：

```
public/logo.svg → dist/logo.svg
public/images/screenshot.png → dist/images/screenshot.png
```

## 引用资源

### Markdown 中使用

```md
<!-- 引用 public 目录的资源 -->
![Logo](/logo.svg)
![Screenshot](/images/screenshot.png)
```

### Vue 组件中使用

```vue
<template>
  <img src="/logo.svg" alt="Logo" />
</template>
```

### CSS 中使用

```css
.hero {
  background-image: url('/images/hero.png');
}

@font-face {
  font-family: 'MyFont';
  src: url('/fonts/custom.woff2') format('woff2');
}
```

## 相对路径

也可以使用相对路径引用同目录资源：

```
docs/
└── guide/
    ├── index.md
    └── images/
        └── diagram.png
```

```md
<!-- docs/guide/index.md -->
![Diagram](./images/diagram.png)
```

## Base URL

如果站点部署在子目录，资源路径会自动添加 base 前缀：

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

### 自动懒加载

图片默认添加 `loading="lazy"` 属性。

### 指定尺寸

```md
![Screenshot](/screenshot.png){width="800" height="600"}
```

### 禁用预览

使用 `imageViewerPlugin` 时，添加 `.no-preview` 类禁用点击预览：

```md
![Logo](/logo.svg){.no-preview}
```

## 字体配置

### Google Fonts

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

### 本地字体

```css
/* public/styles/fonts.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## 外部资源

### CDN 引入

```ts
// doc.config.ts
export default defineConfig({
  head: [
    ['script', { src: 'https://cdn.example.com/lib.js' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.example.com/style.css' }]
  ]
})
```

### 预连接优化

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }]
  ]
})
```
