/**
 * 中文分词支持
 * 提供简单的中文分词功能，用于改善中文搜索体验
 */

/**
 * 检测文本是否包含 CJK 字符
 */
export function containsCJK(text: string): boolean {
  // CJK 统一表意文字范围
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/u
  return cjkRegex.test(text)
}

/**
 * 简单的中文分词实现
 * 使用基于规则的方法进行分词
 */
export function segmentCJK(text: string): string[] {
  if (!text) return []

  const tokens: string[] = []
  let currentToken = ''
  let isCJKMode = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const isCJKChar = containsCJK(char)

    if (isCJKChar) {
      // CJK 字符
      if (!isCJKMode && currentToken) {
        // 切换到 CJK 模式，保存之前的非 CJK token
        tokens.push(currentToken)
        currentToken = ''
      }

      // 单字分词
      tokens.push(char)

      // 双字组合
      if (i + 1 < text.length && containsCJK(text[i + 1])) {
        tokens.push(char + text[i + 1])
      }

      // 三字组合
      if (i + 2 < text.length && containsCJK(text[i + 1]) && containsCJK(text[i + 2])) {
        tokens.push(char + text[i + 1] + text[i + 2])
      }

      isCJKMode = true
      currentToken = ''
    } else {
      // 非 CJK 字符
      if (isCJKMode) {
        isCJKMode = false
      }

      // 空白字符作为分隔符
      if (/\s/.test(char)) {
        if (currentToken) {
          tokens.push(currentToken)
          currentToken = ''
        }
      } else {
        currentToken += char
      }
    }
  }

  // 添加最后的 token
  if (currentToken) {
    tokens.push(currentToken)
  }

  return tokens.filter(t => t.length > 0)
}

/**
 * 为文本创建搜索索引
 * 包含原始词和分词结果
 */
export function createCJKIndex(text: string): Set<string> {
  const index = new Set<string>()

  // 添加原始文本（小写）
  index.add(text.toLowerCase())

  // 如果包含 CJK 字符，进行分词
  if (containsCJK(text)) {
    const tokens = segmentCJK(text)
    tokens.forEach(token => {
      index.add(token.toLowerCase())
    })
  } else {
    // 非 CJK 文本，按空格分词
    const words = text.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (word) index.add(word)
    })
  }

  return index
}

/**
 * CJK 搜索匹配
 * 支持中文分词的搜索匹配
 */
export function matchCJK(query: string, text: string): boolean {
  if (!query || !text) return false

  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()

  // 精确匹配
  if (lowerText.includes(lowerQuery)) {
    return true
  }

  // 如果查询包含 CJK 字符，使用分词匹配
  if (containsCJK(query)) {
    const queryTokens = segmentCJK(query)
    const textIndex = createCJKIndex(text)

    // 检查是否所有查询 token 都在文本索引中
    return queryTokens.every(token => {
      // 检查精确匹配
      if (textIndex.has(token.toLowerCase())) {
        return true
      }

      // 检查部分匹配
      for (const indexToken of textIndex) {
        if (indexToken.includes(token.toLowerCase())) {
          return true
        }
      }

      return false
    })
  }

  return false
}

/**
 * 批量 CJK 搜索
 * 在文本数组中搜索匹配的项
 */
export function searchCJK<T>(
  query: string,
  items: T[],
  getText: (item: T) => string
): T[] {
  if (!query) return items

  return items.filter(item => {
    const text = getText(item)
    return matchCJK(query, text)
  })
}

/**
 * 高亮 CJK 匹配
 * 在文本中高亮匹配的 CJK 片段
 */
export function highlightCJK(
  text: string,
  query: string,
  tag: string = 'mark'
): string {
  if (!query || !text) return text

  let result = text

  // 精确匹配高亮
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()

  if (lowerText.includes(lowerQuery)) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    result = result.replace(regex, `<${tag}>$1</${tag}>`)
  } else if (containsCJK(query)) {
    // CJK 分词高亮
    const queryTokens = segmentCJK(query)

    for (const token of queryTokens) {
      if (token.length > 0) {
        const regex = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        result = result.replace(regex, `<${tag}>$1</${tag}>`)
      }
    }
  }

  return result
}

/**
 * 提取 CJK 关键词
 * 从文本中提取重要的 CJK 词汇
 */
export function extractCJKKeywords(text: string, maxKeywords: number = 10): string[] {
  if (!containsCJK(text)) {
    // 非 CJK 文本，简单按空格分词
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, maxKeywords)
  }

  const tokens = segmentCJK(text)

  // 统计词频
  const frequency = new Map<string, number>()
  for (const token of tokens) {
    if (token.length >= 2) { // 只考虑长度 >= 2 的词
      frequency.set(token, (frequency.get(token) || 0) + 1)
    }
  }

  // 按频率排序
  const sorted = Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)

  return sorted.slice(0, maxKeywords)
}
