# Enhanced Previous/Next Navigation

## Overview

The enhanced previous/next navigation (doc footer) provides improved navigation between documentation pages with support for:

1. **Configurable Reading Order** - Define custom navigation order independent of sidebar structure
2. **Page Descriptions** - Display preview text for each page in the navigation
3. **Flexible Configuration** - Enable/disable navigation per page or globally

## Features

### 1. Automatic Sidebar-Based Navigation

By default, the navigation uses the sidebar structure to determine the reading order:

```typescript
// config.ts
export default {
  themeConfig: {
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { 
              text: 'Introduction', 
              link: '/guide/introduction',
              description: 'Learn the basics of our documentation system'
            },
            { 
              text: 'Installation', 
              link: '/guide/installation',
              description: 'Step-by-step installation guide'
            }
          ]
        }
      ]
    }
  }
}
```

### 2. Custom Reading Order

Override the sidebar order with a custom reading sequence:

```typescript
// config.ts
export default {
  themeConfig: {
    docFooter: {
      readingOrder: [
        { 
          link: '/guide/introduction', 
          text: 'Introduction',
          description: 'Start here to learn the basics'
        },
        { 
          link: '/guide/concepts', 
          text: 'Core Concepts',
          description: 'Understand the fundamental concepts'
        },
        { 
          link: '/guide/installation', 
          text: 'Installation',
          description: 'Install and set up the system'
        }
      ]
    }
  }
}
```

### 3. Disable Navigation

Disable previous/next navigation globally or per direction:

```typescript
// Disable both
export default {
  themeConfig: {
    docFooter: {
      prev: false,
      next: false
    }
  }
}

// Disable only previous
export default {
  themeConfig: {
    docFooter: {
      prev: false
    }
  }
}
```

### 4. Custom Labels

Customize the "Previous" and "Next" labels:

```typescript
export default {
  themeConfig: {
    docFooter: {
      prev: 'Previous Page',
      next: 'Next Page'
    }
  }
}
```

## Configuration Reference

### ThemeConfig.docFooter

```typescript
interface DocFooterConfig {
  /** Previous page label or false to disable */
  prev?: string | false
  
  /** Next page label or false to disable */
  next?: string | false
  
  /** Custom reading order (overrides sidebar order) */
  readingOrder?: ReadingOrderItem[]
}

interface ReadingOrderItem {
  /** Page link */
  link: string
  
  /** Page title */
  text: string
  
  /** Page description (optional, shown as preview) */
  description?: string
}
```

### SidebarItem.description

Add descriptions to sidebar items for automatic preview:

```typescript
interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
  
  /** Description shown in prev/next navigation */
  description?: string
}
```

## Examples

### Example 1: Tutorial Series

```typescript
export default {
  themeConfig: {
    docFooter: {
      readingOrder: [
        { 
          link: '/tutorial/setup', 
          text: 'Setup',
          description: 'Set up your development environment'
        },
        { 
          link: '/tutorial/first-app', 
          text: 'Your First App',
          description: 'Build your first application'
        },
        { 
          link: '/tutorial/components', 
          text: 'Components',
          description: 'Learn about component architecture'
        },
        { 
          link: '/tutorial/deployment', 
          text: 'Deployment',
          description: 'Deploy your application to production'
        }
      ]
    }
  }
}
```

### Example 2: Multi-Language Support

```typescript
export default {
  locales: {
    root: {
      themeConfig: {
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
      }
    },
    en: {
      themeConfig: {
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        }
      }
    }
  }
}
```

### Example 3: Sidebar with Descriptions

```typescript
export default {
  themeConfig: {
    sidebar: {
      '/api/': [
        {
          text: 'Core API',
          items: [
            { 
              text: 'Configuration', 
              link: '/api/config',
              description: 'Configure your application settings'
            },
            { 
              text: 'Plugins', 
              link: '/api/plugins',
              description: 'Extend functionality with plugins'
            },
            { 
              text: 'Themes', 
              link: '/api/themes',
              description: 'Customize the appearance'
            }
          ]
        }
      ]
    }
  }
}
```

## Styling

The navigation uses CSS custom properties for theming:

```css
.vp-doc-pagination {
  /* Grid layout for prev/next */
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.vp-doc-pagination-prev,
.vp-doc-pagination-next {
  /* Card styling */
  padding: 16px;
  border-radius: 8px;
  background: transparent;
  transition: all 0.2s;
}

.vp-doc-pagination-prev:hover,
.vp-doc-pagination-next:hover {
  background: var(--ldoc-c-bg-soft);
}

.vp-doc-pagination-title {
  /* Title styling */
  font-size: 14px;
  font-weight: 500;
  color: var(--ldoc-c-brand);
}

.vp-doc-pagination-description {
  /* Description styling */
  font-size: 12px;
  color: var(--ldoc-c-text-2);
  line-height: 1.4;
  /* Truncate to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

## Responsive Design

The navigation is fully responsive:

- **Desktop**: Side-by-side layout with full descriptions
- **Tablet**: Side-by-side with truncated descriptions
- **Mobile**: Stacked layout with full-width cards

## Accessibility

The navigation includes:

- Semantic HTML (`<nav>` element)
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Touch-friendly tap targets (min 44px height on mobile)

## Property Validation

**Property 33: Previous/Next navigation**

*For any* page in a sequential section, the rendered page SHALL include correct previous and next page links based on the configured order.

**Validates: Requirements 8.5**

This property ensures:
1. Navigation links are generated based on configured reading order or sidebar order
2. Previous link points to the correct preceding page
3. Next link points to the correct following page
4. Page titles and descriptions are displayed correctly
5. Navigation respects configuration (disabled states, custom labels)
