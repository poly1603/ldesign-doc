# Tags Plugin

`tagsPlugin` builds a tag index from `frontmatter.tags` and generates tag pages.

## Installation

```ts
import { tagsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    tagsPlugin({
      enabled: true,
      tagPagePrefix: '/tags',
      generateTagCloud: true,
      tagCloudPath: '/tags.html'
    })
  ]
})
```

## Frontmatter

```yaml
---
tags:
  - guide
  - plugin
---
```
