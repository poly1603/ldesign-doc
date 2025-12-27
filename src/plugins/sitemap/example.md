# Sitemap Plugin Example

This example demonstrates how to use the sitemap plugin in your documentation.

## Basic Setup

```typescript
// doc.config.ts
import { defineConfig } from '@ldesign/doc'
import { sitemapPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  title: 'My Documentation',
  description: 'My awesome documentation',
  
  plugins: [
    sitemapPlugin({
      enabled: true,
      sitemapPath: '/sitemap.html'
    })
  ]
})
```

## Page Configuration

Add metadata to your pages using frontmatter:

```markdown
---
title: Getting Started
category: Guide
tags:
  - setup
  - beginner
  - tutorial
---

# Getting Started

Your content here...
```

## Hiding Pages

To hide a page from the sitemap:

```markdown
---
title: Draft Page
hidden: true
---

# Draft Page

This page won't appear in the sitemap.
```

## Custom Categories

You can organize pages by category:

```markdown
---
title: API Reference
category: API Documentation
tags:
  - api
  - reference
---
```

If no category is specified, the plugin will use the first directory in the file path:
- `guide/getting-started.md` → Category: "Guide"
- `api/reference.md` → Category: "Api"
- `index.md` → Category: "Root"

## Using in Components

You can use the sitemap data in your custom components:

```vue
<template>
  <div>
    <h2>Documentation Pages</h2>
    
    <!-- Search -->
    <input 
      v-model="searchQuery" 
      placeholder="Search pages..."
    />
    
    <!-- Results -->
    <ul>
      <li v-for="page in filteredPages" :key="page.relativePath">
        <a :href="page.path">{{ page.title }}</a>
        <p>{{ page.description }}</p>
        <span v-if="page.category">{{ page.category }}</span>
      </li>
    </ul>
    
    <!-- Categories -->
    <div>
      <h3>Categories</h3>
      <button 
        v-for="category in allCategories" 
        :key="category.name"
        @click="filterByCategory(category.name)"
      >
        {{ category.name }} ({{ category.count }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSitemap } from '@ldesign/doc/theme-default'

const { allPages, allCategories, searchPages, getPagesByCategory } = useSitemap()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

const filteredPages = computed(() => {
  let pages = searchQuery.value 
    ? searchPages(searchQuery.value) 
    : allPages.value
  
  if (selectedCategory.value) {
    pages = pages.filter(p => p.category === selectedCategory.value)
  }
  
  return pages
})

const filterByCategory = (category: string) => {
  selectedCategory.value = category
}
</script>
```

## Accessing the Sitemap Page

After building your documentation, the sitemap will be available at:

```
https://your-docs-site.com/sitemap.html
```

## Features

The sitemap page includes:

1. **Search Bar** - Search by title, description, tags, or path
2. **Category Filters** - Filter pages by category
3. **View Modes** - Switch between list view and grouped view
4. **Page Metadata** - Shows category, tags, and last updated date
5. **Responsive Design** - Works on mobile and desktop

## Advanced Configuration

### Custom Sitemap Path

```typescript
sitemapPlugin({
  sitemapPath: '/docs/sitemap.html'
})
```

### Include Hidden Pages

```typescript
sitemapPlugin({
  includeHidden: true
})
```

### Disable Sitemap

```typescript
sitemapPlugin({
  enabled: false
})
```

## Tips

1. **Consistent Categories**: Use consistent category names across your documentation
2. **Meaningful Tags**: Add relevant tags to help users find related content
3. **Good Descriptions**: Write clear descriptions in frontmatter for better search results
4. **Regular Updates**: The sitemap is generated at build time, so rebuild to update

## Integration with Other Plugins

The sitemap plugin works well with:

- **Tags Plugin**: Share tag data for better organization
- **Search Plugin**: Complement the search functionality
- **Version Plugin**: Show pages for specific versions

```typescript
export default defineConfig({
  plugins: [
    sitemapPlugin(),
    tagsPlugin(),
    searchPlugin()
  ]
})
```
