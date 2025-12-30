# ComparisonTable Component

A Vue component for creating feature comparison matrices in documentation.

## Overview

The ComparisonTable component provides a clean, responsive way to compare features across multiple items (products, frameworks, versions, etc.). It supports various value types including booleans, text, numbers, and styled values.

## Features

- 📊 **Feature Matrix Display** - Compare multiple items side-by-side
- 🎨 **Multiple Value Types** - Boolean (✓/✗), text, numbers, styled values
- 📱 **Responsive Design** - Horizontal scrolling on mobile devices
- 📌 **Sticky Column** - First column stays visible while scrolling
- 🏷️ **Badges & Icons** - Add visual indicators to items
- 💡 **Tooltips** - Feature descriptions on hover
- 🌓 **Dark Mode** - Full support through CSS variables
- ♿ **Accessible** - Semantic HTML table structure

## Usage

```vue
<script setup>
import ComparisonTable from '@ldesign/doc/theme-default/components/ComparisonTable.vue'

const items = [
  { 
    name: 'Option A', 
    icon: '🅰️',
    badge: { text: 'Popular', type: 'success' }
  },
  { 
    name: 'Option B', 
    icon: '🅱️'
  }
]

const features = [
  {
    name: 'Feature 1',
    description: 'Description of feature 1',
    values: [true, false]
  },
  {
    name: 'Feature 2',
    values: ['Value A', 'Value B']
  },
  {
    name: 'Feature 3',
    values: [
      { text: 'Good', type: 'success' },
      { text: 'Poor', type: 'danger' }
    ]
  }
]
</script>

<template>
  <ComparisonTable 
    :items="items" 
    :features="features"
    feature-column-label="Features"
  />
</template>
```

## Props

### Main Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `items` | `ComparisonItem[]` | Yes | - | List of items to compare |
| `features` | `ComparisonFeature[]` | Yes | - | List of features to compare |
| `featureColumnLabel` | `string` | No | `"Feature"` | Label for the feature column header |

### ComparisonItem Interface

```typescript
interface ComparisonItem {
  /** Item name */
  name: string
  /** Item icon (HTML or emoji) */
  icon?: string
  /** Badge configuration */
  badge?: {
    text: string
    type?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  }
}
```

### ComparisonFeature Interface

```typescript
interface ComparisonFeature {
  /** Feature name */
  name: string
  /** Feature description (shown on hover) */
  description?: string
  /** Values for each item */
  values: ComparisonValue[]
}
```

### ComparisonValue Type

```typescript
type ComparisonValue = 
  | boolean                    // Renders as ✓ or ✗
  | string                     // Plain text
  | number                     // Numeric value
  | {                          // Styled text
      text: string
      type?: 'success' | 'warning' | 'danger' | 'info'
    }
  | null                       // Renders as —
  | undefined                  // Renders as —
```

## Value Types

### Boolean Values

```typescript
values: [true, false, true]
```

Renders as:
- `true` → Green ✓
- `false` → Gray ✗

### Text Values

```typescript
values: ['Small', 'Medium', 'Large']
values: [100, 200, 300]
```

Renders as plain text.

### Styled Values

```typescript
values: [
  { text: 'Excellent', type: 'success' },
  { text: 'Good', type: 'info' },
  { text: 'Poor', type: 'danger' }
]
```

Applies color styling based on type.

### Empty Values

```typescript
values: [null, undefined, 'Available']
```

`null` and `undefined` render as "—".

## Examples

### Framework Comparison

```vue
<ComparisonTable 
  :items="[
    { name: 'Vue 3', icon: '🟢', badge: { text: 'Popular', type: 'success' } },
    { name: 'React', icon: '⚛️', badge: { text: 'Popular', type: 'success' } },
    { name: 'Angular', icon: '🅰️' }
  ]"
  :features="[
    { name: 'TypeScript', values: [true, true, true] },
    { name: 'Bundle Size', values: ['34 KB', '42 KB', '167 KB'] },
    { name: 'Learning Curve', values: [
      { text: 'Easy', type: 'success' },
      { text: 'Moderate', type: 'warning' },
      { text: 'Steep', type: 'danger' }
    ]}
  ]"
/>
```

### Pricing Table

```vue
<ComparisonTable 
  :items="[
    { name: 'Free', badge: { text: 'Starter', type: 'info' } },
    { name: 'Pro', badge: { text: 'Popular', type: 'success' } },
    { name: 'Enterprise', badge: { text: 'Custom', type: 'warning' } }
  ]"
  :features="[
    { name: 'Price', values: ['$0/mo', '$29/mo', 'Contact us'] },
    { name: 'Users', values: [1, 10, 'Unlimited'] },
    { name: 'API Access', values: [false, true, true] },
    { name: 'Support', values: [
      { text: 'Community', type: 'info' },
      { text: 'Email', type: 'success' },
      { text: '24/7', type: 'success' }
    ]}
  ]"
  feature-column-label="Plan Features"
/>
```

## Styling

The component uses CSS variables for theming:

```css
--ldoc-c-bg              /* Background color */
--ldoc-c-bg-soft         /* Soft background (headers, hover) */
--ldoc-c-text-1          /* Primary text */
--ldoc-c-text-2          /* Secondary text */
--ldoc-c-text-3          /* Tertiary text */
--ldoc-c-divider         /* Border color */
--ldoc-c-divider-light   /* Light border color */
--ldoc-c-success         /* Success color */
--ldoc-c-warning         /* Warning color */
--ldoc-c-danger          /* Danger color */
--ldoc-c-info            /* Info color */
```

## Accessibility

- Uses semantic `<table>` structure
- Proper `<thead>` and `<tbody>` elements
- Sticky positioning for better navigation
- Tooltip descriptions for features
- High contrast colors for readability

## Responsive Behavior

- **Desktop**: Full table with all columns visible
- **Tablet/Mobile**: Horizontal scrolling with sticky first column
- Font sizes and padding adjust for smaller screens
- Touch-friendly spacing

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- CSS Variables
- Sticky positioning
- ES6+ JavaScript

## Related Components

- `Timeline.vue` - For chronological event display
- `VPBadge.vue` - For standalone badges
- `VPTag.vue` - For tagging content

## Validates

- **Requirements**: 9.2 - Support comparison tables with feature matrices
- **Property**: 36 - Comparison table rendering
