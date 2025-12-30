# PWA 插件

`pwaPlugin` 为站点提供 PWA 能力：Service Worker、Manifest、离线缓存与更新提示。

## 安装

```ts
import { pwaPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    pwaPlugin({
      enabled: true,
      updatePrompt: { enabled: true }
    })
  ]
})
```

## 关键配置

- **`enabled`**: `boolean`

  是否启用 PWA。

- **`serviceWorker`**: `ServiceWorkerConfig`

  SW 生成与缓存策略。

- **`manifest`**: `ManifestConfig`

  Manifest 元信息与 icons。

- **`updatePrompt`**: `UpdatePromptConfig`

  控制更新提示组件。

- **`devOptions`**

  控制开发模式下是否启用。

## 注意

该插件会在构建输出目录写入 `sw.js`、`manifest.json` 等文件。Playground 默认关闭，避免干扰本地开发环境。
