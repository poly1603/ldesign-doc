# 配置

LDoc 提供了丰富的配置选项，让你可以定制文档站点的各个方面。

## 站点配置

基本的站点配置选项：

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `title` | `string` | `'LDoc'` | 站点标题 |
| `description` | `string` | `''` | 站点描述 |
| `base` | `string` | `'/'` | 站点基础路径 |
| `lang` | `string` | `'zh-CN'` | 站点语言 |
| `srcDir` | `string` | `'docs'` | 文档源目录 |
| `outDir` | `string` | `'.ldoc/dist'` | 构建输出目录 |

## 主题配置

通过 `themeConfig` 配置主题：

```ts
export default defineConfig({
  themeConfig: {
    // 导航栏
    nav: [
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Dropdown',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' }
        ]
      }
    ],
    
    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is LDoc?', link: '/guide/' },
            { text: 'Getting Started', link: '/guide/getting-started' }
          ]
        }
      ]
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/doc' }
    ],
    
    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/ldesign/doc/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
```

## Markdown 配置

```ts
export default defineConfig({
  markdown: {
    // 显示行号
    lineNumbers: true,
    
    // 代码主题
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    
    // 锚点配置
    anchor: {
      permalink: true
    },
    
    // 目录配置
    toc: {
      includeLevel: [2, 3]
    }
  }
})
```

## Vite 配置

你可以通过 `vite` 选项传递 Vite 配置：

```ts
export default defineConfig({
  vite: {
    server: {
      port: 3000
    }
  }
})
```

::: warning 注意
某些 Vite 选项可能会与 LDoc 内部配置冲突，请谨慎使用。
:::
