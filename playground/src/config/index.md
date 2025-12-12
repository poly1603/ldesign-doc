---
title: 站点配置
---

# 站点配置

站点配置在 `doc.config.ts` 文件中定义，使用 `defineConfig` 获得完整的类型提示。

## 基础配置

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  // 站点标题
  title: 'My Docs',
  
  // 站点描述（用于 SEO）
  description: 'A documentation site powered by @ldesign/doc',
  
  // 站点语言
  lang: 'zh-CN',
  
  // 基础路径（如果部署到子目录）
  base: '/',
  
  // 源文件目录
  srcDir: 'src',
  
  // 输出目录
  outDir: 'dist',
  
  // 是否忽略死链接
  ignoreDeadLinks: false,
  
  // 最后更新时间
  lastUpdated: true
})
```

## 完整配置参考

### `title`

- 类型：`string`
- 默认值：`'Documentation'`

站点标题，会显示在浏览器标签页和导航栏。

### `description`

- 类型：`string`
- 默认值：`''`

站点描述，用于 SEO 的 meta 标签。

### `lang`

- 类型：`string`
- 默认值：`'en-US'`

站点语言，用于 HTML 的 `lang` 属性和国际化。

### `base`

- 类型：`string`
- 默认值：`'/'`

站点部署的基础路径。如果你计划部署到 `https://example.com/docs/`，则设置为 `'/docs/'`。

```ts
export default defineConfig({
  base: '/docs/'
})
```

### `srcDir`

- 类型：`string`
- 默认值：`'src'`

Markdown 源文件目录，相对于项目根目录。

### `outDir`

- 类型：`string`
- 默认值：`'dist'`

构建输出目录。

### `cacheDir`

- 类型：`string`
- 默认值：`'.ldesign'`

缓存目录，存放构建过程中的临时文件。

### `ignoreDeadLinks`

- 类型：`boolean | 'localhostLinks'`
- 默认值：`false`

设置为 `true` 时，构建不会因为死链接而失败。

### `lastUpdated`

- 类型：`boolean`
- 默认值：`false`

是否显示页面的最后更新时间。需要 Git 支持。

### `cleanUrls`

- 类型：`boolean`
- 默认值：`false`

启用后，URL 将不包含 `.html` 后缀。

```ts
export default defineConfig({
  cleanUrls: true
})
```

| cleanUrls | 生成的 URL |
|-----------|----------|
| `false` | `/guide/index.html` |
| `true` | `/guide/` |

### `head`

- 类型：`HeadConfig[]`

额外的 `<head>` 标签：

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['script', { src: 'https://example.com/analytics.js' }]
  ]
})
```

### `markdown`

Markdown 解析器配置：

```ts
export default defineConfig({
  markdown: {
    // 代码块主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    
    // 启用数学公式
    math: true,
    
    // 代码块行号
    lineNumbers: true,
    
    // 自定义锚点
    anchor: {
      permalink: true
    },
    
    // 目录配置
    toc: {
      level: [2, 3]
    }
  }
})
```

### `vite`

Vite 配置扩展：

```ts
export default defineConfig({
  vite: {
    plugins: [
      // 额外的 Vite 插件
    ],
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})
```

### `plugins`

插件配置，详见 [插件系统](/plugins/)：

```ts
import { defineConfig } from '@ldesign/doc'
import { searchPlugin, commentPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin(),
    commentPlugin({
      provider: 'giscus',
      giscus: { /* ... */ }
    })
  ]
})
```

### `themeConfig`

主题配置，详见 [主题配置](/config/theme)。

## 环境变量

可以在配置中使用环境变量：

```ts
export default defineConfig({
  title: process.env.SITE_TITLE || 'My Docs',
  
  themeConfig: {
    // 仅在生产环境显示广告
    carbonAds: process.env.NODE_ENV === 'production' 
      ? { code: 'xxx' } 
      : undefined
  }
})
```

## TypeScript 配置

推荐的 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "doc.config.ts"]
}
```
