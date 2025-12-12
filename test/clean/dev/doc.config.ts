import { defineConfig } from '@ldesign/doc'
import theme from '../dist/index.js'

export default defineConfig({
  title: 'Clean Theme Preview',
  description: '主题开发预览',
  lang: 'zh-CN',
  srcDir: 'docs',
  
  // 使用本地开发的主题
  theme,
  
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Clean Theme',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/guide/components' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '组件', link: '/guide/components' }
          ]
        }
      ]
    },
    
    footer: {
      message: '主题开发预览',
      copyright: 'Copyright © 2024'
    }
  }
})
