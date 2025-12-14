# Videos

Embed videos in your documentation.

## YouTube

Embed YouTube videos using an iframe:

```html
<iframe 
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>

## Vimeo

```html
<iframe 
  src="https://player.vimeo.com/video/VIDEO_ID" 
  width="640" 
  height="360" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

## Local Video

Use HTML5 video for local files:

```html
<video controls width="100%">
  <source src="/path/to/video.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

## Video with Poster

```html
<video 
  controls 
  poster="/path/to/poster.jpg"
  width="100%">
  <source src="/path/to/video.mp4" type="video/mp4">
</video>
```

## Autoplay (Muted)

```html
<video autoplay muted loop playsinline width="100%">
  <source src="/path/to/video.mp4" type="video/mp4">
</video>
```

## Responsive Video Container

Wrap videos in a responsive container:

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    src="VIDEO_URL" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>
```

## Video Formats

Provide multiple formats for compatibility:

```html
<video controls width="100%">
  <source src="/video.webm" type="video/webm">
  <source src="/video.mp4" type="video/mp4">
  <source src="/video.ogg" type="video/ogg">
</video>
```
