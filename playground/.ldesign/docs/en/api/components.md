# Components

Built-in Vue components available in your documentation.

## Content

Renders the markdown content of the current page.

```vue
<template>
  <Content />
</template>
```

## ClientOnly

Renders content only on the client side (not during SSR/SSG).

```vue
<template>
  <ClientOnly>
    <BrowserOnlyComponent />
  </ClientOnly>
</template>
```

## PluginSlot

Renders content from plugins in named slots.

```vue
<template>
  <PluginSlot name="doc-before" />
  <Content />
  <PluginSlot name="doc-after" />
</template>
```

### Available Slots

- `layout-top` - Top of layout
- `layout-bottom` - Bottom of layout
- `nav-bar-title-before` - Before nav title
- `nav-bar-title-after` - After nav title
- `sidebar-nav-before` - Before sidebar
- `sidebar-nav-after` - After sidebar
- `doc-before` - Before doc content
- `doc-after` - After doc content
- `home-hero-before` - Before hero section
- `home-hero-after` - After hero section
- `home-features-before` - Before features
- `home-features-after` - After features

## Theme Components

### VPNav

Navigation bar component.

### VPSidebar

Sidebar navigation component.

### VPDoc

Documentation page layout.

### VPHome

Homepage layout component.

### VPFooter

Footer component.

### VPOutline

Table of contents (outline) component.

### VPBackToTop

Back to top button.

### VPImageZoom

Image lightbox/zoom component.

## Using Components in Markdown

Import and use Vue components directly in Markdown files:

```md
<script setup>
import CustomComponent from './CustomComponent.vue'
</script>

# My Page

<CustomComponent />
```

## Global Components

Register global components in your theme configuration:

```ts
// theme/index.ts
export default {
  Layout,
  enhanceApp({ app }) {
    app.component('MyComponent', MyComponent)
  }
}
```

Then use anywhere:

```md
<MyComponent />
```
