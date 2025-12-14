# Plugins

LDoc has a powerful plugin system that allows you to extend functionality.

## Built-in Plugins

LDoc comes with several built-in plugins:

- [Search Plugin](/en/plugins/search) - Full-text search
- [Comment Plugin](/en/plugins/comment) - Comment systems (Giscus, etc.)
- [Progress Plugin](/en/plugins/progress) - Reading progress bar
- [Copy Code Plugin](/en/plugins/copy-code) - Code block copy button
- [Image Viewer Plugin](/en/plugins/image-viewer) - Image lightbox
- [Reading Time Plugin](/en/plugins/reading-time) - Estimated reading time
- [Last Updated Plugin](/en/plugins/last-updated) - Last update timestamp
- [Demo Plugin](/en/plugins/demo) - Component demo blocks

## Using Plugins

Import and configure plugins in `doc.config.ts`:

```ts
import { defineConfig } from '@ldesign/doc'
import {
  searchPlugin,
  commentPlugin,
  progressPlugin,
  copyCodePlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin({
      hotkeys: ['/', 'Ctrl+K']
    }),
    
    commentPlugin({
      provider: 'giscus',
      giscus: {
        repo: 'your-org/your-repo',
        repoId: 'your-repo-id',
        category: 'Announcements',
        categoryId: 'your-category-id'
      }
    }),
    
    progressPlugin({
      color: '#3b82f6',
      height: 3
    }),
    
    copyCodePlugin({
      showLanguage: true
    })
  ]
})
```

## Plugin Development

- [Plugin Development Guide](/en/plugins/development) - Create your own plugins
- [Plugin API](/en/plugins/api) - Plugin API reference

## Plugin Categories

### Content Enhancement
- Search, comments, reading time

### UI Enhancement
- Progress bar, image viewer, copy code

### Development Tools
- Demo blocks, component documentation
