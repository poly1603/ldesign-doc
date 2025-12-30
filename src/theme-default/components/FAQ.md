# FAQ Component

The FAQ component provides collapsible question-and-answer sections with built-in search functionality.

## Features

- **Collapsible Sections**: Click to expand/collapse individual FAQ items
- **Search Functionality**: Search across questions, answers, and tags
- **Highlight Matches**: Search terms are highlighted in results
- **Expand/Collapse All**: Toggle all items at once with a single button
- **Auto-expand on Search**: Automatically expands matching items when searching
- **Rich Content Support**: Answers support HTML (lists, code blocks, links, etc.)
- **Tags**: Categorize questions with tags for better organization and search
- **Responsive Design**: Optimized for mobile and desktop
- **Smooth Animations**: Polished expand/collapse transitions
- **Accessible**: Keyboard navigation support

## Usage

```vue
<script setup>
import FAQ from '@ldesign/doc/theme-default/components/FAQ.vue'

const faqItems = [
  {
    question: 'What is @ldesign/doc?',
    answer: '<p>A modern documentation framework built on Vite.</p>',
    tags: ['general', 'introduction']
  },
  {
    question: 'How do I install it?',
    answer: '<p>Use npm, yarn, or pnpm:</p><pre><code>npm install @ldesign/doc</code></pre>',
    tags: ['installation', 'getting-started']
  }
]
</script>

<FAQ :items="faqItems" />
```

## Props

### items
- **Type**: `FAQItem[]`
- **Required**: Yes
- **Description**: Array of FAQ items to display

### searchable
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable/disable search functionality

### searchPlaceholder
- **Type**: `string`
- **Default**: `'Search FAQ...'`
- **Description**: Placeholder text for the search input

### defaultExpanded
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Expand all items by default

### defaultExpandedItems
- **Type**: `number[]`
- **Default**: `[]`
- **Description**: Array of item indices to expand by default

## FAQItem Interface

```typescript
interface FAQItem {
  /** Question text */
  question: string
  
  /** Answer content (supports HTML) */
  answer: string
  
  /** Optional tags for categorization and search */
  tags?: string[]
}
```

## Examples

### Basic FAQ

```vue
<FAQ :items="basicItems" />
```

### FAQ with Search Disabled

```vue
<FAQ :items="items" :searchable="false" />
```

### FAQ with Custom Search Placeholder

```vue
<FAQ 
  :items="items" 
  searchPlaceholder="Type to search questions..."
/>
```

### FAQ with Default Expanded Items

```vue
<FAQ 
  :items="items" 
  :defaultExpandedItems="[0, 2, 4]"
/>
```

### FAQ with All Items Expanded

```vue
<FAQ 
  :items="items" 
  :defaultExpanded="true"
/>
```

## Search Behavior

The search functionality searches across:
1. **Question text**: Matches in the question
2. **Answer content**: Matches in the answer (HTML tags are stripped for search)
3. **Tags**: Matches in the tags array

When a search query is entered:
- Matching items are automatically expanded
- Search terms are highlighted in yellow
- A results count is displayed
- Non-matching items are hidden

## Styling

The component uses CSS variables for theming:

```css
--ldoc-c-brand          /* Brand color for highlights and active states */
--ldoc-c-bg             /* Background color */
--ldoc-c-bg-soft        /* Soft background for hover states */
--ldoc-c-text-1         /* Primary text color */
--ldoc-c-text-2         /* Secondary text color */
--ldoc-c-text-3         /* Tertiary text color */
--ldoc-c-divider        /* Border color */
--ldoc-c-warning-soft   /* Highlight background color */
```

## Accessibility

- Keyboard navigation: Use Tab to navigate between items, Enter/Space to toggle
- Screen reader friendly: Proper ARIA labels and semantic HTML
- Focus indicators: Clear visual feedback for keyboard navigation
- Color contrast: Meets WCAG AA standards

## Best Practices

1. **Keep questions concise**: Short, clear questions are easier to scan
2. **Use HTML for rich answers**: Format answers with lists, code blocks, and links
3. **Add relevant tags**: Tags improve search and organization
4. **Group related questions**: Order items logically by topic
5. **Provide search hints**: Use descriptive search placeholders
6. **Test on mobile**: Ensure touch targets are large enough

## Related Components

- [Timeline](./Timeline.vue) - Display chronological events
- [ComparisonTable](./ComparisonTable.vue) - Compare features across items
- [VideoPlayer](./VideoPlayer.vue) - Embed videos with chapters

## Requirements

Validates: **Requirements 9.6** - Support collapsible FAQ sections with search
