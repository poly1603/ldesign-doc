# Basic Vue Components

Use Vue components directly in your Markdown files.

## Inline Component

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

Click count: **{{ count }}**

<button @click="count++" style="padding: 8px 16px; background: var(--ldoc-c-brand); color: white; border: none; border-radius: 4px; cursor: pointer;">
  Click me
</button>

## Component Definition

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">
    Count: {{ count }}
  </button>
</template>
```

## Reactive Data

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>

<div style="display: flex; gap: 8px; margin: 16px 0;">
  <input v-model="firstName" placeholder="First name" style="padding: 8px; border: 1px solid var(--ldoc-c-divider); border-radius: 4px;">
  <input v-model="lastName" placeholder="Last name" style="padding: 8px; border: 1px solid var(--ldoc-c-divider); border-radius: 4px;">
</div>

Full name: **{{ fullName }}**

## Conditional Rendering

<script setup>
import { ref } from 'vue'

const show = ref(true)
</script>

<button @click="show = !show" style="padding: 8px 16px; background: var(--ldoc-c-brand); color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 16px;">
  Toggle
</button>

<div v-if="show" style="padding: 16px; background: var(--ldoc-c-bg-soft); border-radius: 8px;">
  ✨ This content can be toggled!
</div>

## List Rendering

<script setup>
import { ref } from 'vue'

const items = ref(['Apple', 'Banana', 'Cherry', 'Date'])
</script>

<ul>
  <li v-for="(item, index) in items" :key="index">
    {{ index + 1 }}. {{ item }}
  </li>
</ul>

## Styling Components

<div style="padding: 20px; background: linear-gradient(135deg, var(--ldoc-c-brand-soft), var(--ldoc-c-bg-soft)); border-radius: 12px; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: var(--ldoc-c-brand);">Styled Component</h3>
  <p style="margin: 0; color: var(--ldoc-c-text-2);">With gradient background and custom styling</p>
</div>
