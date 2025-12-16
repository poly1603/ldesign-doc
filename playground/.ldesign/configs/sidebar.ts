import { defineSidebar } from '@ldesign/doc'

/**
 * 中文侧边栏配置
 */
export const zhSidebar = defineSidebar({
  '/guide/': [
    {
      text: '开始使用',
      collapsed: false,
      items: [
        { text: '介绍', link: '/guide/' },
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '配置说明', link: '/guide/configuration' }
      ]
    },
    {
      text: '编写文档',
      collapsed: false,
      items: [
        { text: 'Markdown 扩展', link: '/guide/markdown' },
        { text: 'Frontmatter', link: '/guide/frontmatter' },
        { text: '静态资源', link: '/guide/assets' }
      ]
    },
    {
      text: '进阶功能',
      collapsed: false,
      items: [
        { text: '主题定制', link: '/guide/theme' },
        { text: '国际化', link: '/guide/i18n' },
        { text: '部署上线', link: '/guide/deploy' }
      ]
    }
  ],

  '/api/': [
    {
      text: '配置参考',
      collapsed: false,
      items: [
        { text: '概述', link: '/api/' },
        { text: '站点配置', link: '/api/site-config' },
        { text: '主题配置', link: '/api/theme-config' },
        { text: 'Frontmatter', link: '/api/frontmatter' }
      ]
    },
    {
      text: '客户端 API',
      collapsed: false,
      items: [
        { text: 'Composables', link: '/api/composables' },
        { text: '内置组件', link: '/api/components' }
      ]
    }
  ],

  '/examples/': [
    {
      text: '示例总览',
      collapsed: false,
      items: [{ text: '功能演示', link: '/examples/' }]
    },
    {
      text: 'Markdown 增强',
      collapsed: false,
      items: [
        { text: '代码块高亮', link: '/examples/markdown/code' },
        { text: '容器与提示框', link: '/examples/markdown/containers' }
      ]
    },
    {
      text: '媒体资源',
      collapsed: false,
      items: [
        { text: '图片展示', link: '/examples/media/images' },
        { text: '视频嵌入', link: '/examples/media/videos' },
        { text: '图标使用', link: '/examples/media/icons' }
      ]
    },
    {
      text: 'Vue 组件',
      collapsed: false,
      items: [
        { text: '基础组件', link: '/examples/vue/basic' },
        { text: '交互组件', link: '/examples/vue/interactive' }
      ]
    },
    {
      text: '高级功能',
      collapsed: false,
      items: [
        { text: '数学公式', link: '/examples/advanced/math' },
        { text: '流程图表', link: '/examples/advanced/diagrams' }
      ]
    }
  ],

  '/plugins/': [
    {
      text: '插件系统',
      collapsed: false,
      items: [
        { text: '概述', link: '/plugins/' },
        { text: '使用插件', link: '/plugins/using' }
      ]
    },
    {
      text: '内置插件',
      collapsed: false,
      items: [
        { text: '组件演示', link: '/plugins/demo' },
        { text: '全文搜索', link: '/plugins/search' },
        { text: '评论系统', link: '/plugins/comment' },
        { text: '阅读进度条', link: '/plugins/progress' },
        { text: '代码复制', link: '/plugins/copy-code' },
        { text: '图片预览', link: '/plugins/image-viewer' },
        { text: '阅读时间', link: '/plugins/reading-time' },
        { text: '最后更新时间', link: '/plugins/last-updated' }
      ]
    },
    {
      text: '扩展开发',
      collapsed: false,
      items: [
        { text: '插件开发指南', link: '/plugins/development' },
        { text: '插件 API', link: '/plugins/api' },
        { text: '主题开发指南', link: '/plugins/theme-dev' }
      ]
    }
  ]
})

/**
 * 英文侧边栏配置
 */
export const enSidebar = defineSidebar({
  '/en/guide/': [
    {
      text: 'Getting Started',
      collapsed: false,
      items: [
        { text: 'Introduction', link: '/en/guide/' },
        { text: 'Quick Start', link: '/en/guide/getting-started' },
        { text: 'Configuration', link: '/en/guide/configuration' }
      ]
    },
    {
      text: 'Writing Docs',
      collapsed: false,
      items: [
        { text: 'Markdown Extensions', link: '/en/guide/markdown' },
        { text: 'Frontmatter', link: '/en/guide/frontmatter' },
        { text: 'Static Assets', link: '/en/guide/assets' }
      ]
    },
    {
      text: 'Advanced',
      collapsed: false,
      items: [
        { text: 'Theme Customization', link: '/en/guide/theme' },
        { text: 'Internationalization', link: '/en/guide/i18n' },
        { text: 'Deployment', link: '/en/guide/deploy' }
      ]
    }
  ],

  '/en/api/': [
    {
      text: 'Config Reference',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/en/api/' },
        { text: 'Site Config', link: '/en/api/site-config' },
        { text: 'Theme Config', link: '/en/api/theme-config' },
        { text: 'Frontmatter', link: '/en/api/frontmatter' }
      ]
    },
    {
      text: 'Client API',
      collapsed: false,
      items: [
        { text: 'Composables', link: '/en/api/composables' },
        { text: 'Components', link: '/en/api/components' }
      ]
    }
  ],

  '/en/examples/': [
    {
      text: 'Overview',
      collapsed: false,
      items: [{ text: 'Feature Examples', link: '/en/examples/' }]
    },
    {
      text: 'Markdown',
      collapsed: false,
      items: [
        { text: 'Code Blocks', link: '/en/examples/markdown/code' },
        { text: 'Containers', link: '/en/examples/markdown/containers' }
      ]
    },
    {
      text: 'Media',
      collapsed: false,
      items: [
        { text: 'Images', link: '/en/examples/media/images' },
        { text: 'Videos', link: '/en/examples/media/videos' },
        { text: 'Icons', link: '/en/examples/media/icons' }
      ]
    },
    {
      text: 'Vue Components',
      collapsed: false,
      items: [
        { text: 'Basic', link: '/en/examples/vue/basic' },
        { text: 'Interactive', link: '/en/examples/vue/interactive' }
      ]
    },
    {
      text: 'Advanced',
      collapsed: false,
      items: [
        { text: 'Math Equations', link: '/en/examples/advanced/math' },
        { text: 'Diagrams', link: '/en/examples/advanced/diagrams' }
      ]
    }
  ],

  '/en/plugins/': [
    {
      text: 'Plugin System',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/en/plugins/' },
        { text: 'Using Plugins', link: '/en/plugins/using' }
      ]
    },
    {
      text: 'Built-in Plugins',
      collapsed: false,
      items: [
        { text: 'Demo', link: '/en/plugins/demo' },
        { text: 'Search', link: '/en/plugins/search' },
        { text: 'Comment', link: '/en/plugins/comment' },
        { text: 'Progress', link: '/en/plugins/progress' },
        { text: 'Copy Code', link: '/en/plugins/copy-code' },
        { text: 'Image Viewer', link: '/en/plugins/image-viewer' },
        { text: 'Reading Time', link: '/en/plugins/reading-time' },
        { text: 'Last Updated', link: '/en/plugins/last-updated' }
      ]
    },
    {
      text: 'Development',
      collapsed: false,
      items: [
        { text: 'Plugin Guide', link: '/en/plugins/development' },
        { text: 'Plugin API', link: '/en/plugins/api' },
        { text: 'Theme Guide', link: '/en/plugins/theme-dev' }
      ]
    }
  ]
})
