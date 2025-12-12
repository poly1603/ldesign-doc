# ldoc-plugin-word-count

显示文章字数统计

## Installation

```bash
pnpm add ldoc-plugin-word-count
```

## Usage

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import wordCountPlugin from 'ldoc-plugin-word-count'

export default defineConfig({
  plugins: [
    wordCountPlugin({
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

详细开发指南请查看 [DEVELOPMENT.md](./DEVELOPMENT.md)。

## License

MIT
