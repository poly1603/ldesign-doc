# 大纲（悬浮 TOC）插件

`outlinePlugin` 会根据页面内容区的标题（h2-h6）生成一个悬浮的大纲面板，便于快速跳转。

## 安装

```ts
import { outlinePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    outlinePlugin()
  ]
})
```

## 配置

```ts
outlinePlugin({
  title: '本页目录',
  minLevel: 2,
  maxLevel: 3,
  position: 'right'
})
```

## 配置选项

- **`minLevel`**: `number`

  最小标题级别（默认 2）。

- **`maxLevel`**: `number`

  最大标题级别（默认 3）。

- **`title`**: `string`

  面板标题。

- **`position`**: `'left' | 'right'`

  面板显示在左侧或右侧。

## 注意

`outlinePlugin` 会从 `.ldoc-content` 内收集标题。如果你自定义主题/布局，需要保证内容容器类名保持一致或兼容。
