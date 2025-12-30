# Component Playground Plugin

`componentPlaygroundPlugin` provides an interactive playground container for Vue 3 components inside Markdown.

## Installation

```ts
import { componentPlaygroundPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    componentPlaygroundPlugin()
  ]
})
```

## Usage

Use the `::: playground` container.

```md
::: playground
<LDocAuthButton />
:::
```

## Features

- **Interactive props** - Adjust props with controls.
- **Event viewer** - Inspect emitted events.
- **Slot preview** - Render default and named slots.

## Notes

This plugin is meant for Vue component demos. For generic demo blocks (Vue/React code + preview), use `demoPlugin`.
