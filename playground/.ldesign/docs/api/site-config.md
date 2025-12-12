# 站点配置

站点配置在 `doc.config.ts` 中定义，使用 `defineConfig` 获得类型提示。

## 基础配置

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  description: '我的文档站点',
  lang: 'zh-CN',
  base: '/'
})
```

## 完整配置

### title

- **类型**: `string`
- **默认值**: `'Documentation'`

站点标题，显示在浏览器标签页和导航栏。

### description

- **类型**: `string`
- **默认值**: `''`

站点描述，用于 SEO。

### lang

- **类型**: `string`
- **默认值**: `'en-US'`

站点语言。

### base

- **类型**: `string`
- **默认值**: `'/'`

部署的基础路径。如果部署到 `https://example.com/docs/`，设置为 `'/docs/'`。

### srcDir

- **类型**: `string`
- **默认值**: `'docs'` 或 `'src'`

文档源文件目录。

### outDir

- **类型**: `string`
- **默认值**: `'dist'`

构建输出目录。

### cacheDir

- **类型**: `string`
- **默认值**: `'.ldesign'`

缓存目录。

### cleanUrls

- **类型**: `boolean`
- **默认值**: `false`

启用后 URL 不包含 `.html` 后缀。

### lastUpdated

- **类型**: `boolean`
- **默认值**: `false`

显示页面最后更新时间。

### head

- **类型**: `HeadConfig[]`

额外的 `<head>` 标签：

```ts
export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }]
  ]
})
```

### markdown

Markdown 解析配置：

```ts
export default defineConfig({
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    math: true,
    anchor: { permalink: true },
    toc: { level: [2, 3] }
  }
})
```

### vite

Vite 配置扩展：

```ts
export default defineConfig({
  vite: {
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    resolve: {
      alias: { '@': '/src' }
    }
  }
})
```

### plugins

插件配置：

```ts
import { searchPlugin, commentPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    searchPlugin(),
    commentPlugin({ provider: 'giscus', giscus: { /* ... */ } })
  ]
})
```

### themeConfig

主题配置，详见 [主题配置](/api/theme-config)。

## 环境变量

可以使用环境变量：

```ts
export default defineConfig({
  title: process.env.SITE_TITLE || 'My Docs'
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
    "strict": true
  },
  "include": ["docs/**/*", "doc.config.ts"]
}
```
