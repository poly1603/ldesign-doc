# Site Config

Site-level configuration options for your LDoc documentation site.

## title

- Type: `string`
- Default: `'LDoc'`

Site title, displayed in the browser tab and navigation bar.

```ts
export default defineConfig({
  title: 'My Documentation'
})
```

## description

- Type: `string`
- Default: `''`

Site description for SEO meta tags.

```ts
export default defineConfig({
  description: 'A modern documentation framework'
})
```

## base

- Type: `string`
- Default: `'/'`

Base URL for deployment. Set this when deploying to a subdirectory.

```ts
export default defineConfig({
  base: '/docs/'
})
```

## lang

- Type: `string`
- Default: `'en-US'`

Default language for the site.

```ts
export default defineConfig({
  lang: 'zh-CN'
})
```

## head

- Type: `HeadConfig[]`
- Default: `[]`

Additional tags to inject into the HTML `<head>`.

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }]
  ]
})
```

## srcDir

- Type: `string`
- Default: `'.ldesign/docs'`

Directory containing your documentation files.

```ts
export default defineConfig({
  srcDir: 'docs'
})
```

## outDir

- Type: `string`
- Default: `'dist'`

Output directory for production build.

```ts
export default defineConfig({
  outDir: 'build'
})
```

## locales

- Type: `Record<string, LocaleConfig>`
- Default: `{}`

Multi-language configuration.

```ts
export default defineConfig({
  locales: {
    root: { label: 'English', lang: 'en-US' },
    zh: { label: '中文', lang: 'zh-CN', link: '/zh/' }
  }
})
```

## markdown

- Type: `MarkdownOptions`
- Default: `{}`

Markdown processing options.

```ts
export default defineConfig({
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
```

## vite

- Type: `ViteUserConfig`
- Default: `{}`

Vite configuration overrides.

```ts
export default defineConfig({
  vite: {
    server: { port: 3000 }
  }
})
```
