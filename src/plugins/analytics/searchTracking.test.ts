/**
 * 搜索查询追踪属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 28: Search query logging
 * Validates: Requirements 7.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import {
  logSearchQuery,
  getLogsFromLocalStorage,
  analyzeSearchLogs,
  generateSearchReport,
  clearSearchLogs,
  exportSearchLogs,
  importSearchLogs
} from './searchTracking'
import type { SearchQueryLog } from './index'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// @ts-ignore
global.localStorage = localStorageMock

// ============== 生成器 ==============

/**
 * 非空白字符串生成器
 * 确保生成的字符串不是纯空白
 */
const nonWhitespaceStringArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)

/**
 * 搜索查询日志生成器
 */
const searchQueryLogArb = fc.record({
  query: nonWhitespaceStringArb,
  resultCount: fc.integer({ min: 0, max: 100 }),
  timestamp: fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ms => new Date(ms).toISOString()),
  isContentGap: fc.boolean()
})

/**
 * 搜索追踪配置生成器
 */
const searchTrackingConfigArb = fc.record({
  storage: fc.constantFrom('local' as const, 'api' as const),
  endpoint: fc.option(fc.webUrl(), { nil: undefined }),
  minResultsThreshold: fc.integer({ min: 1, max: 10 })
})

// ============== 属性测试 ==============

