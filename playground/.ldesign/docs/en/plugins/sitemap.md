# Sitemap Plugin

`sitemapPlugin` generates a sitemap page and JSON data during build.

## Installation

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
