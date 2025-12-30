# Export Plugin

`exportPlugin` injects print-optimized styles and an export button (PDF / EPUB / HTML).

## Installation

```ts
import { exportPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    exportPlugin({
      formats: ['pdf'],
      enablePrintStyles: true,
      buttonPosition: 'doc-bottom'
    })
  ]
})
```

## Notes

- PDF export dynamically imports Playwright.
- EPUB export requires `epub-gen-memory`.
