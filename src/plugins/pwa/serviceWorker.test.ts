/**
 * Service Worker 生成属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 17: Service worker generation
 * Property 19: Caching strategy implementation
 * Validates: Requirements 5.1, 5.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateServiceWorker,
  getDefaultRuntimeCaching,
  mergeRuntimeCaching
} from './serviceWorker'
import type { ServiceWorkerConfig, RuntimeCacheRule } from './index'

// ============== 自定义生成器 ==============

/**
 * 生成缓存策略
 */
const cacheStrategyArb = fc.constantFrom(
  'cache-first',
  'network-first',
  'stale-while-revalidate'
)

/**
 * 生成预缓存 URL 列表
 */
const precacheUrlsArb = fc.array(
  fc.webUrl({ withFragments: false, withQueryParameters: false }),
  { minLength: 0, maxLength: 10 }
)

/**
 * 生成运行时缓存规则
 */
const runtimeCacheRuleArb: fc.Arbitrary<RuntimeCacheRule> = fc.record({
  urlPattern: fc.oneof(
    fc.constant(/\.(?:png|jpg|jpeg|svg|gif)$/),
    fc.constant(/\.(?:js|css)$/),
    fc.constant(/\.html$/)
  ),
  handler: fc.constantFrom('CacheFirst', 'NetworkFirst', 'StaleWhileRevalidate'),
  options: fc.option(
    fc.record({
      cacheName: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
      expiration: fc.option(
        fc.record({
          maxEntries: fc.option(fc.integer({ min: 1, max: 100 })),
          maxAgeSeconds: fc.option(fc.integer({ min: 60, max: 31536000 }))
        })
      )
    }),
    { nil: undefined }
  )
})

/**
 * 生成 Service Worker 配置
 */
const serviceWorkerConfigArb: fc.Arbitrary<ServiceWorkerConfig> = fc.record({
  strategy: fc.option(cacheStrategyArb, { nil: undefined }),
  precache: fc.option(precacheUrlsArb, { nil: undefined }),
  runtimeCaching: fc.option(
    fc.array(runtimeCacheRuleArb, { minLength: 0, maxLength: 5 }),
    { nil: undefined }
  ),
  skipWaiting: fc.option(fc.boolean(), { nil: undefined }),
  clientsClaim: fc.option(fc.boolean(), { nil: undefined }),
  filename: fc.option(fc.constant('sw.js'), { nil: undefined })
})

// ============== 属性测试 ==============

