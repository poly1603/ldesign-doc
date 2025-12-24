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
  imageViewerPlugin,
  lastUpdatedPlugin,
  wordCountPlugin,
  authPlugin,
  componentPlaygroundPlugin
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
    // 顶部公告栏配置
    announcement: {
      content: [
        { text: '🎉 <strong>LDoc 1.0</strong> 正式发布！全新的文档体验，欢迎体验！', link: '/guide/' },
        { text: '✨ 支持 Vue / React 组件实时预览', link: '/guide/markdown' },
        { text: '🚀 基于 Vite 的极速开发体验' }
      ],
      type: 'info',
      closable: true,
      storageKey: 'ldoc-v1.0-new'
    },
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
    },
    ui: {
      progressBar: { enabled: true, height: 3, color: '#3b82f6', trackFetch: process.env.NODE_ENV === 'production', trackXHR: process.env.NODE_ENV === 'production' },
      modal: { type: 'scale', enterDuration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' },
      searchModal: { type: 'zoom', enterDuration: 350, leaveDuration: 220 },
      loginModal: { type: 'scale', enterDuration: 250 }
    }
  },

  // ==================== Markdown 配置 ====================
  markdown: {
    lineNumbers: true,
    theme: { light: 'github-light', dark: 'github-dark' }
  },

  // ==================== 插件配置 ====================
  plugins: [
    progressPlugin({ color: 'var(--ldoc-c-brand)', height: 3, exclude: ['/'] }),
    copyCodePlugin({ showLanguage: true }),
    imageViewerPlugin({ zoom: true }),
    demoPlugin({ defaultTitle: '示例', defaultExpanded: false }),
    componentPlaygroundPlugin(),
    readingTimePlugin({ wordsPerMinute: 300, position: 'doc-top', exclude: [] }),
    wordCountPlugin(),
    lastUpdatedPlugin({ useGitTime: false, position: 'doc-top', exclude: [] }),
    ...(process.env.NODE_ENV === 'production'
      ? [
        commentPlugin({
          provider: 'artalk',
          artalk: {
            server: 'http://swimly.cn:8080/',
            site: 'LDesign Docs',
            darkMode: 'auto'
          }
        })
      ]
      : []),
    authPlugin({
      loginText: '登录',
      onLogin: async (data) => {
        console.log('Login:', data)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
          success: true,
          user: {
            id: '1',
            name: data.username,
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            email: 'admin@example.com'
          }
        }
      },
      onGetUser: async () => {
        return { isLoggedIn: false }
      },
      onLogout: async () => {
        console.log('Logout')
      },
      getCaptcha: () => 'https://dummyimage.com/100x40/e5e7eb/4b5563&text=1234',
      userMenuItems: [
        { text: '个人中心', icon: '👤', onClick: () => alert('点击了个人中心') },
        { text: '设置', icon: '⚙️', onClick: () => alert('点击了设置') }
      ]
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
