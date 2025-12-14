# API Reference

Welcome to the LDoc API reference. This section provides detailed documentation for all available APIs.

## Configuration APIs

- [Site Config](/en/api/site-config) - Global site configuration options
- [Theme Config](/en/api/theme-config) - Theme customization options
- [Frontmatter](/en/api/frontmatter) - Page-level configuration

## Client APIs

- [Composables](/en/api/composables) - Vue composition functions
- [Components](/en/api/components) - Built-in Vue components

## Plugin APIs

- [Plugin API](/en/api/plugin) - Create custom plugins

## Quick Reference

### defineConfig

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  description: 'Documentation site',
  // ... more options
})
```

### useData

```ts
import { useData } from '@ldesign/doc/client'

const { page, site, theme, frontmatter } = useData()
```

### useRoute

```ts
import { useRoute } from '@ldesign/doc/client'

const route = useRoute()
console.log(route.path)
```
