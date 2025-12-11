# 插件开发

LDoc 的插件系统让你可以扩展文档系统的功能。

## 创建插件

使用 `definePlugin` 创建插件：

```ts
import { definePlugin } from '@ldesign/doc'

export default definePlugin({
  name: 'my-plugin',
  
  // 修改配置
  config(config) {
    return {
      ...config,
      title: 'Modified Title'
    }
  },
  
  // 扩展 Markdown
  extendMarkdown(md) {
    md.use(myMarkdownPlugin)
  },
  
  // 扩展页面数据
  extendPageData(pageData) {
    pageData.customField = 'value'
  },
  
  // 构建钩子
  buildStart(config) {
    console.log('Build started')
  },
  
  buildEnd(config) {
    console.log('Build completed')
  }
})
```

## 使用插件

在配置文件中使用插件：

```ts
import { defineConfig } from '@ldesign/doc'
import myPlugin from './my-plugin'

export default defineConfig({
  plugins: [
    myPlugin()
  ]
})
```

## 内置插件

### Vue 组件演示

```ts
import { vuePlugin } from '@ldesign/doc/plugin-vue'

export default defineConfig({
  plugins: [
    vuePlugin()
  ]
})
```

### React 组件演示

```ts
import { reactPlugin } from '@ldesign/doc/plugin-react'

export default defineConfig({
  plugins: [
    reactPlugin()
  ]
})
```

### 认证插件

```ts
import { authPlugin } from '@ldesign/doc/plugins/auth'

export default defineConfig({
  plugins: [
    authPlugin({
      protectedRoutes: ['/admin/*'],
      loginPage: '/login'
    })
  ]
})
```

## 插件钩子

| 钩子 | 描述 |
|------|------|
| `config` | 修改用户配置 |
| `configResolved` | 配置解析完成后 |
| `extendMarkdown` | 扩展 Markdown 渲染器 |
| `extendPageData` | 扩展页面数据 |
| `extendRoutes` | 扩展路由 |
| `buildStart` | 构建开始时 |
| `buildEnd` | 构建结束时 |
| `handleHotUpdate` | 热更新时 |

## Vite 插件集成

插件可以返回 Vite 插件：

```ts
export default definePlugin({
  name: 'my-plugin',
  
  vitePlugins() {
    return [
      myVitePlugin()
    ]
  }
})
```
