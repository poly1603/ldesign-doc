# Reading Time Plugin

Display estimated reading time for documentation pages.

## Installation

```ts
import { readingTimePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    readingTimePlugin({
      // options
    })
  ]
})
```

## Options

### wordsPerMinute

- Type: `number`
- Default: `200`

Average reading speed.

```ts
readingTimePlugin({
  wordsPerMinute: 250
})
```

### include

- Type: `string[]`
- Default: `['**/*.md']`

Pages to include.

```ts
readingTimePlugin({
  include: ['/guide/**', '/api/**']
})
```

### exclude

- Type: `string[]`
- Default: `[]`

Pages to exclude.

```ts
readingTimePlugin({
  exclude: ['/', '/about']
})
```

### template

- Type: `string`
- Default: `'{time} min read'`

Display template.

```ts
readingTimePlugin({
  template: 'About {time} minutes'
})
```

## Example Configuration

```ts
readingTimePlugin({
  wordsPerMinute: 200,
  exclude: ['/'],
  template: '{time} min read'
})
```

## Display Location

Reading time is displayed:
- In the page header area
- Near the title or metadata section

## Features

- **Accurate estimates** - Based on word count
- **Code handling** - Adjusts for code blocks
- **Configurable speed** - Set reading speed
- **Localization** - Customize display text

## Access in Components

Access reading time data in Vue components:

```vue
<script setup>
import { usePageData } from '@ldesign/doc/client'

const page = usePageData()
const readingTime = page.value.readingTime
</script>

<template>
  <span>{{ readingTime }} min read</span>
</template>
```

## Frontmatter Override

Override reading time per page:

```yaml
---
readingTime: 5
---
```

Or disable:

```yaml
---
readingTime: false
---
```
