<template>
  <div class="btn-group">
    <button class="btn">默认</button>
    <button class="btn btn-primary">主要</button>
    <button class="btn btn-success">成功</button>
    <button class="btn btn-warning">警告</button>
    <button class="btn btn-danger">危险</button>
  </div>
</template>

<style scoped>
.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.btn:hover {
  opacity: 0.8;
}
.btn-primary {
  background: #3451b2;
  color: white;
  border-color: #3451b2;
}
.btn-success {
  background: #10b981;
  color: white;
  border-color: #10b981;
}
.btn-warning {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}
.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
