# Performance Plugin

`performancePlugin` provides image optimization (WebP / lazy loading), code splitting and preload hints.

## Installation

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

## Notes

Image optimization uses `sharp` via dynamic import and will skip if not installed.
