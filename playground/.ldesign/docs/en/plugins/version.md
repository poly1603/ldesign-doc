# Version Plugin

`versionPlugin` manages multiple doc versions and provides a version selector in the navbar or sidebar.

## Installation

```ts
import { versionPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    versionPlugin({
      versions: [
        { version: '2.0.0', path: '/v2/', label: 'v2.x' },
        { version: '1.0.0', path: '/v1/', label: 'v1.x', deprecated: true }
      ],
      current: '2.0.0',
      selectorPosition: 'nav'
    })
  ]
})
```
