# Plugin Development

Learn how to create custom plugins for LDoc.

## Plugin Structure

A plugin is an object with specific hooks and properties:

```ts
import type { LDocPlugin } from '@ldesign/doc'

const myPlugin: LDocPlugin = {
  name: 'my-plugin',
  
  // Optional: Execution order
  enforce: 'pre', // 'pre' | 'post' | number
  
  // Server-side hooks
  extendPageData(pageData, context) {
    // Modify page data
  },
  
  extendSiteData(siteData, context) {
    // Modify site data
  },
  
  // Client-side components
  slots: {
    'doc-before': () => MyComponent
  },
  
  // Client-side hooks
  onClientInit(context) {
    // Initialize on client
  },
  
  onClientMounted(context) {
    // After app mounted
  }
}
```

## Lifecycle Hooks

### Server-side Hooks

```ts
{
  // Transform markdown before rendering
  transformMarkdown(code, id, context) {
    return code.replace(/foo/g, 'bar')
  },
  
  // Extend page data
  extendPageData(pageData, context) {
    pageData.customData = 'value'
  },
  
  // Extend site data
  extendSiteData(siteData, context) {
    siteData.customField = 'value'
  }
}
```

### Client-side Hooks

```ts
{
  // When client app initializes
  onClientInit(context) {
    console.log('App initializing')
  },
  
  // When client app is mounted
  onClientMounted(context) {
    console.log('App mounted')
  },
  
  // Before route change
  onBeforeRouteChange(to, from, context) {
    console.log('Navigating to', to.path)
  },
  
  // After route change
  onAfterRouteChange(to, from, context) {
    console.log('Navigated to', to.path)
  }
}
```

## Plugin Context

The context object provides access to:

```ts
interface PluginContext {
  // Site configuration
  siteData: SiteData
  
  // Current page data
  pageData: PageData
  
  // Router instance
  router: Router
  
  // App instance
  app: App
  
  // Utilities
  route: RouteUtils
  data: DataUtils
  ui: UIUtils
  storage: StorageUtils
  events: EventBus
}
```

## Slots

Inject components into predefined slots:

```ts
{
  slots: {
    'layout-top': () => import('./Banner.vue'),
    'doc-before': () => import('./DocHeader.vue'),
    'doc-after': () => import('./DocFooter.vue')
  }
}
```

### Available Slots

- `layout-top` / `layout-bottom`
- `nav-bar-title-before` / `nav-bar-title-after`
- `sidebar-nav-before` / `sidebar-nav-after`
- `doc-before` / `doc-after`
- `home-hero-before` / `home-hero-after`
- `home-features-before` / `home-features-after`

## Example: Word Count Plugin

```ts
import type { LDocPlugin } from '@ldesign/doc'

export function wordCountPlugin(): LDocPlugin {
  return {
    name: 'word-count',
    
    extendPageData(pageData) {
      const content = pageData.content || ''
      const words = content.trim().split(/\s+/).length
      pageData.wordCount = words
    }
  }
}
```

## Example: Analytics Plugin

```ts
export function analyticsPlugin(options: { id: string }): LDocPlugin {
  return {
    name: 'analytics',
    
    headScripts: [
      `https://analytics.example.com/script.js?id=${options.id}`
    ],
    
    onClientMounted() {
      // Initialize analytics
    },
    
    onAfterRouteChange(to) {
      // Track page view
      window.analytics?.track(to.path)
    }
  }
}
```

## Publishing

1. Create a package with your plugin
2. Export the plugin function
3. Publish to npm
4. Users install and use:

```ts
import { myPlugin } from 'ldoc-plugin-my-plugin'

export default defineConfig({
  plugins: [myPlugin()]
})
```
