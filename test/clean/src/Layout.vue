<script setup lang="ts">
/**
 * 自定义主题 Layout
 * 继承默认主题，只添加一个顶部标识 banner
 * 
 * 你可以在这里：
 * 1. 修改 banner 的样式和内容
 * 2. 添加更多自定义组件
 * 3. 覆盖默认主题的部分功能
 */

// 导入默认主题的 Layout 组件
import { Layout as DefaultLayout } from '@ldesign/doc/theme-default'
</script>

<template>
  <div class="custom-theme-wrapper">
    <!-- 🎨 自定义顶部标识 Banner - 你可以修改这里 -->
    <div class="custom-theme-banner">
      <span class="banner-icon">🎨</span>
      <span class="banner-text">自定义主题 - ldoc-theme-clean</span>
    </div>
    
    <!-- 使用默认主题的 Layout（包含导航栏、侧边栏、内容区、页脚等） -->
    <DefaultLayout />
  </div>
</template>

<style scoped>
/* 自定义主题包装器 */
.custom-theme-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🎨 自定义顶部标识 Banner - 你可以修改这里的样式 */
.custom-theme-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
}

.banner-icon {
  font-size: 16px;
}

.banner-text {
  letter-spacing: 0.5px;
}

/* 响应式：移动端隐藏 banner 文字 */
@media (max-width: 640px) {
  .banner-text {
    display: none;
  }
}
</style>
