# Image Viewer Plugin

View images in a lightbox with zoom and navigation features.

## Installation

```ts
import { imageViewerPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    imageViewerPlugin({
      // options
    })
  ]
})
```

## Options

### zoom

- Type: `boolean`
- Default: `true`

Enable zoom functionality.

```ts
imageViewerPlugin({
  zoom: true
})
```

### maxZoom

- Type: `number`
- Default: `3`

Maximum zoom level.

```ts
imageViewerPlugin({
  maxZoom: 5
})
```

### selector

- Type: `string`
- Default: `'.ldoc-content img'`

CSS selector for images to enable viewer.

```ts
imageViewerPlugin({
  selector: 'img:not(.no-zoom)'
})
```

## Features

- **Click to open** - Click any image to view in lightbox
- **Zoom** - Zoom in/out with scroll or buttons
- **Pan** - Drag to pan when zoomed
- **Keyboard support** - Navigate with keyboard
- **Touch support** - Pinch to zoom on mobile

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close viewer |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `←` `→` | Previous/Next image |

## Exclude Images

Prevent specific images from opening in viewer:

```html
<img src="image.png" class="no-zoom" alt="No zoom">
```

Or using data attribute:

```html
<img src="image.png" data-no-zoom alt="No zoom">
```

## Styling

Customize viewer appearance:

```css
.ldoc-image-viewer {
  --viewer-bg: rgba(0, 0, 0, 0.9);
  --viewer-btn-bg: rgba(255, 255, 255, 0.1);
}
```

## Example

Click on any image in your documentation to open it in the lightbox viewer.

All images are automatically enabled for the viewer unless explicitly excluded.
