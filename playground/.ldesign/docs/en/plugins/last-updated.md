# Last Updated Plugin

Display the last update time for documentation pages.

## Installation

```ts
import { lastUpdatedPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    lastUpdatedPlugin({
      // options
    })
  ]
})
```

## Options

### useGitTime

- Type: `boolean`
- Default: `true`

Use Git commit time instead of file modification time.

```ts
lastUpdatedPlugin({
  useGitTime: true
})
```

### text

- Type: `string`
- Default: `'Last updated'`

Label text.

```ts
lastUpdatedPlugin({
  text: 'Last modified'
})
```

### formatOptions

- Type: `Intl.DateTimeFormatOptions`
- Default: `{ dateStyle: 'medium' }`

Date formatting options.

```ts
lastUpdatedPlugin({
  formatOptions: {
    dateStyle: 'full',
    timeStyle: 'short'
  }
})
```

## Example Configuration

```ts
lastUpdatedPlugin({
  useGitTime: true,
  text: 'Last updated',
  formatOptions: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
})
```

## Display

The last updated time appears at the bottom of documentation pages, typically near the footer or edit link.

## Git Integration

When `useGitTime` is enabled:
- Uses the last Git commit time for each file
- Requires the page to be in a Git repository
- Falls back to file modification time if not available

## Disable per Page

Disable last updated display on specific pages:

```yaml
---
lastUpdated: false
---
```

## Custom Date

Override with a specific date:

```yaml
---
lastUpdated: 2024-01-15
---
```

## Access in Components

```vue
<script setup>
import { usePageData } from '@ldesign/doc/client'

const page = usePageData()
const lastUpdated = page.value.lastUpdated
</script>
```

## Features

- **Git integration** - Uses commit history
- **Localized format** - Respects locale settings
- **Configurable** - Custom format and text
- **Per-page control** - Override or disable
