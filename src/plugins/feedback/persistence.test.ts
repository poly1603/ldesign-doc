/**
 * 反馈数据持久化属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 15: Feedback data persistence
 * Validates: Requirements 4.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { storeFeedback } from './index'
import type { FeedbackData, FeedbackStorageConfig } from './index'

// ============== Mock Setup ==============

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

// Mock fetch
const fetchMock = vi.fn()

beforeEach(() => {
  // 设置 localStorage mock
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // 设置 fetch mock
  global.fetch = fetchMock

  // 清空存储
  localStorageMock.clear()
  fetchMock.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============== 自定义生成器 ==============

/**
 * 生成页面路径
 */
const pagePathArb = fc.oneof(
  fc.constant('/'),
  fc.constant('/guide/'),
  fc.constant('/api/reference'),
  fc.webPath()
)

/**
 * 生成反馈类型
 */
const feedbackTypeArb = fc.constantFrom('helpful', 'rating', 'form', 'inline')

/**
 * 生成时间戳 - 使用固定的有效日期范围
 */
const timestampArb = fc.integer({ min: 1577836800000, max: 1735689600000 }) // 2020-01-01 to 2025-01-01 in ms
  .map((ms) => new Date(ms).toISOString())

/**
 * 生成 JSON 安全的值（不包含 undefined，避免 -0）
 */
const jsonSafeValueArb: fc.Arbitrary<unknown> = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.double({ noNaN: true, noDefaultInfinity: true }).map(n => Object.is(n, -0) ? 0 : n), // 避免 -0
  fc.boolean(),
  fc.constant(null)
)

/**
 * 生成非空的 formData（至少有一个键值对）
 */
const nonEmptyFormDataArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  jsonSafeValueArb,
  { minKeys: 1 }
)

/**
 * 生成反馈数据
 */
const feedbackDataArb: fc.Arbitrary<FeedbackData> = fc
  .record({
    page: pagePathArb,
    type: feedbackTypeArb,
    isHelpful: fc.option(fc.boolean(), { nil: undefined }),
    rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
    formData: fc.option(nonEmptyFormDataArb, { nil: undefined }),
    suggestion: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
    timestamp: timestampArb,
    userAgent: fc.option(fc.string(), { nil: undefined })
  })
  .filter((data) => {
    // 确保至少有一个反馈内容字段
    return (
      data.isHelpful !== undefined ||
      data.rating !== undefined ||
      data.formData !== undefined ||
      data.suggestion !== undefined
    )
  })

/**
 * 生成本地存储配置
 */
const localStorageConfigArb: fc.Arbitrary<FeedbackStorageConfig> = fc.constant({
  type: 'local' as const
})

/**
 * 生成 API 存储配置
 */
const apiStorageConfigArb: fc.Arbitrary<FeedbackStorageConfig> = fc.record({
  type: fc.constant('api' as const),
  endpoint: fc.webUrl()
})

/**
 * 生成 GitHub 存储配置
 */
const githubStorageConfigArb: fc.Arbitrary<FeedbackStorageConfig> = fc.record({
  type: fc.constant('github' as const),
  githubRepo: fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 39 }),
      fc.string({ minLength: 1, maxLength: 100 })
    )
    .map(([owner, repo]) => `${owner}/${repo}`),
  githubToken: fc.option(fc.string({ minLength: 40, maxLength: 40 }), { nil: undefined })
})

/**
 * 生成任意存储配置
 */
const storageConfigArb = fc.oneof(
  localStorageConfigArb,
  apiStorageConfigArb,
  githubStorageConfigArb
)

// ============== 属性测试 ==============

