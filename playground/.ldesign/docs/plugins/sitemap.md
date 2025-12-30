# 站点地图插件

`sitemapPlugin` 会在构建时扫描所有页面，生成一个站点地图页面（HTML）以及数据文件（JSON）。

## 安装

```ts
import { sitemapPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    sitemapPlugin({
      enabled: true,
      sitemapPath: '/sitemap.html',
      includeHidden: false
    })
  ]
})
```

## 配置选项

- **`enabled`**: `boolean`

  是否启用。

- **`sitemapPath`**: `string`

  站点地图页面输出路径。

- **`includeHidden`**: `boolean`

  是否包含隐藏页面。

## 注意

该插件会输出 `sitemap-data.json`。Playground 默认关闭，避免生成额外页面影响演示结构。
