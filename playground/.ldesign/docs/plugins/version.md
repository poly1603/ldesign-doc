# 版本管理插件

`versionPlugin` 用于管理多版本文档，并在导航栏或侧边栏提供版本选择器。

## 安装

```ts
import { versionPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    versionPlugin({
      versions: [
        { version: '2.0.0', path: '/v2/', label: 'v2.x' },
        { version: '1.0.0', path: '/v1/', label: 'v1.x', deprecated: true }
      ],
      current: '2.0.0',
      aliases: {
        latest: '2.0.0',
        stable: '2.0.0',
        legacy: '1.0.0'
      },
      selectorPosition: 'nav'
    })
  ]
})
```

## 配置选项

- **`versions`**: `VersionItem[]`

  版本列表，每项包含 `version`、`path`、可选 `label/prerelease/releaseDate/deprecated`。

- **`current`**: `string`

  当前版本。

- **`aliases`**: `Record<string, string>`

  别名映射，例如 `latest/stable/next`。

- **`selectorPosition`**: `'nav' | 'sidebar'`

  版本选择器注入位置。

- **`deprecation`**: `{ versions: string[]; message?: string; recommendedVersion?: string }`

  废弃版本提示配置。

## 提示

在 Playground 中我们用单版本配置演示插件注入能力；实际项目建议结合目录结构 `/v1/` `/v2/` 组织多版本内容。
