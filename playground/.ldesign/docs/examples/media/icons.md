---
title: 图标使用
---

# 图标使用

LDoc 支持多种图标使用方式。

## Emoji 图标

直接使用 Emoji：

✨ 🚀 📦 🎨 ⚡️ 🔧 📝 🎯

## SVG 图标

内联 SVG 图标：

<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M12 6v6l4 2"></path>
</svg>

## 图标库推荐

::: tip 推荐图标库
- **Heroicons** - Tailwind CSS 官方图标库
- **Lucide** - 简洁美观的图标集
- **Phosphor** - 灵活可定制的图标库
- **Tabler Icons** - 开源 SVG 图标
:::

## 使用示例

```html
<svg width="24" height="24" viewBox="0 0 24 24">
  <path d="..." />
</svg>
```

## 图标与文字组合

<div style="display: flex; align-items: center; gap: 8px;">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
  <span>任务完成</span>
</div>
