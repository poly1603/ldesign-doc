/**
 * 模糊搜索算法实现
 * 使用 Levenshtein 距离算法支持拼写错误容忍
 */

export interface FuzzyOptions {
  threshold?: number  // 0-1, 相似度阈值，默认 0.6
  distance?: number   // 最大编辑距离，默认 2
}

/**
 * 计算 Levenshtein 距离（编辑距离）
 * 返回将字符串 a 转换为字符串 b 所需的最小编辑操作数
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  // 初始化矩阵
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // 填充矩阵
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 替换
          matrix[i][j - 1] + 1,     // 插入
          matrix[i - 1][j] + 1      // 删除
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * 计算相似度分数（0-1）
 * 1 表示完全匹配，0 表示完全不匹配
 */
export function similarityScore(a: string, b: string): number {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  const maxLength = Math.max(a.length, b.length)

  if (maxLength === 0) return 1

  return 1 - distance / maxLength
}

/**
 * 模糊匹配
 * 检查查询字符串是否与目标字符串模糊匹配
 */
export function fuzzyMatch(
  query: string,
  target: string,
  options: FuzzyOptions = {}
): boolean {
  const { threshold = 0.6, distance = 2 } = options

  // 精确匹配
  if (target.toLowerCase().includes(query.toLowerCase())) {
    return true
  }

  // 计算相似度
  const score = similarityScore(query, target)
  if (score >= threshold) {
    return true
  }

  // 检查编辑距离
  const editDistance = levenshteinDistance(query.toLowerCase(), target.toLowerCase())
  if (editDistance <= distance) {
    return true
  }

  // 分词匹配（对于较长的文本）
  const targetWords = target.toLowerCase().split(/\s+/)
  for (const word of targetWords) {
    if (word.includes(query.toLowerCase())) {
      return true
    }

    const wordScore = similarityScore(query, word)
    if (wordScore >= threshold) {
      return true
    }

    const wordDistance = levenshteinDistance(query.toLowerCase(), word)
    if (wordDistance <= distance) {
      return true
    }
  }

  return false
}

/**
 * 模糊搜索
 * 在文本数组中查找与查询字符串模糊匹配的项
 */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  options: FuzzyOptions = {}
): T[] {
  if (!query) return items

  return items.filter(item => {
    const text = getText(item)
    return fuzzyMatch(query, text, options)
  })
}

/**
 * 模糊搜索并排序
 * 返回按相似度排序的结果
 */
export function fuzzySearchWithScore<T>(
  query: string,
  items: T[],
  getText: (item: T) => string,
  options: FuzzyOptions = {}
): Array<{ item: T; score: number }> {
  if (!query) {
    return items.map(item => ({ item, score: 1 }))
  }

  const results = items
    .map(item => {
      const text = getText(item)
      let score = 0

      // 精确匹配得分最高
      if (text.toLowerCase().includes(query.toLowerCase())) {
        score = 1
      } else {
        // 计算相似度
        score = similarityScore(query, text)

        // 分词匹配
        const words = text.toLowerCase().split(/\s+/)
        for (const word of words) {
          if (word.includes(query.toLowerCase())) {
            score = Math.max(score, 0.9)
          } else {
            const wordScore = similarityScore(query, word)
            score = Math.max(score, wordScore * 0.8)
          }
        }
      }

      return { item, score }
    })
    .filter(result => result.score >= (options.threshold || 0.6))
    .sort((a, b) => b.score - a.score)

  return results
}
