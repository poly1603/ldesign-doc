<template>
  <div class="not-found">
    <div class="not-found-content">
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-description">
        抱歉，您访问的页面不存在。
      </p>
      <div class="not-found-actions">
        <a href="/" class="not-found-link">返回首页</a>
        <button @click="goBack" class="not-found-button">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '@ldesign/doc/client'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
}

.not-found-code {
  font-size: 64px;
  font-weight: 700;
  color: var(--ldoc-c-brand);
  margin: 0;
  line-height: 1;
}

.not-found-title {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0;
  color: var(--ldoc-c-text-1);
}

.not-found-description {
  font-size: 16px;
  color: var(--ldoc-c-text-2);
  margin: 0 0 24px;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.not-found-link,
.not-found-button {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.not-found-link {
  background: var(--ldoc-c-brand);
  color: white;
  border: 1px solid var(--ldoc-c-brand);
}

.not-found-link:hover {
  background: var(--ldoc-c-brand-dark);
  border-color: var(--ldoc-c-brand-dark);
}

.not-found-button {
  background: transparent;
  color: var(--ldoc-c-text-1);
  border: 1px solid var(--ldoc-c-divider);
}

.not-found-button:hover {
  border-color: var(--ldoc-c-brand);
  color: var(--ldoc-c-brand);
}
</style>
