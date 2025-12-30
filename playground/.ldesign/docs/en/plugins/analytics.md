# Analytics Plugin

`analyticsPlugin` injects analytics scripts and optionally performs doc health checks and search tracking.

## Installation (Safe Defaults)

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

## Providers

- `google` (requires `measurementId`)
- `plausible` (requires `domain`)
- `umami` (requires `websiteId` + `src`)
- `custom`
