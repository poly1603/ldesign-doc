# Images

Learn how to work with images in your documentation.

## Basic Image

```md
![Alt text](/path/to/image.png)
```

## Image with Title

```md
![Alt text](/path/to/image.png "Image title")
```

## Linked Image

```md
[![Alt text](/path/to/image.png)](https://example.com)
```

## Image Sizing

Using HTML for more control:

```html
<img src="/path/to/image.png" width="300" alt="Sized image">
```

## Image Alignment

### Centered Image

<div style="text-align: center">
  <img src="https://via.placeholder.com/200" alt="Centered">
</div>

### Side by Side

<div style="display: flex; gap: 16px; justify-content: center">
  <img src="https://via.placeholder.com/150" alt="Image 1">
  <img src="https://via.placeholder.com/150" alt="Image 2">
</div>

## Image with Caption

<figure>
  <img src="https://via.placeholder.com/400x200" alt="Example">
  <figcaption style="text-align: center; color: var(--ldoc-c-text-2); font-size: 14px;">
    Figure 1: Example image with caption
  </figcaption>
</figure>

## Image Gallery

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
  <img src="https://via.placeholder.com/150" alt="1">
  <img src="https://via.placeholder.com/150" alt="2">
  <img src="https://via.placeholder.com/150" alt="3">
  <img src="https://via.placeholder.com/150" alt="4">
  <img src="https://via.placeholder.com/150" alt="5">
  <img src="https://via.placeholder.com/150" alt="6">
</div>

## Image Zoom

Images automatically support click-to-zoom when the Image Viewer plugin is enabled.

Click on any image to view it in a lightbox.

## Dark Mode Images

Use different images for light and dark modes:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/dark-image.png">
  <img src="/light-image.png" alt="Theme-aware image">
</picture>
```

## Lazy Loading

Images are lazy-loaded by default for better performance:

```md
![Lazy loaded](/large-image.png)
```
