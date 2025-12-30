<template>
  <div class="video-player-container">
    <div class="video-wrapper">
      <video
        ref="videoRef"
        :src="src"
        :poster="poster"
        :controls="controls"
        :autoplay="autoplay"
        :loop="loop"
        :muted="muted"
        :preload="preload"
        class="video-element"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
      >
        <track
          v-if="subtitles"
          kind="subtitles"
          :src="subtitles"
          :srclang="subtitlesLang"
          :label="subtitlesLabel"
        />
        Your browser does not support the video tag.
      </video>
      
      <!-- Custom controls overlay (optional) -->
      <div v-if="showCustomControls" class="custom-controls">
        <button @click="togglePlay" class="control-button play-pause">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <div class="progress-bar" @click="handleProgressClick">
          <div class="progress-filled" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Chapter markers -->
    <div v-if="chapters && chapters.length > 0" class="chapters-container">
      <h4 class="chapters-title">{{ chaptersTitle }}</h4>
      <div class="chapters-list">
        <div
          v-for="(chapter, index) in chapters"
          :key="index"
          class="chapter-item"
          :class="{ 
            active: isChapterActive(chapter),
            completed: isChapterCompleted(chapter)
          }"
          @click="seekToChapter(chapter)"
        >
          <div class="chapter-marker">
            <div class="chapter-dot"></div>
            <div v-if="index < chapters.length - 1" class="chapter-line"></div>
          </div>
          <div class="chapter-content">
            <div class="chapter-time">{{ formatTime(chapter.time) }}</div>
            <div class="chapter-title">{{ chapter.title }}</div>
            <div v-if="chapter.description" class="chapter-description">
              {{ chapter.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export interface VideoChapter {
  /** 章节开始时间（秒） */
  time: number
  /** 章节标题 */
  title: string
  /** 章节描述 */
  description?: string
}

const props = withDefaults(defineProps<{
  /** 视频源 URL */
  src: string
  /** 海报图片 URL */
  poster?: string
  /** 是否显示原生控制条 */
  controls?: boolean
  /** 是否自动播放 */
  autoplay?: boolean
  /** 是否循环播放 */
  loop?: boolean
  /** 是否静音 */
  muted?: boolean
  /** 预加载策略 */
  preload?: 'none' | 'metadata' | 'auto'
  /** 章节列表 */
  chapters?: VideoChapter[]
  /** 章节标题 */
  chaptersTitle?: string
  /** 是否显示自定义控制条 */
  showCustomControls?: boolean
  /** 字幕文件 URL */
  subtitles?: string
  /** 字幕语言 */
  subtitlesLang?: string
  /** 字幕标签 */
  subtitlesLabel?: string
}>(), {
  controls: true,
  autoplay: false,
  loop: false,
  muted: false,
  preload: 'metadata',
  chaptersTitle: 'Chapters',
  showCustomControls: false,
  subtitlesLang: 'en',
  subtitlesLabel: 'English'
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  timeupdate: [time: number]
  chapterchange: [chapter: VideoChapter]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const currentChapterIndex = ref(-1)

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    emit('timeupdate', currentTime.value)
    updateCurrentChapter()
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const handlePlay = () => {
  isPlaying.value = true
  emit('play')
}

const handlePause = () => {
  isPlaying.value = false
  emit('pause')
}

const handleEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

const handleProgressClick = (event: MouseEvent) => {
  if (videoRef.value) {
    const progressBar = event.currentTarget as HTMLElement
    const rect = progressBar.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percent = clickX / rect.width
    videoRef.value.currentTime = percent * duration.value
  }
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0:00'
  }
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

const seekToChapter = (chapter: VideoChapter) => {
  if (videoRef.value) {
    videoRef.value.currentTime = chapter.time
    emit('chapterchange', chapter)
  }
}

const isChapterActive = (chapter: VideoChapter): boolean => {
  if (!props.chapters || props.chapters.length === 0) return false
  
  const index = props.chapters.indexOf(chapter)
  const nextChapter = props.chapters[index + 1]
  
  if (nextChapter) {
    return currentTime.value >= chapter.time && currentTime.value < nextChapter.time
  }
  return currentTime.value >= chapter.time
}

const isChapterCompleted = (chapter: VideoChapter): boolean => {
  return currentTime.value > chapter.time && !isChapterActive(chapter)
}

const updateCurrentChapter = () => {
  if (!props.chapters || props.chapters.length === 0) return
  
  for (let i = props.chapters.length - 1; i >= 0; i--) {
    if (currentTime.value >= props.chapters[i].time) {
      if (currentChapterIndex.value !== i) {
        currentChapterIndex.value = i
        emit('chapterchange', props.chapters[i])
      }
      break
    }
  }
}

onMounted(() => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration || 0
  }
})

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<style scoped>
.video-player-container {
  margin: 24px 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--ldoc-c-bg-soft);
}

.video-wrapper {
  position: relative;
  width: 100%;
  background: #000;
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
  max-height: 600px;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-wrapper:hover .custom-controls {
  opacity: 1;
}

.control-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.control-button:hover {
  transform: scale(1.1);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-filled {
  height: 100%;
  background: var(--ldoc-c-brand);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-display {
  color: white;
  font-size: 13px;
  font-family: monospace;
  white-space: nowrap;
}

.chapters-container {
  padding: 24px;
  background: var(--ldoc-c-bg);
}

.chapters-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
  margin: 0 0 16px 0;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.chapter-item {
  display: flex;
  cursor: pointer;
  padding: 12px 0;
  transition: all 0.2s;
  border-radius: 6px;
}

.chapter-item:hover {
  background: var(--ldoc-c-bg-soft);
  padding-left: 8px;
  padding-right: 8px;
}

.chapter-item.active {
  background: var(--ldoc-c-brand-soft);
}

.chapter-item.active .chapter-title {
  color: var(--ldoc-c-brand);
  font-weight: 600;
}

.chapter-item.completed .chapter-dot {
  background: var(--ldoc-c-success, #10b981);
  border-color: var(--ldoc-c-success, #10b981);
}

.chapter-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.chapter-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--ldoc-c-brand);
  background: var(--ldoc-c-bg);
  position: relative;
  z-index: 1;
  transition: all 0.2s;
}

.chapter-item.active .chapter-dot {
  width: 16px;
  height: 16px;
  background: var(--ldoc-c-brand);
}

.chapter-line {
  width: 2px;
  flex: 1;
  background: var(--ldoc-c-divider);
  margin-top: 4px;
  min-height: 20px;
}

.chapter-content {
  flex: 1;
  padding-top: 0;
}

.chapter-time {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
  font-family: monospace;
  margin-bottom: 4px;
  font-weight: 500;
}

.chapter-item.active .chapter-time {
  color: var(--ldoc-c-brand);
}

.chapter-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--ldoc-c-text-1);
  margin-bottom: 4px;
  transition: color 0.2s;
}

.chapter-description {
  font-size: 13px;
  color: var(--ldoc-c-text-2);
  line-height: 1.5;
}

/* Responsive design */
@media (max-width: 768px) {
  .chapters-container {
    padding: 16px;
  }

  .chapters-title {
    font-size: 16px;
  }

  .chapter-item {
    padding: 10px 0;
  }

  .chapter-marker {
    margin-right: 12px;
  }

  .chapter-title {
    font-size: 14px;
  }

  .chapter-description {
    font-size: 12px;
  }

  .custom-controls {
    padding: 12px;
    gap: 8px;
  }

  .control-button {
    font-size: 18px;
    padding: 6px;
  }

  .time-display {
    font-size: 11px;
  }
}
</style>
