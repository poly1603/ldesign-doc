/**
 * 文档健康检查模块
 * 
 * 负责检测断链、过期内容并生成健康报告
 */

import type { PageData } from '../../shared/types'
import type {
  HealthCheckReport,
  BrokenLink,
  OutdatedContent
} from './index'

/**
 * 健康检查选项
 */
export interface HealthCheckOptions {
  /** 是否检查断链 */
  checkBrokenLinks: boolean
  /** 是否检查过期内容 */
  checkOutdated: boolean
  /** 最大过期天数 */
  maxAgeDays: number
}

/**
 * 执行文档健康检查
 * 
 * @param pages 所有页面数据
 * @param options 健康检查选项
 * @returns 健康检查报告
 */
export async function performHealthCheck(
  pages: PageData[],
  options: HealthCheckOptions
): Promise<HealthCheckReport> {
  const brokenLinks: BrokenLink[] = []
  const outdatedContent: OutdatedContent[] = []

  // 创建页面路径集合用于快速查找
  const validPaths = new Set(pages.map(p => p.relativePath))

  // 检查断链
  if (options.checkBrokenLinks) {
    for (const page of pages) {
      const links = extractLinks(page)
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
  }

  // 检查过期内容
  if (options.checkOutdated) {
    const now = Date.now()
    const maxAge = options.maxAgeDays * 24 * 60 * 60 * 1000

    for (const page of pages) {
      if (page.lastUpdated) {
        const age = now - page.lastUpdated
        if (age > maxAge) {
          outdatedContent.push({
            page: page.relativePath,
            lastUpdated: new Date(page.lastUpdated).toISOString(),
            daysOld: Math.floor(age / (24 * 60 * 60 * 1000)),
            title: page.title
          })
        }
      }
    }
  }

  // 计算健康评分
  const healthScore = calculateHealthScore(pages.length, brokenLinks.length, outdatedContent.length)

  return {
    generatedAt: new Date().toISOString(),
    totalPages: pages.length,
    brokenLinks,
    outdatedContent,
    healthScore
  }
}

/**
 * 从页面中提取链接
 * 
 * @param page 页面数据
 * @returns 链接列表
 */
export function extractLinks(page: PageData): Array<{
  url: string
  text?: string
  line?: number
}> {
  const links: Array<{ url: string; text?: string; line?: number }> = []

  // 从 content 中提取 Markdown 链接
  if (page.content) {
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
    let match
    let lineNumber = 1

    const lines = page.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      linkRegex.lastIndex = 0
      while ((match = linkRegex.exec(line)) !== null) {
        links.push({
          url: match[2],
          text: match[1],
          line: i + 1
        })
      }
    }
  }

  return links
}

/**
 * 判断是否为内部链接
 * 
 * @param url 链接 URL
 * @returns 是否为内部链接
 */
export function isInternalLink(url: string): boolean {
  // 排除外部链接
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return false
  }

  // 排除锚点链接
  if (url.startsWith('#')) {
    return false
  }

  // 排除邮件链接
  if (url.startsWith('mailto:')) {
    return false
  }

  return true
}

/**
 * 验证内部链接是否有效
 * 
 * @param url 链接 URL
 * @param validPaths 有效路径集合
 * @returns 是否有效
 */
export function isValidInternalLink(url: string, validPaths: Set<string>): boolean {
  // 移除锚点
  let path = url.split('#')[0]

  // 移除查询参数
  path = path.split('?')[0]

  // 如果是相对路径，需要规范化
  if (path.startsWith('./')) {
    path = path.slice(2)
  }

  // 如果是绝对路径，移除前导斜杠
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  // 移除前后空白
  path = path.trim()

  // 如果路径为空，检查原始 URL 是否为纯锚点或有效的查询参数
  if (!path) {
    const trimmedUrl = url.trim()
    // 纯锚点链接（#section）视为有效
    if (trimmedUrl.startsWith('#') && trimmedUrl.length > 1) {
      return true
    }
    // 纯查询参数（?key=value）视为有效，但必须有实际的查询内容
    // "?" 或 "? " 这样的无效格式应该返回 false
    if (trimmedUrl.startsWith('?') && trimmedUrl.length > 1) {
      // 检查 ? 后面是否有有效的查询参数内容（非空白）
      const queryPart = trimmedUrl.slice(1).trim()
      return queryPart.length > 0
    }
    // 空字符串或纯空白视为无效
    return false
  }

  // 检查路径是否存在
  if (validPaths.has(path)) {
    return true
  }

  // 尝试添加 .md 扩展名
  if (validPaths.has(path + '.md')) {
    return true
  }

  // 处理目录链接（以 / 结尾）
  if (path.endsWith('/')) {
    // 尝试 folder/index.md
    if (validPaths.has(path + 'index.md')) {
      return true
    }
    // 尝试移除尾部斜杠后添加 /index.md
    const pathWithoutSlash = path.slice(0, -1)
    if (validPaths.has(pathWithoutSlash + '/index.md')) {
      return true
    }
  } else {
    // 尝试添加 /index.md（用于没有尾部斜杠的目录链接）
    if (validPaths.has(path + '/index.md')) {
      return true
    }
  }

  // 尝试移除 .html 扩展名
  if (path.endsWith('.html')) {
    const mdPath = path.replace(/\.html$/, '.md')
    if (validPaths.has(mdPath)) {
      return true
    }
  }

  return false
}

/**
 * 计算健康评分
 * 
 * @param totalPages 总页面数
 * @param brokenLinksCount 断链数量
 * @param outdatedCount 过期内容数量
 * @returns 健康评分 (0-100)
 */
export function calculateHealthScore(
  totalPages: number,
  brokenLinksCount: number,
  outdatedCount: number
): number {
  if (totalPages === 0) {
    return 100
  }

  // 断链权重 60%，过期内容权重 40%
  // 计算每种问题导致的扣分
  const brokenLinksDeduction = (brokenLinksCount / totalPages) * 100 * 0.6
  const outdatedDeduction = (outdatedCount / totalPages) * 100 * 0.4

  // 从100分中扣除
  const score = 100 - brokenLinksDeduction - outdatedDeduction

  // 确保分数在 0-100 之间，使用 floor 确保有问题时分数 < 100
  return Math.max(0, Math.min(100, Math.floor(score)))
}

/**
 * 生成健康报告摘要
 * 
 * @param report 健康检查报告
 * @returns 摘要文本
 */
export function generateHealthSummary(report: HealthCheckReport): string {
  const lines: string[] = []

  lines.push('# Documentation Health Report')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Total Pages: ${report.totalPages}`)
  lines.push(`Health Score: ${report.healthScore}/100`)
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

  if (report.outdatedContent.length > 0) {
    lines.push(`## Outdated Content (${report.outdatedContent.length})`)
    lines.push('')
    for (const content of report.outdatedContent) {
      lines.push(`- **${content.title}** (\`${content.page}\`)`)
      lines.push(`  - Last Updated: ${content.lastUpdated}`)
      lines.push(`  - Age: ${content.daysOld} days`)
    }
    lines.push('')
  }

  if (report.brokenLinks.length === 0 && report.outdatedContent.length === 0) {
    lines.push('✅ No issues found! Your documentation is healthy.')
  }

  return lines.join('\n')
}
