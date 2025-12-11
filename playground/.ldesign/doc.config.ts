import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'LDoc 演示站点',
  description: '现代化文档系统演示',
  lang: 'zh-CN',
  // srcDir 已自动设置为 .ldesign/docs

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

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
      {
        text: '更多',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing' },
          { text: 'GitHub', link: 'https://github.com/nicepkg/ldesign' }
        ]
      }
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
            { text: 'Markdown 语法', link: '/guide/markdown' },
            { text: 'Frontmatter', link: '/guide/frontmatter' },
            { text: '静态资源', link: '/guide/assets' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '主题定制', link: '/guide/theme' },
            { text: '插件开发', link: '/guide/plugins' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '配置选项', link: '/api/config' },
            { text: '运行时 API', link: '/api/runtime' }
          ]
        }
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: '按钮', link: '/components/button' },
            { text: '输入框', link: '/components/input' }
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
  }
})
