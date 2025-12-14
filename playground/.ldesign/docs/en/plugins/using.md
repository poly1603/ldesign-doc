# Using Plugins

Learn how to install, configure, and use plugins in LDoc.

## Installing Plugins

### Built-in Plugins

Built-in plugins are included with LDoc:

```ts
import {
  searchPlugin,
  commentPlugin,
  progressPlugin,
  copyCodePlugin,
  imageViewerPlugin,
  readingTimePlugin,
  lastUpdatedPlugin,
  demoPlugin,
  wordCountPlugin
} from '@ldesign/doc/plugins'
```

### Third-party Plugins

Install from npm:

```bash
pnpm add ldoc-plugin-example
```

Then import:

```ts
import { examplePlugin } from 'ldoc-plugin-example'
```

## Configuring Plugins

Add plugins to your configuration:

```ts
import { defineConfig } from '@ldesign/doc'
import { searchPlugin, progressPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin(),
    progressPlugin({
      color: '#3b82f6',
      height: 3
    })
  ]
})
```

## Plugin Order

Plugins are executed in array order by default. Use `enforce` to control order:

```ts
{
  plugins: [
    pluginA(),           // Normal order
    pluginB({ enforce: 'pre' }),  // Runs first
    pluginC({ enforce: 'post' }), // Runs last
  ]
}
```

## Conditional Plugins

Enable plugins conditionally:

```ts
const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [
    searchPlugin(),
    isDev && debugPlugin(), // Only in development
    !isDev && analyticsPlugin() // Only in production
  ].filter(Boolean)
})
```

## Plugin Options Pattern

Most plugins follow this pattern:

```ts
import { myPlugin } from 'ldoc-plugin-my'

myPlugin({
  // Enable/disable features
  enabled: true,
  
  // Customize behavior
  option1: 'value',
  option2: 123,
  
  // Include/exclude pages
  include: ['/guide/**'],
  exclude: ['/'],
  
  // Callbacks
  onEvent: (data) => {
    console.log(data)
  }
})
```

## Common Configuration

### Recommended Setup

```ts
import { defineConfig } from '@ldesign/doc'
import {
  searchPlugin,
  progressPlugin,
  copyCodePlugin,
  imageViewerPlugin,
  readingTimePlugin,
  lastUpdatedPlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    // Essential plugins
    searchPlugin({
      hotkeys: ['/', 'Ctrl+K']
    }),
    
    copyCodePlugin({
      showLanguage: true
    }),
    
    // UI enhancements
    progressPlugin({
      exclude: ['/']
    }),
    
    imageViewerPlugin({
      zoom: true
    }),
    
    // Page metadata
    readingTimePlugin({
      wordsPerMinute: 200
    }),
    
    lastUpdatedPlugin({
      useGitTime: true
    })
  ]
})
```

## Troubleshooting

### Plugin Not Working

1. Check plugin is imported correctly
2. Verify plugin is in the plugins array
3. Check plugin options are valid
4. Look for errors in console

### Conflicts

If plugins conflict:
- Adjust execution order with `enforce`
- Check plugin documentation for compatibility
- Contact plugin maintainers
