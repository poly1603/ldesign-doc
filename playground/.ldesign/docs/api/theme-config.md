# 主题配置

主题配置定义站点的外观和导航结构。

## 基础配置

```ts
export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'My Docs',
    nav: [...],
    sidebar: {...}
  }
})
```

## 导航栏

### 基础链接

```ts
nav: [
  { text: '指南', link: '/guide/' },
  { text: 'API', link: '/api/' }
]
```

### 下拉菜单

```ts
nav: [
  {
    text: '版本',
    items: [
      { text: 'v2.x', link: '/v2/' },
      { text: 'v1.x', link: '/v1/' }
    ]
  }
]
```

### 活动状态

```ts
nav: [
  {
    text: '指南',
    link: '/guide/',
    activeMatch: '/guide/'
  }
]
```

## 侧边栏

### 简单配置

```ts
sidebar: [
  {
    text: '介绍',
    items: [
      { text: '什么是 LDoc', link: '/guide/' },
      { text: '快速开始', link: '/guide/getting-started' }
    ]
  }
]
```

### 多侧边栏

```ts
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
      text: 'API',
      items: [
        { text: '配置', link: '/api/config' }
      ]
    }
  ]
}
```

### 可折叠

```ts
sidebar: [
  {
    text: '高级',
    collapsed: true,
    items: [...]
  }
]
```

## 社交链接

```ts
socialLinks: [
  { icon: 'github', link: 'https://github.com/xxx' },
  { icon: 'twitter', link: 'https://twitter.com/xxx' },
  { icon: 'discord', link: 'https://discord.gg/xxx' }
]
```

支持图标：`github`, `twitter`, `discord`, `facebook`, `instagram`, `linkedin`, `slack`, `youtube`

## 页脚

```ts
footer: {
  message: 'Released under the MIT License.',
  copyright: 'Copyright © 2024'
}
```

## 编辑链接

```ts
editLink: {
  pattern: 'https://github.com/user/repo/edit/main/docs/:path',
  text: '在 GitHub 上编辑此页'
}
```

## 大纲

```ts
outline: {
  level: [2, 3],
  label: '本页目录'
}
```

## 搜索

### 本地搜索

```ts
search: {
  provider: 'local',
  options: {
    placeholder: '搜索文档'
  }
}
```

### Algolia

```ts
search: {
  provider: 'algolia',
  options: {
    appId: 'xxx',
    apiKey: 'xxx',
    indexName: 'xxx'
  }
}
```

## 暗色模式

```ts
appearance: true  // 启用切换
appearance: 'dark'  // 默认暗色
```

## 布局配置

```ts
layout: {
  sidebarWidth: 260,
  outlineWidth: 220,
  contentGap: 32,
  navHeight: 64,
  maxWidth: 1400
}
```

## 国际化

```ts
locales: {
  root: {
    label: 'English',
    lang: 'en',
    themeConfig: {
      nav: [{ text: 'Guide', link: '/guide/' }]
    }
  },
  zh: {
    label: '简体中文',
    lang: 'zh-CN',
    themeConfig: {
      nav: [{ text: '指南', link: '/zh/guide/' }]
    }
  }
}
```
