# 介绍

欢迎使用 Clean 主题！

## 安装

```bash
pnpm add ldoc-theme-clean
```

## 配置

```ts
import { defineConfig } from '@ldesign/doc'
import theme from 'ldoc-theme-clean'

export default defineConfig({
  theme
})
```

## 主题特性

### 响应式设计

主题默认支持响应式布局，适配各种屏幕尺寸。

### 暗色模式

点击右上角的主题切换按钮体验暗色模式。

### 代码高亮

支持语法高亮的代码块：

```ts
function hello() {
  console.log('Hello, World!')
}
```

### 引用块

> 这是一个引用块示例

### 表格

| 功能 | 支持 |
|------|------|
| 暗色模式 | ✅ |
| 响应式 | ✅ |
| 代码高亮 | ✅ |
