# Feedback Plugin

`feedbackPlugin` collects documentation feedback (helpful, rating, form, inline) with multiple storage backends.

## Installation

```ts
import { feedbackPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    feedbackPlugin({
      type: 'helpful',
      storage: { type: 'local' },
      position: 'doc-bottom',
      enableInDev: true
    })
  ]
})
```

## Storage

- `local`
- `api`
- `github`
