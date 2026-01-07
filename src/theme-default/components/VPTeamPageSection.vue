<template>
  <section class="vp-team-page-section">
    <div v-if="$slots.title || $slots.lead" class="vp-team-page-section-header">
      <h2 v-if="$slots.title" class="vp-team-page-section-title">
        <slot name="title" />
      </h2>
      <p v-if="$slots.lead" class="vp-team-page-section-lead">
        <slot name="lead" />
      </p>
    </div>
    <div class="vp-team-page-section-content">
      <slot name="members" />
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.vp-team-page-section {
  padding: 48px 0;
}

.vp-team-page-section + .vp-team-page-section {
  border-top: 1px solid var(--ldoc-c-divider);
}

.vp-team-page-section-header {
  text-align: center;
  margin-bottom: 32px;
}

.vp-team-page-section-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--ldoc-c-text-1);
}

.vp-team-page-section-lead {
  margin: 12px auto 0;
  max-width: 560px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ldoc-c-text-2);
}

@media (max-width: 768px) {
  .vp-team-page-section-title {
    font-size: 24px;
  }

  .vp-team-page-section-lead {
    font-size: 14px;
  }
}
</style>
