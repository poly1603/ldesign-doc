# 评论插件

评论系统插件，支持多种**免费**评论服务，无需自建服务器即可为文档添加评论功能。

::: tip 演示模式
即使未配置评论服务，插件也会显示演示界面，方便您预览评论区效果。
:::

## 免费评论方案对比

| 服务 | 数据存储 | 部署难度 | 推荐场景 |
|------|----------|----------|----------|
| **Giscus** ⭐ | GitHub Discussions | ⭐ 极简 | 开源项目、技术文档 |
| **Gitalk** | GitHub Issues | ⭐ 简单 | 个人博客 |
| **Waline** | Vercel + LeanCloud | ⭐⭐ 中等 | 需要邮件通知 |
| **Twikoo** | Vercel/腾讯云 | ⭐⭐ 中等 | 国内访问 |
| **Artalk** | 自托管 Docker | ⭐⭐⭐ 复杂 | 完全自主控制 |

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

### Giscus ⭐ 推荐

基于 GitHub Discussions，**零成本、零服务器**，最推荐的方案。

#### 配置步骤

1. **启用 Discussions**
   - 进入你的 GitHub 仓库 → Settings → Features
   - 勾选 "Discussions" 启用讨论功能

2. **安装 Giscus App**
   - 访问 [github.com/apps/giscus](https://github.com/apps/giscus)
   - 点击 "Install" 安装到你的仓库

3. **获取配置参数**
   - 访问 [giscus.app/zh-CN](https://giscus.app/zh-CN)
   - 填写仓库信息，自动生成 `repoId` 和 `categoryId`

4. **配置插件**

```ts
commentPlugin({
  provider: 'giscus',
  giscus: {
    repo: 'your-name/your-repo',      // 仓库名
    repoId: 'R_kgDOxxxxxx',           // 从 giscus.app 获取
    category: 'Announcements',         // 讨论分类
    categoryId: 'DIC_kwDOxxxxxx',     // 从 giscus.app 获取
    mapping: 'pathname',               // 页面映射方式
    strict: true,                      // 严格匹配
    reactionsEnabled: true,            // 启用表情反应
    inputPosition: 'top',              // 输入框位置
    theme: 'preferred_color_scheme',   // 主题跟随系统
    lang: 'zh-CN'                      // 语言
  }
})
```

::: details Giscus 配置参数详解
| 参数 | 说明 | 可选值 |
|------|------|--------|
| `mapping` | 页面与讨论的映射方式 | `pathname`、`url`、`title`、`og:title` |
| `theme` | 评论区主题 | `light`、`dark`、`preferred_color_scheme`、自定义CSS URL |
| `inputPosition` | 评论输入框位置 | `top`、`bottom` |
:::

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
  title: '评论'            // 评论区标题
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
- **默认值**: `'评论'`

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
