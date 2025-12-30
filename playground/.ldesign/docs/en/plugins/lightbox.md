# Lightbox Plugin

`lightboxPlugin` provides a full-screen image lightbox. Click images inside the doc content to preview.

## Installation

```ts
import { lightboxPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    lightboxPlugin()
  ]
})
```

## Options

```ts
lightboxPlugin({
  zoom: true,
  background: 'rgba(0, 0, 0, 0.9)',
  selector: '.ldoc-content img'
})
```
