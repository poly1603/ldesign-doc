# 社交分享插件

`socialSharePlugin` 用于在文档页注入一组分享按钮（Twitter / Facebook / LinkedIn / 微博等）。

## 安装

```ts
import { socialSharePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    socialSharePlugin({
      showAtBottom: true
    })
  ]
})
```

## 配置

```ts
socialSharePlugin({
  platforms: ['twitter', 'facebook', 'linkedin', 'weibo'],
  titleTemplate: '{title}',
  showAtBottom: true,
  showInSidebar: false
})
```

## 配置选项

- **`platforms`**: `Array<'twitter' | 'facebook' | 'linkedin' | 'weibo' | 'wechat' | 'qq' | 'telegram' | 'reddit' | 'email'>`

  启用的分享平台列表。

- **`titleTemplate`**: `string`

  分享标题模板，`{title}` 会被替换为 `document.title`。

- **`showAtBottom`**: `boolean`

  是否在文章底部注入分享组件。

- **`showInSidebar`**: `boolean`

  是否在侧边栏注入分享组件（如果主题插槽支持）。
