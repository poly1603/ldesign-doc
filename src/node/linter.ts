/**
 * 文档检查器 (Documentation Linter)
 * 
 * 检测断链、拼写错误和样式问题
 */

import type { PageData } from '../shared/types'
import { readFileSync } from 'fs'

/**
 * 检查器选项
 */
export interface LinterOptions {
  /** 是否检查断链 */
  checkBrokenLinks?: boolean
  /** 是否检查拼写 */
  checkSpelling?: boolean
  /** 是否检查样式 */
  checkStyle?: boolean
  /** 自定义词典（拼写检查白名单） */
  customDictionary?: string[]
  /** 样式规则配置 */
  styleRules?: StyleRuleConfig
}

/**
 * 样式规则配置
 */
export interface StyleRuleConfig {
  /** 最大行长度 */
  maxLineLength?: number
  /** 是否检查标题层级 */
  checkHeadingHierarchy?: boolean
  /** 是否检查代码块语言标识 */
  checkCodeBlockLanguage?: boolean
  /** 是否检查列表缩进 */
  checkListIndentation?: boolean
}

/**
 * 检查报告
 */
export interface LintReport {
  /** 生成时间 */
  generatedAt: string
  /** 总页面数 */
  totalPages: number
  /** 总问题数 */
  totalIssues: number
  /** 断链问题 */
  brokenLinks: BrokenLinkIssue[]
  /** 拼写问题 */
  spellingIssues: SpellingIssue[]
  /** 样式问题 */
  styleIssues: StyleIssue[]
}

/**
 * 断链问题
 */
export interface BrokenLinkIssue {
  /** 源页面 */
  sourcePage: string
  /** 断开的链接 */
  brokenUrl: string
  /** 链接文本 */
  linkText?: string
  /** 行号 */
  line?: number
}

/**
 * 拼写问题
 */
export interface SpellingIssue {
  /** 页面路径 */
  page: string
  /** 拼写错误的单词 */
  word: string
  /** 行号 */
  line: number
  /** 列号 */
  column: number
  /** 建议的修正 */
  suggestions?: string[]
}

/**
 * 样式问题
 */
export interface StyleIssue {
  /** 页面路径 */
  page: string
  /** 问题类型 */
  type: 'line-length' | 'heading-hierarchy' | 'code-block-language' | 'list-indentation'
  /** 问题描述 */
  message: string
  /** 行号 */
  line: number
  /** 严重程度 */
  severity: 'error' | 'warning'
}

/**
 * 执行文档检查
 */
export async function lintDocumentation(
  pages: PageData[],
  options: LinterOptions = {}
): Promise<LintReport> {
  const {
    checkBrokenLinks = true,
    checkSpelling = true,
    checkStyle = true,
    customDictionary = [],
    styleRules = {}
  } = options

  const brokenLinks: BrokenLinkIssue[] = []
  const spellingIssues: SpellingIssue[] = []
  const styleIssues: StyleIssue[] = []

  // 创建页面路径集合用于断链检查
  const validPaths = new Set(pages.map(p => p.relativePath))

  for (const page of pages) {
    // 读取页面内容
    let content = ''
    try {
      content = readFileSync(page.filePath, 'utf-8')
    } catch (error) {
      continue
    }

    // 检查断链
    if (checkBrokenLinks) {
      const links = extractLinks(content)
      for (const link of links) {
        if (isInternalLink(link.url) && !isValidInternalLink(link.url, validPaths)) {
          brokenLinks.push({
            sourcePage: page.relativePath,
            brokenUrl: link.url,
            linkText: link.text,
            line: link.line
          })
        }
      }
    }

    // 检查拼写
    if (checkSpelling) {
      const spelling = checkSpellingInContent(content, customDictionary)
      spellingIssues.push(...spelling.map(issue => ({
        ...issue,
        page: page.relativePath
      })))
    }

    // 检查样式
    if (checkStyle) {
      const style = checkStyleInContent(content, styleRules)
      styleIssues.push(...style.map(issue => ({
        ...issue,
        page: page.relativePath
      })))
    }
  }

  const totalIssues = brokenLinks.length + spellingIssues.length + styleIssues.length

  return {
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    totalIssues,
    brokenLinks,
    spellingIssues,
    styleIssues
  }
}

/**
 * 从内容中提取链接
 */
export function extractLinks(content: string): Array<{
  url: string
  text?: string
  line?: number
}> {
  const links: Array<{ url: string; text?: string; line?: number }> = []
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    linkRegex.lastIndex = 0
    let match
    while ((match = linkRegex.exec(line)) !== null) {
      links.push({
        url: match[2],
        text: match[1],
        line: i + 1
      })
    }
  }

  return links
}

/**
 * 判断是否为内部链接
 */
export function isInternalLink(url: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return false
  }
  if (url.startsWith('#')) {
    return false
  }
  if (url.startsWith('mailto:')) {
    return false
  }
  return true
}

/**
 * 验证内部链接是否有效
 */
