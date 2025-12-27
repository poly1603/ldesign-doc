/**
 * 增强搜索插件 - 支持模糊搜索、中文分词、过滤器等高级功能
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData, SiteConfig } from '../../shared/types'

// 扩展现有 SearchPluginOptions
export interface SearchFilter {
  name: string
  label: string
  field: string
  options: FilterOption[]
}

export interface FilterOption {
  value: string
  label: string
}

export interface EnhancedSearchOptions {
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

  /** 模糊匹配配置 */
  fuzzy?: {
    enabled: boolean
    threshold?: number  // 0-1, 默认 0.6
    distance?: number   // 最大编辑距离
  }

  /** 中文分词配置 */
  cjk?: {
    enabled: boolean
    segmenter?: 'jieba' | 'nodejieba' | 'custom'
    customDict?: string[]
  }

  /** 搜索过滤器 */
  filters?: SearchFilter[]

  /** 搜索建议配置 */
  suggestions?: {
    enabled: boolean
    maxSuggestions?: number
  }

  /** 搜索历史 */
  history?: {
    enabled: boolean
    maxItems?: number
    storageKey?: string
  }
}

// 搜索索引类型
export interface SearchDocument {
  id: string
  path: string
  title: string
  content: string
  headers: string[]
  tags?: string[]
  category?: string
  lastUpdated?: number
  // 用于过滤
  metadata: Record<string, unknown>
}

export interface SearchIndex {
  documents: SearchDocument[]
  invertedIndex: Map<string, Set<string>>
  // 中文分词索引
  cjkIndex?: Map<string, Set<string>>
}

// 全局搜索索引（构建时生成）
const searchIndex: SearchDocument[] = []

/**
 * 增强搜索插件
 */
export function enhancedSearchPlugin(options: EnhancedSearchOptions = {}): LDocPlugin {
  const {
    hotkeys = ['/', 'Ctrl+K', 'Meta+K'],
    maxResults = 10,
    placeholder = '搜索文档...',
    showButton = true,
    exclude = [],
    highlightColor = 'var(--ldoc-c-brand-1)',
    fuzzy = { enabled: true, threshold: 0.6, distance: 2 },
    cjk = { enabled: true, segmenter: 'jieba' },
    filters = [],
    suggestions = { enabled: true, maxSuggestions: 5 },
    history = { enabled: true, maxItems: 10, storageKey: 'ldoc-search-history' }
  } = options

  return definePlugin({
    name: 'ldoc:search-enhanced',
    enforce: 'pre',

    configResolved(config: SiteConfig) {
      // Enhanced search plugin initialized
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
        const doc: SearchDocument = {
          id: pageData.relativePath,
          path: pageData.relativePath,
          title: pageData.title,
          content: '', // 内容在渲染时填充
          headers: pageData.headers.map(h => h.title),
          tags: (pageData.frontmatter.tags as string[]) || [],
          category: (pageData.frontmatter.category as string) || undefined,
          lastUpdated: pageData.lastUpdated,
          metadata: {
            ...pageData.frontmatter,
            category: pageData.frontmatter.category,
            tags: pageData.frontmatter.tags
          }
        }

        searchIndex.push(doc)
      }
    },

    // 注入搜索组件到导航栏
    slots: {
      'nav-bar-content-before': {
        component: 'LDocEnhancedSearch',
        props: {
          placeholder,
          hotkeys,
          maxResults,
          highlightColor,
          fuzzy,
          cjk,
          filters,
          suggestions,
          history
        },
        order: 0
      }
    },

    // 注入搜索脚本
    headScripts: [
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
            window.dispatchEvent(new CustomEvent('ldoc:search-enhanced-open'));
            return;
          }
          if (hotkey === 'Ctrl+K' && ctrl && key === 'k') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('ldoc:search-enhanced-open'));
            return;
          }
          if (hotkey === 'Meta+K' && meta && key === 'k') {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('ldoc:search-enhanced-open'));
            return;
          }
        }
      });
      `
    ],

    // 在客户端注册搜索按钮组件，供插槽渲染
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/search-enhanced/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

export default enhancedSearchPlugin
