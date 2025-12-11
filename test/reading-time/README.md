# ldoc-plugin-reading-time

LDoc plugin - reading-time

## Installation

```bash
pnpm add ldoc-plugin-reading-time
```

## Usage

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import readingTimePlugin from 'ldoc-plugin-reading-time'

export default defineConfig({
  plugins: [
    readingTimePlugin({
      enabled: true
    })
  ]
})
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable the plugin |

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build
```

## License

MIT
