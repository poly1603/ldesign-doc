---
title: 交互式组件
---

# 交互式组件

展示各种交互式 Vue 组件示例。

## 滑块控件

```vue
<script setup>
import { ref, computed } from 'vue'

const sliderValue = ref(50)
const progressStyle = computed(() => ({
  width: sliderValue.value + '%'
}))
</script>

<template>
  <div class="demo-box">
    <input type="range" v-model="sliderValue" min="0" max="100" />
    <p>当前值: {{ sliderValue }}</p>
    <div class="progress-bar">
      <div class="progress-fill" :style="progressStyle"></div>
    </div>
  </div>
</template>
```

## Todo 列表

```vue
<script setup>
import { ref, computed } from 'vue'

const newTodo = ref('')
const todos = ref([
  { id: 1, text: '学习 Vue 3', done: true },
  { id: 2, text: '阅读文档', done: false }
])

function addTodo() {
  if (!newTodo.value.trim()) return
  todos.value.push({
    id: Date.now(),
    text: newTodo.value,
    done: false
  })
  newTodo.value = ''
}

const completedCount = computed(() => 
  todos.value.filter(t => t.done).length
)
</script>

<template>
  <div class="todo-app">
    <input v-model="newTodo" @keyup.enter="addTodo" />
    <button @click="addTodo">添加</button>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input type="checkbox" v-model="todo.done" />
        <span :class="{ done: todo.done }">{{ todo.text }}</span>
      </li>
    </ul>
    <p>完成: {{ completedCount }} / {{ todos.length }}</p>
  </div>
</template>
```

## 评分组件

```vue
<script setup>
import { ref } from 'vue'

const rating = ref(0)
</script>

<template>
  <div class="rating">
    <span 
      v-for="i in 5" 
      :key="i"
      class="star"
      :class="{ active: i <= rating }"
      @click="rating = i"
    >★</span>
  </div>
  <p>评分: {{ rating }} / 5</p>
</template>

<style>
.star {
  cursor: pointer;
  color: #ccc;
  font-size: 24px;
}
.star.active {
  color: #f59e0b;
}
</style>
```

## 使用技巧

::: tip 响应式数据
使用 `ref` 和 `reactive` 创建响应式数据，Vue 会自动追踪依赖并更新视图。
:::

::: tip 计算属性
使用 `computed` 创建派生状态，它会根据依赖自动缓存计算结果。
:::
