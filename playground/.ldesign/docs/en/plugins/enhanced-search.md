# Enhanced Search Plugin

`enhancedSearchPlugin` adds fuzzy search, CJK segmentation, filters, suggestions and search history.

## Installation

```ts
import { enhancedSearchPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    enhancedSearchPlugin({
      hotkeys: ['/', 'Ctrl+K', 'Meta+K'],
      placeholder: 'Search docs...'
    })
  ]
})
```

## Notes

In most sites you should use either `searchPlugin` or `enhancedSearchPlugin`, not both.
