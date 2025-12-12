import { defineConfig } from '@ldesign/doc'
import readingTimePlugin from 'ldoc-plugin-reading-time'

export default defineConfig({
  title: 'LDoc 演示站点',
  description: '现代化文档系统演示',
  lang: 'zh-CN',
  // srcDir 已自动设置为 .ldesign/docs

  // 主题配置（可选）
  // 使用 npm 包主题: theme: 'ldoc-theme-xxx'
  // 使用默认主题: 不设置 theme

  // 使用阅读时间插件
  plugins: [
    readingTimePlugin({
      wordsPerMinute: 300,
      includeCode: true
    })
  ],

  themeConfig: {
    logo: 'https://wuhan.yxybb.com/ldesign/source/npm-logo.svg',
    siteTitle: 'LDesign',

    // 布局配置
    layout: {
      sidebarWidth: 260,
      outlineWidth: 220,
      contentGap: 32,
      navHeight: 64,
      maxWidth: 1400
    },

    // 导航栏 - 点击后跳转到侧边栏第一个页面
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '插件', link: '/plugins/' },
      { text: 'GitHub', link: 'https://github.com/polyester-design/ldesign' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '配置', link: '/guide/configuration' }
          ]
        },
        {
          text: '编写文档',
          items: [
            { text: 'Markdown 扩展', link: '/guide/markdown' },
            { text: 'Frontmatter', link: '/guide/frontmatter' },
            { text: '静态资源', link: '/guide/assets' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theme' },
            { text: '部署', link: '/guide/deploy' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '概述', link: '/api/' },
            { text: '站点配置', link: '/api/site-config' },
            { text: '主题配置', link: '/api/theme-config' },
            { text: 'Frontmatter', link: '/api/frontmatter' }
          ]
        },
        {
          text: '客户端 API',
          items: [
            { text: 'Composables', link: '/api/composables' },
            { text: '组件', link: '/api/components' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: '插件系统',
          items: [
            { text: '概述', link: '/plugins/' },
            { text: '使用插件', link: '/plugins/using' }
          ]
        },
        {
          text: '内置插件',
          items: [
            { text: '搜索插件', link: '/plugins/search' },
            { text: '评论插件', link: '/plugins/comment' },
            { text: '进度条插件', link: '/plugins/progress' },
            { text: '代码复制插件', link: '/plugins/copy-code' },
            { text: '图片预览插件', link: '/plugins/image-viewer' },
            { text: '阅读时间插件', link: '/plugins/reading-time' },
            { text: '最后更新插件', link: '/plugins/last-updated' }
          ]
        },
        {
          text: '开发插件',
          items: [
            { text: '插件开发指南', link: '/plugins/development' },
            { text: '插件 API', link: '/plugins/api' }
          ]
        },
        {
          text: '开发主题',
          items: [
            { text: '主题开发指南', link: '/plugins/theme-dev' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nicepkg/ldesign' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: '版权所有 © 2024 LDesign'
    },

    editLink: {
      pattern: 'https://github.com/nicepkg/ldesign/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新'
    },

    outline: {
      level: [1, 6],
      label: '本页目录'
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },
  vite: {
    server: {
      port: 8878,
      host: true,
      open: true
    }
  }
})
