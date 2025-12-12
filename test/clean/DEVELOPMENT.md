# ldoc-theme-clean 开发指南

本文档详细介绍如何开发、调试、打包和发布此主题。

## 项目结构

```
src/
├── index.ts              # 主题入口（必须导出 theme 对象）
├── Layout.vue            # 主布局组件（必须）
├── NotFound.vue          # 404 页面（必须）
├── components/           # 自定义组件
└── styles/index.css      # 主题样式
dev/                      # 开发预览
├── doc.config.ts         # 预览配置
└── docs/                 # 预览文档
```

## 开发流程

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发模式

```bash
pnpm dev
```

这会同时运行：
- \`vite build --watch\` - 监听源码变化自动构建
- \`ldoc dev dev\` - 启动预览服务

打开 http://localhost:5173 查看效果。

### 3. 修改代码

编辑 \`src/\` 目录下的文件，保存后自动重新构建和刷新。

## 主题开发要点

### 必须导出的内容

```ts
// src/index.ts
import type { Theme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import './styles/index.css'

export const theme: Theme = {
  Layout,      // 主布局组件（必须）
  NotFound,    // 404 页面
}

export default theme
```

### Layout 组件要求

```vue
<script setup lang="ts">
import { useData } from '@ldesign/doc/client'
const { site, page, frontmatter } = useData()
</script>

<template>
  <div class="layout">
    <header>{{ site.title }}</header>
    <main>
      <!-- 必须包含 router-view -->
      <router-view />
    </main>
  </div>
</template>
```

### 可用的 Composables

```ts
import {
  useData,         // 站点和页面数据
  useRoute,        // 当前路由
  useSidebarItems, // 侧边栏数据
  useThemeConfig   // 主题配置
} from '@ldesign/doc/client'
```

### CSS 变量规范

```css
:root {
  --theme-primary: #3b82f6;
  --theme-bg: #ffffff;
  --theme-text: #1f2937;
  --theme-border: #e5e7eb;
}

.dark {
  --theme-bg: #1f2937;
  --theme-text: #f9fafb;
}
```

## 调试技巧

1. **Vue DevTools** - 查看组件树和状态
2. **打印数据** - \`console.log(useData())\`
3. **热更新失效** - 硬刷新或重启服务

## 打包构建

```bash
pnpm build
```

输出到 \`dist/\` 目录。

## 发布到 npm

```bash
# 登录
npm login

# 发布
pnpm publish
```

### 版本管理

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0  
npm version major  # 1.0.0 -> 2.0.0
```

## 注意事项

1. **package.json exports** - 必须导出 \`./package.json\`
2. **样式导入** - 在 index.ts 中导入样式文件
3. **router-view** - Layout 必须包含 router-view
4. **响应式设计** - 适配移动端和桌面端

## 许可证

MIT
