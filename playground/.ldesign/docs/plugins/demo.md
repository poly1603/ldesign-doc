# 组件演示插件

组件演示插件让你可以在 Markdown 中展示 Vue/React 组件的实际效果和源代码，非常适合组件库文档。

## 基础用法

### 按钮组件

<DemoBox title="基础按钮" description="最基础的按钮组件，支持不同状态" code="<template>
  <div class='button-group'>
    <button class='btn btn-primary'>主要按钮</button>
    <button class='btn btn-success'>成功按钮</button>
    <button class='btn btn-warning'>警告按钮</button>
    <button class='btn btn-danger'>危险按钮</button>
    <button class='btn btn-default'>默认按钮</button>
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
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-primary { background: #3b82f6; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-warning { background: #f59e0b; color: white; }
.btn-danger { background: #ef4444; color: white; }
.btn-default { background: #f3f4f6; color: #374151; }
</style>" language="vue">

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">主要按钮</button>
  <button style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">成功按钮</button>
  <button style="padding: 8px 16px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer;">警告按钮</button>
  <button style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">危险按钮</button>
  <button style="padding: 8px 16px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; cursor: pointer;">默认按钮</button>
</div>

</DemoBox>

### 输入框组件

<DemoBox title="输入框" description="支持多种类型的输入框" code="<template>
  <div class='input-group'>
    <input type='text' class='input' placeholder='请输入文本' />
    <input type='password' class='input' placeholder='请输入密码' />
    <input type='text' class='input input-disabled' placeholder='禁用状态' disabled />
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}
.input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.input-disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}
</style>" language="vue">

<div style="display: flex; flex-direction: column; gap: 12px; max-width: 300px;">
  <input type="text" placeholder="请输入文本" style="padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none;" />
  <input type="password" placeholder="请输入密码" style="padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none;" />
  <input type="text" placeholder="禁用状态" disabled style="padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: #f3f4f6; cursor: not-allowed;" />
</div>

</DemoBox>

### 卡片组件

<DemoBox title="信息卡片" description="常用的卡片布局组件" code="<template>
  <div class='card'>
    <div class='card-header'>
      <img src='https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' class='avatar' />
      <div class='card-info'>
        <h4 class='card-title'>用户名称</h4>
        <span class='card-subtitle'>前端开发工程师</span>
      </div>
    </div>
    <div class='card-body'>
      <p>这是一段卡片描述文字，用于展示卡片组件的基本用法。</p>
    </div>
    <div class='card-footer'>
      <button class='btn-link'>查看详情</button>
      <button class='btn-link'>编辑</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  max-width: 320px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.card-title {
  margin: 0;
  font-size: 16px;
}
.card-subtitle {
  font-size: 13px;
  color: #6b7280;
}
.card-body {
  padding: 16px;
}
.card-body p {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}
.card-footer {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}
.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
}
</style>" language="vue">

<div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; max-width: 320px;">
  <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb;">
    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style="width: 48px; height: 48px; border-radius: 50%;" />
    <div>
      <h4 style="margin: 0; font-size: 16px;">用户名称</h4>
      <span style="font-size: 13px; color: #6b7280;">前端开发工程师</span>
    </div>
  </div>
  <div style="padding: 16px;">
    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">这是一段卡片描述文字，用于展示卡片组件的基本用法。</p>
  </div>
  <div style="display: flex; gap: 16px; padding: 12px 16px; border-top: 1px solid #e5e7eb;">
    <button style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 14px;">查看详情</button>
    <button style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 14px;">编辑</button>
  </div>
</div>

</DemoBox>

### 标签组件

<DemoBox title="标签" description="用于标记和分类的小型标签" code="<template>
  <div class='tag-group'>
    <span class='tag tag-blue'>Vue</span>
    <span class='tag tag-green'>React</span>
    <span class='tag tag-purple'>TypeScript</span>
    <span class='tag tag-orange'>Vite</span>
    <span class='tag tag-red'>Hot</span>
  </div>
</template>

