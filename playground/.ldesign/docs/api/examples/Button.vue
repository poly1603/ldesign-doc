<template>
  <button class="demo-button" @click="count++">
    Clicked {{ count }} times
  </button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.demo-button {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.demo-button:hover {
  background-color: #2563eb;
}
</style>
