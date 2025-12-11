# 主题开发

LDoc 提供了强大的主题系统，让你可以完全自定义文档站点的外观。

## 创建自定义主题

在 `.ldoc/theme` 目录下创建主题文件：

```ts
// .ldoc/theme/index.ts
import { defineTheme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('MyComponent', MyComponent)
  }
})
```

## 主题布局

Layout 组件是主题的核心，它定义了整个页面的结构：

```vue
<template>
  <div class="layout">
    <header>
      <Nav />
    </header>
    <aside>
      <Sidebar />
    </aside>
    <main>
      <Content />
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>
```

## 使用默认主题组件

你可以导入默认主题的组件进行复用或覆盖：

```ts
import {
  VPNav,
  VPSidebar,
  VPContent,
  VPFooter
} from '@ldesign/doc/theme-default'
```

## 主题配置类型

为你的自定义主题提供类型支持：

```ts
// theme/types.ts
export interface MyThemeConfig {
  logo?: string
  nav?: NavItem[]
  // ...
}
```

```ts
// ldoc.config.ts
import { defineConfigWithTheme } from '@ldesign/doc'
import type { MyThemeConfig } from './.ldoc/theme/types'

export default defineConfigWithTheme<MyThemeConfig>({
  themeConfig: {
    // 带类型提示的配置
  }
})
```

## 样式定制

### CSS 变量

默认主题使用 CSS 变量，你可以覆盖它们：

```css
:root {
  --ldoc-c-brand: #5468ff;
  --ldoc-c-brand-light: #747bff;
  --ldoc-c-brand-dark: #3451b2;
}
```

### 暗色模式

LDoc 内置暗色模式支持，使用 `.dark` 类名：

```css
.dark {
  --ldoc-c-bg: #1a1a1a;
  --ldoc-c-text-1: rgba(255, 255, 255, 0.87);
}
```
