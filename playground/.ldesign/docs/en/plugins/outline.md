# Outline (Floating TOC) Plugin

`outlinePlugin` collects headings from the content area and renders a floating outline panel.

## Installation

```ts
import { outlinePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    outlinePlugin({
      title: 'On this page',
      minLevel: 2,
      maxLevel: 3,
      position: 'right'
    })
  ]
})
```
