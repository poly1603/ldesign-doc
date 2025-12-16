/**
 * LDoc 站点配置
 * 
 * 配置结构参考 VitePress：https://vitepress.dev/zh/reference/site-config
 * 
 * 配置文件组织：
 * - doc.config.ts      主配置文件
 * - configs/nav.ts     导航配置
 * - configs/sidebar.ts 侧边栏配置
 */
import { defineConfig } from '@ldesign/doc'
import {
  commentPlugin,
  readingTimePlugin,
  progressPlugin,
  copyCodePlugin,
  demoPlugin,
  searchPlugin,
  imageViewerPlugin,
  lastUpdatedPlugin,
  wordCountPlugin
} from '@ldesign/doc/plugins'

// 导入导航和侧边栏配置
import { zhNav, enNav } from './configs/nav'
import { zhSidebar, enSidebar } from './configs/sidebar'

export default defineConfig({
  // ==================== 站点元数据 ====================
  title: 'LDoc 演示站点',
  description: '现代化文档系统 - 支持 Vue/React 组件、主题定制、插件扩展',
  lang: 'zh-CN',

  // ==================== 路由配置 ====================
  srcDir: '.ldesign/docs',

  // ==================== 多语言配置 ====================
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar,
        footer: {
          message: 'Released under the MIT License',
          copyright: 'Copyright © 2024 LDesign'
        },
        outline: { level: [2, 3], label: 'On this page' },
        lastUpdated: { text: 'Last updated' },
        editLink: {
          pattern: 'https://github.com/nicepkg/ldesign/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        }
      }
    }
  },

  // ==================== 主题配置 ====================
  themeConfig: {
    logo: 'https://wuhan.yxybb.com/ldesign/source/npm-logo.svg',
    siteTitle: 'LDesign',
    nav: zhNav,
    sidebar: zhSidebar,

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

    outline: { level: [2, 3], label: '本页目录' },
    lastUpdated: { text: '最后更新' },

    layout: {
      sidebarWidth: 260,
      outlineWidth: 220,
      navHeight: 64,
      maxWidth: 1400
    }
  },

  // ==================== Markdown 配置 ====================
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' }
  },

  // ==================== 插件配置 ====================
  plugins: [
    searchPlugin({ hotkeys: ['/', 'Ctrl+K'] }),
    progressPlugin({ color: 'var(--ldoc-c-brand)', height: 3, exclude: ['/'] }),
    copyCodePlugin({ showLanguage: true }),
    imageViewerPlugin({ zoom: true }),
    demoPlugin({ defaultTitle: '示例', defaultExpanded: false }),
    readingTimePlugin({ wordsPerMinute: 300 }),
    wordCountPlugin(),
    lastUpdatedPlugin({ useGitTime: false }),
    commentPlugin({
      provider: 'artalk',
      artalk: {
        server: 'http://swimly.cn:8080/',
        site: 'LDesign Docs',
        darkMode: 'auto'
      }
    })
  ],

  // ==================== Vite 配置 ====================
  vite: {
    server: {
      port: 8878,
      host: true,
      open: true
    }
  },

  // ==================== 部署配置 ====================
  deploy: {
    platform: 'surge',
    surge: { domain: 'ldoc-playground.surge.sh' }
  }
})