describe('PWA Plugin - Service Worker Generation', () => {
  /**
   * Property 17: Service worker generation
   * For any valid Service Worker configuration, the generated code SHALL be valid JavaScript
   * and include the configured caching strategy.
   */
  it('Property 17: generates valid service worker code for any configuration', () => {
    fc.assert(
      fc.property(serviceWorkerConfigArb, (config) => {
        const swCode = generateServiceWorker(config)

        // 验证生成的代码不为空
        expect(swCode).toBeTruthy()
        expect(swCode.length).toBeGreaterThan(0)

        // 验证包含必要的 Service Worker 结构
        expect(swCode).toContain('self.addEventListener')
        expect(swCode).toContain('install')
        expect(swCode).toContain('activate')
        expect(swCode).toContain('fetch')

        // 验证包含缓存相关代码
        expect(swCode).toContain('CACHE_NAME')
        expect(swCode).toContain('caches.open')

        // 验证包含配置的预缓存 URLs
        if (config.precache && config.precache.length > 0) {
          expect(swCode).toContain('PRECACHE_URLS')
          config.precache.forEach((url) => {
            expect(swCode).toContain(url)
          })
        }

        // 验证 skipWaiting 配置
        if (config.skipWaiting !== false) {
          expect(swCode).toContain('skipWaiting')
        }

        // 验证 clientsClaim 配置
        if (config.clientsClaim !== false) {
          expect(swCode).toContain('clients.claim')
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 19: Caching strategy implementation
   * For any caching strategy configuration, the generated service worker SHALL implement
   * the specified strategy (cache-first, network-first, or stale-while-revalidate).
   */
  it('Property 19: implements the configured caching strategy correctly', () => {
    fc.assert(
      fc.property(cacheStrategyArb, precacheUrlsArb, (strategy, precache) => {
        const config: ServiceWorkerConfig = {
          strategy,
          precache,
          runtimeCaching: []
        }

        const swCode = generateServiceWorker(config)

        // 验证策略相关的函数存在
        const strategyFunctionMap = {
          'cache-first': 'cacheFirst',
          'network-first': 'networkFirst',
          'stale-while-revalidate': 'staleWhileRevalidate'
        }

        const expectedFunction = strategyFunctionMap[strategy]
        expect(swCode).toContain(expectedFunction)

        // 验证策略的核心逻辑
        switch (strategy) {
          case 'cache-first':
            // Cache First: 先检查缓存
            expect(swCode).toContain('caches.match')
            expect(swCode).toContain('cachedResponse')
            break

          case 'network-first':
            // Network First: 先尝试网络请求
            expect(swCode).toContain('fetch(request)')
            expect(swCode).toContain('.catch')
            break

          case 'stale-while-revalidate':
            // Stale While Revalidate: 返回缓存同时更新
            expect(swCode).toContain('caches.match')
            expect(swCode).toContain('fetchPromise')
            break
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：运行时缓存规则生成
   * For any runtime caching rules, the generated code SHALL include handlers for those rules.
   */
  it('includes runtime caching rules in generated code', () => {
    fc.assert(
      fc.property(
        fc.array(runtimeCacheRuleArb, { minLength: 1, maxLength: 3 }),
        (runtimeCaching) => {
          const config: ServiceWorkerConfig = {
            strategy: 'cache-first',
            precache: [],
            runtimeCaching
          }

          const swCode = generateServiceWorker(config)

          // 验证包含运行时缓存处理函数
          if (runtimeCaching.length > 0) {
            expect(swCode).toContain('handleRuntimeCaching')
          }

          // 验证每个规则的处理器都存在
          runtimeCaching.forEach((rule) => {
            const handler = rule.handler.toLowerCase().replace(/([A-Z])/g, (m) =>
              m.toLowerCase()
            )
            expect(swCode).toContain(handler)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：默认运行时缓存规则
   * The default runtime caching rules SHALL cover common resource types.
   */
  it('provides sensible default runtime caching rules', () => {
    const defaultRules = getDefaultRuntimeCaching()

    // 验证有默认规则
    expect(defaultRules).toBeDefined()
    expect(defaultRules.length).toBeGreaterThan(0)

    // 验证覆盖常见资源类型
    const patterns = defaultRules.map((rule) => rule.urlPattern.toString())
    const hasImages = patterns.some((p) => p.includes('png') || p.includes('jpg'))
    const hasFonts = patterns.some((p) => p.includes('woff') || p.includes('ttf'))
    const hasScripts = patterns.some((p) => p.includes('js') || p.includes('css'))

    expect(hasImages).toBe(true)
    expect(hasFonts).toBe(true)
    expect(hasScripts).toBe(true)

    // 验证每个规则都有合理的配置
    defaultRules.forEach((rule) => {
      expect(rule.handler).toBeDefined()
      expect(['CacheFirst', 'NetworkFirst', 'StaleWhileRevalidate']).toContain(
        rule.handler
      )

      if (rule.options?.cacheName) {
        expect(rule.options.cacheName).toBeTruthy()
      }

      if (rule.options?.expiration) {
        if (rule.options.expiration.maxEntries) {
          expect(rule.options.expiration.maxEntries).toBeGreaterThan(0)
        }
        if (rule.options.expiration.maxAgeSeconds) {
          expect(rule.options.expiration.maxAgeSeconds).toBeGreaterThan(0)
        }
      }
    })
  })

  /**
   * 额外测试：合并运行时缓存规则
   * Merging user rules with defaults SHALL preserve both sets of rules.
   */
  it('merges user runtime caching rules with defaults correctly', () => {
    fc.assert(
      fc.property(
        fc.array(runtimeCacheRuleArb, { minLength: 0, maxLength: 3 }),
        fc.boolean(),
        (userRules, useDefaults) => {
          const merged = mergeRuntimeCaching(userRules, useDefaults)

          if (useDefaults) {
            // 应该包含默认规则和用户规则
            const defaultRules = getDefaultRuntimeCaching()
            expect(merged.length).toBeGreaterThanOrEqual(defaultRules.length)
            expect(merged.length).toBe(defaultRules.length + userRules.length)
          } else {
            // 只包含用户规则
            expect(merged.length).toBe(userRules.length)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：生成的代码语法正确性
   * The generated service worker code SHALL be syntactically valid JavaScript.
   */
  it('generates syntactically valid JavaScript code', () => {
    fc.assert(
      fc.property(serviceWorkerConfigArb, (config) => {
        const swCode = generateServiceWorker(config)

        // 尝试解析生成的代码（不执行）
        // 如果语法错误会抛出异常
        expect(() => {
          // 使用 Function 构造函数验证语法
          new Function(swCode)
        }).not.toThrow()

        return true
      }),
      { numRuns: 50 }
    )
  })
})