describe('Search Tracking - Property Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  /**
   * Property 28: Search query logging
   * 
   * For any search query when analytics is enabled, the query SHALL be logged
   * with timestamp and result count.
   * 
   * Validates: Requirements 7.4
   */
  describe('Property 28: Search query logging', () => {
    it('should log search queries with all required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          nonWhitespaceStringArb,
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 1, max: 10 }),
          async (query, resultCount, threshold) => {
            // 清除之前的日志以确保测试隔离
            localStorageMock.clear()

            const config = {
              storage: 'local' as const,
              minResultsThreshold: threshold
            }

            await logSearchQuery(query, resultCount, config)

            const logs = getLogsFromLocalStorage()

            // 应该有一条日志
            expect(logs.length).toBe(1)

            // 第一条日志应该是我们刚记录的
            const log = logs[0]

            // 日志应包含所有必需字段
            expect(log).toHaveProperty('query')
            expect(log).toHaveProperty('resultCount')
            expect(log).toHaveProperty('timestamp')
            expect(log).toHaveProperty('isContentGap')

            // 字段值应该正确
            expect(log.query).toBe(query)
            expect(log.resultCount).toBe(resultCount)

            // 时间戳应该是有效的 ISO 字符串
            const timestamp = new Date(log.timestamp)
            expect(timestamp.toString()).not.toBe('Invalid Date')

            // isContentGap 应该根据阈值正确设置
            expect(log.isContentGap).toBe(resultCount < threshold)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should limit stored logs to 100 entries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 101, max: 150 }),
          async (numLogs) => {
            // 清除之前的日志以确保测试隔离
            localStorageMock.clear()

            const config = {
              storage: 'local' as const,
              minResultsThreshold: 3
            }

            // 记录多条日志
            for (let i = 0; i < numLogs; i++) {
              await logSearchQuery(`query-${i}`, i, config)
            }

            const logs = getLogsFromLocalStorage()

            // 应该只保留最近 100 条
            expect(logs.length).toBe(100)

            // 最早的日志应该被移除（前 numLogs - 100 条）
            const firstLog = logs[0]
            const expectedFirstIndex = numLogs - 100
            expect(firstLog.query).toBe(`query-${expectedFirstIndex}`)

            // 最新的日志应该保留
            const lastLog = logs[logs.length - 1]
            expect(lastLog.query).toBe(`query-${numLogs - 1}`)

            return true
          }
        ),
        { numRuns: 10 }
      )
    })

    it('should correctly identify content gaps', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          async (resultCount, threshold) => {
            // 清除之前的日志以确保测试隔离
            localStorageMock.clear()

            const config = {
              storage: 'local' as const,
              minResultsThreshold: threshold
            }

            await logSearchQuery('test-query', resultCount, config)

            const logs = getLogsFromLocalStorage()
            expect(logs.length).toBe(1)

            const log = logs[0]

            // isContentGap 应该正确反映结果数是否低于阈值
            const expectedGap = resultCount < threshold
            expect(log.isContentGap).toBe(expectedGap)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Search Log Analysis', () => {
    it('should analyze logs and produce valid statistics', () => {
      fc.assert(
        fc.property(
          fc.array(searchQueryLogArb, { minLength: 1, maxLength: 50 }),
          (logs) => {
            const stats = analyzeSearchLogs(logs)

            // 统计应包含所有必需字段
            expect(stats).toHaveProperty('totalQueries')
            expect(stats).toHaveProperty('contentGaps')
            expect(stats).toHaveProperty('averageResults')
            expect(stats).toHaveProperty('topQueries')
            expect(stats).toHaveProperty('gapQueries')

            // 总查询数应匹配
            expect(stats.totalQueries).toBe(logs.length)

            // 内容缺口数应该 <= 总查询数
            expect(stats.contentGaps).toBeLessThanOrEqual(logs.length)

            // 平均结果数应该 >= 0
            expect(stats.averageResults).toBeGreaterThanOrEqual(0)

            // topQueries 应该是数组
            expect(Array.isArray(stats.topQueries)).toBe(true)

            // topQueries 最多 10 个
            expect(stats.topQueries.length).toBeLessThanOrEqual(10)

            // gapQueries 应该是数组
            expect(Array.isArray(stats.gapQueries)).toBe(true)

            // 所有 gapQueries 应该是内容缺口
            for (const gap of stats.gapQueries) {
              const matchingLog = logs.find(l => l.query === gap.query)
              if (matchingLog) {
                expect(matchingLog.isContentGap).toBe(true)
              }
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty log array', () => {
      const stats = analyzeSearchLogs([])

      expect(stats.totalQueries).toBe(0)
      expect(stats.contentGaps).toBe(0)
      expect(stats.averageResults).toBe(0)
      expect(stats.topQueries).toHaveLength(0)
      expect(stats.gapQueries).toHaveLength(0)
    })

    it('should correctly count content gaps', () => {
      fc.assert(
        fc.property(
          fc.array(searchQueryLogArb, { minLength: 1, maxLength: 50 }),
          (logs) => {
            const stats = analyzeSearchLogs(logs)

            // 手动计算内容缺口数
            const expectedGaps = logs.filter(l => l.isContentGap).length

            expect(stats.contentGaps).toBe(expectedGaps)

            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should sort top queries by frequency', () => {
      fc.assert(
        fc.property(
          fc.array(searchQueryLogArb, { minLength: 2, maxLength: 50 }),
          (logs) => {
            const stats = analyzeSearchLogs(logs)

            // topQueries 应该按频率降序排列
            for (let i = 0; i < stats.topQueries.length - 1; i++) {
              expect(stats.topQueries[i].count).toBeGreaterThanOrEqual(
                stats.topQueries[i + 1].count
              )
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Search Report Generation', () => {
    it('should generate valid report for any statistics', () => {
      fc.assert(
        fc.property(
          fc.array(searchQueryLogArb, { minLength: 0, maxLength: 50 }),
          (logs) => {
            const stats = analyzeSearchLogs(logs)
            const report = generateSearchReport(stats)

            // 报告应包含标题
            expect(report).toContain('Search Query Analysis Report')

            // 报告应包含总查询数
            expect(report).toContain(`Total Queries: ${stats.totalQueries}`)

            // 报告应包含内容缺口数
            expect(report).toContain(`Content Gaps: ${stats.contentGaps}`)

            // 报告应包含平均结果数
            expect(report).toContain(`Average Results: ${stats.averageResults}`)

            // 如果有 top queries，报告应包含它们
            if (stats.topQueries.length > 0) {
              expect(report).toContain('Top Queries')
            }

            // 如果有内容缺口，报告应包含它们
            if (stats.gapQueries.length > 0) {
              expect(report).toContain('Content Gaps')
            }

            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Import/Export', () => {
    it('should export and import logs correctly', () => {
      fc.assert(
        fc.property(
          fc.array(searchQueryLogArb, { minLength: 1, maxLength: 20 }),
          (logs) => {
            // 存储日志
            localStorage.setItem('ldoc-search-logs', JSON.stringify(logs))

            // 导出
            const exported = exportSearchLogs()

            // 清除
            clearSearchLogs()
            expect(getLogsFromLocalStorage()).toHaveLength(0)

            // 导入
            importSearchLogs(exported)

            // 验证导入的日志
            const imported = getLogsFromLocalStorage()
            expect(imported).toHaveLength(logs.length)

            // 验证每条日志的内容
            for (let i = 0; i < logs.length; i++) {
              expect(imported[i].query).toBe(logs[i].query)
              expect(imported[i].resultCount).toBe(logs[i].resultCount)
              expect(imported[i].isContentGap).toBe(logs[i].isContentGap)
            }

            return true
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // ============== 单元测试（补充） ==============

  describe('Basic Functionality', () => {
    it('should log a single query', async () => {
      const config = {
        storage: 'local' as const,
        minResultsThreshold: 3
      }

      await logSearchQuery('test query', 5, config)

      const logs = getLogsFromLocalStorage()
      expect(logs).toHaveLength(1)
      expect(logs[0].query).toBe('test query')
      expect(logs[0].resultCount).toBe(5)
      expect(logs[0].isContentGap).toBe(false)
    })

    it('should mark low-result queries as content gaps', async () => {
      const config = {
        storage: 'local' as const,
        minResultsThreshold: 5
      }

      await logSearchQuery('rare query', 2, config)

      const logs = getLogsFromLocalStorage()
      expect(logs[0].isContentGap).toBe(true)
    })

    it('should clear all logs', async () => {
      const config = {
        storage: 'local' as const,
        minResultsThreshold: 3
      }

      await logSearchQuery('query 1', 5, config)
      await logSearchQuery('query 2', 3, config)

      expect(getLogsFromLocalStorage()).toHaveLength(2)

      clearSearchLogs()

      expect(getLogsFromLocalStorage()).toHaveLength(0)
    })
  })
})
