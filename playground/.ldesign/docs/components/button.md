# Button 按钮

按钮用于触发一个操作。

## 基础用法

::: demo
```vue
<template>
  <div class="button-group">
    <button class="btn">默认按钮</button>
    <button class="btn btn-primary">主要按钮</button>
    <button class="btn btn-success">成功按钮</button>
    <button class="btn btn-warning">警告按钮</button>
    <button class="btn btn-danger">危险按钮</button>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background: #5468ff;
  color: white;
  border-color: #5468ff;
}

.btn-success {
  background: #42b883;
  color: white;
  border-color: #42b883;
}

.btn-warning {
  background: #e2c500;
  color: white;
  border-color: #e2c500;
}

.btn-danger {
  background: #f44747;
  color: white;
  border-color: #f44747;
}
</style>
```
:::

## 禁用状态

::: demo
```vue
<template>
  <div class="button-group">
    <button class="btn" disabled>禁用按钮</button>
    <button class="btn btn-primary" disabled>禁用主要</button>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #5468ff;
  color: white;
  border-color: #5468ff;
}
</style>
```
:::

## 按钮尺寸

::: demo
```vue
<template>
  <div class="button-group">
    <button class="btn btn-primary btn-sm">小按钮</button>
    <button class="btn btn-primary">默认按钮</button>
    <button class="btn btn-primary btn-lg">大按钮</button>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #5468ff;
  color: white;
  border-color: #5468ff;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}
</style>
```
:::

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| size | 按钮尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| disabled | 是否禁用 | `boolean` | `false` |
| loading | 是否加载中 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击按钮时触发 | `(event: MouseEvent)` |
