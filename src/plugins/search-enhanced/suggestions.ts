/**
 * 搜索建议功能
 * 当无结果时提供相似词建议
 */

import { similarityScore } from './fuzzy'
import type { SearchDocument } from './index'

export interface SuggestionOptions {
  /** 最大建议数量 */
  maxSuggestions?: number
  /** 相似度阈值 */
  threshold?: number
  /** 是否包含热门搜索 */
  includePopular?: boolean
}

/**
 * 生成搜索建议
 * 基于索引中的词汇生成相似词建议
 */
export function generateSuggestions(
  query: string,
  documents: SearchDocument[],
  options: SuggestionOptions = {}
): string[] {
  const {
    maxSuggestions = 5,
    threshold = 0.5,
    includePopular = true
  } = options

  if (!query) {
    // 无查询时，返回热门词汇
    if (includePopular) {
      return getPopularTerms(documents, maxSuggestions)
    }
    return []
  }

  // 收集所有可能的词汇
  const terms = extractAllTerms(documents)

  // 计算相似度并排序
  const suggestions = terms
    .map(term => ({
      term,
      score: similarityScore(query.toLowerCase(), term.toLowerCase())
    }))
    .filter(item => item.score >= threshold && item.term.toLowerCase() !== query.toLowerCase())
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(item => item.term)

  return suggestions
}

/**
 * 从文档中提取所有词汇
 */
function extractAllTerms(documents: SearchDocument[]): string[] {
  const termsSet = new Set<string>()

  for (const doc of documents) {
    // 添加标题词汇
    if (doc.title) {
      const titleWords = doc.title.toLowerCase().split(/\s+/)
      titleWords.forEach(word => {
        if (word.length > 2) termsSet.add(word)
      })
    }

    // 添加标签
    if (doc.tags) {
      doc.tags.forEach(tag => {
        if (tag.length > 0) termsSet.add(tag.toLowerCase())
      })
    }

    // 添加分类
    if (doc.category) {
      termsSet.add(doc.category.toLowerCase())
    }

    // 添加标题中的词
    if (doc.headers) {
      doc.headers.forEach(header => {
        const words = header.toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.length > 2) termsSet.add(word)
        })
      })
    }
  }

  return Array.from(termsSet)
}

/**
 * 获取热门搜索词
 * 基于文档频率返回最常见的词汇
 */
export function getPopularTerms(
  documents: SearchDocument[],
  maxTerms: number = 10
): string[] {
  const termFrequency = new Map<string, number>()

  for (const doc of documents) {
    // 统计标题词频
    if (doc.title) {
      const words = doc.title.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 2) {
          termFrequency.set(word, (termFrequency.get(word) || 0) + 1)
        }
      })
    }

    // 统计标签频率
    if (doc.tags) {
      doc.tags.forEach(tag => {
        if (tag.length > 0) {
          termFrequency.set(tag.toLowerCase(), (termFrequency.get(tag.toLowerCase()) || 0) + 2)
        }
      })
    }

    // 统计分类频率
    if (doc.category) {
      termFrequency.set(doc.category.toLowerCase(), (termFrequency.get(doc.category.toLowerCase()) || 0) + 3)
    }
  }

  // 排序并返回前 N 个
  return Array.from(termFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTerms)
    .map(([term]) => term)
}

/**
 * 生成相关搜索建议
 * 基于当前查询生成相关的搜索词
 */
export function generateRelatedQueries(
  query: string,
  documents: SearchDocument[],
  maxQueries: number = 5
): string[] {
  if (!query) return []

  const relatedTerms = new Set<string>()
  const queryLower = query.toLowerCase()

  // 查找包含查询词的文档
  const matchingDocs = documents.filter(doc => {
    const title = doc.title.toLowerCase()
    const content = doc.content.toLowerCase()
    return title.includes(queryLower) || content.includes(queryLower)
  })

  // 从匹配的文档中提取相关词汇
  for (const doc of matchingDocs) {
    // 添加标签
    if (doc.tags) {
      doc.tags.forEach(tag => {
        if (tag.toLowerCase() !== queryLower) {
          relatedTerms.add(tag)
        }
      })
    }

    // 添加分类
    if (doc.category && doc.category.toLowerCase() !== queryLower) {
      relatedTerms.add(doc.category)
    }

    // 从标题中提取相关词
    const titleWords = doc.title.toLowerCase().split(/\s+/)
    titleWords.forEach(word => {
      if (word.length > 2 && word !== queryLower && !relatedTerms.has(word)) {
        relatedTerms.add(word)
      }
    })
  }

  return Array.from(relatedTerms).slice(0, maxQueries)
}

/**
 * 拼写纠正建议
 * 检测常见的拼写错误并提供纠正建议
 */
export function suggestSpellingCorrection(
  query: string,
  documents: SearchDocument[]
): string | null {
  if (!query || query.length < 3) return null

  const terms = extractAllTerms(documents)

  // 查找最相似的词（编辑距离 <= 2）
  let bestMatch: string | null = null
  let bestScore = 0

  for (const term of terms) {
    const score = similarityScore(query.toLowerCase(), term.toLowerCase())

    // 如果相似度很高但不完全相同，可能是拼写错误
    if (score > bestScore && score >= 0.7 && score < 1.0) {
      bestScore = score
      bestMatch = term
    }
  }

  return bestMatch
}

/**
 * 自动完成建议
 * 基于前缀匹配生成自动完成建议
 */
export function generateAutocompleteSuggestions(
  prefix: string,
  documents: SearchDocument[],
  maxSuggestions: number = 10
): string[] {
  if (!prefix || prefix.length < 2) return []

  const terms = extractAllTerms(documents)
  const prefixLower = prefix.toLowerCase()

  // 查找以前缀开头的词汇
  const matches = terms
    .filter(term => term.toLowerCase().startsWith(prefixLower))
    .sort((a, b) => a.length - b.length) // 优先短词
    .slice(0, maxSuggestions)

  return matches
}

/**
 * 组合建议生成器
 * 综合多种策略生成建议
 */
export function generateCombinedSuggestions(
  query: string,
  documents: SearchDocument[],
  hasResults: boolean,
  options: SuggestionOptions = {}
): {
  suggestions: string[]
  relatedQueries: string[]
  spellingCorrection: string | null
  autocompleteSuggestions: string[]
} {
  const { maxSuggestions = 5 } = options

  return {
    suggestions: hasResults
      ? []
      : generateSuggestions(query, documents, options),
    relatedQueries: hasResults
      ? generateRelatedQueries(query, documents, maxSuggestions)
      : [],
    spellingCorrection: hasResults
      ? null
      : suggestSpellingCorrection(query, documents),
    autocompleteSuggestions: generateAutocompleteSuggestions(query, documents, maxSuggestions)
  }
}
