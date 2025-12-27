# VPSubpageTOC Component

The `VPSubpageTOC` component automatically detects and displays a mini table of contents for subpages (direct child pages) of the current page.

## Features

- **Automatic Detection**: Detects subpages based on sidebar configuration
- **Direct Children Only**: Only shows immediate child pages, not grandchildren
- **Customizable Title**: Configure the title text via props or frontmatter
- **Descriptions**: Displays page descriptions when available
- **Responsive Design**: Optimized for all screen sizes
- **Conditional Display**: Can be disabled via frontmatter

## Usage

### Automatic Integration

The component is automatically integrated into the `VPDoc` component and will display when:
1. The current page has child pages in the sidebar configuration
2. The `subpageTOC` frontmatter option is not set to `false`

### Frontmatter Configuration

```yaml
---
# Disable subpage TOC for this page
subpageTOC: false
---
```

```yaml
---
# Customize the title
subpageTOCTitle: "Related Pages"
---
```

### Manual Usage

You can also use the component manually in your custom layouts:

```vue
<template>
  <VPSubpageTOC title="Child Pages" />
</template>

<script setup>
import VPSubpageTOC from './VPSubpageTOC.vue'
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'子页面'` (or `'Subpages'` in English) | The title displayed above the subpage list |

## How It Works

The component:

1. **Reads the sidebar configuration** from the theme config
2. **Normalizes the current page path** to handle trailing slashes
3. **Finds matching sidebar items** based on the current path
4. **Extracts direct children** (pages that are exactly one level deeper)
5. **Displays the list** with links and descriptions

### Path Detection Logic

The component uses a smart path detection algorithm:

- **Root path (`/`)**: Shows all top-level pages (e.g., `/guide`, `/api`)
- **Nested paths**: Shows only direct children (e.g., for `/guide`, shows `/guide/intro` but not `/guide/intro/advanced`)
- **Path normalization**: Handles trailing slashes and empty segments
- **Case-sensitive**: Paths are matched case-sensitively

## Example

Given this sidebar configuration:

```ts
sidebar: {
  '/guide/': [
    {
      text: 'Getting Started',
      link: '/guide/',
      items: [
        { text: 'Introduction', link: '/guide/intro' },
        { text: 'Installation', link: '/guide/installation', description: 'How to install the library' },
        { text: 'Configuration', link: '/guide/config' }
      ]
    }
  ]
}
```

When viewing `/guide/`, the SubpageTOC will display:

```
子页面
├─ Introduction
├─ Installation
│  └─ How to install the library
└─ Configuration
```

## Styling

The component uses CSS custom properties for theming:

- `--ldoc-c-bg-soft`: Background color of the TOC container
- `--ldoc-c-divider`: Border color
- `--ldoc-c-text-1`: Title text color
- `--ldoc-c-brand`: Link color
- `--ldoc-c-text-2`: Description text color
- `--ldoc-c-bg`: Individual item background
- `--ldoc-c-bg-elv`: Hover background

## Accessibility

- Uses semantic HTML (`<nav>`, `<ul>`, `<li>`)
- Proper heading hierarchy
- Keyboard navigable links
- Screen reader friendly

## Property-Based Testing

The component is validated with property-based tests that verify:

- **Property 34**: For any page with child pages, the component SHALL display a mini table of contents listing the subpages
- Direct children detection works correctly
- Path normalization handles edge cases
- Descriptions are preserved when present
- Nested sidebar structures are handled properly

See `VPSubpageTOC.test.ts` for the complete test suite.
