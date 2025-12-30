/**
 * 代码高亮
 */

import { getHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'
import type { MarkdownOptions } from '../shared/types'
import type { BuildCache, HighlightCacheData } from '../node/cache'
import { createHighlightCacheKey, computeContentHash } from '../node/cache'

let highlighter: Highlighter | null = null

/**
 * 创建代码高亮器
 * @param options - Markdown 配置选项
 * @param cache - 可选的构建缓存实例
 */
export async function createCodeHighlighter(
  options: MarkdownOptions,
  cache?: BuildCache
): Promise<(code: string, lang: string) => string> {
  // 解析主题配置
  const theme = options.theme || {
    light: 'github-light',
    dark: 'github-dark'
  }

  const lightTheme = typeof theme === 'string' ? theme : theme.light
  const darkTheme = typeof theme === 'string' ? theme : theme.dark

  // 创建 Shiki 高亮器
  highlighter = await getHighlighter({
    themes: [lightTheme, darkTheme] as BundledTheme[],
    langs: [
      'javascript',
      'typescript',
      'vue',
      'vue-html',
      'jsx',
      'tsx',
      'html',
      'css',
      'scss',
      'less',
      'json',
      'yaml',
      'markdown',
      'bash',
      'shell',
      'python',
      'java',
      'go',
      'rust',
      'c',
      'cpp',
      'diff',
      'sql',
      ...(options.languages || [])
    ] as BundledLanguage[]
  })

  return (code: string, lang: string): string => {
    if (!highlighter) {
      return wrapLines(escapeHtml(code))
    }

    // 尝试从缓存获取
    if (cache) {
      const cacheKey = createHighlightCacheKey(code, lang, theme)
      const contentHash = computeContentHash(code)
      const cached = cache.get<HighlightCacheData>('highlight', cacheKey, contentHash)
      if (cached) {
        return cached.html
      }
    }

    try {
      // 获取支持的语言列表
      const supportedLangs = highlighter.getLoadedLanguages()
      const actualLang = supportedLangs.includes(lang as BundledLanguage) ? lang : 'text'

      // 使用双主题高亮
      const html = highlighter.codeToHtml(code, {
        lang: actualLang as BundledLanguage,
        themes: {
          light: lightTheme as BundledTheme,
          dark: darkTheme as BundledTheme
        },
        defaultColor: false
      })

      // 提取 code 内容并包装每行
      const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/)
      const result = match ? wrapLines(match[1]) : wrapLines(escapeHtml(code))

      // 写入缓存
      if (cache) {
        const cacheKey = createHighlightCacheKey(code, lang, theme)
        const contentHash = computeContentHash(code)
        cache.set<HighlightCacheData>('highlight', cacheKey, contentHash, {
          html: result,
          lang
        })
      }

      return result
    } catch {
      return wrapLines(escapeHtml(code))
    }
  }
}

/**
 * 将代码内容按行包装成 span.line
 */
function wrapLines(html: string): string {
  // 检查是否已经被 shiki 包装了 line
  if (html.includes('<span class="line">')) {
    // Shiki 输出的 HTML 中，span.line 之间有换行符
    // 这些换行符会被 white-space: pre 渲染成空白行
    // 需要移除 span 之间的换行符，只保留 span 内部的内容
    return html
      .replace(/>\n<span class="line/g, '><span class="line')  // 移除 span 之间的换行
      .replace(/\n$/, '')  // 移除末尾换行
      .trim()
  }

  // 按换行符分割
  const lines = html.split('\n')
  // 移除最后一个空行（如果存在）
  if (lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines.map(line => `<span class="line">${line || '&nbsp;'}</span>`).join('')
}

/**
 * 转义 HTML
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 释放高亮器资源
 */
export function disposeHighlighter(): void {
  if (highlighter) {
    // Shiki v1.x 不需要手动 dispose
    highlighter = null
  }
}
