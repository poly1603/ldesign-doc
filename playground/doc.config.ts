import { defineConfig } from '@ldesign/doc'
// 注意：在开发环境下，这些插件需要先构建 @ldesign/doc
// 或者直接从源码导入
// import { progressPlugin, copyCodePlugin, ... } from '@ldesign/doc/plugins'

// 以下为内置插件的使用示例（构建后可用）
// import {
//   progressPlugin,
//   copyCodePlugin,
//   imageViewerPlugin,
//   readingTimePlugin,
//   lastUpdatedPlugin
// } from '@ldesign/doc/plugins'

export default defineConfig({
  // 站点基本信息
  title: '@ldesign/doc',
  description: '一个现代化的文档生成框架',
  lang: 'zh-CN',

  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '指南', link: '/guide/' },
      { text: '配置', link: '/config/' },
      { text: '插件', link: '/plugins/' },
      { text: 'API', link: '/api/' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '目录结构', link: '/guide/structure' }
          ]
        },
        {
          text: '写作',
          items: [
            { text: 'Markdown 扩展', link: '/guide/markdown' },
            { text: '资源处理', link: '/guide/assets' },
            { text: 'Frontmatter', link: '/guide/frontmatter' }
          ]
        }
      ],
      '/config/': [
        {
          text: '配置',
          items: [
            { text: '站点配置', link: '/config/' },
            { text: '主题配置', link: '/config/theme' },
            { text: 'Frontmatter 配置', link: '/config/frontmatter' }
          ]
        }
      ],
      '/plugins/': [
        {
          text: '插件',
          items: [
            { text: '插件概述', link: '/plugins/' },
            { text: '内置插件', link: '/plugins/built-in' },
            { text: '插件开发', link: '/plugins/development' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '运行时 API', link: '/api/' },
            { text: '插件 API', link: '/api/plugin' },
            { text: '客户端 API', link: '/api/client' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/polyester-design/ldesign' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Polyester Design'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/polyester-design/ldesign/edit/main/libraries/doc/playground/src/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 搜索
    search: {
      provider: 'local'
    }
  },

  // 插件配置（构建 @ldesign/doc 后取消注释）
  // plugins: [
  //   // 阅读进度条
  //   progressPlugin({
  //     color: 'var(--ldoc-c-brand-1)',
  //     height: 3
  //   }),
  //
  //   // 代码复制
  //   copyCodePlugin({
  //     buttonText: '复制',
  //     successText: '已复制!'
  //   }),
  //
  //   // 图片预览
  //   imageViewerPlugin({
  //     zoom: true
  //   }),
  //
  //   // 阅读时间
  //   readingTimePlugin({
  //     wordsPerMinute: 200
  //   }),
  //
  //   // 最后更新时间
  //   lastUpdatedPlugin({
  //     useGitTime: true
  //   })
  // ]
  plugins: []
})
