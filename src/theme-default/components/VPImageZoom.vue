<template>
  <Teleport to="body">
    <Transition name="zoom">
      <div v-if="visible" class="vp-image-zoom-overlay" @click="close">
        <div class="vp-image-zoom-content" @click.stop>
          <img :src="currentSrc" :alt="currentAlt" class="vp-image-zoom-img" />
          <button class="vp-image-zoom-close" @click="close" aria-label="关闭">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const currentSrc = ref('')
const currentAlt = ref('')

const open = (src: string, alt: string = '') => {
  currentSrc.value = src
  currentAlt.value = alt
  visible.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  visible.value = false
  document.body.style.overflow = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && visible.value) {
    close()
  }
}

const handleImageClick = (e: Event) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG' && target.closest('.vp-doc')) {
    const img = target as HTMLImageElement
    // 排除小图标和 emoji
    if (img.naturalWidth > 100 && img.naturalHeight > 100) {
      open(img.src, img.alt)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleImageClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleImageClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.vp-image-zoom-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(4px);
}

.vp-image-zoom-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.vp-image-zoom-img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.vp-image-zoom-close {
  position: absolute;
  top: -48px;
  right: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.vp-image-zoom-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Transition */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
}

.zoom-enter-from .vp-image-zoom-img,
.zoom-leave-to .vp-image-zoom-img {
  transform: scale(0.9);
}
</style>
