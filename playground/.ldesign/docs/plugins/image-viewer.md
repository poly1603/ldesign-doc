# 图片预览插件

点击图片放大预览，支持缩放和拖拽。

## 安装

```ts
import { imageViewerPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    imageViewerPlugin()
  ]
})
```

## 配置选项

```ts
imageViewerPlugin({
  // 启用缩放
  zoom: true,
  
  // 最大缩放倍数
  maxZoom: 5,
  
  // 显示关闭按钮
  showClose: true,
  
  // 显示图片信息
  showInfo: true,
  
  // 背景透明度
  bgOpacity: 0.9,
  
  // 图片选择器
  selector: '.ldoc-content img',
  
  // 排除选择器
  excludeSelector: '.no-preview'
})
```

## 配置详解

### zoom

- **类型**: `boolean`
- **默认值**: `true`

是否启用滚轮缩放。

### maxZoom

- **类型**: `number`
- **默认值**: `5`

最大缩放倍数。

### showClose

- **类型**: `boolean`
- **默认值**: `true`

是否显示关闭按钮。

### showInfo

- **类型**: `boolean`
- **默认值**: `true`

是否显示图片信息（尺寸、名称）。

### bgOpacity

- **类型**: `number`
- **默认值**: `0.9`

背景遮罩的透明度，0-1 之间。

### selector

- **类型**: `string`
- **默认值**: `'.ldoc-content img'`

可点击预览的图片选择器。

### excludeSelector

- **类型**: `string`
- **默认值**: `'.no-preview'`

排除的图片选择器。

## 功能特点

### 交互操作

| 操作 | 效果 |
|------|------|
| 点击图片 | 打开预览 |
| 滚轮 | 缩放 |
| 拖拽 | 移动图片 |
| ESC | 关闭预览 |
| 点击背景 | 关闭预览 |

### 控制按钮

- 🔍 放大
- 🔍 缩小
- 🔄 重置
- ✕ 关闭

## 禁用特定图片

添加 `.no-preview` 类或使用 `data-no-preview` 属性：

```md
<!-- 使用类名 -->
![Logo](/logo.svg){.no-preview}

<!-- 使用属性 -->
<img src="/logo.svg" data-no-preview />
```

## 自定义样式

```css
/* 预览遮罩 */
.ldoc-image-viewer-overlay {
  background: rgba(0, 0, 0, 0.9);
}

/* 图片容器 */
.ldoc-image-viewer-container {
  /* ... */
}

/* 控制按钮 */
.ldoc-image-viewer-controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.ldoc-image-viewer-control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 图片信息 */
.ldoc-image-viewer-info {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
}
```

## 与 Markdown 图片配合

正常的 Markdown 图片会自动支持预览：

```md
![示例图片](/images/example.png)
```

点击图片即可放大查看。