export function isValidInternalLink(url: string, validPaths: Set<string>): boolean {
  let path = url.split('#')[0].split('?')[0]

  if (path.startsWith('./')) {
    path = path.slice(2)
  }
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  path = path.trim()

  if (!path) {
    const trimmedUrl = url.trim()
    if (trimmedUrl.startsWith('#') && trimmedUrl.length > 1) {
      return true
    }
    if (trimmedUrl.startsWith('?') && trimmedUrl.length > 1) {
      const queryPart = trimmedUrl.slice(1).trim()
      return queryPart.length > 0
    }
    return false
  }

  if (validPaths.has(path)) {
    return true
  }
  if (validPaths.has(path + '.md')) {
    return true
  }

  if (path.endsWith('/')) {
    if (validPaths.has(path + 'index.md')) {
      return true
    }
    const pathWithoutSlash = path.slice(0, -1)
    if (validPaths.has(pathWithoutSlash + '/index.md')) {
      return true
    }
  } else {
    if (validPaths.has(path + '/index.md')) {
      return true
    }
  }

  if (path.endsWith('.html')) {
    const mdPath = path.replace(/\.html$/, '.md')
    if (validPaths.has(mdPath)) {
      return true
    }
  }

  return false
}

/**
 * 检查内容中的拼写错误
 */
export function checkSpellingInContent(
  content: string,
  customDictionary: string[] = []
): Array<Omit<SpellingIssue, 'page'>> {
  const issues: Array<Omit<SpellingIssue, 'page'>> = []

  // 构建词典（包含常见技术词汇和自定义词典）
  const dictionary = new Set([
    ...getCommonTechWords(),
    ...customDictionary.map(w => w.toLowerCase())
  ])

  const lines = content.split('\n')
  let inCodeBlock = false

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    // 检测代码块开始/结束
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // 跳过代码块内容
    if (inCodeBlock) {
      continue
    }

    // 跳过链接和图片
    if (line.includes('](') || line.includes('![')) {
      continue
    }

    // 提取单词（只检查英文单词）
    const words = line.match(/\b[a-zA-Z]+\b/g) || []

    for (const word of words) {
      const lowerWord = word.toLowerCase()

      // 跳过短单词和全大写单词（可能是缩写）
      if (word.length <= 2 || word === word.toUpperCase()) {
        continue
      }

      // 检查是否在词典中
      if (!dictionary.has(lowerWord)) {
        const column = line.indexOf(word) + 1
        issues.push({
          word,
          line: lineIndex + 1,
          column,
          suggestions: getSuggestions(word, dictionary)
        })
      }
    }
  }

  return issues
}

/**
 * 检查内容中的样式问题
 */
export function checkStyleInContent(
  content: string,
  rules: StyleRuleConfig = {}
): Array<Omit<StyleIssue, 'page'>> {
  const issues: Array<Omit<StyleIssue, 'page'>> = []
  const {
    maxLineLength = 120,
    checkHeadingHierarchy = true,
    checkCodeBlockLanguage = true,
    checkListIndentation = true
  } = rules

  const lines = content.split('\n')
  let inCodeBlock = false
  let lastHeadingLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    // 检测代码块
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // 进入代码块
        inCodeBlock = true

        // 检查代码块语言标识
        if (checkCodeBlockLanguage) {
          const lang = line.trim().slice(3).trim()
          if (!lang) {
            issues.push({
              type: 'code-block-language',
              message: 'Code block should specify a language',
              line: lineNumber,
              severity: 'warning'
            })
          }
        }
      } else {
        // 退出代码块
        inCodeBlock = false
      }
      continue
    }

    // 跳过代码块内容
    if (inCodeBlock) {
      continue
    }

    // 检查行长度
    if (line.length > maxLineLength) {
      issues.push({
        type: 'line-length',
        message: `Line exceeds maximum length of ${maxLineLength} characters (${line.length})`,
        line: lineNumber,
        severity: 'warning'
      })
    }

    // 检查标题层级
    if (checkHeadingHierarchy) {
      const headingMatch = line.match(/^(#{1,6})\s/)
      if (headingMatch) {
        const level = headingMatch[1].length

        // 检查是否跳过层级
        if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
          issues.push({
            type: 'heading-hierarchy',
            message: `Heading level ${level} follows level ${lastHeadingLevel}, skipping level ${lastHeadingLevel + 1}`,
            line: lineNumber,
            severity: 'warning'
          })
        }

        lastHeadingLevel = level
      }
    }

    // 检查列表缩进
    if (checkListIndentation) {
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s/)
      if (listMatch) {
        const indent = listMatch[1].length

        // 列表缩进应该是2或4的倍数
        if (indent % 2 !== 0) {
          issues.push({
            type: 'list-indentation',
            message: `List item has inconsistent indentation (${indent} spaces)`,
            line: lineNumber,
            severity: 'warning'
          })
        }
      }
    }
  }

  return issues
}

/**
 * 获取常见技术词汇
 */
