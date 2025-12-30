# ComparisonTable Component Example

## Basic Usage

The ComparisonTable component allows you to create feature comparison matrices for documentation.

### Example 1: Framework Comparison

```vue
<script setup>
import ComparisonTable from '@ldesign/doc/theme-default/components/ComparisonTable.vue'

const items = [
  { 
    name: 'Vue 3', 
    icon: '🟢',
    badge: { text: 'Popular', type: 'success' }
  },
  { 
    name: 'React', 
    icon: '⚛️',
    badge: { text: 'Popular', type: 'success' }
  },
  { 
    name: 'Angular', 
    icon: '🅰️',
    badge: { text: 'Enterprise', type: 'info' }
  }
]

const features = [
  {
    name: 'TypeScript Support',
    description: 'Native TypeScript support out of the box',
    values: [true, true, true]
  },
  {
    name: 'Bundle Size (min+gzip)',
    values: ['34 KB', '42 KB', '167 KB']
  },
  {
    name: 'Learning Curve',
    values: [
      { text: 'Easy', type: 'success' },
      { text: 'Moderate', type: 'warning' },
      { text: 'Steep', type: 'danger' }
    ]
  },
  {
    name: 'Virtual DOM',
    values: [true, true, false]
  },
  {
    name: 'SSR Support',
    values: [true, true, true]
  },
  {
    name: 'Mobile Support',
    description: 'Native mobile development support',
    values: [false, true, false]
  }
]
</script>

<template>
  <ComparisonTable 
    :items="items" 
    :features="features"
    feature-column-label="Feature"
  />
</template>
```

### Example 2: Pricing Plans

```vue
<script setup>
import ComparisonTable from '@ldesign/doc/theme-default/components/ComparisonTable.vue'

const items = [
  { 
    name: 'Free', 
    icon: '🆓',
    badge: { text: 'Starter', type: 'info' }
  },
  { 
    name: 'Pro', 
    icon: '⭐',
    badge: { text: 'Popular', type: 'success' }
  },
  { 
    name: 'Enterprise', 
    icon: '🏢',
    badge: { text: 'Custom', type: 'warning' }
  }
]

const features = [
  {
    name: 'Price',
    values: ['$0/month', '$29/month', 'Contact us']
  },
  {
    name: 'Users',
    values: ['1', '10', 'Unlimited']
  },
  {
    name: 'Storage',
    values: ['1 GB', '100 GB', 'Unlimited']
  },
  {
    name: 'API Access',
    values: [false, true, true]
  },
  {
    name: 'Priority Support',
    values: [false, true, true]
  },
  {
    name: 'Custom Domain',
    values: [false, true, true]
  },
  {
    name: 'SLA',
    values: [null, '99.9%', '99.99%']
  }
]
</script>

<template>
  <ComparisonTable 
    :items="items" 
    :features="features"
    feature-column-label="Plan Features"
  />
</template>
```

### Example 3: API Versions

```vue
<script setup>
import ComparisonTable from '@ldesign/doc/theme-default/components/ComparisonTable.vue'

const items = [
  { 
    name: 'v1.0', 
    badge: { text: 'Deprecated', type: 'danger' }
  },
  { 
    name: 'v2.0', 
    badge: { text: 'Stable', type: 'success' }
  },
  { 
    name: 'v3.0', 
    badge: { text: 'Beta', type: 'warning' }
  }
]

const features = [
  {
    name: 'REST API',
    values: [true, true, true]
  },
  {
    name: 'GraphQL',
    values: [false, true, true]
  },
  {
    name: 'WebSocket',
    values: [false, false, true]
  },
  {
    name: 'Rate Limit',
    values: ['100/hour', '1000/hour', '10000/hour']
  },
  {
    name: 'Authentication',
    values: ['API Key', 'OAuth 2.0', 'OAuth 2.0 + JWT']
  },
  {
    name: 'Webhooks',
    values: [false, true, true]
  }
]
</script>

<template>
  <ComparisonTable 
    :items="items" 
    :features="features"
    feature-column-label="API Feature"
  />
</template>
```

## Props

### ComparisonItem

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Item name (required) |
| `icon` | `string` | Icon HTML or emoji (optional) |
| `badge` | `object` | Badge configuration (optional) |
| `badge.text` | `string` | Badge text |
| `badge.type` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | Badge style type |

### ComparisonFeature

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Feature name (required) |
| `description` | `string` | Feature description shown on hover (optional) |
| `values` | `ComparisonValue[]` | Array of values for each item (required) |

### ComparisonValue

Can be one of:
- `boolean` - Renders as ✓ or ✗
- `string` - Plain text
- `number` - Numeric value
- `{ text: string, type?: 'success' | 'warning' | 'danger' | 'info' }` - Styled text
- `null` or `undefined` - Renders as —

## Features

- ✅ Responsive design with horizontal scrolling
- ✅ Sticky first column for easy feature reference
- ✅ Support for icons and badges
- ✅ Multiple value types (boolean, text, styled text)
- ✅ Hover effects for better readability
- ✅ Feature descriptions with tooltips
- ✅ Customizable feature column label
- ✅ Dark mode support through CSS variables
