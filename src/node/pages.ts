/**
 * 页面扫描和处理
 */

import { resolve, relative, extname } from 'path'
import { readFileSync, statSync } from 'fs'
import fg from 'fast-glob'
import matter from 'gray-matter'
import type { SiteConfig, PageData, Header } from '../shared/types'
import { normalizePath, slugify } from '../shared/utils'

/**
 * 扫描所有 Markdown 页面
 */
export async function scanPages(config: SiteConfig): Promise<PageData[]> {
  const { srcDir } = config

  // 使用 fast-glob 扫描 Markdown 文件
  const files = await fg(['**/*.md'], {
    cwd: srcDir,
    ignore: ['**/node_modules/**', '**/.ldoc/**', '**/dist/**']
  })

  const pages: PageData[] = []

  for (const file of files) {
    const filePath = resolve(srcDir, file)
    const pageData = await processPage(filePath, config)
    if (pageData) {
      pages.push(pageData)
    }
  }

  return pages
}

/**
 * 处理单个页面
 */
export async function processPage(
  filePath: string,
  config: SiteConfig
): Promise<PageData | null> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content: markdown } = matter(content)

    // 提取标题
    const title = frontmatter.title || extractTitle(markdown) || 'Untitled'

    // 提取描述
    const description = frontmatter.description || extractDescription(markdown) || ''

    // 提取标题层级
    const headers = extractHeaders(markdown)

    // 获取文件统计信息
    const stat = statSync(filePath)

    // 计算相对路径
    const relativePath = normalizePath(relative(config.srcDir, filePath))

    return {
      title,
      description,
      frontmatter,
      headers,
      relativePath,
      filePath: normalizePath(filePath),
      lastUpdated: stat.mtimeMs
    }
  } catch (error) {
    console.error(`Error processing page: ${filePath}`, error)
    return null
  }
}

/**
 * 从 Markdown 中提取标题
 */
function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/**
 * 从 Markdown 中提取描述
 */
function extractDescription(markdown: string): string {
  // 跳过标题，获取第一段文字
  const lines = markdown.split('\n')
  let inParagraph = false
  let description = ''

  for (const line of lines) {
    const trimmed = line.trim()

    // 跳过标题和空行
    if (trimmed.startsWith('#') || !trimmed) {
      if (inParagraph) break
      continue
    }

    // 跳过代码块
    if (trimmed.startsWith('```')) {
      if (inParagraph) break
      continue
    }

    inParagraph = true
    description += (description ? ' ' : '') + trimmed

    // 限制长度
    if (description.length > 200) {
      description = description.slice(0, 200) + '...'
      break
    }
  }

  return description
}

/**
 * 从 Markdown 中提取标题层级
 */
function extractHeaders(markdown: string): Header[] {
  const headers: Header[] = []
  const lines = markdown.split('\n')
  const stack: Header[] = []

  let inCodeBlock = false

  for (const line of lines) {
    // 检测代码块
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    if (inCodeBlock) continue

    // 匹配标题
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length
    const title = match[2].trim()
    const slug = slugify(title)

    const header: Header = {
      level,
      title,
      slug,
      children: []
    }

    // 构建层级结构
    if (level === 1 || level === 2) {
      headers.push(header)
      stack.length = 0
      stack.push(header)
    } else {
      // 找到合适的父节点
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length > 0) {
        const parent = stack[stack.length - 1]
        if (!parent.children) parent.children = []
        parent.children.push(header)
      } else {
        headers.push(header)
      }

      stack.push(header)
    }
  }

  return headers
}

/**
 * 获取页面的 URL 路径
 */
export function getPagePath(relativePath: string, base: string = '/'): string {
  let path = relativePath
    .replace(/\.md$/, '.html')
    .replace(/index\.html$/, '')

  if (!path.startsWith('/')) {
    path = '/' + path
  }

  return base.replace(/\/$/, '') + path
}

/**
 * 解析页面链接
 */
export function resolvePageLink(
  link: string,
  currentPath: string,
  config: SiteConfig
): string {
  // 外部链接
  if (/^[a-z]+:/i.test(link)) {
    return link
  }

  // 绝对路径
  if (link.startsWith('/')) {
    return config.base.replace(/\/$/, '') + link
  }

  // 相对路径
  const dir = currentPath.replace(/[^/]+$/, '')
  const resolved = new URL(link, `file://${dir}`).pathname
  return config.base.replace(/\/$/, '') + resolved
}
