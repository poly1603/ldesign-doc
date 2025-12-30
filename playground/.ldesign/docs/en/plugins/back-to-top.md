# Back To Top Plugin

`backToTopPlugin` shows a floating "Back to top" button when the page is scrolled down.

## Installation

```ts
import { backToTopPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    backToTopPlugin()
  ]
})
```

## Options

```ts
backToTopPlugin({
  threshold: 300,
  position: 'right',
  bottom: 40,
  side: 40
})
```
