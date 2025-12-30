# 性能优化插件

`performancePlugin` 提供图片优化（WebP/lazy loading）、代码分割、预加载提示等能力。

## 安装

```ts
import { performancePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    performancePlugin({
      imageOptimization: { enabled: true },
      codeSplitting: { enabled: true },
      preloadHints: { enabled: true }
    })
  ]
})
```

## 图片优化

- 动态导入 `sharp`，如果未安装会自动跳过并打印 warning。
- 可生成 WebP，记录需要 lazy loading 的图片。

## 代码分割

在构建阶段调整打包策略，减少首屏体积。

## 预加载提示

构建结束后注入预加载提示，提升页面切换体验。
