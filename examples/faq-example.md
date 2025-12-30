# FAQ Component Example

This example demonstrates the FAQ component with collapsible sections and search functionality.

## Basic Usage

<script setup>
import FAQ from '../src/theme-default/components/FAQ.vue'

const basicFAQItems = [
  {
    question: 'What is @ldesign/doc?',
    answer: '<p>@ldesign/doc is a modern documentation framework built on Vite. It provides a fast, flexible, and feature-rich platform for creating beautiful documentation sites.</p>'
  },
  {
    question: 'How do I install @ldesign/doc?',
    answer: '<p>You can install @ldesign/doc using npm, yarn, or pnpm:</p><pre><code>npm install @ldesign/doc\nyarn add @ldesign/doc\npnpm add @ldesign/doc</code></pre>'
  },
  {
    question: 'Does it support TypeScript?',
    answer: '<p>Yes! @ldesign/doc has full TypeScript support with complete type definitions for all APIs.</p>'
  },
  {
    question: 'Can I customize the theme?',
    answer: '<p>Absolutely! The theme system is highly customizable. You can:</p><ul><li>Override CSS variables</li><li>Create custom components</li><li>Extend the default theme</li><li>Build a completely custom theme</li></ul>'
  }
]

const advancedFAQItems = [
  {
    question: 'How do I add custom plugins?',
    answer: '<p>You can add custom plugins in your config file:</p><pre><code>export default {\n  plugins: [\n    myCustomPlugin({\n      // options\n    })\n  ]\n}</code></pre><p>See the <a href="/guide/plugins">plugin documentation</a> for more details.</p>',
    tags: ['plugins', 'configuration', 'advanced']
  },
  {
    question: 'What is the plugin lifecycle?',
    answer: '<p>Plugins go through several lifecycle phases:</p><ol><li><strong>Init</strong> - Plugin initialization</li><li><strong>Config</strong> - Configuration phase</li><li><strong>Build</strong> - Build-time hooks</li><li><strong>Runtime</strong> - Client-side runtime</li></ol>',
    tags: ['plugins', 'lifecycle', 'advanced']
  },
  {
    question: 'How do I optimize performance?',
    answer: '<p>Here are some performance optimization tips:</p><ul><li>Enable code splitting</li><li>Use lazy loading for images</li><li>Minimize bundle size</li><li>Enable PWA caching</li><li>Use CDN for assets</li></ul><p>Check out the <a href="/guide/performance">performance guide</a> for detailed strategies.</p>',
    tags: ['performance', 'optimization', 'advanced']
  },
  {
    question: 'Can I use it with Vue 3?',
    answer: '<p>Yes! @ldesign/doc is built on Vue 3 and takes full advantage of the Composition API, Teleport, Suspense, and other Vue 3 features.</p>',
    tags: ['vue', 'framework', 'compatibility']
  },
  {
    question: 'Is server-side rendering supported?',
    answer: '<p>Yes, @ldesign/doc supports SSG (Static Site Generation) out of the box. All pages are pre-rendered at build time for optimal performance and SEO.</p>',
    tags: ['ssr', 'ssg', 'performance']
  }
]
</script>

## Basic FAQ

<FAQ :items="basicFAQItems" />

## FAQ with Search

This example includes search functionality and tags:

<FAQ 
  :items="advancedFAQItems" 
  :searchable="true"
  searchPlaceholder="Search questions..."
/>

## FAQ with Default Expanded Items

<FAQ 
  :items="basicFAQItems" 
  :defaultExpandedItems="[0, 1]"
/>

## FAQ with All Items Expanded

<FAQ 
  :items="basicFAQItems" 
  :defaultExpanded="true"
/>

## FAQ without Search

<FAQ 
  :items="basicFAQItems" 
  :searchable="false"
/>

## Features

The FAQ component supports:

- ✅ **Collapsible sections** - Click to expand/collapse individual items
- ✅ **Search functionality** - Search across questions, answers, and tags
- ✅ **Highlight matches** - Search terms are highlighted in results
- ✅ **Expand/Collapse all** - Toggle all items at once
- ✅ **Auto-expand on search** - Automatically expands matching items
- ✅ **Rich content** - Supports HTML in answers (lists, code, links, etc.)
- ✅ **Tags** - Categorize questions with tags for better search
- ✅ **Responsive design** - Works great on mobile devices
- ✅ **Smooth animations** - Polished expand/collapse transitions
- ✅ **Accessible** - Keyboard navigation and screen reader friendly

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FAQItem[]` | required | Array of FAQ items |
| `searchable` | `boolean` | `true` | Enable/disable search functionality |
| `searchPlaceholder` | `string` | `'Search FAQ...'` | Placeholder text for search input |
| `defaultExpanded` | `boolean` | `false` | Expand all items by default |
| `defaultExpandedItems` | `number[]` | `[]` | Array of item indices to expand by default |

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

## Usage in Markdown

```vue
<script setup>
import FAQ from '@ldesign/doc/theme-default/components/FAQ.vue'

const faqItems = [
  {
    question: 'Your question here?',
    answer: '<p>Your answer here</p>',
    tags: ['category1', 'category2']
  }
]
</script>

<FAQ :items="faqItems" />
```

## Styling

The FAQ component uses CSS variables for theming:

- `--ldoc-c-brand` - Brand color for highlights
- `--ldoc-c-bg` - Background color
- `--ldoc-c-text-1` - Primary text color
- `--ldoc-c-text-2` - Secondary text color
- `--ldoc-c-divider` - Border color

You can override these in your custom theme.
