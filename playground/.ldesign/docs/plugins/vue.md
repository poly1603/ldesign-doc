# Vue 插件

`vuePlugin` 用于在 Markdown 中增强 Vue 代码块/演示能力。

## 安装

```ts
import { vuePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    vuePlugin({
      devtools: true
    })
  ]
})
```

## 配置选项

- **`devtools`**: `boolean`

  是否启用 Vue DevTools（取决于运行环境）。

- **`vueOptions`**: `Record<string, unknown>`

  自定义 Vue 配置（预留）。

## 注意

当前插件主要演示 `vue demo` fence 的处理能力；更完整的 Vue 组件演示推荐使用 `demoPlugin` 与 `componentPlaygroundPlugin`。
