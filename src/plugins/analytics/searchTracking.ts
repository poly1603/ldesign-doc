/**
 * 搜索查询追踪模块
 * 
 * 负责记录搜索查询、识别内容缺口并生成分析报告
 */

import type { SearchQueryLog } from './index'

/**
 * 搜索追踪配置
 */
export interface SearchTrackingConfig {
  /** 存储方式 */
  storage: 'local' | 'api'
  /** API 端点（当 storage 为 'api' 时） */
  endpoint?: string
  /** 最小结果数阈值 */
  minResultsThreshold: number
}

/**
 * 搜索查询统计
 */
export interface SearchQueryStats {
  /** 总查询数 */
  totalQueries: number
  /** 内容缺口数量 */
  contentGaps: number
  /** 平均结果数 */
  averageResults: number
  /** 最常见的查询 */
  topQueries: Array<{ query: string; count: number }>
  /** 内容缺口查询列表 */
  gapQueries: Array<{ query: string; resultCount: number }>
}

/**
 * 记录搜索查询
 * 
 * @param query 查询文本
 * @param resultCount 结果数量
 * @param config 追踪配置
 */
export async function logSearchQuery(
  query: string,
  resultCount: number,
  config: SearchTrackingConfig
): Promise<void> {
  const log: SearchQueryLog = {
    query,
    resultCount,
    timestamp: new Date().toISOString(),
    isContentGap: resultCount < config.minResultsThreshold
  }

  if (config.storage === 'local') {
    await logToLocalStorage(log)
  } else if (config.storage === 'api' && config.endpoint) {
    await logToAPI(log, config.endpoint)
  }
}

/**
 * 记录到本地存储
 * 
 * @param log 查询日志
 */
async function logToLocalStorage(log: SearchQueryLog): Promise<void> {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const logs = getLogsFromLocalStorage()
    logs.push(log)

    // 保留最近 100 条
    if (logs.length > 100) {
      logs.shift()
    }

    localStorage.setItem('ldoc-search-logs', JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to log search query to localStorage:', error)
  }
}

/**
 * 从本地存储获取日志
 * 
 * @returns 查询日志数组
 */
export function getLogsFromLocalStorage(): SearchQueryLog[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  try {
    const data = localStorage.getItem('ldoc-search-logs')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to read search logs from localStorage:', error)
    return []
  }
}

/**
 * 记录到 API
 * 
 * @param log 查询日志
 * @param endpoint API 端点
 */
async function logToAPI(log: SearchQueryLog, endpoint: string): Promise<void> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(log)
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to log search query to API:', error)
  }
}

/**
 * 分析搜索查询日志
 * 
 * @param logs 查询日志数组
 * @returns 统计信息
 */
export function analyzeSearchLogs(logs: SearchQueryLog[]): SearchQueryStats {
  if (logs.length === 0) {
    return {
      totalQueries: 0,
      contentGaps: 0,
      averageResults: 0,
      topQueries: [],
      gapQueries: []
    }
  }

  // 统计查询频率
  const queryCount = new Map<string, number>()
  let totalResults = 0
  let contentGaps = 0
  const gapQueries: Array<{ query: string; resultCount: number }> = []

  for (const log of logs) {
    // 统计查询次数
    const count = queryCount.get(log.query) || 0
    queryCount.set(log.query, count + 1)

    // 累计结果数
    totalResults += log.resultCount

    // 统计内容缺口
    if (log.isContentGap) {
      contentGaps++
      // 只记录唯一的内容缺口查询
      if (!gapQueries.some(g => g.query === log.query)) {
        gapQueries.push({
          query: log.query,
          resultCount: log.resultCount
        })
      }
    }
  }

  // 计算平均结果数
  const averageResults = totalResults / logs.length

  // 获取最常见的查询（前 10 个）
  const topQueries = Array.from(queryCount.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 按结果数排序内容缺口查询
  gapQueries.sort((a, b) => a.resultCount - b.resultCount)

  return {
    totalQueries: logs.length,
    contentGaps,
    averageResults: Math.round(averageResults * 10) / 10,
    topQueries,
    gapQueries
  }
}

/**
 * 生成搜索分析报告
 * 
 * @param stats 统计信息
 * @returns 报告文本
 */
export function generateSearchReport(stats: SearchQueryStats): string {
  const lines: string[] = []

  lines.push('# Search Query Analysis Report')
  lines.push('')
  lines.push(`Total Queries: ${stats.totalQueries}`)
  lines.push(`Content Gaps: ${stats.contentGaps} (${Math.round((stats.contentGaps / stats.totalQueries) * 100)}%)`)
  lines.push(`Average Results: ${stats.averageResults}`)
  lines.push('')

  if (stats.topQueries.length > 0) {
    lines.push('## Top Queries')
    lines.push('')
    for (const { query, count } of stats.topQueries) {
      lines.push(`- "${query}" (${count} times)`)
    }
    lines.push('')
  }

  if (stats.gapQueries.length > 0) {
    lines.push('## Content Gaps')
    lines.push('')
    lines.push('These queries returned few or no results, indicating potential content gaps:')
    lines.push('')
    for (const { query, resultCount } of stats.gapQueries) {
      lines.push(`- "${query}" (${resultCount} results)`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 清除本地存储的搜索日志
 */
export function clearSearchLogs(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('ldoc-search-logs')
  }
}

/**
 * 导出搜索日志为 JSON
 * 
 * @returns JSON 字符串
 */
export function exportSearchLogs(): string {
  const logs = getLogsFromLocalStorage()
  return JSON.stringify(logs, null, 2)
}

/**
 * 导入搜索日志
 * 
 * @param jsonData JSON 字符串
 */
export function importSearchLogs(jsonData: string): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const logs = JSON.parse(jsonData) as SearchQueryLog[]
    localStorage.setItem('ldoc-search-logs', JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to import search logs:', error)
    throw new Error('Invalid JSON data')
  }
}
