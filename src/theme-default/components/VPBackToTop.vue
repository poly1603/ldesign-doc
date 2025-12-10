<template>
  <Transition name="fade">
    <button
      v-show="show"
      class="vp-back-to-top"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      ↑
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(false)
const threshold = 300

const handleScroll = () => {
  show.value = window.scrollY > threshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.vp-back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldoc-c-bg);
  border: 1px solid var(--ldoc-c-divider);
  border-radius: 50%;
  font-size: 20px;
  color: var(--ldoc-c-text-2);
  cursor: pointer;
  box-shadow: var(--ldoc-shadow-2);
  transition: all 0.2s;
  z-index: 50;
}

.vp-back-to-top:hover {
  color: var(--ldoc-c-brand);
  border-color: var(--ldoc-c-brand);
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
