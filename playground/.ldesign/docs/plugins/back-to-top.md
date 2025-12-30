# 返回顶部插件

`backToTopPlugin` 会在页面滚动到一定距离后显示一个“返回顶部”按钮。

## 安装

```ts
import { backToTopPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    backToTopPlugin()
  ]
})
```

## 配置

```ts
backToTopPlugin({
  threshold: 300,
  position: 'right',
  bottom: 40,
  side: 40
})
```

## 配置选项

- **`threshold`**: `number`

  显示按钮的滚动阈值（像素）。

- **`position`**: `'left' | 'right'`

  按钮显示在左侧或右侧。

- **`bottom`**: `number`

  距离底部的偏移（像素）。

- **`side`**: `number`

  距离侧边的偏移（像素）。
