/**
 * 搜索结果高亮功能
 * 在搜索结果中标记匹配文本并生成内容预览片段
 */

export interface HighlightOptions {
  /** 高亮标签，默认 'mark' */
  tag?: string
  /** 高亮 CSS 类名 */
  className?: string
  /** 预览片段长度（字符数），默认 150 */
  snippetLength?: number
  /** 匹配项周围的上下文字符数，默认 50 */
  contextLength?: number
}

/**
 * 高亮匹配的文本
 * 将匹配的文本用指定标签包裹
 */
export function highlightMatches(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  const { tag = 'mark', className = 'search-highlight' } = options

  if (!query || !text) return text

  // 转义特殊字符
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 创建正则表达式（不区分大小写）
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  // 替换匹配的文本
  const classAttr = className ? ` class="${className}"` : ''
  return text.replace(regex, `<${tag}${classAttr}>$1</${tag}>`)
}

/**
 * 生成内容预览片段
 * 提取包含匹配文本的片段，并在周围添加上下文
 */
export function generateSnippet(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  const {
    snippetLength = 150,
    contextLength = 50
  } = options

  if (!query || !text) return text.substring(0, snippetLength)

  // 查找第一个匹配位置
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const matchIndex = lowerText.indexOf(lowerQuery)

  if (matchIndex === -1) {
    // 没有找到匹配，返回开头部分
    return text.substring(0, snippetLength) + (text.length > snippetLength ? '...' : '')
  }

  // 计算片段的起始和结束位置
  const start = Math.max(0, matchIndex - contextLength)
  const end = Math.min(text.length, matchIndex + query.length + contextLength)

  // 提取片段
  let snippet = text.substring(start, end)

  // 添加省略号
  if (start > 0) {
    snippet = '...' + snippet
  }
  if (end < text.length) {
    snippet = snippet + '...'
  }

  return snippet
}

/**
 * 生成高亮的预览片段
 * 结合片段生成和高亮功能
 */
export function generateHighlightedSnippet(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string {
  // 先生成片段
  const snippet = generateSnippet(text, query, options)

  // 然后高亮匹配的文本
  return highlightMatches(snippet, query, options)
}

/**
 * 查找所有匹配位置
 * 返回所有匹配的起始位置数组
 */
export function findAllMatches(text: string, query: string): number[] {
  if (!query || !text) return []

  const matches: number[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  let index = lowerText.indexOf(lowerQuery)
  while (index !== -1) {
    matches.push(index)
    index = lowerText.indexOf(lowerQuery, index + 1)
  }

  return matches
}

/**
 * 生成多个匹配的预览片段
 * 如果有多个匹配，生成多个片段
 */
export function generateMultipleSnippets(
  text: string,
  query: string,
  options: HighlightOptions = {}
): string[] {
  const {
    snippetLength = 150,
    contextLength = 50
  } = options

  const matches = findAllMatches(text, query)

  if (matches.length === 0) {
    return [text.substring(0, snippetLength) + (text.length > snippetLength ? '...' : '')]
  }

  const snippets: string[] = []
  const maxSnippets = 3 // 最多返回3个片段

  for (let i = 0; i < Math.min(matches.length, maxSnippets); i++) {
    const matchIndex = matches[i]
    const start = Math.max(0, matchIndex - contextLength)
    const end = Math.min(text.length, matchIndex + query.length + contextLength)

    let snippet = text.substring(start, end)

    if (start > 0) {
      snippet = '...' + snippet
    }
    if (end < text.length) {
      snippet = snippet + '...'
    }

    snippets.push(highlightMatches(snippet, query, options))
  }

  return snippets
}

/**
 * 高亮多个查询词
 * 支持同时高亮多个搜索词
 */
export function highlightMultipleQueries(
  text: string,
  queries: string[],
  options: HighlightOptions = {}
): string {
  let result = text

  for (const query of queries) {
    if (query) {
      result = highlightMatches(result, query, options)
    }
  }

  return result
}
