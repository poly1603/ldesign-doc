/**
 * 代码高亮
 */

import { getHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki'
import type { MarkdownOptions } from '../shared/types'

let highlighter: Highlighter | null = null

/**
 * 创建代码高亮器
 */
export async function createCodeHighlighter(
  options: MarkdownOptions
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
      return escapeHtml(code)
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

      // 提取 code 内容
      const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/)
      return match ? match[1] : escapeHtml(code)
    } catch {
      return escapeHtml(code)
    }
  }
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
