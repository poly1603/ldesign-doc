# Composables

Vue composition functions for accessing site and page data.

## useData

Returns reactive data about the current page and site.

```ts
import { useData } from '@ldesign/doc/client'

const { 
  page,        // Current page data
  site,        // Site configuration
  theme,       // Theme configuration
  frontmatter, // Page frontmatter
  title,       // Page title
  description, // Page description
  headers,     // Page headers (TOC)
  lang,        // Current language
  isDark       // Dark mode state
} = useData()
```

### Example

```vue
<script setup>
import { useData } from '@ldesign/doc/client'

const { frontmatter, isDark } = useData()
</script>

<template>
  <div :class="{ dark: isDark }">
    <h1>{{ frontmatter.title }}</h1>
  </div>
</template>
```

## useRoute

Returns the current route object.

```ts
import { useRoute } from '@ldesign/doc/client'

const route = useRoute()

// Properties
route.path      // Current path
route.hash      // URL hash
route.query     // Query parameters
route.params    // Route params
```

## useRouter

Returns the router instance.

```ts
import { useRouter } from '@ldesign/doc/client'

const router = useRouter()

// Navigate programmatically
router.push('/guide/')
router.replace('/api/')
router.back()
router.forward()
```

## useSiteData

Returns reactive site data.

```ts
import { useSiteData } from '@ldesign/doc/client'

const site = useSiteData()
console.log(site.value.title)
```

## usePageData

Returns reactive page data.

```ts
import { usePageData } from '@ldesign/doc/client'

const page = usePageData()
console.log(page.value.frontmatter)
```

## useDark

Dark mode toggle functionality.

```ts
import { useDark } from '@ldesign/doc/client'

const { isDark, toggle } = useDark()

// Toggle dark mode
toggle()
```

## useSidebar

Sidebar state management.

```ts
import { useSidebar } from '@ldesign/doc/client'

const { isOpen, open, close, toggle } = useSidebar()
```

## useThemeColor

Theme color management.

```ts
import { useThemeColor } from '@ldesign/doc/client'

const { colors, currentColor, setColor } = useThemeColor()

// Change theme color
setColor('purple')
```
