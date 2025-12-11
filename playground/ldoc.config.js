import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'LDoc 演示站点',
  description: '现代化文档系统演示',
  lang: 'zh-CN',
  srcDir: 'docs',

  themeConfig: {
    logo: 'https://wuhan.yxybb.com/ldesign/source/npm-logo.svg',
    siteTitle: 'LDesign',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '组件', link: '/components/' },
      {
        text: '更多',
        items: [
          { text: 'GitHub', link: 'https://github.com/ldesign/doc' },
          { text: '更新日志', link: '/changelog' }
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
            { text: '配置 API', link: '/api/' },
            { text: '客户端 API', link: '/api/client' },
            { text: '主题 API', link: '/api/theme' }
          ]
        }
      ],
      '/components/': [
        {
          text: '组件演示',
          items: [
            { text: '概述', link: '/components/' },
            { text: 'Button 按钮', link: '/components/button' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/doc' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 LDesign Team. All rights reserved.',
      links: [
        {
          title: '文档',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: 'Markdown 语法', link: '/guide/markdown' },
            { text: '配置参考', link: '/guide/configuration' }
          ]
        },
        {
          title: '社区',
          items: [
            { text: 'GitHub', link: 'https://github.com/ldesign/doc' },
            { text: '问题反馈', link: 'https://github.com/ldesign/doc/issues' },
            { text: '讨论区', link: 'https://github.com/ldesign/doc/discussions' }
          ]
        },
        {
          title: '更多',
          items: [
            { text: '更新日志', link: '/changelog' },
            { text: '贡献指南', link: '/contributing' },
            { text: '团队', link: '/team' }
          ]
        }
      ]
    },

    editLink: {
      pattern: 'https://github.com/ldesign/doc/edit/main/playground/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    outline: {
      level: [2, 3],
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
      port: 5173,
      open: true
    }
  }
})
