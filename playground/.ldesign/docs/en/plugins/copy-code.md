# Copy Code Plugin

Add a copy button to code blocks for easy code copying.

## Installation

```ts
import { copyCodePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    copyCodePlugin({
      // options
    })
  ]
})
```

## Options

### showLanguage

- Type: `boolean`
- Default: `true`

Show the code language label.

```ts
copyCodePlugin({
  showLanguage: true
})
```

### successText

- Type: `string`
- Default: `'Copied!'`

Text shown after successful copy.

```ts
copyCodePlugin({
  successText: 'Copied to clipboard!'
})
```

### failText

- Type: `string`
- Default: `'Copy failed'`

Text shown when copy fails.

```ts
copyCodePlugin({
  failText: 'Failed to copy'
})
```

### duration

- Type: `number`
- Default: `2000`

Duration to show success/fail message (ms).

```ts
copyCodePlugin({
  duration: 3000
})
```

## Example

```ts
copyCodePlugin({
  showLanguage: true,
  successText: '✓ Copied!',
  failText: '✗ Failed',
  duration: 2000
})
```

## Features

- **One-click copy** - Copy code with a single click
- **Visual feedback** - Shows success/failure status
- **Language label** - Displays code language
- **Keyboard accessible** - Works with keyboard navigation

## Styling

Customize the copy button appearance:

```css
.vp-code-copy {
  /* Button styles */
}

.vp-code-copy:hover {
  /* Hover styles */
}

.vp-code-lang {
  /* Language label styles */
}
```

## Usage

The copy button automatically appears on all code blocks:

```js
// This code block has a copy button
const greeting = 'Hello, World!'
console.log(greeting)
```

Hover over the code block to see the copy button in the top-right corner.
