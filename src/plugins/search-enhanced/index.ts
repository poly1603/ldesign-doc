/**
 * 增强搜索插件 - 支持模糊搜索、中文分词、过滤器等高级功能
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData, SiteConfig } from '../../shared/types'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import type { ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'
import type { NextFunction } from 'connect'

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
  headings?: Array<{ title: string; slug: string; level: number }>
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

type SearchIndexPublicDoc = {
  path: string
  title: string
  content: string
  headers: string[]
  headings: Array<{ title: string; slug: string; level: number }>
}

const flattenHeaders = (headers: Array<{ title: string; slug: string; level: number; children?: any[] }>): Array<{ title: string; slug: string; level: number }> => {
  const out: Array<{ title: string; slug: string; level: number }> = []
  const walk = (hs: Array<{ title: string; slug: string; level: number; children?: any[] }>) => {
    for (const h of hs) {
      out.push({ title: h.title, slug: h.slug, level: h.level })
      if (Array.isArray(h.children) && h.children.length > 0) walk(h.children as any)
    }
  }
  walk(headers)
  return out
}

function normalizeContent(raw: string): string {
  if (!raw) return ''
  return raw
    // remove fenced code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // remove inline code
    .replace(/`[^`]*`/g, ' ')
    // remove markdown links/images keeping text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // remove headings/markers
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~>#-]/g, ' ')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

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

  const shouldInjectButton = showButton !== false
  const shouldInjectHotkeys = shouldInjectButton && Array.isArray(hotkeys) && hotkeys.length > 0

  let resolvedConfig: SiteConfig | null = null

  const toPublicDocs = (docs: Array<{ path: string; title: string; content: string; headers: string[]; headings: Array<{ title: string; slug: string; level: number }> }>): SearchIndexPublicDoc[] => {
    return docs.map(d => ({
      path: d.path,
      title: d.title,
      content: d.content,
      headers: d.headers,
      headings: d.headings
    }))
  }

  const buildDocsFromSite = async (): Promise<SearchIndexPublicDoc[]> => {
    if (!resolvedConfig) return []

    const { scanPages } = await import('../../node/pages')
    const pages = await scanPages(resolvedConfig)

    const docs: SearchIndexPublicDoc[] = []
    for (const page of pages) {
      let raw = ''
      try {
        raw = readFileSync(page.filePath, 'utf-8')
      } catch {
        raw = ''
      }

      let markdown = raw
      try {
        markdown = matter(raw).content
      } catch {
        markdown = raw
      }

      docs.push({
        path: page.relativePath,
        title: page.title,
        content: normalizeContent(markdown),
        headers: page.headers.map(h => h.title),
        headings: flattenHeaders(page.headers as any)
      })
    }
    return docs
  }

  return definePlugin({
    name: 'ldoc:search-enhanced',
    enforce: 'pre',

    configResolved(config: SiteConfig) {
      resolvedConfig = config
      // Enhanced search plugin initialized
    },

    // 构建时收集搜索索引
    async extendPageData(pageData: PageData, ctx) {
      // 检查是否排除
      const isExcluded = exclude.some(pattern => {
        if (pattern.endsWith('*')) {
          return pageData.relativePath.startsWith(pattern.slice(0, -1))
        }
        return pageData.relativePath === pattern
      })

      if (!isExcluded) {
        const raw = (pageData.content || ctx?.content || '') as string
        let markdown = raw
        try {
          markdown = matter(raw).content
        } catch {
          markdown = raw
        }
        const contentText = normalizeContent(markdown)
        const doc: SearchDocument = {
          id: pageData.relativePath,
          path: pageData.relativePath,
          title: pageData.title,
          content: contentText,
          headers: pageData.headers.map(h => h.title),
          headings: flattenHeaders(pageData.headers as any),
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

    vitePlugins() {
      const plugin = {
        name: 'ldoc:search-enhanced-index-endpoint',
        configureServer(server: ViteDevServer) {
          server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
            try {
              if (!req.url) return next()
              const url = new URL(req.url, 'http://localhost')
              if (url.pathname !== '/__ldoc/search-index.json') return next()

              const docs = await buildDocsFromSite()
              const body = JSON.stringify(docs)
              res.statusCode = 200
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.setHeader('cache-control', 'no-store')
              res.end(body)
            } catch (err) {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ message: 'Search index generation failed', error: String(err) }))
            }
          })
        }
      }
      return [plugin]
    },

    buildEnd(config: SiteConfig) {
      try {
        if (!existsSync(config.outDir)) mkdirSync(config.outDir, { recursive: true })
        const outFile = join(config.outDir, 'ldoc-search-index.json')
        const body = JSON.stringify(toPublicDocs(searchIndex as any))
        writeFileSync(outFile, body, 'utf-8')
      } catch (err) {
        console.error('[ldoc:search-enhanced] write search index failed:', err)
      }
    },

    // 注入搜索组件到导航栏
    slots: shouldInjectButton
      ? {
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
      }
      : undefined,

    // 注入搜索脚本（始终注入索引；快捷键仅在显示按钮时注入，避免与主题自带搜索重复）
    headScripts: shouldInjectButton && shouldInjectHotkeys
      ? [
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
      ]
      : undefined,

    // 在客户端注册搜索按钮组件，供插槽渲染
    clientConfigFile: shouldInjectButton ? `
import { globalComponents } from '@ldesign/doc/plugins/search-enhanced/client'

export { globalComponents }
export default { globalComponents }
`
      : undefined,
  })
}

export default enhancedSearchPlugin
