---
title: 视频嵌入
---

# 视频嵌入

LDoc 支持多种视频嵌入方式。

## HTML5 视频

使用标准 HTML5 video 标签：

```html
<video controls width="100%">
  <source src="video.mp4" type="video/mp4" />
</video>
```

## iframe 嵌入

嵌入第三方视频平台：

```html
<iframe 
  src="https://player.bilibili.com/player.html?bvid=xxx" 
  allowfullscreen
></iframe>
```

## 响应式视频

使用容器包装实现响应式：

```html
<div class="video-container">
  <iframe src="视频地址"></iframe>
</div>
```

```css
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

## 最佳实践

::: tip 建议
- 提供多种视频格式以确保兼容性
- 添加 poster 属性显示预览图
- 考虑视频加载性能
- 为视频添加字幕支持
:::
