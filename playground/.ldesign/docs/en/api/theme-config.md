# Theme Config

Theme configuration options to customize the appearance and behavior of your site.

## logo

- Type: `string | { light: string; dark: string }`

Site logo displayed in the navigation bar.

```ts
export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',
    // Or different logos for light/dark mode
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg'
    }
  }
})
```

## siteTitle

- Type: `string | false`

Override the site title in the navbar. Set to `false` to hide.

```ts
export default defineConfig({
  themeConfig: {
    siteTitle: 'My Docs'
  }
})
```

## nav

- Type: `NavItem[]`

Navigation bar items.

```ts
export default defineConfig({
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      {
        text: 'Dropdown',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' }
        ]
      }
    ]
  }
})
```

## sidebar

- Type: `Sidebar`

Sidebar configuration, can be an array or object keyed by path.

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is LDoc', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        }
      ]
    }
  }
})
```

## socialLinks

- Type: `SocialLink[]`

Social links displayed in the navigation bar.

```ts
export default defineConfig({
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' },
      { icon: 'twitter', link: 'https://twitter.com/your-account' }
    ]
  }
})
```

## footer

- Type: `{ message?: string; copyright?: string }`

Footer content.

```ts
export default defineConfig({
  themeConfig: {
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2024 Your Name'
    }
  }
})
```

## editLink

- Type: `{ pattern: string; text?: string }`

Edit link configuration.

```ts
export default defineConfig({
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
```

## outline

- Type: `{ level?: number | [number, number]; label?: string }`

Table of contents configuration.

```ts
export default defineConfig({
  themeConfig: {
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  }
})
```

## lastUpdated

- Type: `{ text?: string; formatOptions?: object }`

Last updated time display.

```ts
export default defineConfig({
  themeConfig: {
    lastUpdated: {
      text: 'Last updated'
    }
  }
})
```
