# 反馈插件

`feedbackPlugin` 用于收集文档反馈（是否有帮助 / 评分 / 表单 / 内联建议），并支持多种存储方式。

## 安装

```ts
import { feedbackPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    feedbackPlugin({
      type: 'helpful',
      storage: { type: 'local' },
      position: 'doc-bottom',
      enableInDev: true
    })
  ]
})
```

## 配置选项

- **`type`**: `'helpful' | 'rating' | 'form' | 'inline'`

  反馈形式。

- **`storage`**: `{ type: 'local' | 'api' | 'github', ... }`

  存储方式：

  - `local`：写入 localStorage
  - `api`：POST 到 endpoint
  - `github`：创建 GitHub Issue

- **`position`**: `'doc-bottom' | 'doc-footer' | 'floating'`

  注入位置。

- **`contributors`**

  可选：从 Git 提取贡献者信息并展示。

## 注意

Playground 默认使用 `local` 存储，并关闭 contributors，避免依赖 Git 环境与外部服务。
