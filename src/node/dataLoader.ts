/**
 * Build-Time Data Loader
 * 
 * 提供类似 VitePress 的 createContentLoader API
 * 用于在构建时加载和处理 Markdown 内容
 * 
 * @example
 * ```ts
 * // posts.data.ts
 * import { createContentLoader } from '@ldesign/doc'
 * 
 * export default createContentLoader('blog/*.md', {
 *   excerpt: true,
 *   transform(data) {
 *     return data.sort((a, b) => 
 *       +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
 *     )
 *   }
 * })
 * ```
 */

import { resolve, relative, dirname } from 'path'
import { readFileSync, existsSync } from 'fs'
import fg from 'fast-glob'
import matter from 'gray-matter'
import { watch as chokidarWatch, type FSWatcher } from 'chokidar'
import type { ContentData, ContentLoaderOptions, ContentLoader } from '../types/dataLoader'
import { normalizePath } from '../shared/utils'

// 默认忽略的目录
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.ldesign/**',
  '**/dist/**'
]

/**
 * 创建内容加载器
 * 
 * @param pattern - glob 模式，相对于项目根目录
 * @param options - 加载器选项
 * @returns 内容加载器对象
 * 
 * @example
 * ```ts
 * // 加载所有博客文章
 * const loader = createContentLoader('blog/*.md', {
 *   excerpt: true,
 *   transform(data) {
 *     return data.filter(p => !p.frontmatter.draft)
 *   }
 * })
 * 
 * // 在组件中使用
 * const posts = await loader.load()
 * ```
 */
export function createContentLoader<T = ContentData[]>(
  pattern: string | string[],
  options: ContentLoaderOptions<T> = {}
): ContentLoader<T> {
  const {
    includeSrc = false,
    render = false,
    excerpt = false,
    transform,
    globOptions = {}
  } = options

  // 确定工作目录
  const cwd = process.cwd()
  
  // 构建 glob 忽略模式
  const ignore = [
    ...DEFAULT_IGNORE,
    ...(globOptions.ignore || [])
  ]

  // 文件监听器
  let watcher: FSWatcher | null = null

  /**
   * 加载单个文件的内容
   */
  const loadFile = async (filePath: string): Promise<ContentData | null> => {
    try {
      const absolutePath = resolve(cwd, filePath)
      if (!existsSync(absolutePath)) {
        return null
      }

      const content = readFileSync(absolutePath, 'utf-8')
      const { data: frontmatter, content: markdown } = matter(content)

      // 计算 URL
      const url = '/' + normalizePath(filePath)
        .replace(/\.md$/, '.html')
        .replace(/index\.html$/, '')

      const result: ContentData = {
        url,
        frontmatter
      }

      // 包含源码
      if (includeSrc) {
        result.src = markdown
      }

      // 渲染 HTML（简化版，实际应使用 markdown 渲染器）
      if (render) {
        // 这里可以集成真正的 markdown 渲染器
        // 目前使用简化的处理
        result.html = markdown
      }

      // 提取摘要
      if (excerpt) {
        if (typeof excerpt === 'function') {
          result.excerpt = excerpt(markdown, frontmatter)
        } else {
          result.excerpt = extractExcerpt(markdown)
        }
      }

      return result
    } catch (error) {
      console.error(`[dataLoader] Failed to load file: ${filePath}`, error)
      return null
    }
  }

  /**
   * 加载所有匹配的文件
   */
  const loadAll = async (): Promise<T> => {
    const patterns = Array.isArray(pattern) ? pattern : [pattern]
    
    // 使用 fast-glob 查找文件
    const files = await fg(patterns, {
      cwd,
      ignore,
      onlyFiles: true
    })

    // 加载所有文件
    const results = await Promise.all(
      files.map(file => loadFile(file))
    )

    // 过滤掉加载失败的文件
    const data = results.filter((item): item is ContentData => item !== null)

    // 应用转换函数
    if (transform) {
      return transform(data)
    }

    return data as unknown as T
  }

  return {
    /**
     * 监听文件变化
     */
    watch(callback: (data: T) => void) {
      const patterns = Array.isArray(pattern) ? pattern : [pattern]
      
      // 创建文件监听器
      watcher = chokidarWatch(patterns, {
        cwd,
        ignored: ignore,
        ignoreInitial: true
      })

      // 监听文件变化事件
      const onChange = async () => {
        const data = await loadAll()
        callback(data)
      }

      watcher.on('add', onChange)
      watcher.on('change', onChange)
      watcher.on('unlink', onChange)

      // 返回停止监听的函数
      return () => {
        if (watcher) {
          watcher.close()
          watcher = null
        }
      }
    },

    /**
     * 加载数据
     */
    load: loadAll
  }
}

/**
 * 提取摘要
 * 默认提取第一个 --- 分隔符之前的内容，或第一段文字
 */
function extractExcerpt(content: string): string {
  // 检查是否有摘要分隔符
  const excerptMatch = content.match(/^([\s\S]*?)(?:\n---\n|$)/)
  if (excerptMatch && excerptMatch[1].trim()) {
    const excerpt = excerptMatch[1].trim()
    // 如果摘要太长，截取前 200 字符
    if (excerpt.length > 200) {
      return excerpt.slice(0, 200) + '...'
    }
    return excerpt
  }

  // 否则提取第一段非标题文字
  const lines = content.split('\n')
  let excerpt = ''
  
  for (const line of lines) {
    const trimmed = line.trim()
    // 跳过空行和标题
    if (!trimmed || trimmed.startsWith('#')) {
      if (excerpt) break
      continue
    }
    // 跳过代码块开始
    if (trimmed.startsWith('```')) {
      if (excerpt) break
      continue
    }
    excerpt += (excerpt ? ' ' : '') + trimmed
    if (excerpt.length > 200) {
      excerpt = excerpt.slice(0, 200) + '...'
      break
    }
  }

  return excerpt
}

// 导出类型
export type { ContentData, ContentLoaderOptions, ContentLoader }
