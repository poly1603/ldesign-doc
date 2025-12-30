# 公告栏插件

`announcementPlugin` 用于在站点顶部展示一条公告信息（支持链接、可关闭、记忆关闭状态）。

## 安装

```ts
import { announcementPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    announcementPlugin({
      content: '这是公告内容',
      type: 'info',
      closable: true,
      storageKey: 'my-announcement',
      link: '/examples/',
      linkText: '查看示例'
    })
  ]
})
```

## 配置选项

- **`content`**: `string`

  公告内容（支持 HTML）。

- **`type`**: `'info' | 'warning' | 'success' | 'error'`

  公告的语义类型（影响默认配色）。

- **`closable`**: `boolean`

  是否允许用户关闭公告。

- **`storageKey`**: `string`

  用于记忆关闭状态的 key（为空则不记忆）。

- **`link`**: `string`

  公告右侧链接地址（可选）。

- **`linkText`**: `string`

  链接文案（可选）。

- **`backgroundColor`**: `string`

  自定义背景色。

- **`textColor`**: `string`

  自定义文字颜色。

- **`followTheme`**: `boolean`

  是否跟随主题色。
