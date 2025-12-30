/**
 * Related Pages Computation
 * Computes related pages based on tags and content similarity
 */

import type { PageData, SiteData, ThemeConfig, SidebarItem, SidebarMulti } from '../../shared/types'

export interface RelatedPage {
  title: string
  link: string
  description?: string
  tags?: string[]
  score: number
}

/**
 * Normalize path for comparison
 */
function normalizePath(path: string): string {
  let normalized = path || '/'
  if (!normalized.startsWith('/')) normalized = '/' + normalized
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  // Remove .html extension
  normalized = normalized.replace(/\.html$/, '')
  return normalized
}

/**
 * Extract tags from frontmatter
 */
function extractTags(frontmatter: Record<string, unknown>): string[] {
  const tags = frontmatter.tags
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === 'string')
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 0

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Extract words from text for content similarity
 */
function extractWords(text: string): Set<string> {
  // Remove markdown syntax and extract words
  const cleaned = text
    .replace(/[#*`_\[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()

  const words = cleaned.match(/[\u4e00-\u9fa5]+|[a-z]+/gi) || []

  // Filter out common stop words and short words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'])

  return new Set(
    words
      .filter(w => w.length > 1 && !stopWords.has(w))
      .slice(0, 100) // Limit to top 100 words
  )
}

/**
 * Get all pages from sidebar configuration
 */
function getAllPagesFromSidebar(
  sidebar: SidebarItem[] | SidebarMulti | undefined,
  currentPath: string
): Array<{ link: string; text: string }> {
  const pages: Array<{ link: string; text: string }> = []

  if (!sidebar) return pages

  // Handle multi-sidebar
  if (!Array.isArray(sidebar)) {
    // Find the matching sidebar group
    const normalizedCurrent = normalizePath(currentPath)
    const matchingKey = Object.keys(sidebar)
      .sort((a, b) => b.length - a.length)
      .find(key => normalizedCurrent.startsWith(normalizePath(key)))

    if (matchingKey) {
      sidebar = sidebar[matchingKey]
    } else {
      // Use first sidebar group as fallback
      const firstKey = Object.keys(sidebar)[0]
      sidebar = firstKey ? sidebar[firstKey] : []
    }
  }

  // Extract pages from sidebar items
  function extractPages(items: SidebarItem[]) {
    for (const item of items) {
      if (item.link && !/^https?:/i.test(item.link)) {
        pages.push({ link: item.link, text: item.text })
      }
      if (item.items) {
        extractPages(item.items)
      }
    }
  }

  if (Array.isArray(sidebar)) {
    extractPages(sidebar)
  }

  return pages
}

/**
 * Compute related pages based on tags and content similarity
 */
export function computeRelatedPages(
  currentPath: string,
  currentPage: PageData,
  siteData: SiteData,
  themeConfig: unknown,
  maxItems: number = 5
): RelatedPage[] {
  const normalizedCurrent = normalizePath(currentPath)
  const currentTags = extractTags((currentPage.frontmatter || {}) as Record<string, unknown>)
  const currentWords = extractWords(
    `${currentPage.title} ${currentPage.description} ${(currentPage.headers || []).map(h => h.title).join(' ')}`
  )

  const theme = themeConfig as ThemeConfig
  const sidebar = theme?.sidebar

  // Get all pages from sidebar
  const allPages = getAllPagesFromSidebar(sidebar, currentPath)

  // Calculate scores for each page
  const scoredPages: RelatedPage[] = []

  for (const page of allPages) {
    const normalizedLink = normalizePath(page.link)

    // Skip current page
    if (normalizedLink === normalizedCurrent) continue

    // For now, we only have title from sidebar
    // In a real implementation, we would need to load page data
    // For this implementation, we'll use a simplified scoring based on path similarity

    let score = 0

    // Path similarity (pages in same directory are more related)
    const currentParts = normalizedCurrent.split('/').filter(Boolean)
    const pageParts = normalizedLink.split('/').filter(Boolean)

    let commonParts = 0
    for (let i = 0; i < Math.min(currentParts.length, pageParts.length); i++) {
      if (currentParts[i] === pageParts[i]) {
        commonParts++
      } else {
        break
      }
    }

    // Weight path similarity
    score += commonParts * 0.3

    // Title similarity (simple word matching)
    const pageWords = extractWords(page.text)
    const titleSimilarity = jaccardSimilarity(currentWords, pageWords)
    score += titleSimilarity * 0.7

    if (score > 0) {
      scoredPages.push({
        title: page.text,
        link: page.link,
        score
      })
    }
  }

  // Sort by score and return top N
  return scoredPages
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
}

/**
 * Compute related pages with full page data (for use in build-time or with page cache)
 */
export function computeRelatedPagesWithData(
  currentPath: string,
  currentPage: PageData,
  allPages: PageData[],
  maxItems: number = 5
): RelatedPage[] {
  const normalizedCurrent = normalizePath(currentPath)
  const currentTags = extractTags((currentPage.frontmatter || {}) as Record<string, unknown>)
  const currentWords = extractWords(
    `${currentPage.title} ${currentPage.description} ${(currentPage.headers || []).map(h => h.title).join(' ')}`
  )

  const scoredPages: RelatedPage[] = []

  for (const page of allPages) {
    const normalizedLink = normalizePath('/' + page.relativePath.replace(/\.md$/, ''))

    // Skip current page
    if (normalizedLink === normalizedCurrent) continue

    let score = 0

    // Tag similarity (highest weight)
    const pageTags = extractTags(page.frontmatter)
    if (currentTags.length > 0 && pageTags.length > 0) {
      const tagSimilarity = jaccardSimilarity(
        new Set(currentTags),
        new Set(pageTags)
      )
      score += tagSimilarity * 2.0 // High weight for tag matches
    }

    // Content similarity
    const pageWords = extractWords(
      `${page.title} ${page.description} ${page.headers.map(h => h.title).join(' ')}`
    )
    const contentSimilarity = jaccardSimilarity(currentWords, pageWords)
    score += contentSimilarity * 1.0

    // Path similarity (pages in same directory)
    const currentParts = normalizedCurrent.split('/').filter(Boolean)
    const pageParts = normalizedLink.split('/').filter(Boolean)

    let commonParts = 0
    for (let i = 0; i < Math.min(currentParts.length, pageParts.length); i++) {
      if (currentParts[i] === pageParts[i]) {
        commonParts++
      } else {
        break
      }
    }
    score += commonParts * 0.5

    if (score > 0) {
      scoredPages.push({
        title: page.title,
        link: normalizedLink,
        description: page.description,
        tags: pageTags,
        score
      })
    }
  }

  // Sort by score and return top N
  return scoredPages
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
}