describe('Feedback Plugin - Data Persistence', () => {
  /**
   * Property 15: Feedback data persistence
   * For any feedback submission, the feedback data SHALL be stored and retrievable
   * with all submitted fields intact.
   */
  it('Property 15: stores and retrieves feedback data with all fields intact (localStorage)', async () => {
    await fc.assert(
      fc.asyncProperty(feedbackDataArb, async (feedbackData) => {
        const storage: FeedbackStorageConfig = { type: 'local' }

        // 清空 localStorage，避免测试间干扰
        localStorage.clear()

        // 存储反馈数据
        await storeFeedback(feedbackData, storage)

        // 从 localStorage 检索数据
        const storedData = JSON.parse(localStorage.getItem('ldoc-feedback') || '[]')

        // 验证数据已存储
        expect(storedData).toBeDefined()
        expect(Array.isArray(storedData)).toBe(true)
        expect(storedData.length).toBeGreaterThan(0)

        // 查找刚存储的数据
        const retrievedData = storedData.find(
          (item: FeedbackData) =>
            item.page === feedbackData.page && item.timestamp === feedbackData.timestamp
        )

        // 验证所有字段都完整保存
        expect(retrievedData).toBeDefined()
        expect(retrievedData.page).toBe(feedbackData.page)
        expect(retrievedData.type).toBe(feedbackData.type)
        expect(retrievedData.timestamp).toBe(feedbackData.timestamp)

        // 验证可选字段 - 注意：undefined 值会被过滤掉，所以只检查非 undefined 的字段
        if (feedbackData.isHelpful !== undefined) {
          expect(retrievedData.isHelpful).toBe(feedbackData.isHelpful)
        } else {
          // undefined 字段应该不存在于检索的数据中
          expect(retrievedData.isHelpful).toBeUndefined()
        }

        if (feedbackData.rating !== undefined) {
          expect(retrievedData.rating).toBe(feedbackData.rating)
        } else {
          expect(retrievedData.rating).toBeUndefined()
        }

        if (feedbackData.suggestion !== undefined) {
          expect(retrievedData.suggestion).toBe(feedbackData.suggestion)
        } else {
          expect(retrievedData.suggestion).toBeUndefined()
        }

        if (feedbackData.formData !== undefined) {
          // formData 可能包含嵌套的 undefined，这些会被过滤掉
          // JSON.parse/stringify 也会过滤掉 __proto__ 等危险属性（这是正确的安全行为）
          const cleanFormData = JSON.parse(JSON.stringify(feedbackData.formData))
          // 移除 __proto__ 等特殊属性，因为它们会被 JSON 序列化过滤
          const sanitizedFormData = Object.keys(cleanFormData).reduce((acc, key) => {
            if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
              acc[key] = cleanFormData[key]
            }
            return acc
          }, {} as Record<string, any>)
          expect(retrievedData.formData).toEqual(sanitizedFormData)
        } else {
          expect(retrievedData.formData).toBeUndefined()
        }

        if (feedbackData.userAgent !== undefined) {
          expect(retrievedData.userAgent).toBe(feedbackData.userAgent)
        } else {
          expect(retrievedData.userAgent).toBeUndefined()
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：API 存储调用正确性
   * For any API storage configuration, the feedback SHALL be sent to the configured endpoint.
   */
  it('sends feedback to API endpoint with correct data', async () => {
    await fc.assert(
      fc.asyncProperty(feedbackDataArb, apiStorageConfigArb, async (feedbackData, storage) => {
        // 清空 mock
        fetchMock.mockClear()

        // Mock successful API response
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        } as Response)

        // 存储反馈数据
        await storeFeedback(feedbackData, storage)

        // 验证 fetch 被调用
        expect(fetchMock).toHaveBeenCalledTimes(1)

        // 验证调用参数
        const [url, options] = fetchMock.mock.calls[0]
        expect(url).toBe(storage.endpoint)
        expect(options.method).toBe('POST')
        expect(options.headers['Content-Type']).toBe('application/json')

        // 验证发送的数据
        const sentData = JSON.parse(options.body)
        expect(sentData.page).toBe(feedbackData.page)
        expect(sentData.type).toBe(feedbackData.type)
        expect(sentData.timestamp).toBe(feedbackData.timestamp)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：GitHub Issue 创建正确性
   * For any GitHub storage configuration, the feedback SHALL create an issue with correct format.
   */
  it('creates GitHub issue with correct format', async () => {
    await fc.assert(
      fc.asyncProperty(
        feedbackDataArb,
        githubStorageConfigArb,
        async (feedbackData, storage) => {
          // 清空 mock
          fetchMock.mockClear()

          // Mock successful GitHub API response
          fetchMock.mockResolvedValueOnce({
            ok: true,
            status: 201,
            json: async () => ({ id: 123, number: 1 })
          } as Response)

          // 存储反馈数据
          await storeFeedback(feedbackData, storage)

          // 验证 fetch 被调用
          expect(fetchMock).toHaveBeenCalledTimes(1)

          // 验证调用参数
          const [url, options] = fetchMock.mock.calls[0]
          const [owner, repo] = storage.githubRepo!.split('/')
          expect(url).toBe(`https://api.github.com/repos/${owner}/${repo}/issues`)
          expect(options.method).toBe('POST')
          expect(options.headers['Content-Type']).toBe('application/json')

          // 验证 Authorization header
          if (storage.githubToken) {
            expect(options.headers['Authorization']).toBe(`token ${storage.githubToken}`)
          }

          // 验证 Issue 数据
          const issueData = JSON.parse(options.body)
          expect(issueData.title).toContain(feedbackData.page)
          expect(issueData.body).toContain(feedbackData.page)
          expect(issueData.body).toContain(feedbackData.type)
          expect(issueData.body).toContain(feedbackData.timestamp)
          expect(issueData.labels).toContain('feedback')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：多次存储累积
   * Multiple feedback submissions SHALL accumulate in storage without data loss.
   */
  it('accumulates multiple feedback submissions without data loss', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(feedbackDataArb, { minLength: 2, maxLength: 10 }),
        async (feedbackArray) => {
          const storage: FeedbackStorageConfig = { type: 'local' }

          // 清空 localStorage
          localStorage.clear()

          // 存储所有反馈
          for (const feedback of feedbackArray) {
            await storeFeedback(feedback, storage)
          }

          // 检索所有数据
          const storedData = JSON.parse(localStorage.getItem('ldoc-feedback') || '[]')

          // 验证数量正确
          expect(storedData.length).toBe(feedbackArray.length)

          // 验证每条数据都存在且完整
          for (const originalFeedback of feedbackArray) {
            const found = storedData.find(
              (item: FeedbackData) =>
                item.page === originalFeedback.page &&
                item.timestamp === originalFeedback.timestamp
            )

            expect(found).toBeDefined()
            expect(found.type).toBe(originalFeedback.type)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * 额外测试：存储容量限制
   * When storage exceeds 100 items, oldest items SHALL be removed.
   */
  it('maintains storage limit of 100 items by removing oldest', async () => {
    const storage: FeedbackStorageConfig = { type: 'local' }

    // 创建 105 条反馈数据
    const feedbackArray: FeedbackData[] = Array.from({ length: 105 }, (_, i) => ({
      page: `/page-${i}`,
      type: 'helpful' as const,
      isHelpful: true,
      timestamp: new Date(Date.now() + i * 1000).toISOString()
    }))

    // 存储所有反馈
    for (const feedback of feedbackArray) {
      await storeFeedback(feedback, storage)
    }

    // 检索数据
    const storedData = JSON.parse(localStorage.getItem('ldoc-feedback') || '[]')

    // 验证只保留最新的 100 条
    expect(storedData.length).toBe(100)

    // 验证最旧的 5 条已被移除
    for (let i = 0; i < 5; i++) {
      const found = storedData.find((item: FeedbackData) => item.page === `/page-${i}`)
      expect(found).toBeUndefined()
    }

    // 验证最新的数据仍然存在
    const lastItem = storedData[storedData.length - 1]
    expect(lastItem.page).toBe('/page-104')
  })

  /**
   * 额外测试：数据序列化和反序列化
   * Feedback data SHALL survive JSON serialization round-trip without corruption.
   */
  it('survives JSON serialization round-trip', () => {
    fc.assert(
      fc.property(feedbackDataArb, (feedbackData) => {
        // 序列化
        const serialized = JSON.stringify(feedbackData)

        // 反序列化
        const deserialized = JSON.parse(serialized)

        // 验证所有字段相等
        expect(deserialized.page).toBe(feedbackData.page)
        expect(deserialized.type).toBe(feedbackData.type)
        expect(deserialized.timestamp).toBe(feedbackData.timestamp)

        if (feedbackData.isHelpful !== undefined) {
          expect(deserialized.isHelpful).toBe(feedbackData.isHelpful)
        }

        if (feedbackData.rating !== undefined) {
          expect(deserialized.rating).toBe(feedbackData.rating)
        }

        if (feedbackData.suggestion !== undefined) {
          expect(deserialized.suggestion).toBe(feedbackData.suggestion)
        }

        if (feedbackData.formData !== undefined) {
          expect(deserialized.formData).toEqual(feedbackData.formData)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})
