# Demo Plugin

Create interactive component demos with live preview and source code.

## Installation

```ts
import { demoPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    demoPlugin({
      // options
    })
  ]
})
```

## Options

### defaultTitle

- Type: `string`
- Default: `'Demo'`

Default title for demo blocks.

```ts
demoPlugin({
  defaultTitle: 'Example'
})
```

### defaultExpanded

- Type: `boolean`
- Default: `false`

Whether code is expanded by default.

```ts
demoPlugin({
  defaultExpanded: true
})
```

## Usage

### Basic Demo

````md
::: demo Basic Button
```vue
<template>
  <button>Click me</button>
</template>
```
:::
````

### With Setup Script

````md
::: demo Counter
```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```
:::
````

### With Styles

````md
::: demo Styled Component
```vue
<template>
  <div class="custom-box">Hello</div>
</template>

<style scoped>
.custom-box {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
}
</style>
```
:::
````

## Features

- **Live preview** - See component in action
- **Source code** - View and copy code
- **Collapsible** - Expand/collapse code view
- **Syntax highlighting** - Colored code display
- **Copy button** - Quick code copying

## Demo Block Structure

```
┌─────────────────────────┐
│      Live Preview       │
├─────────────────────────┤
│  [Show Code] [Copy]     │
├─────────────────────────┤
│                         │
│     Source Code         │
│     (collapsible)       │
│                         │
└─────────────────────────┘
```

## Styling

Customize demo block appearance:

```css
.demo-block {
  /* Container styles */
}

.demo-preview {
  /* Preview area styles */
}

.demo-code {
  /* Code area styles */
}
```

## Best Practices

1. Keep demos simple and focused
2. Include meaningful titles
3. Add comments to explain code
4. Test demos in both light and dark modes
