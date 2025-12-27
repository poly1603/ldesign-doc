# PWA 插件

PWA (Progressive Web App) 插件为 @ldesign/doc 文档系统添加离线访问和渐进式 Web 应用功能。

## 功能特性

- ✅ Service Worker 自动生成和管理
- ✅ 多种缓存策略支持（Cache First、Network First、Stale While Revalidate）
- ✅ Web App Manifest 自动生成
- ✅ 离线访问支持
- ✅ 更新提示组件
- ✅ 自动检查更新
- ✅ 可配置的运行时缓存规则

## 安装使用

### 基础配置

```ts
import { defineConfig } from '@ldesign/doc'
import { pwaPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    pwaPlugin({
      enabled: true,
      manifest: {
        name: 'My Documentation',
        shortName: 'Docs',
        description: 'My awesome documentation',
        themeColor: '#3eaf7c',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

### 完整配置

```ts
pwaPlugin({
  // 是否启用 PWA
  enabled: true,

  // Service Worker 配置
  serviceWorker: {
    // 缓存策略
    strategy: 'cache-first', // 'cache-first' | 'network-first' | 'stale-while-revalidate'
    
    // 预缓存资源列表
    precache: [
      '/',
      '/guide/',
      '/api/'
    ],
    
    // 运行时缓存规则
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
          }
        }
      },
      {
        urlPattern: /\.(?:js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 天
          }
        }
      }
    ],
    
    // Service Worker 文件名
    filename: 'sw.js',
    
    // 是否跳过等待
    skipWaiting: true,
    
    // 是否立即接管客户端
    clientsClaim: true
  },

  // Web App Manifest 配置
  manifest: {
    name: 'My Documentation',
    shortName: 'Docs',
    description: 'My awesome documentation',
    themeColor: '#3eaf7c',
    backgroundColor: '#ffffff',
    display: 'standalone',
    orientation: 'any',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    startUrl: '/',
    scope: '/'
  },

  // 更新提示配置
  updatePrompt: {
    enabled: true,
    message: 'New content available, click to refresh.',
    buttonText: 'Refresh',
    checkInterval: 60000 // 检查更新间隔（毫秒）
  },

  // 开发模式配置
  devOptions: {
    enabled: false, // 开发模式下是否启用 PWA
    type: 'classic'
  }
})
```

## 缓存策略

### Cache First（缓存优先）

优先使用缓存，缓存未命中时请求网络。适合静态资源。

```ts
{
  strategy: 'cache-first'
}
```

### Network First（网络优先）

优先请求网络，网络失败时使用缓存。适合动态内容。

```ts
{
  strategy: 'network-first'
}
```

### Stale While Revalidate（过期重新验证）

立即返回缓存，同时在后台更新缓存。适合需要快速响应的资源。

```ts
{
  strategy: 'stale-while-revalidate'
}
```

## 运行时缓存规则

运行时缓存规则允许你为不同类型的资源配置不同的缓存策略：

```ts
runtimeCaching: [
  // 图片资源 - Cache First
  {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60
      }
    }
  },
  
  // 字体资源 - Cache First
  {
    urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'fonts',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60
      }
    }
  },
  
  // API 请求 - Network First
  {
    urlPattern: /^https:\/\/api\.example\.com\//,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 分钟
      }
    }
  }
]
```

## 图标要求

为了获得最佳的 PWA 支持，建议提供以下尺寸的图标：

### 必需尺寸
- 192x192 - Android 主屏幕图标
- 512x512 - Android 启动画面

### 推荐尺寸
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 384x384

### Maskable 图标

为了在 Android 上获得更好的显示效果，建议提供 maskable 图标：

```ts
{
  src: '/icon-maskable-192.png',
  sizes: '192x192',
  type: 'image/png',
  purpose: 'maskable'
}
```

## 更新提示组件

PWA 插件会自动检测新版本并显示更新提示。你可以自定义提示消息和按钮文本：

```ts
updatePrompt: {
  enabled: true,
  message: '发现新内容，点击刷新查看。',
  buttonText: '刷新',
  checkInterval: 60000 // 每分钟检查一次
}
```

## 开发模式

默认情况下，PWA 功能在开发模式下是禁用的。如果需要在开发时测试 PWA 功能：

```ts
devOptions: {
  enabled: true,
  type: 'classic'
}
```

## 验证 PWA

构建完成后，你可以使用以下工具验证 PWA 配置：

1. Chrome DevTools - Application 面板
2. Lighthouse - PWA 审计
3. [PWA Builder](https://www.pwabuilder.com/)

## 注意事项

1. **HTTPS 要求**：Service Worker 只能在 HTTPS 环境下工作（localhost 除外）
2. **图标准备**：确保提供所有推荐尺寸的图标
3. **缓存策略**：根据资源类型选择合适的缓存策略
4. **更新机制**：用户需要刷新页面才能应用更新
5. **离线支持**：确保预缓存关键页面以支持离线访问

## 相关资源

- [Web App Manifest 规范](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA 最佳实践](https://web.dev/progressive-web-apps/)
- [Workbox 文档](https://developers.google.com/web/tools/workbox)
