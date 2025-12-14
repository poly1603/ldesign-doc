# Comment Plugin

Add comment functionality to your documentation pages.

## Supported Providers

- **Giscus** - GitHub Discussions based (recommended)
- **Gitalk** - GitHub Issues based
- **Waline** - Self-hosted
- **Twikoo** - Serverless
- **Artalk** - Self-hosted

## Installation

```ts
import { commentPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    commentPlugin({
      provider: 'giscus',
      giscus: {
        // configuration
      }
    })
  ]
})
```

## Giscus Configuration

### Setup Steps

1. Go to [giscus.app](https://giscus.app/)
2. Enter your repository URL
3. Enable GitHub Discussions on your repo
4. Choose a discussion category
5. Copy the configuration values

### Configuration

```ts
commentPlugin({
  provider: 'giscus',
  giscus: {
    repo: 'owner/repo',
    repoId: 'R_xxxxxx',
    category: 'Announcements',
    categoryId: 'DIC_xxxxxx',
    mapping: 'pathname',
    strict: false,
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'top',
    theme: 'preferred_color_scheme',
    lang: 'en'
  }
})
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `repo` | string | GitHub repository (owner/repo) |
| `repoId` | string | Repository ID |
| `category` | string | Discussion category name |
| `categoryId` | string | Category ID |
| `mapping` | string | Page to discussion mapping |
| `theme` | string | Color theme |
| `lang` | string | Language |

## Gitalk Configuration

```ts
commentPlugin({
  provider: 'gitalk',
  gitalk: {
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    repo: 'your-repo',
    owner: 'your-username',
    admin: ['your-username']
  }
})
```

## Waline Configuration

```ts
commentPlugin({
  provider: 'waline',
  waline: {
    serverURL: 'https://your-waline-server.com'
  }
})
```

## Disable on Specific Pages

```yaml
---
comment: false
---
```

## UI Preview

Even without full configuration, the comment UI will be displayed showing where comments will appear once configured.
