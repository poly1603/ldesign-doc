# Search Plugin

Full-text search functionality for your documentation.

## Installation

The search plugin is included with LDoc.

```ts
import { searchPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin({
      // options
    })
  ]
})
```

## Options

### hotkeys

- Type: `string[]`
- Default: `['/', 'Ctrl+K', 'Meta+K']`

Keyboard shortcuts to open search.

```ts
searchPlugin({
  hotkeys: ['/', 'Ctrl+K']
})
```

### placeholder

- Type: `string`
- Default: `'Search...'`

Search input placeholder text.

```ts
searchPlugin({
  placeholder: 'Search documentation...'
})
```

### maxResults

- Type: `number`
- Default: `10`

Maximum number of search results to display.

```ts
searchPlugin({
  maxResults: 20
})
```

## Usage

### Keyboard Shortcuts

- Press `/` or `Ctrl+K` to open search
- Type to search
- Use `↑` `↓` to navigate results
- Press `Enter` to go to selected result
- Press `Esc` to close

### Search Button

Click the search button in the navigation bar to open search.

## Features

- **Instant results** - Results appear as you type
- **Fuzzy matching** - Finds results even with typos
- **Highlighted matches** - Search terms are highlighted
- **Keyboard navigation** - Full keyboard support
- **Mobile friendly** - Works on all devices

## Customization

### Styling

Override CSS variables to customize appearance:

```css
:root {
  --ldoc-search-bg: #ffffff;
  --ldoc-search-border: #e2e2e3;
  --ldoc-search-highlight: #3b82f6;
}
```

### Exclude Pages

Exclude specific pages from search by adding frontmatter:

```yaml
---
search: false
---
```
