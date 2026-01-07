<template>
  <div class="vp-team-page">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.vp-team-page {
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px 24px 96px;
}

@media (min-width: 768px) {
  .vp-team-page {
    padding: 64px 48px 128px;
  }
}
</style>
