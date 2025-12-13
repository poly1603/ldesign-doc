---
title: 基础 Vue 组件
---

# 基础 Vue 组件

LDoc 支持在 Markdown 中渲染 Vue 组件并查看源代码。

## 计数器示例（引用外部文件）

使用 `src` 属性引用外部 Vue 文件：

```vue-demo src="../demos/Counter.vue"
```

## 内联代码示例

直接在代码块中编写 Vue 代码：

```vue-demo
<template>
  <div class="inline-demo">
    <button @click="count++">点击了 {{ count }} 次</button>
    <p>这是内联 Vue 代码示例</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<style scoped>
.inline-demo {
  padding: 16px;
  text-align: center;
}
.inline-demo button {
  padding: 8px 16px;
  background: #3451b2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.inline-demo p {
  margin-top: 12px;
  color: #666;
}
</style>
```

## 按钮样式

展示不同样式的按钮组件：

```vue-demo src="../demos/Buttons.vue"
```
