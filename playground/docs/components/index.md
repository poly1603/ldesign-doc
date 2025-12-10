# 组件演示

本节展示 LDoc 中的组件演示功能。

## Vue 组件演示

在 Markdown 中使用 `::: demo` 容器来展示 Vue 组件：

::: demo
```vue
<template>
  <button @click="count++">
    点击次数: {{ count }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```
:::

## 代码高亮

支持多种语言的代码高亮：

```typescript
interface User {
  id: number
  name: string
  email: string
}

function greet(user: User): string {
  return `Hello, ${user.name}!`
}
```

```vue
<template>
  <div class="component">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.component {
  padding: 20px;
}
</style>
```

## 提示块

::: tip 提示
这是一个提示信息。
:::

::: warning 警告
这是一个警告信息。
:::

::: danger 危险
这是一个危险提示。
:::

::: info 信息
这是一个普通信息。
:::

::: details 点击展开
这是折叠的详细内容。

可以包含多段落和代码：

```js
console.log('Hello!')
```
:::

## 代码组

::: code-group
```js [JavaScript]
function hello() {
  console.log('Hello!')
}
```

```ts [TypeScript]
function hello(): void {
  console.log('Hello!')
}
```

```vue [Vue]
<template>
  <button @click="hello">Say Hello</button>
</template>
```
:::
