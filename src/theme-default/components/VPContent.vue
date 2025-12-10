<template>
  <div class="vp-content">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.vp-content {
  max-width: var(--ldoc-content-width, 740px);
  margin: 0 auto;
  padding: 24px;
}
</style>