function getCommonTechWords(): string[] {
  return [
    // 编程语言
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php', 'swift', 'kotlin',
    'rust', 'golang', 'scala', 'perl', 'lua', 'dart', 'elixir', 'haskell', 'clojure',

    // 框架和库
    'vue', 'react', 'angular', 'svelte', 'jquery', 'express', 'fastify', 'nestjs', 'nextjs',
    'nuxt', 'gatsby', 'vite', 'webpack', 'rollup', 'parcel', 'esbuild', 'babel', 'eslint',
    'prettier', 'jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'puppeteer',

    // 技术术语
    'api', 'rest', 'graphql', 'websocket', 'http', 'https', 'ssl', 'tls', 'json', 'xml',
    'yaml', 'markdown', 'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap',
    'async', 'await', 'promise', 'callback', 'closure', 'prototype', 'class', 'interface',
    'enum', 'type', 'generic', 'decorator', 'middleware', 'plugin', 'component', 'directive',
    'composable', 'hook', 'mixin', 'props', 'emit', 'ref', 'reactive', 'computed', 'watch',

    // 工具和平台
    'git', 'github', 'gitlab', 'bitbucket', 'npm', 'yarn', 'pnpm', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'vercel', 'netlify', 'heroku', 'firebase', 'supabase',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'nginx', 'apache',

    // 常见单词
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one',
    'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old',
    'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too',
    'use', 'will', 'with', 'about', 'after', 'also', 'back', 'been', 'before', 'between',
    'both', 'come', 'could', 'down', 'each', 'even', 'first', 'from', 'give', 'good',
    'have', 'here', 'into', 'just', 'know', 'like', 'look', 'make', 'many', 'more',
    'most', 'much', 'must', 'need', 'only', 'other', 'over', 'same', 'should', 'some',
    'such', 'take', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they',
    'this', 'through', 'time', 'very', 'want', 'well', 'what', 'when', 'where', 'which',
    'while', 'work', 'would', 'year', 'your'
  ]
}

/**
 * 获取拼写建议
 */
function getSuggestions(word: string, dictionary: Set<string>): string[] {
  const suggestions: string[] = []
  const lowerWord = word.toLowerCase()

  // 简单的编辑距离算法
  for (const dictWord of dictionary) {
    if (Math.abs(dictWord.length - lowerWord.length) <= 2) {
      const distance = levenshteinDistance(lowerWord, dictWord)
      if (distance <= 2) {
        suggestions.push(dictWord)
      }
    }
  }

  return suggestions.slice(0, 3) // 最多返回3个建议
}

/**
 * 计算 Levenshtein 距离
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * 生成检查报告摘要
 */
export function generateLintSummary(report: LintReport): string {
  const lines: string[] = []

  lines.push('# Documentation Lint Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Total Pages: ${report.totalPages}`)
  lines.push(`Total Issues: ${report.totalIssues}`)
  lines.push('')

  if (report.brokenLinks.length > 0) {
    lines.push(`## Broken Links (${report.brokenLinks.length})`)
    lines.push('')
    for (const link of report.brokenLinks) {
      lines.push(`- **${link.sourcePage}**${link.line ? ` (line ${link.line})` : ''}`)
      lines.push(`  - URL: \`${link.brokenUrl}\``)
      if (link.linkText) {
        lines.push(`  - Text: "${link.linkText}"`)
      }
    }
    lines.push('')
  }

  if (report.spellingIssues.length > 0) {
    lines.push(`## Spelling Issues (${report.spellingIssues.length})`)
    lines.push('')

    // 按页面分组
    const byPage = new Map<string, SpellingIssue[]>()
    for (const issue of report.spellingIssues) {
      if (!byPage.has(issue.page)) {
        byPage.set(issue.page, [])
      }
      byPage.get(issue.page)!.push(issue)
    }

    for (const [page, issues] of byPage) {
      lines.push(`### ${page}`)
      for (const issue of issues) {
        lines.push(`- Line ${issue.line}, Column ${issue.column}: \`${issue.word}\``)
        if (issue.suggestions && issue.suggestions.length > 0) {
          lines.push(`  - Suggestions: ${issue.suggestions.join(', ')}`)
        }
      }
      lines.push('')
    }
  }

  if (report.styleIssues.length > 0) {
    lines.push(`## Style Issues (${report.styleIssues.length})`)
    lines.push('')

    // 按页面分组
    const byPage = new Map<string, StyleIssue[]>()
    for (const issue of report.styleIssues) {
      if (!byPage.has(issue.page)) {
        byPage.set(issue.page, [])
      }
      byPage.get(issue.page)!.push(issue)
    }

    for (const [page, issues] of byPage) {
      lines.push(`### ${page}`)
      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '❌' : '⚠️'
        lines.push(`- ${icon} Line ${issue.line}: ${issue.message}`)
      }
      lines.push('')
    }
  }

  if (report.totalIssues === 0) {
    lines.push('✅ No issues found! Your documentation looks great.')
  }

  return lines.join('\n')
}
