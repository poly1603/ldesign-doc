# Social Share Plugin

`socialSharePlugin` injects a set of share buttons for common platforms.

## Installation

```ts
import { socialSharePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    socialSharePlugin({
      showAtBottom: true
    })
  ]
})
```

## Options

- `platforms`
- `titleTemplate`
- `showAtBottom`
- `showInSidebar`
