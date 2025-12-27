# Version Plugin

版本管理插件，支持多版本文档管理、版本选择器、版本别名和废弃版本警告。

## 功能特性

- ✅ 版本选择器（导航栏或侧边栏）
- ✅ 版本别名解析（latest、stable、next 等）
- ✅ 废弃版本警告横幅
- ✅ 多版本构建支持
- ✅ 版本清单自动生成
- ✅ 版本切换回调

## 安装使用

```ts
import { defineConfig } from '@ldesign/doc'
import { versionPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    versionPlugin({
      // 版本列表
      versions: [
        { 
          version: '2.0.0', 
          path: '/v2/', 
          label: 'v2.x',
          releaseDate: '2024-01-15'
        },
        { 
          version: '1.0.0', 
          path: '/v1/', 
          label: 'v1.x',
          deprecated: true,
          releaseDate: '2023-06-01'
        }
      ],
      
      // 当前版本
      current: '2.0.0',
      
      // 版本别名
      aliases: {
        latest: '2.0.0',
        stable: '2.0.0',
        legacy: '1.0.0'
      },
      
      // 版本选择器位置
      selectorPosition: 'nav', // 'nav' | 'sidebar'
      
      // 废弃版本警告
      deprecation: {
        versions: ['1.0.0'],
        message: 'This version is deprecated. Please upgrade to v2.x',
        recommendedVersion: '2.0.0'
      },
      
      // 版本切换回调
      onVersionChange: (from, to) => {
        console.log(`Version changed from ${from} to ${to}`)
      }
    })
  ]
})
```

## 配置选项

### VersionPluginOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `versions` | `VersionItem[]` | **必填** | 版本列表 |
| `current` | `string` | **必填** | 当前版本 |
| `aliases` | `Record<string, string>` | `{}` | 版本别名映射 |
| `selectorPosition` | `'nav' \| 'sidebar'` | `'nav'` | 版本选择器位置 |
| `deprecation` | `DeprecationConfig` | - | 废弃版本配置 |
| `onVersionChange` | `(from, to) => void` | - | 版本切换回调 |
| `manifestFileName` | `string` | `'version-manifest.json'` | 清单文件名 |

### VersionItem

| 选项 | 类型 | 说明 |
|------|------|------|
| `version` | `string` | 版本号 |
| `path` | `string` | 文档路径前缀 |
| `label` | `string` | 显示标签（可选） |
| `prerelease` | `boolean` | 是否为预发布版本 |
| `releaseDate` | `string` | 发布日期（ISO 格式） |
| `deprecated` | `boolean` | 是否已废弃 |

### DeprecationConfig

| 选项 | 类型 | 说明 |
|------|------|------|
| `versions` | `string[]` | 废弃的版本列表 |
| `message` | `string` | 警告消息 |
| `recommendedVersion` | `string` | 推荐的版本 |

## 使用示例

### 基础配置

```ts
versionPlugin({
  versions: [
    { version: '2.0.0', path: '/v2/' },
    { version: '1.0.0', path: '/v1/' }
  ],
  current: '2.0.0'
})
```

### 完整配置

```ts
versionPlugin({
  versions: [
    { 
      version: '3.0.0', 
      path: '/v3/', 
      label: 'v3.x (Beta)',
      prerelease: true,
      releaseDate: '2024-12-01'
    },
    { 
      version: '2.0.0', 
      path: '/v2/', 
      label: 'v2.x',
      releaseDate: '2024-01-15'
    },
    { 
      version: '1.0.0', 
      path: '/v1/', 
      label: 'v1.x (Legacy)',
      deprecated: true,
      releaseDate: '2023-06-01'
    }
  ],
  current: '2.0.0',
  aliases: {
    latest: '2.0.0',
    stable: '2.0.0',
    next: '3.0.0',
    legacy: '1.0.0'
  },
  selectorPosition: 'nav',
  deprecation: {
    versions: ['1.0.0'],
    message: 'Version 1.x is no longer maintained. Please upgrade to v2.x for the latest features and security updates.',
    recommendedVersion: '2.0.0'
  },
  onVersionChange: (from, to) => {
    // 记录版本切换事件
    console.log(`User switched from ${from} to ${to}`)
    
    // 可以发送分析事件
    if (window.gtag) {
      window.gtag('event', 'version_change', {
        from_version: from,
        to_version: to
      })
    }
  }
})
```

## 工具函数

### resolveVersionAlias

解析版本别名为实际版本号。

```ts
import { resolveVersionAlias } from '@ldesign/doc/plugins'

const aliases = {
  latest: '2.0.0',
  stable: '2.0.0',
  next: '3.0.0'
}

resolveVersionAlias('latest', aliases) // '2.0.0'
resolveVersionAlias('2.0.0', aliases)  // '2.0.0' (返回原值)
```

### isVersionDeprecated

检查版本是否已废弃。

```ts
import { isVersionDeprecated } from '@ldesign/doc/plugins'

const deprecatedVersions = ['1.0.0', '1.5.0']

isVersionDeprecated('1.0.0', deprecatedVersions) // true
isVersionDeprecated('2.0.0', deprecatedVersions) // false
```

### generateVersionManifest

生成版本清单对象。

```ts
import { generateVersionManifest } from '@ldesign/doc/plugins'

const config = {
  versions: [
    { version: '2.0.0', path: '/v2/', label: 'v2.x' },
    { version: '1.0.0', path: '/v1/', label: 'v1.x' }
  ],
  current: '2.0.0',
  aliases: { latest: '2.0.0' }
}

const manifest = generateVersionManifest(config)
// {
//   current: '2.0.0',
//   versions: [...],
//   aliases: { latest: '2.0.0' },
//   generatedAt: '2024-12-26T...'
// }
```

## 版本清单

构建时会自动生成 `version-manifest.json` 文件，包含：

```json
{
  "current": "2.0.0",
  "versions": [
    {
      "version": "2.0.0",
      "label": "v2.x",
      "path": "/v2/",
      "releaseDate": "2024-01-15T00:00:00.000Z",
      "deprecated": false
    },
    {
      "version": "1.0.0",
      "label": "v1.x",
      "path": "/v1/",
      "releaseDate": "2023-06-01T00:00:00.000Z",
      "deprecated": true
    }
  ],
  "aliases": {
    "latest": "2.0.0",
    "stable": "2.0.0",
    "legacy": "1.0.0"
  },
  "generatedAt": "2024-12-26T10:00:00.000Z"
}
```

## 最佳实践

1. **版本路径规范**：使用 `/v{major}/` 格式，如 `/v1/`、`/v2/`
2. **版本别名**：为常用版本设置别名，方便用户访问
3. **废弃警告**：及时标记废弃版本，引导用户升级
4. **发布日期**：记录版本发布日期，帮助用户了解版本历史
5. **预发布标记**：为 Beta/RC 版本添加 `prerelease: true`

## 注意事项

- 版本路径必须以 `/` 开头和结尾
- 当前版本必须在版本列表中存在
- 废弃版本警告可以被用户关闭（存储在 localStorage）
- 版本切换会保持当前页面的相对路径

## License

MIT
