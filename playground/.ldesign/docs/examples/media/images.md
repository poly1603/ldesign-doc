---
title: 图片展示
---

# 图片展示

LDoc 支持多种图片展示方式。

## 基础用法

使用标准 Markdown 语法插入图片：

```markdown
![Alt 文本](图片路径)
```

## 远程图片

![Vue Logo](https://vuejs.org/images/logo.png)

## 图片尺寸

可以使用 HTML 标签控制图片尺寸：

```html
<img src="图片路径" width="200" />
```

## 图片对齐

使用样式控制图片对齐：

```html
<div style="text-align: center">
  <img src="图片路径" />
</div>
```

## 最佳实践

::: tip 建议
- 使用相对路径引用本地图片
- 为图片添加有意义的 alt 文本
- 优化图片大小以提升加载速度
- 使用 WebP 格式获得更好的压缩
:::
