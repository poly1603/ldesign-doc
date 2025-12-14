# Progress Plugin

Display a reading progress bar as users scroll through documentation.

## Installation

```ts
import { progressPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    progressPlugin({
      // options
    })
  ]
})
```

## Options

### color

- Type: `string`
- Default: `'var(--ldoc-c-brand)'`

Progress bar color.

```ts
progressPlugin({
  color: '#3b82f6'
})
```

### height

- Type: `number`
- Default: `3`

Progress bar height in pixels.

```ts
progressPlugin({
  height: 4
})
```

### position

- Type: `'top' | 'bottom'`
- Default: `'top'`

Position of the progress bar.

```ts
progressPlugin({
  position: 'top'
})
```

### showPercentage

- Type: `boolean`
- Default: `false`

Show percentage text.

```ts
progressPlugin({
  showPercentage: true
})
```

### exclude

- Type: `string[]`
- Default: `[]`

Pages to exclude from showing progress bar.

```ts
progressPlugin({
  exclude: ['/', '/about']
})
```

## Example Configuration

```ts
progressPlugin({
  color: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
  height: 3,
  position: 'top',
  showPercentage: false,
  exclude: ['/']
})
```

## Styling

Override CSS variables:

```css
:root {
  --ldoc-progress-bg: transparent;
  --ldoc-progress-z-index: 100;
}
```

## Features

- **Smooth animation** - Progress updates smoothly
- **Theme aware** - Respects dark/light mode
- **Gradient support** - Use gradient colors
- **Configurable** - Full control over appearance
