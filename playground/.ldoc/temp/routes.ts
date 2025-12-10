
// Auto-generated routes
export const routes = [
  {
    path: '/api/client',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/api/client.md'),
    meta: { 
      title: 'client',
      frontmatter: {}
    }
  },
  {
    path: '/api',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/api/index.md'),
    meta: { 
      title: 'API 参考',
      frontmatter: {"title":"API 参考","description":"LDoc 的完整 API 文档"}
    }
  },
  {
    path: '/api/theme',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/api/theme.md'),
    meta: { 
      title: 'theme',
      frontmatter: {}
    }
  },
  {
    path: '/components/button',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/components/button.md'),
    meta: { 
      title: 'button',
      frontmatter: {}
    }
  },
  {
    path: '/components',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/components/index.md'),
    meta: { 
      title: '',
      frontmatter: {}
    }
  },
  {
    path: '/guide/configuration',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/guide/configuration.md'),
    meta: { 
      title: 'configuration',
      frontmatter: {}
    }
  },
  {
    path: '/guide/getting-started',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/guide/getting-started.md'),
    meta: { 
      title: '快速开始',
      frontmatter: {"title":"快速开始","description":"从零开始搭建 LDoc 文档站点"}
    }
  },
  {
    path: '/guide',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/guide/index.md'),
    meta: { 
      title: '',
      frontmatter: {}
    }
  },
  {
    path: '/guide/plugin',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/guide/plugin.md'),
    meta: { 
      title: 'plugin',
      frontmatter: {}
    }
  },
  {
    path: '/guide/theme',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/guide/theme.md'),
    meta: { 
      title: 'theme',
      frontmatter: {}
    }
  },
  {
    path: '/',
    component: () => import('D:/workspace/ldesign/libraries/doc/playground/docs/index.md'),
    meta: { 
      title: '首页',
      frontmatter: {"layout":"home","title":"首页","hero":{"name":"LDoc","text":"现代化文档系统","tagline":"支持 Vue/React 组件渲染、主题系统、插件系统","actions":[{"text":"快速开始","link":"/guide/getting-started","theme":"brand"},{"text":"GitHub","link":"https://github.com/ldesign/doc","theme":"alt"}],"image":{"src":"/logo.svg","alt":"LDoc"}},"features":[{"icon":"⚡️","title":"基于 Vite","details":"极速冷启动，即时热更新，享受现代化的开发体验"},{"icon":"📝","title":"Markdown 优先","details":"专注于内容创作，支持 Vue/React 组件在文档中渲染"},{"icon":"🎨","title":"主题系统","details":"完全可定制的主题，支持暗色模式，打造独特的文档风格"},{"icon":"🔌","title":"插件系统","details":"强大的插件架构，轻松扩展功能，满足各种需求"},{"icon":"🔒","title":"认证支持","details":"内置登录认证系统，保护私有文档，支持自定义认证逻辑"},{"icon":"📱","title":"响应式设计","details":"完美适配各种设备，从桌面到移动端都能获得最佳体验"}]}
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@theme/NotFound.vue')
  }
]
