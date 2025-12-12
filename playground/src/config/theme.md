---
title: 主题配置
---

# 主题配置

主题配置定义了站点的外观和导航结构。

## 基础配置

```ts
export default defineConfig({
  themeConfig: {
    // 站点 Logo
    logo: '/logo.svg',
    
    // 站点标题（覆盖顶层 title）
    siteTitle: 'My Docs',
    
    // 导航栏
    nav: [...],
    
    // 侧边栏
    sidebar: {...},
    
    // 页脚
    footer: {...}
  }
})
```

## 导航栏

### 基础链接

```ts
themeConfig: {
  nav: [
    { text: '指南', link: '/guide/' },
    { text: 'API', link: '/api/' },
    { text: '更新日志', link: '/changelog' }
  ]
}
```

### 下拉菜单

```ts
themeConfig: {
  nav: [
    {
      text: '版本',
      items: [
        { text: 'v2.x', link: '/v2/' },
        { text: 'v1.x', link: '/v1/' }
      ]
    }
  ]
}
```

### 嵌套下拉菜单

```ts
themeConfig: {
  nav: [
    {
      text: '生态系统',
      items: [
        {
          text: '核心',
          items: [
            { text: '@ldesign/doc', link: '...' },
            { text: '@ldesign/theme', link: '...' }
          ]
        },
        {
          text: '工具',
          items: [
            { text: '@ldesign/cli', link: '...' }
          ]
        }
      ]
    }
  ]
}
```

### 活动状态

默认情况下，当前路径匹配时会高亮对应的导航项。可以自定义匹配规则：

```ts
themeConfig: {
  nav: [
    {
      text: '指南',
      link: '/guide/',
      activeMatch: '/guide/'
    }
  ]
}
```

## 侧边栏

### 简单配置

```ts
themeConfig: {
  sidebar: [
    {
      text: '介绍',
      items: [
        { text: '什么是 LDoc', link: '/guide/what-is-ldoc' },
        { text: '快速开始', link: '/guide/getting-started' }
      ]
    }
  ]
}
```

### 多侧边栏

根据路径显示不同的侧边栏：

```ts
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/guide/' },
          { text: '快速开始', link: '/guide/getting-started' }
        ]
      }
    ],
    '/api/': [
      {
        text: 'API 参考',
        items: [
          { text: '配置', link: '/api/config' },
          { text: '运行时', link: '/api/runtime' }
        ]
      }
    ]
  }
}
```

### 可折叠分组

```ts
themeConfig: {
  sidebar: [
    {
      text: '高级',
      collapsed: true,  // 默认折叠
      items: [
        { text: '自定义主题', link: '/advanced/custom-theme' },
        { text: '插件开发', link: '/advanced/plugin-dev' }
      ]
    }
  ]
}
```

### 分隔线

```ts
themeConfig: {
  sidebar: [
    { text: '基础', items: [...] },
    '---',  // 分隔线
    { text: '高级', items: [...] }
  ]
}
```

## 社交链接

```ts
themeConfig: {
  socialLinks: [
    { icon: 'github', link: 'https://github.com/xxx' },
    { icon: 'twitter', link: 'https://twitter.com/xxx' },
    { icon: 'discord', link: 'https://discord.gg/xxx' },
    {
      icon: {
        svg: '<svg>...</svg>'
      },
      link: 'https://example.com'
    }
  ]
}
```

支持的图标：`github`, `twitter`, `discord`, `facebook`, `instagram`, `linkedin`, `slack`, `youtube`, `mastodon`

## 页脚

```ts
themeConfig: {
  footer: {
    message: 'Released under the MIT License.',
    copyright: 'Copyright © 2024 My Company'
  }
}
```

## 编辑链接

```ts
themeConfig: {
  editLink: {
    pattern: 'https://github.com/owner/repo/edit/main/docs/:path',
    text: '在 GitHub 上编辑此页'
  }
}
```

`:path` 会被替换为当前页面的相对路径。

## 上一页/下一页

默认根据侧边栏自动生成。可以在 frontmatter 中自定义：

```yaml
---
prev:
  text: '自定义上一页'
  link: '/custom-prev'
next:
  text: '自定义下一页'
  link: '/custom-next'
---
```

或禁用：

```yaml
---
prev: false
next: false
---
```

## 大纲

控制右侧大纲的显示：

```ts
themeConfig: {
  outline: {
    level: [2, 3],  // 显示 h2 和 h3
    label: '本页目录'
  }
}
```

## 搜索

### 本地搜索

```ts
themeConfig: {
  search: {
    provider: 'local',
    options: {
      placeholder: '搜索文档',
      translations: {
        button: {
          buttonText: '搜索'
        }
      }
    }
  }
}
```

### Algolia 搜索

```ts
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: 'xxx',
      apiKey: 'xxx',
      indexName: 'xxx'
    }
  }
}
```

## 暗色模式

```ts
themeConfig: {
  // 控制暗色模式切换
  appearance: true,  // 默认启用
  
  // 或指定默认主题
  appearance: 'dark'
}
```

## 国际化

```ts
export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/' }
        ]
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/' }
        ]
      }
    }
  }
})
```
