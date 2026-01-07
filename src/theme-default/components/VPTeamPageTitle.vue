<template>
  <div class="vp-team-page-title">
    <h1 class="vp-team-page-title-text">
      <slot name="title" />
    </h1>
    <p v-if="$slots.lead" class="vp-team-page-title-lead">
      <slot name="lead" />
    </p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.vp-team-page-title {
  padding: 48px 0;
  text-align: center;
}

.vp-team-page-title-text {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--ldoc-c-text-1);
  letter-spacing: -0.02em;
}

.vp-team-page-title-lead {
  margin: 16px auto 0;
  max-width: 640px;
  font-size: 18px;
  line-height: 1.6;
  color: var(--ldoc-c-text-2);
}

@media (max-width: 768px) {
  .vp-team-page-title-text {
    font-size: 32px;
  }

  .vp-team-page-title-lead {
    font-size: 16px;
  }
}
</style>
