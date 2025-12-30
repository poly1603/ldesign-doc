# VideoPlayer Component Example

This example demonstrates how to use the VideoPlayer component with chapter markers.

## Basic Usage

```vue
<script setup>
import VideoPlayer from '../src/theme-default/components/VideoPlayer.vue'

const chapters = [
  {
    time: 0,
    title: 'Introduction',
    description: 'Welcome to the tutorial'
  },
  {
    time: 30,
    title: 'Getting Started',
    description: 'Setting up your environment'
  },
  {
    time: 90,
    title: 'Core Concepts',
    description: 'Understanding the fundamentals'
  },
  {
    time: 180,
    title: 'Advanced Features',
    description: 'Exploring advanced functionality'
  },
  {
    time: 300,
    title: 'Conclusion',
    description: 'Wrapping up and next steps'
  }
]
</script>

<template>
  <VideoPlayer
    src="https://example.com/video.mp4"
    poster="https://example.com/poster.jpg"
    :chapters="chapters"
    chaptersTitle="Tutorial Chapters"
    :controls="true"
  />
</template>
```

## With Custom Controls

```vue
<template>
  <VideoPlayer
    src="https://example.com/video.mp4"
    :chapters="chapters"
    :showCustomControls="true"
    :controls="false"
    @chapterchange="handleChapterChange"
  />
</template>

<script setup>
const handleChapterChange = (chapter) => {
  console.log('Now playing:', chapter.title)
}
</script>
```

## With Subtitles

```vue
<template>
  <VideoPlayer
    src="https://example.com/video.mp4"
    subtitles="https://example.com/subtitles.vtt"
    subtitlesLang="en"
    subtitlesLabel="English"
    :chapters="chapters"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Video source URL |
| `poster` | `string` | - | Poster image URL |
| `controls` | `boolean` | `true` | Show native video controls |
| `autoplay` | `boolean` | `false` | Auto-play video |
| `loop` | `boolean` | `false` | Loop video playback |
| `muted` | `boolean` | `false` | Mute video |
| `preload` | `'none' \| 'metadata' \| 'auto'` | `'metadata'` | Preload strategy |
| `chapters` | `VideoChapter[]` | - | Chapter markers |
| `chaptersTitle` | `string` | `'Chapters'` | Chapters section title |
| `showCustomControls` | `boolean` | `false` | Show custom controls overlay |
| `subtitles` | `string` | - | Subtitles file URL (VTT format) |
| `subtitlesLang` | `string` | `'en'` | Subtitles language code |
| `subtitlesLabel` | `string` | `'English'` | Subtitles label |

## VideoChapter Interface

```typescript
interface VideoChapter {
  /** Chapter start time in seconds */
  time: number
  /** Chapter title */
  title: string
  /** Chapter description (optional) */
  description?: string
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `play` | - | Emitted when video starts playing |
| `pause` | - | Emitted when video is paused |
| `ended` | - | Emitted when video ends |
| `timeupdate` | `number` | Emitted on time update with current time |
| `chapterchange` | `VideoChapter` | Emitted when active chapter changes |

## Features

- ✅ Native HTML5 video player
- ✅ Chapter markers with timeline visualization
- ✅ Click to jump to any chapter
- ✅ Active chapter highlighting
- ✅ Completed chapter indicators
- ✅ Optional custom controls overlay
- ✅ Subtitle support (VTT format)
- ✅ Responsive design
- ✅ Keyboard accessible
- ✅ Event system for integration

## Styling

The component uses CSS custom properties for theming:

```css
--ldoc-c-brand        /* Primary brand color */
--ldoc-c-brand-soft   /* Soft brand color for backgrounds */
--ldoc-c-bg           /* Background color */
--ldoc-c-bg-soft      /* Soft background color */
--ldoc-c-text-1       /* Primary text color */
--ldoc-c-text-2       /* Secondary text color */
--ldoc-c-text-3       /* Tertiary text color */
--ldoc-c-divider      /* Divider color */
--ldoc-c-success      /* Success color for completed chapters */
```
