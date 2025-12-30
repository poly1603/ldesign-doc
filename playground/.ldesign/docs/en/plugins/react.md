# React Plugin

`reactPlugin` enhances JSX/TSX demo fences.

## Installation

```ts
import { reactPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    reactPlugin({
      version: '18',
      strictMode: true
    })
  ]
})
```
