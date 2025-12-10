# API 参考

本节包含 LDoc 的完整 API 文档。

## 配置 API

### defineConfig

用于定义配置文件，提供类型提示：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  // ...
})
```

### defineConfigWithTheme

带自定义主题配置类型的配置定义：

```ts
import { defineConfigWithTheme } from '@ldesign/doc'
import type { MyThemeConfig } from './theme'

export default defineConfigWithTheme<MyThemeConfig>({
  themeConfig: {
    // 自定义主题配置，带类型提示
  }
})
```

## 主题 API

### defineTheme

用于定义自定义主题：

```ts
import { defineTheme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

export default defineTheme({
  Layout,
  NotFound,
  enhanceApp({ app, router, siteData }) {
    // 增强应用
  }
})
```

## 插件 API

### definePlugin

用于定义插件：

```ts
import { definePlugin } from '@ldesign/doc'

export default definePlugin({
  name: 'my-plugin',
  
  config(config) {
    return config
  },
  
  extendMarkdown(md) {
    // 扩展 Markdown
  }
})
```
