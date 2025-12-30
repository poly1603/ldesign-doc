# Announcement Plugin

`announcementPlugin` renders a top announcement bar (HTML content supported). It can be closable and remember the dismissed state.

## Installation

```ts
import { announcementPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    announcementPlugin({
      content: 'Announcement text',
      type: 'info',
      closable: true,
      storageKey: 'my-announcement',
      link: '/en/examples/',
      linkText: 'View examples'
    })
  ]
})
```
