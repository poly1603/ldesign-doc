# 标签系统插件

`tagsPlugin` 会在构建阶段扫描页面的 `frontmatter.tags`，生成标签页与标签云页，并输出索引数据。

## 安装

```ts
import { tagsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    tagsPlugin({
      enabled: true,
      tagPagePrefix: '/tags',
      generateTagCloud: true,
      tagCloudPath: '/tags.html'
    })
  ]
})
```

## 配置选项

- **`enabled`**: `boolean`

  是否启用。

- **`tagPagePrefix`**: `string`

  单个标签页面的路径前缀（默认 `/tags`）。

- **`generateTagCloud`**: `boolean`

  是否生成标签云页面。

- **`tagCloudPath`**: `string`

  标签云页面路径（默认 `/tags.html`）。

## Frontmatter 示例

```yaml
---
tags:
  - plugin
  - guide
---
```

## 注意

该插件会在构建输出目录生成 HTML 页面与 `tag-index.json`。Playground 默认关闭，避免生成额外页面影响演示结构。
