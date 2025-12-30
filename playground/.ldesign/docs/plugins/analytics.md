# 分析插件

`analyticsPlugin` 用于注入统计脚本，并可选进行文档健康检查与搜索追踪。

## 安装

```ts
import { analyticsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    analyticsPlugin({
      provider: 'custom',
      custom: { script: '' },
      healthCheck: { enabled: false },
      searchTracking: { enabled: false },
      enableInDev: false
    })
  ]
})
```

## provider

- `google`：需要 `google.measurementId`
- `plausible`：需要 `plausible.domain`
- `umami`：需要 `umami.websiteId` 与 `umami.src`
- `custom`：使用自定义脚本

## 额外能力

- **健康检查**：断链、过期内容检测，并输出报告
- **搜索追踪**：记录用户搜索词（本地或 API）

## 注意

由于第三方统计通常需要站点 ID / Key，Playground 默认使用 `custom` 且脚本为空。
