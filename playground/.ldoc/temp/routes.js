
// Auto-generated routes
import Page0 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/index.md'
import Page1 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/api/index.md'
import Page2 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/api/client.md'
import Page3 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/api/theme.md'
import Page4 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/components/index.md'
import Page5 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/components/button.md'
import Page6 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/index.md'
import Page7 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/configuration.md'
import Page8 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/getting-started.md'
import Page9 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/markdown.md'
import Page10 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/plugin.md'
import Page11 from 'D:/WorkBench/ldesign/libraries/doc/playground/docs/guide/theme.md'
import NotFound from '@theme/NotFound.vue'

export const routes = [
  {
    path: '/',
    component: Page0,
    meta: { 
      title: 'LDoc - 现代化文档系统',
      frontmatter: {"layout":"home","title":"LDoc - 现代化文档系统","hero":{"name":"LDoc","text":"为现代化文档而生","tagline":"基于 Vite 的高性能文档框架，支持 Vue/React 组件渲染、主题系统、插件系统","actions":[{"text":"快速开始","link":"/guide/getting-started","theme":"brand"},{"text":"Markdown 语法","link":"/guide/markdown","theme":"alt"}],"image":{"src":"/logo.svg","alt":"LDoc"}},"featuresTitle":"核心特性","featuresDescription":"为现代化文档而生，提供极致的开发体验","features":[{"icon":"⚡️","title":"极速启动","details":"基于 Vite 构建，毫秒级冷启动，即时热更新，文档修改实时可见","link":"/guide/getting-started","linkText":"快速开始"},{"icon":"📝","title":"Markdown 增强","details":"丰富的 Markdown 扩展语法，支持自定义容器、代码高亮、组件演示等","link":"/guide/markdown","linkText":"查看语法"},{"icon":"🎨","title":"主题定制","details":"完全可定制的主题系统，支持暗色模式切换，CSS 变量轻松修改样式","link":"/guide/theme","linkText":"主题配置"},{"icon":"🔌","title":"插件扩展","details":"强大的插件架构，支持自定义 Markdown 语法、页面数据、构建流程","link":"/guide/plugins","linkText":"插件开发"},{"icon":"📱","title":"响应式布局","details":"完美适配各种设备尺寸，从桌面到移动端都能获得最佳阅读体验"},{"icon":"🔍","title":"全文搜索","details":"内置全文搜索支持，快速定位文档内容，提升查阅效率"}],"stats":[{"value":"50+","title":"Markdown 特性"},{"value":"100%","title":"TypeScript"},{"value":"MIT","title":"开源协议"},{"value":"2KB","title":"主题包大小"}],"codeExample":{"title":"三步开始","description":"只需几行命令，即可创建你的文档站点","steps":[{"title":"安装依赖","code":"npm install @ldesign/doc -D"},{"title":"初始化配置","code":"npx ldoc init"},{"title":"启动开发","code":"npm run docs:dev"}]},"banner":{"icon":"🚀","title":"开始使用 LDoc","description":"查看完整的使用指南，了解如何配置和自定义你的文档站点","link":"/guide/getting-started","linkText":"阅读文档"}}
    }
  },
  {
    path: '/api',
    component: Page1,
    meta: { 
      title: 'API 参考',
      frontmatter: {"title":"API 参考","description":"LDoc 的完整 API 文档"}
    }
  },
  {
    path: '/api/client',
    component: Page2,
    meta: { 
      title: 'client',
      frontmatter: {}
    }
  },
  {
    path: '/api/theme',
    component: Page3,
    meta: { 
      title: 'theme',
      frontmatter: {}
    }
  },
  {
    path: '/components',
    component: Page4,
    meta: { 
      title: '',
      frontmatter: {}
    }
  },
  {
    path: '/components/button',
    component: Page5,
    meta: { 
      title: 'button',
      frontmatter: {}
    }
  },
  {
    path: '/guide',
    component: Page6,
    meta: { 
      title: '',
      frontmatter: {}
    }
  },
  {
    path: '/guide/configuration',
    component: Page7,
    meta: { 
      title: 'configuration',
      frontmatter: {}
    }
  },
  {
    path: '/guide/getting-started',
    component: Page8,
    meta: { 
      title: '快速开始',
      frontmatter: {"title":"快速开始","description":"从零开始搭建 LDoc 文档站点"}
    }
  },
  {
    path: '/guide/markdown',
    component: Page9,
    meta: { 
      title: 'markdown',
      frontmatter: {}
    }
  },
  {
    path: '/guide/plugin',
    component: Page10,
    meta: { 
      title: 'plugin',
      frontmatter: {}
    }
  },
  {
    path: '/guide/theme',
    component: Page11,
    meta: { 
      title: 'theme',
      frontmatter: {}
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]
