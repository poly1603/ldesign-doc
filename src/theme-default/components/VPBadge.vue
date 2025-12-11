<template>
  <span class="vp-badge" :class="[type, { vertical }]">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  type?: 'tip' | 'warning' | 'danger' | 'info'
  text?: string
  vertical?: 'top' | 'middle'
}

withDefaults(defineProps<Props>(), {
  type: 'tip',
  vertical: undefined
})
</script>

<style scoped>
.vp-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.vp-badge.vertical {
  margin-left: 0;
}

.vp-badge.top {
  vertical-align: top;
}

.vp-badge.middle {
  vertical-align: middle;
}

.vp-badge.tip {
  background-color: var(--ldoc-c-brand-soft);
  color: var(--ldoc-c-brand-dark);
}

.vp-badge.warning {
  background-color: var(--ldoc-c-yellow-soft);
  color: var(--ldoc-c-yellow-dark);
}

.vp-badge.danger {
  background-color: var(--ldoc-c-red-soft);
  color: var(--ldoc-c-red);
}

.vp-badge.info {
  background-color: var(--ldoc-c-gray-soft);
  color: var(--ldoc-c-text-2);
}
</style>
