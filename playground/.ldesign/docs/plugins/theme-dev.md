# 主题开发指南

本章介绍如何从零开发一个 LDoc 主题。

## 快速开始

使用 CLI 创建主题项目：

```bash
# 创建主题项目
ldoc create theme my-theme

# 进入项目
cd ldoc-theme-my-theme

# 安装依赖
pnpm install

# 开发模式
pnpm dev
```

`pnpm dev` 会同时：
1. 监听主题源码变化并自动构建
2. 启动预览文档站点

## 项目结构

```
ldoc-theme-my-theme/
├── src/
│   ├── index.ts          # 主题入口
│   ├── Layout.vue        # 主布局组件
│   ├── NotFound.vue      # 404 页面
│   ├── components/       # 组件目录
│   ├── composables/      # 组合式函数
│   └── styles/
│       └── index.css     # 主题样式
├── dev/                  # 开发预览
│   ├── doc.config.ts     # 预览配置
│   └── docs/             # 预览文档
├── dist/                 # 构建输出
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 主题入口

```ts
// src/index.ts
import type { Theme, EnhanceAppContext } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import './styles/index.css'

export interface MyThemeOptions {
  primaryColor?: string
}

export function createMyTheme(options: MyThemeOptions = {}): Theme {
  return {
    Layout,
    NotFound,
    
    enhanceApp({ app, router, siteData }: EnhanceAppContext) {
      // 注册全局组件
      // app.component('CustomComponent', CustomComponent)
      
      // 设置主色调
      if (options.primaryColor && typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--theme-primary', options.primaryColor)
      }
    }
  }
}

// 默认导出
export const theme: Theme = { Layout, NotFound }
export default theme
```

## Theme 接口

```ts
interface Theme {
  // 必需：主布局组件
  Layout: Component
  
  // 可选：404 页面组件
  NotFound?: Component
  
  // 可选：增强 App 实例
  enhanceApp?: (ctx: EnhanceAppContext) => void | Promise<void>
  
  // 可选：扩展其他主题
  extends?: Theme
  
  // 可选：额外样式文件
  styles?: string[]
}

interface EnhanceAppContext {
  app: App          // Vue 应用实例
  router: Router    // 路由实例
  siteData: SiteData // 站点数据
}
```

## Layout 组件

Layout 是主题的核心，负责整体页面结构：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute, Content } from '@ldesign/doc/client'

const { site, page, theme, frontmatter } = useData()
const route = useRoute()

// 判断页面类型
const isHome = computed(() => frontmatter.value.layout === 'home')
const isDoc = computed(() => !isHome.value)

// 暗色模式
const isDark = ref(false)
</script>

<template>
  <div class="theme-layout" :class="{ dark: isDark }">
    <!-- 导航栏 -->
    <header class="nav-bar">
      <a href="/" class="logo">{{ site.title }}</a>
      
      <nav class="nav-links">
        <a 
          v-for="item in theme.nav" 
          :key="item.link" 
          :href="item.link"
        >
          {{ item.text }}
        </a>
      </nav>
      
      <button @click="isDark = !isDark">
        {{ isDark ? '🌙' : '☀️' }}
      </button>
    </header>
    
    <!-- 侧边栏 -->
    <aside v-if="isDoc" class="sidebar">
      <!-- 渲染侧边栏 -->
    </aside>
    
    <!-- 主内容 -->
    <main class="main-content">
      <!-- 首页 -->
      <template v-if="isHome">
        <div class="home-hero">
          <h1>{{ frontmatter.hero?.name }}</h1>
          <p>{{ frontmatter.hero?.tagline }}</p>
        </div>
      </template>
      
      <!-- 文档页 -->
      <template v-else>
        <Content />
      </template>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      {{ theme.footer?.message }}
    </footer>
  </div>
</template>

<style scoped>
/* 样式 */
</style>
```

## 使用内置 Composables

```ts
import {
  useData,      // 获取站点/页面数据
  useRoute,     // 当前路由
  useRouter,    // 路由器
  useDark,      // 暗色模式
  useSidebar    // 侧边栏状态
} from '@ldesign/doc/client'
```

### useData

```ts
const { 
  site,        // SiteData
  page,        // PageData
  theme,       // ThemeConfig
  frontmatter, // 当前页面 frontmatter
  lang,        // 当前语言
  title,       // 页面标题
  description  // 页面描述
} = useData()
```

### useDark

```ts
const isDark = useDark()

// 切换
isDark.value = !isDark.value
```

## 复用默认主题组件

```ts
import {
  VPNav,
  VPSidebar,
  VPContent,
  VPFooter,
  VPHome,
  VPDoc,
  VPOutline
} from '@ldesign/doc/theme-default'
```

## 主题样式

### CSS 变量规范

```css
:root {
  /* 主色 */
  --theme-primary: #3b82f6;
  --theme-primary-light: #60a5fa;
  --theme-primary-dark: #2563eb;
  
  /* 背景 */
  --theme-bg: #ffffff;
  --theme-bg-soft: #f6f6f7;
  --theme-bg-mute: #e3e3e5;
  
  /* 文字 */
  --theme-text-1: #1f2937;
  --theme-text-2: #6b7280;
  --theme-text-3: #9ca3af;
  
  /* 边框 */
  --theme-border: #e5e7eb;
  
  /* 代码 */
  --theme-code-bg: #f3f4f6;
}

/* 暗色模式 */
.dark {
  --theme-bg: #1f2937;
  --theme-bg-soft: #374151;
  --theme-text-1: #f9fafb;
  --theme-text-2: #d1d5db;
  --theme-border: #4b5563;
  --theme-code-bg: #111827;
}
```

### Markdown 内容样式

```css
/* 标题 */
.content h1, .content h2, .content h3 {
  font-weight: 600;
  line-height: 1.25;
}

/* 代码块 */
.content pre {
  background: var(--theme-code-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

/* 表格 */
.content table {
  width: 100%;
  border-collapse: collapse;
}

/* 引用 */
.content blockquote {
  border-left: 4px solid var(--theme-primary);
  padding-left: 16px;
  color: var(--theme-text-2);
}
```

## 构建与发布

### 构建

```bash
pnpm build
```

输出到 `dist/` 目录。

### 发布到 npm

```bash
# 更新版本
npm version patch

# 发布
npm publish
```

### package.json 配置

```json
{
  "name": "ldoc-theme-my-theme",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles": "./dist/styles/index.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "@ldesign/doc": ">=1.0.0",
    "vue": ">=3.3.0"
  }
}
```

## 使用主题

用户安装后使用：

```bash
pnpm add ldoc-theme-my-theme
```

```ts
// doc.config.ts
import { defineConfig } from '@ldesign/doc'
import theme from 'ldoc-theme-my-theme'

export default defineConfig({
  theme
})
```

或使用工厂函数：

```ts
import { createMyTheme } from 'ldoc-theme-my-theme'

export default defineConfig({
  theme: createMyTheme({
    primaryColor: '#10b981'
  })
})
```

## 最佳实践

### 响应式设计

```css
/* 移动端 */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .nav-links { display: none; }
}

/* 平板 */
@media (max-width: 1024px) {
  .outline { display: none; }
}
```

### 无障碍

- 使用语义化 HTML 标签
- 添加 `aria-*` 属性
- 支持键盘导航
- 保证足够的颜色对比度

### 性能

- 使用 CSS 变量而非 JavaScript 主题切换
- 延迟加载非关键组件
- 优化图片资源
