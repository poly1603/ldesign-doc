# React 插件

`reactPlugin` 用于在 Markdown 中增强 React 代码块/演示能力。

## 安装

```ts
import { reactPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    reactPlugin({
      version: '18',
      strictMode: true
    })
  ]
})
```

## 配置选项

- **`version`**: `'17' | '18'`

  React 版本标识。

- **`strictMode`**: `boolean`

  是否启用 StrictMode（演示用）。

## 注意

当前插件主要演示 `tsx demo` / `jsx demo` fence 的处理能力；更完整的 React 组件演示推荐使用 `demoPlugin`。
