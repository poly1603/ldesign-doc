# PWA Plugin

`pwaPlugin` adds Progressive Web App support: Service Worker generation, manifest generation, offline caching and update prompt.

## Installation

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

## Notes

This plugin writes `sw.js` (and optionally `manifest.json`) during build.
