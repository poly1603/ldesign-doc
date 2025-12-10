<template>
  <footer v-if="footer" class="vp-footer">
    <div class="vp-footer-container">
      <p v-if="footer.message" class="vp-footer-message" v-html="footer.message"></p>
      <p v-if="footer.copyright" class="vp-footer-copyright" v-html="footer.copyright"></p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '../composables'

const { theme } = useData()

const footer = computed(() => {
  const config = theme.value as { footer?: { message?: string; copyright?: string } }
  return config.footer
})
</script>

<style scoped>
.vp-footer {
  border-top: 1px solid var(--ldoc-c-divider);
  padding: 24px;
  text-align: center;
}

.vp-footer-container {
  max-width: var(--ldoc-layout-max-width, 1400px);
  margin: 0 auto;
}

.vp-footer-message,
.vp-footer-copyright {
  margin: 8px 0;
  font-size: 14px;
  color: var(--ldoc-c-text-2);
}

.vp-footer-message :deep(a),
.vp-footer-copyright :deep(a) {
  color: var(--ldoc-c-brand);
  text-decoration: none;
}

.vp-footer-message :deep(a):hover,
.vp-footer-copyright :deep(a):hover {
  text-decoration: underline;
}
</style>
