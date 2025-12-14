# Configuration

LDoc is configured through the `doc.config.ts` file in your `.ldesign` directory.

## Basic Configuration

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  // Site title
  title: 'My Documentation',
  
  // Site description
  description: 'A modern documentation site',
  
  // Base URL
  base: '/',
  
  // Default language
  lang: 'en-US'
})
```

## Theme Configuration

```ts
export default defineConfig({
  themeConfig: {
    // Site logo
    logo: '/logo.svg',
    
    // Navigation bar
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    
    // Sidebar
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/getting-started' }
          ]
        }
      ]
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    
    // Footer
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2024'
    }
  }
})
```

## Multi-language Configuration

```ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/'
    }
  }
})
```

## Vite Configuration

You can extend the Vite configuration:

```ts
export default defineConfig({
  vite: {
    server: {
      port: 3000,
      open: true
    }
  }
})
```

## Build Configuration

```ts
export default defineConfig({
  build: {
    outDir: 'dist'
  }
})
```
