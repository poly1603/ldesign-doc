import { defineNav } from '@ldesign/doc'

/**
 * 中文导航配置
 */
export const zhNav = defineNav([
  {
    text: '指南',
    link: '/guide/',
    activeMatch: '/guide/'
  },
  {
    text: '示例',
    link: '/examples/',
    activeMatch: '/examples/'
  },
  {
    text: 'API',
    link: '/api/',
    activeMatch: '/api/'
  },
  {
    text: '插件',
    link: '/plugins/',
    activeMatch: '/plugins/'
  },
  {
    text: '相关链接',
    items: [
      { text: 'GitHub', link: 'https://github.com/polyester-design/ldesign' },
      { text: '更新日志', link: '/changelog' }
    ]
  }
])

/**
 * 英文导航配置
 */
export const enNav = defineNav([
  {
    text: 'Guide',
    link: '/en/guide/',
    activeMatch: '/en/guide/'
  },
  {
    text: 'Examples',
    link: '/en/examples/',
    activeMatch: '/en/examples/'
  },
  {
    text: 'API',
    link: '/en/api/',
    activeMatch: '/en/api/'
  },
  {
    text: 'Plugins',
    link: '/en/plugins/',
    activeMatch: '/en/plugins/'
  },
  {
    text: 'Links',
    items: [
      { text: 'GitHub', link: 'https://github.com/polyester-design/ldesign' },
      { text: 'Changelog', link: '/en/changelog' }
    ]
  }
])