<style scoped>
.tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.tag-blue { background: #dbeafe; color: #1d4ed8; }
.tag-green { background: #d1fae5; color: #047857; }
.tag-purple { background: #ede9fe; color: #6d28d9; }
.tag-orange { background: #ffedd5; color: #c2410c; }
.tag-red { background: #fee2e2; color: #b91c1c; }
</style>" language="vue">

<div style="display: flex; gap: 8px; flex-wrap: wrap;">
  <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #dbeafe; color: #1d4ed8;">Vue</span>
  <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #d1fae5; color: #047857;">React</span>
  <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #ede9fe; color: #6d28d9;">TypeScript</span>
  <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #ffedd5; color: #c2410c;">Vite</span>
  <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #fee2e2; color: #b91c1c;">Hot</span>
</div>

</DemoBox>

### 提示框组件

<DemoBox title="Alert 提示框" description="用于展示重要信息的提示组件" code="<template>
  <div class='alert-group'>
    <div class='alert alert-info'>
      <span class='alert-icon'>ℹ️</span>
      <span>这是一条信息提示</span>
    </div>
    <div class='alert alert-success'>
      <span class='alert-icon'>✅</span>
      <span>操作成功完成！</span>
    </div>
    <div class='alert alert-warning'>
      <span class='alert-icon'>⚠️</span>
      <span>请注意检查您的输入</span>
    </div>
    <div class='alert alert-error'>
      <span class='alert-icon'>❌</span>
      <span>发生错误，请重试</span>
    </div>
  </div>
</template>

<style scoped>
.alert-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}
.alert-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
.alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
</style>" language="vue">

<div style="display: flex; flex-direction: column; gap: 12px;">
  <div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 14px; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
    <span>ℹ️</span>
    <span>这是一条信息提示</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 14px; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">
    <span>✅</span>
    <span>操作成功完成！</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 14px; background: #fffbeb; color: #92400e; border: 1px solid #fde68a;">
    <span>⚠️</span>
    <span>请注意检查您的输入</span>
  </div>
  <div style="display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; font-size: 14px; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;">
    <span>❌</span>
    <span>发生错误，请重试</span>
  </div>
</div>

</DemoBox>

### 徽章组件

<DemoBox title="徽章 Badge" description="用于状态标记或数量提示" code="<template>
  <div class='badge-group'>
    <span class='badge-wrapper'>
      <button class='btn'>消息</button>
      <span class='badge'>5</span>
    </span>
    <span class='badge-wrapper'>
      <button class='btn'>通知</button>
      <span class='badge badge-dot'></span>
    </span>
    <span class='badge-wrapper'>
      <button class='btn'>购物车</button>
      <span class='badge'>99+</span>
    </span>
  </div>
</template>

<style scoped>
.badge-group {
  display: flex;
  gap: 24px;
}
.badge-wrapper {
  position: relative;
  display: inline-block;
}
.btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-dot {
  min-width: 8px;
  width: 8px;
  height: 8px;
  padding: 0;
  top: -2px;
  right: -2px;
}
</style>" language="vue">

<div style="display: flex; gap: 24px;">
  <span style="position: relative; display: inline-block;">
    <button style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">消息</button>
    <span style="position: absolute; top: -8px; right: -8px; min-width: 18px; height: 18px; padding: 0 6px; background: #ef4444; color: white; font-size: 12px; border-radius: 9px; display: flex; align-items: center; justify-content: center;">5</span>
  </span>
  <span style="position: relative; display: inline-block;">
    <button style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">通知</button>
    <span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></span>
  </span>
  <span style="position: relative; display: inline-block;">
    <button style="padding: 8px 16px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">购物车</button>
    <span style="position: absolute; top: -8px; right: -8px; min-width: 18px; height: 18px; padding: 0 6px; background: #ef4444; color: white; font-size: 12px; border-radius: 9px; display: flex; align-items: center; justify-content: center;">99+</span>
  </span>
</div>

</DemoBox>

## 代码块演示

你也可以直接使用代码块来展示代码：

```vue
<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => count.value++
const decrement = () => count.value--
</script>

<style scoped>
.counter {
  display: flex;
  align-items: center;
  gap: 12px;
}

button {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
}
</style>
```

## React 组件示例

```tsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="counter">
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  )
}

export default Counter
```

## 配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | '示例' | 演示标题 |
| description | string | - | 演示描述 |
| code | string | - | 源代码 |
| language | 'vue' \| 'tsx' | 'vue' | 代码语言 |
| expanded | boolean | false | 是否默认展开代码 |

## 插件配置

在 `doc.config.ts` 中启用插件：

```ts
import { defineConfig } from '@ldesign/doc'
import { demoPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    demoPlugin({
      defaultTitle: '示例',
      defaultExpanded: false,
      expandText: '展开代码',
      collapseText: '收起代码'
    })
  ]
})
```
