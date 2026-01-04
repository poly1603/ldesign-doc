/**
 * 搜索插件 - 支持本地全文搜索
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData, SiteConfig } from '../../shared/types'

export interface SearchPluginOptions {
  /** 搜索快捷键，默认 '/' 或 'Ctrl+K' */
  hotkeys?: string[]
  /** 最大搜索结果数 */
  maxResults?: number
  /** 搜索占位符文本 */
  placeholder?: string
  /** 是否显示搜索按钮 */
  showButton?: boolean
  /** 排除的路径模式 */
  exclude?: string[]
  /** 搜索结果高亮颜色 */
  highlightColor?: string
}

// 搜索索引类型
interface SearchIndex {
  path: string
  title: string
  content: string
  headers: string[]
}

// 全局搜索索引（构建时生成）
const searchIndex: SearchIndex[] = []

function normalizeContent(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 搜索插件
 */
export function searchPlugin(options: SearchPluginOptions = {}): LDocPlugin {
  const {
    hotkeys = ['/', 'Ctrl+K', 'Meta+K'],
    maxResults = 10,
    placeholder = '搜索文档...',
    showButton = true,
    exclude = [],
    highlightColor = 'var(--ldoc-c-brand-1)'
  } = options

  return definePlugin({
    name: 'ldoc:search',
    enforce: 'pre',

    configResolved(config: SiteConfig) {
      // Search plugin initialized
    },

    // 构建时收集搜索索引
    async extendPageData(pageData: PageData) {
      // 检查是否排除
      const isExcluded = exclude.some(pattern => {
        if (pattern.endsWith('*')) {
          return pageData.relativePath.startsWith(pattern.slice(0, -1))
        }
        return pageData.relativePath === pattern
      })

      if (!isExcluded) {
        searchIndex.push({
          path: pageData.relativePath,
          title: pageData.title,
          content: normalizeContent(pageData.content || ''),
          headers: pageData.headers.map(h => h.title)
        })
      }
    },

    // 注入搜索组件到导航栏
    slots: {
      'nav-bar-content-before': {
        component: 'LDocSearch',
        props: {
          placeholder,
          hotkeys,
          maxResults,
          highlightColor
        },
        order: 0
      }
    },

    // 注入搜索脚本
    headScripts: [
      `window.__LDOC_SEARCH_INDEX__ = ${JSON.stringify(searchIndex)};`,
      `
      // 搜索快捷键监听
      document.addEventListener('keydown', (e) => {
        const hotkeys = ${JSON.stringify(hotkeys)};
        const key = e.key;
        const ctrl = e.ctrlKey;
        const meta = e.metaKey;
        
        for (const hotkey of hotkeys) {
          if (hotkey === key) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('ldoc:search-open'));
            return;
          }
          if (hotkey === 'Ctrl+K' && ctrl && key === 'k') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('ldoc:search-open'));
            return;
          }
          if (hotkey === 'Meta+K' && meta && key === 'k') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('ldoc:search-open'));
            return;
          }
        }
      });
      `
    ],

    // 在客户端注册搜索按钮组件，供插槽渲染
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/search/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

export default searchPlugin
