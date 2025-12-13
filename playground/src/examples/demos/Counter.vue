<template>
  <div class="demo-counter">
    <button class="btn" @click="count--">-</button>
    <span class="count">{{ count }}</span>
    <button class="btn" @click="count++">+</button>
    <span class="double">双倍: {{ doubleCount }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
</script>

<style scoped>
.demo-counter {
  display: flex;
  align-items: center;
  gap: 12px;
}
.count {
  font-size: 20px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}
.double {
  color: #666;
  margin-left: 16px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #3451b2;
  color: white;
  cursor: pointer;
  font-size: 16px;
}
.btn:hover {
  opacity: 0.9;
}
</style>
