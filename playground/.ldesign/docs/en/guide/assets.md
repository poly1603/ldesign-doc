# Static Assets

Learn how to handle static assets like images, fonts, and other files in your documentation.

## Public Directory

Files in the `public` directory are served at the root path:

```
.ldesign/
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
│       └── hero.png
```

Reference in Markdown:

```md
![Logo](/logo.svg)
![Hero Image](/images/hero.png)
```

## Relative Paths

You can also use relative paths for assets:

```md
![Image](./images/example.png)
![Image](../assets/image.png)
```

## Base URL

When deploying to a subdirectory, configure the base URL:

```ts
// doc.config.ts
export default defineConfig({
  base: '/docs/'
})
```

Assets will be prefixed automatically:

```md
![Logo](/logo.svg)
<!-- Becomes: /docs/logo.svg -->
```

## Images

### Basic Image

```md
![Alt text](/images/example.png)
```

### Image with Title

```md
![Alt text](/images/example.png "Image title")
```

### Responsive Images

Images are automatically responsive with max-width: 100%.

### Image Zoom

Click on images to view them in a lightbox (enabled by imageViewerPlugin).

## Fonts

Add custom fonts in your configuration:

```ts
export default defineConfig({
  head: [
    ['link', { 
      rel: 'stylesheet', 
      href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap' 
    }]
  ]
})
```

Then use in CSS:

```css
:root {
  --ldoc-font-family-base: 'Inter', sans-serif;
}
```

## Icons

Use emoji or SVG icons in your content:

```md
:rocket: Emoji icons

<svg>...</svg> SVG icons
```

## File Downloads

Link to downloadable files:

```md
[Download PDF](/files/guide.pdf)
[Download ZIP](/files/project.zip)
```
