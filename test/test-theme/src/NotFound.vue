<script setup lang="ts">
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found h1 {
  font-size: 72px;
  font-weight: 700;
  color: var(--theme-primary, #3b82f6);
  margin: 0;
}

.not-found p {
  font-size: 18px;
  color: var(--theme-text-secondary, #6b7280);
  margin: 16px 0 24px;
}

.not-found a {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--theme-primary, #3b82f6);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.not-found a:hover {
  background: var(--theme-primary-dark, #2563eb);
}
</style>
