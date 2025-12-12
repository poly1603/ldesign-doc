<script setup lang="ts">
/**
 * 自定义主题 NotFound
 * 直接使用默认主题的 NotFound 组件
 * 
 * 如果你需要自定义 404 页面，可以：
 * 1. 取消注释下面的自定义模板
 * 2. 或者完全重写这个组件
 */
import { NotFound as DefaultNotFound } from '@ldesign/doc/theme-default'
</script>

<template>
  <!-- 使用默认主题的 404 页面 -->
  <DefaultNotFound />
  
  <!-- 
  如果你想自定义 404 页面，可以取消下面的注释并删除上面的 DefaultNotFound：
  
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
  </div>
  -->
</template>
