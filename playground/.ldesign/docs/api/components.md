# 内置组件

LDoc 提供了一系列内置组件。

## Content

渲染当前页面的 Markdown 内容。

```vue
<template>
  <Content />
</template>

<script setup>
import { Content } from '@ldesign/doc/client'
</script>
```

## PluginSlot

渲染指定位置的插件组件。

```vue
<template>
  <PluginSlot name="doc-after" />
</template>

<script setup>
import { PluginSlot } from '@ldesign/doc/client'
</script>
```

**可用位置**：

| 名称 | 位置 |
|------|------|
| `nav-bar-logo-after` | Logo 之后 |
| `nav-bar-content-before` | 导航内容之前 |
| `nav-bar-content-after` | 导航内容之后 |
| `sidebar-top` | 侧边栏顶部 |
| `sidebar-bottom` | 侧边栏底部 |
| `aside-top` | 右侧栏顶部 |
| `aside-bottom` | 右侧栏底部 |
| `doc-before` | 文档内容之前 |
| `doc-after` | 文档内容之后 |
| `doc-top` | 文档顶部 |
| `doc-bottom` | 文档底部 |
| `doc-footer-before` | 页脚之前 |
| `doc-footer-after` | 页脚之后 |
| `layout-top` | 布局顶部 |
| `layout-bottom` | 布局底部 |
| `home-hero-before` | 首页 Hero 之前 |
| `home-hero-after` | 首页 Hero 之后 |
| `home-features-before` | 首页特性之前 |
| `home-features-after` | 首页特性之后 |

## PluginUI

渲染 Toast、Loading、Modal 等 UI。

```vue
<template>
  <PluginUI />
</template>

<script setup>
import { PluginUI } from '@ldesign/doc/client'
</script>
```

> 主题布局通常已包含此组件。

## ClientOnly

仅在客户端渲染的组件。

```vue
<template>
  <ClientOnly>
    <BrowserOnlyComponent />
  </ClientOnly>
</template>

<script setup>
import { ClientOnly } from '@ldesign/doc/client'
</script>
```

## OutboundLink

外部链接组件，自动添加图标和 `target="_blank"`。

```vue
<template>
  <OutboundLink href="https://github.com">GitHub</OutboundLink>
</template>
```

## CodeGroup

代码组容器。

```md
::: code-group

```bash [npm]
npm install @ldesign/doc
```

```bash [pnpm]
pnpm add @ldesign/doc
```

:::
```

## CodeBlock

代码块组件。

```vue
<template>
  <CodeBlock 
    lang="ts" 
    :code="code"
    :line-numbers="true"
    :highlight-lines="[2, 4]"
  />
</template>
```

## Demo

Vue 组件演示。

```md
<Demo src="./examples/Button.vue" />
```

**Props**：

| 属性 | 类型 | 说明 |
|------|------|------|
| `src` | `string` | 组件路径 |
| `title` | `string` | 标题 |
| `desc` | `string` | 描述 |
| `showCode` | `boolean` | 默认显示代码 |

## Badge

徽章组件。

```md
<Badge text="新功能" type="tip" />
<Badge text="实验性" type="warning" />
<Badge text="已废弃" type="danger" />
```

**Props**：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | - | 文本 |
| `type` | `'tip' \| 'warning' \| 'danger' \| 'info'` | `'tip'` | 类型 |

## 自定义组件

在 Markdown 中使用自定义组件：

```md
<script setup>
import MyComponent from '../components/MyComponent.vue'
</script>

# 我的页面

<MyComponent :count="5" />
```

或通过插件注册全局组件：

```ts
// 插件中
globalComponents: [
  { name: 'MyComponent', component: MyComponent }
]
```

```md
<!-- Markdown 中直接使用 -->
<MyComponent />
```
