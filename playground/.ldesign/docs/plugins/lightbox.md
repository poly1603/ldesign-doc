# 图片灯箱插件

`lightboxPlugin` 提供全屏灯箱预览：点击文档内容区图片即可放大，并支持缩放与快捷键关闭。

## 安装

```ts
import { lightboxPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    lightboxPlugin()
  ]
})
```

## 配置

```ts
lightboxPlugin({
  zoom: true,
  background: 'rgba(0, 0, 0, 0.9)',
  selector: '.ldoc-content img'
})
```

## 配置选项

- **`zoom`**: `boolean`

  是否启用缩放控制。

- **`background`**: `string`

  灯箱背景色。

- **`selector`**: `string`

  需要绑定点击预览的选择器。

## 与 imageViewerPlugin 的区别

`imageViewerPlugin` 更偏向图片查看器体验；`lightboxPlugin` 是轻量级全屏灯箱。Playground 同时启用仅用于展示能力，实际项目建议二选一。
