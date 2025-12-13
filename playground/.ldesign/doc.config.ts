import { defineConfig } from '@ldesign/doc'
import {
  readingTimePlugin,
  progressPlugin,
  copyCodePlugin,
  demoPlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  srcDir: 'src',
  title: 'LDoc 演示站点',
  description: '现代化文档系统演示',
  lang: 'zh-CN',

  // 插件配置
  // 内置插件（返回顶部、图片灯箱、公告栏）自动加载
  plugins: [
    // 阅读时间插件
    readingTimePlugin({
      wordsPerMinute: 300
    }),

    // 阅读进度条（非首页显示）
    progressPlugin({
      color: 'var(--vp-c-brand, #3b82f6)',
      height: 3,
      position: 'top',
      exclude: ['/']
    }),

    // 代码复制按钮
    copyCodePlugin({
      showLanguage: true
    }),

    // 组件演示插件
    demoPlugin({
      defaultTitle: '示例',
      defaultExpanded: false
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
      { text: '示例', link: '/examples/' },
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
      '/examples/': [
        {
          text: '功能示例',
          items: [
            { text: '示例总览', link: '/examples/' }
          ]
        },
        {
          text: 'Markdown 增强',
          items: [
            { text: '代码块', link: '/examples/markdown/code' }
          ]
        },
        {
          text: '容器与提示',
          items: [
            { text: '信息容器', link: '/examples/containers/' }
          ]
        },
        {
          text: '媒体资源',
          items: [
            { text: '图片展示', link: '/examples/media/images' },
            { text: '视频嵌入', link: '/examples/media/videos' },
            { text: '图标使用', link: '/examples/media/icons' }
          ]
        },
        {
          text: 'Vue 组件',
          items: [
            { text: '基础组件', link: '/examples/vue/basic' },
            { text: '交互组件', link: '/examples/vue/interactive' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '数学公式', link: '/examples/advanced/math' },
            { text: '流程图', link: '/examples/advanced/diagrams' }
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
            { text: '组件演示插件', link: '/plugins/demo' },
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
  },

  // 部署配置示例
  deploy: {
    platform: 'surge',
    surge: {
      domain: 'ldoc-playground.surge.sh'
    }
  }
})
