# Theme Customization

LDoc provides flexible theming options to customize your documentation site's appearance.

## CSS Variables

Override CSS variables to customize colors, fonts, and spacing:

```css
:root {
  /* Brand colors */
  --ldoc-c-brand: #3b82f6;
  --ldoc-c-brand-light: #60a5fa;
  --ldoc-c-brand-dark: #2563eb;
  
  /* Text colors */
  --ldoc-c-text-1: #1a1a1a;
  --ldoc-c-text-2: #4a4a4a;
  --ldoc-c-text-3: #8a8a8a;
  
  /* Background colors */
  --ldoc-c-bg: #ffffff;
  --ldoc-c-bg-soft: #f6f6f7;
  
  /* Layout */
  --ldoc-sidebar-width: 260px;
  --ldoc-outline-width: 220px;
  --ldoc-nav-height: 64px;
}

/* Dark mode */
.dark {
  --ldoc-c-brand: #60a5fa;
  --ldoc-c-text-1: #ffffff;
  --ldoc-c-bg: #1a1a1a;
}
```

## Theme Colors

LDoc supports multiple built-in color themes:

- **Blue** - Professional and calm
- **Indigo** - Deep and elegant
- **Purple** - Creative and mysterious
- **Pink** - Warm and friendly
- **Green** - Fresh and natural
- **Orange** - Energetic and warm

Users can switch themes using the color picker in the navigation bar.

## Dark Mode

Dark mode is automatically supported. Users can toggle between light and dark modes using the theme switch in the navigation bar.

### Transition Animation

Theme transitions support multiple animation styles:

- **Circle** - Circular expansion from click point
- **Fade** - Simple fade transition
- **Slide** - Slide transition

## Custom Components

You can use Vue components in your Markdown files:

```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<MyComponent />
```

## Layout Slots

Customize layout by providing content for slots:

```ts
// doc.config.ts
export default defineConfig({
  themeConfig: {
    // Custom footer
    footer: {
      message: 'Custom message',
      copyright: 'Copyright © 2024'
    }
  }
})
```

## Custom CSS

Add custom styles in your configuration:

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'stylesheet', href: '/custom.css' }]
  ]
})
```
