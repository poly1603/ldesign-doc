# 评论插件

评论系统插件，支持多种评论服务。

## 安装

```ts
import { commentPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    commentPlugin({
      provider: 'giscus',
      giscus: { /* 配置 */ }
    })
  ]
})
```

## 支持的服务

### Giscus

基于 GitHub Discussions，推荐使用。

```ts
commentPlugin({
  provider: 'giscus',
  giscus: {
    repo: 'owner/repo',
    repoId: 'R_xxx',
    category: 'Announcements',
    categoryId: 'DIC_xxx',
    mapping: 'pathname',
    strict: true,
    reactionsEnabled: true,
    inputPosition: 'bottom',
    theme: 'preferred_color_scheme',
    lang: 'zh-CN'
  }
})
```

获取配置：访问 [giscus.app](https://giscus.app/zh-CN)

### Gitalk

基于 GitHub Issues。

```ts
commentPlugin({
  provider: 'gitalk',
  gitalk: {
    clientID: 'xxx',
    clientSecret: 'xxx',
    repo: 'repo-name',
    owner: 'owner',
    admin: ['owner'],
    language: 'zh-CN',
    distractionFreeMode: false
  }
})
```

### Waline

独立部署的评论系统。

```ts
commentPlugin({
  provider: 'waline',
  waline: {
    serverURL: 'https://your-waline.vercel.app',
    lang: 'zh-CN',
    dark: 'auto',
    emoji: ['https://unpkg.com/@waline/emojis@1.1.0/weibo'],
    requiredMeta: ['nick', 'mail'],
    login: 'enable'
  }
})
```

部署教程：[waline.js.org](https://waline.js.org)

### Twikoo

腾讯云 / Vercel 部署。

```ts
commentPlugin({
  provider: 'twikoo',
  twikoo: {
    envId: 'your-env-id',
    region: 'ap-shanghai',
    lang: 'zh-CN'
  }
})
```

### Artalk

自托管评论系统。

```ts
commentPlugin({
  provider: 'artalk',
  artalk: {
    server: 'https://your-artalk.com',
    site: 'My Site',
    pageKey: '',
    darkMode: 'auto'
  }
})
```

## 通用配置

```ts
commentPlugin({
  provider: 'giscus',
  giscus: { /* ... */ },
  
  // 通用选项
  position: 'doc-after',     // 显示位置
  exclude: ['/'],            // 排除的页面
  include: ['/guide/*'],     // 仅在这些页面显示
  showOnHome: false,         // 首页是否显示
  title: '💬 评论'            // 评论区标题
})
```

### position

- **类型**: `string`
- **默认值**: `'doc-after'`

评论区显示位置。

### exclude

- **类型**: `string[]`
- **默认值**: `[]`

排除的页面路径。

### include

- **类型**: `string[]`
- **默认值**: 全部页面

仅在这些页面显示。

### showOnHome

- **类型**: `boolean`
- **默认值**: `false`

首页是否显示评论。

### title

- **类型**: `string`
- **默认值**: `'💬 评论'`

评论区标题。

## 页面禁用

在 frontmatter 中禁用特定页面的评论：

```yaml
---
comments: false
---
```

## 自定义样式

```css
/* 评论区容器 */
.ldoc-comment {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--ldoc-c-divider);
}

/* 评论区标题 */
.ldoc-comment-title {
  font-size: 1.25rem;
  margin-bottom: 16px;
}
```
