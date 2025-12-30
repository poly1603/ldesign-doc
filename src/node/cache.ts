/**
 * 构建缓存系统
 * 
 * 用于加速 LDoc 的构建过程，通过缓存 Markdown 渲染结果和代码高亮结果来减少重复计算。
 * 
 * ## 支持的缓存类型
 * - **Markdown 渲染结果**: 包含 HTML、frontmatter 和标题
 * - **Shiki 代码高亮结果**: 包含高亮后的 HTML 和语言信息
 * - **页面元数据**: 包含页面信息和扩展数据
 * 
 * ## 缓存策略
 * - 基于文件内容的 MD5 哈希判断是否需要重新处理
 * - 支持增量构建，只处理变化的文件
 * - 自动清理过期缓存（默认 7 天）
 * - 缓存存储在 `.ldoc-cache` 目录
 * - 支持内存缓存 + 文件缓存双层架构
 * 
 * ## 使用示例
 * ```ts
 * import { createBuildCache } from '@ldesign/doc'
 * 
 * // 创建缓存实例
 * const cache = createBuildCache('/path/to/project', {
 *   enabled: true,
 *   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 天
 * })
 * 
 * // 读取缓存
 * const cached = cache.get('highlight', cacheKey, contentHash)
 * if (cached) {
 *   return cached.html
 * }
 * 
 * // 写入缓存
 * cache.set('highlight', cacheKey, contentHash, { html, lang })
 * 
 * // 查看统计
 * cache.printStats()
 * ```
 * 
 * @module cache
 */

import { createHash } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'fs'
import { resolve, join, dirname, basename } from 'path'
import * as logger from './logger'

/**
 * 缓存条目
 */
export interface CacheEntry<T = unknown> {
  /** 文件内容哈希 */
  hash: string
  /** 缓存数据 */
  data: T
  /** 创建时间 */
  createdAt: number
  /** 版本号（用于缓存失效） */
  version: string
}

/**
 * Markdown 缓存数据
 */
export interface MarkdownCacheData {
  /** 渲染后的 HTML */
  html: string
  /** 解析的 frontmatter */
  frontmatter: Record<string, unknown>
  /** 提取的标题 */
  headers: Array<{ level: number; title: string; slug: string }>
}

/**
 * 代码高亮缓存数据
 */
export interface HighlightCacheData {
  /** 高亮后的 HTML */
  html: string
  /** 语言 */
  lang: string
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 缓存条目数 */
  entries: number
  /** 缓存大小（字节） */
  size: number
}

/**
 * 缓存配置
 */
export interface CacheOptions {
  /** 缓存目录 */
  cacheDir: string
  /** 缓存版本（用于强制失效） */
  version?: string
  /** 是否启用缓存 */
  enabled?: boolean
  /** 缓存过期时间（毫秒），默认 7 天 */
  maxAge?: number
  /** 最大缓存条目数 */
  maxEntries?: number
}

// 当前缓存版本，更新此值可强制清除旧缓存
const CACHE_VERSION = '1.0.0'

/**
 * 构建缓存管理器
 */
export class BuildCache {
  private cacheDir: string
  private version: string
  private enabled: boolean
  private maxAge: number
  private maxEntries: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    entries: 0,
    size: 0
  }

  // 内存缓存（用于同一次构建过程中的快速访问）
  private memoryCache: Map<string, CacheEntry> = new Map()

  constructor(options: CacheOptions) {
    this.cacheDir = options.cacheDir
    this.version = options.version || CACHE_VERSION
    this.enabled = options.enabled ?? true
    this.maxAge = options.maxAge ?? 7 * 24 * 60 * 60 * 1000 // 7 天
    this.maxEntries = options.maxEntries ?? 10000

    if (this.enabled) {
      this.ensureCacheDir()
    }
  }

  /**
   * 确保缓存目录存在
   */
  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true })
    }

    // 创建子目录
    const subDirs = ['markdown', 'highlight', 'pages']
    for (const dir of subDirs) {
      const subDir = resolve(this.cacheDir, dir)
      if (!existsSync(subDir)) {
        mkdirSync(subDir, { recursive: true })
      }
    }
  }

  /**
   * 计算内容哈希
   */
  private computeHash(content: string): string {
    return createHash('md5').update(content).digest('hex')
  }

  /**
   * 生成缓存文件路径
   */
  private getCachePath(type: string, key: string): string {
    const hash = this.computeHash(key)
    const subDir = resolve(this.cacheDir, type)
    return resolve(subDir, `${hash}.json`)
  }

  /**
   * 读取缓存
   */
  get<T>(type: string, key: string, contentHash: string): T | null {
    if (!this.enabled) return null

    const cacheKey = `${type}:${key}`

    // 先检查内存缓存
    if (this.memoryCache.has(cacheKey)) {
      const entry = this.memoryCache.get(cacheKey) as CacheEntry<T>
      if (this.isValidEntry(entry, contentHash)) {
        this.stats.hits++
        return entry.data
      }
    }

    // 检查文件缓存
    const cachePath = this.getCachePath(type, key)
    if (!existsSync(cachePath)) {
      this.stats.misses++
      return null
    }

    try {
      const content = readFileSync(cachePath, 'utf-8')
      const entry = JSON.parse(content) as CacheEntry<T>

      if (this.isValidEntry(entry, contentHash)) {
        // 写入内存缓存
        this.memoryCache.set(cacheKey, entry)
        this.stats.hits++
        return entry.data
      }
    } catch {
      // 缓存文件损坏，删除它
      try {
        unlinkSync(cachePath)
      } catch {
        // 忽略删除错误
      }
    }

    this.stats.misses++
    return null
  }

  /**
   * 写入缓存
   */
  set<T>(type: string, key: string, contentHash: string, data: T): void {
    if (!this.enabled) return

    const cacheKey = `${type}:${key}`
    const entry: CacheEntry<T> = {
      hash: contentHash,
      data,
      createdAt: Date.now(),
      version: this.version
    }

    // 写入内存缓存
    this.memoryCache.set(cacheKey, entry)

    // 写入文件缓存
    const cachePath = this.getCachePath(type, key)
    try {
      writeFileSync(cachePath, JSON.stringify(entry), 'utf-8')
    } catch (error) {
      // 确保目录存在后重试
      const dir = dirname(cachePath)
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
        try {
          writeFileSync(cachePath, JSON.stringify(entry), 'utf-8')
        } catch {
          // 忽略写入错误
        }
      }
    }
  }

  /**
   * 检查缓存条目是否有效
   */
  private isValidEntry<T>(entry: CacheEntry<T>, contentHash: string): boolean {
    // 检查版本
    if (entry.version !== this.version) {
      return false
    }

    // 检查内容哈希
    if (entry.hash !== contentHash) {
      return false
    }

    // 检查过期时间
    if (Date.now() - entry.createdAt > this.maxAge) {
      return false
    }

    return true
  }

  /**
   * 删除指定缓存
   */
  delete(type: string, key: string): void {
    const cacheKey = `${type}:${key}`
    this.memoryCache.delete(cacheKey)

    const cachePath = this.getCachePath(type, key)
    if (existsSync(cachePath)) {
      try {
        unlinkSync(cachePath)
      } catch {
        // 忽略删除错误
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.memoryCache.clear()

    if (existsSync(this.cacheDir)) {
      this.clearDirectory(this.cacheDir)
    }

    this.stats = { hits: 0, misses: 0, entries: 0, size: 0 }
  }

  /**
   * 递归清除目录
   */
  private clearDirectory(dir: string): void {
    if (!existsSync(dir)) return

    const files = readdirSync(dir)
    for (const file of files) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        this.clearDirectory(filePath)
      } else if (file.endsWith('.json')) {
        try {
          unlinkSync(filePath)
        } catch {
          // 忽略删除错误
        }
      }
    }
  }

  /**
   * 清理过期缓存
   */
  prune(): number {
    let pruned = 0

    if (!existsSync(this.cacheDir)) return pruned

    const subDirs = ['markdown', 'highlight', 'pages']
    const now = Date.now()

    for (const subDir of subDirs) {
      const dir = resolve(this.cacheDir, subDir)
      if (!existsSync(dir)) continue

      const files = readdirSync(dir)
      for (const file of files) {
        if (!file.endsWith('.json')) continue

        const filePath = join(dir, file)
        try {
          const content = readFileSync(filePath, 'utf-8')
          const entry = JSON.parse(content) as CacheEntry

          // 检查版本和过期时间
          if (entry.version !== this.version || now - entry.createdAt > this.maxAge) {
            unlinkSync(filePath)
            pruned++
          }
        } catch {
          // 损坏的缓存文件，删除它
          try {
            unlinkSync(filePath)
            pruned++
          } catch {
            // 忽略删除错误
          }
        }
      }
    }

    return pruned
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    // 计算缓存条目数和大小
    let entries = 0
    let size = 0

    if (existsSync(this.cacheDir)) {
      const subDirs = ['markdown', 'highlight', 'pages']
      for (const subDir of subDirs) {
        const dir = resolve(this.cacheDir, subDir)
        if (!existsSync(dir)) continue

        const files = readdirSync(dir)
        for (const file of files) {
          if (!file.endsWith('.json')) continue

          const filePath = join(dir, file)
          try {
            const stat = statSync(filePath)
            entries++
            size += stat.size
          } catch {
            // 忽略统计错误
          }
        }
      }
    }

    return {
      ...this.stats,
      entries,
      size
    }
  }

  /**
   * 打印缓存统计
   */
  printStats(): void {
    const stats = this.getStats()
    const hitRate = stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)
      : '0.0'
    const sizeKB = (stats.size / 1024).toFixed(1)

    logger.printCacheStats({
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${hitRate}%`,
      entries: stats.entries,
      size: `${sizeKB} KB`
    })
  }

  /**
   * 获取缓存目录
   */
  getCacheDir(): string {
    return this.cacheDir
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.enabled
  }
}

/**
 * 创建 Markdown 缓存键
 */
export function createMarkdownCacheKey(filePath: string, config: { markdown?: object }): string {
  // 包含文件路径和 Markdown 配置的哈希
  const configHash = createHash('md5')
    .update(JSON.stringify(config.markdown || {}))
    .digest('hex')
    .slice(0, 8)

  return `${filePath}:${configHash}`
}

/**
 * 创建代码高亮缓存键
 */
export function createHighlightCacheKey(code: string, lang: string, theme: string | object): string {
  const themeHash = typeof theme === 'string'
    ? theme
    : createHash('md5').update(JSON.stringify(theme)).digest('hex').slice(0, 8)

  return `${lang}:${themeHash}:${createHash('md5').update(code).digest('hex')}`
}

/**
 * 计算文件内容哈希
 */
export function computeContentHash(content: string): string {
  return createHash('md5').update(content).digest('hex')
}

/**
 * 创建构建缓存实例
 * 
 * 这是创建缓存实例的主要方式，自动处理缓存目录的创建和配置。
 * 
 * @param root - 项目根目录，缓存目录将相对于此目录创建
 * @param options - 可选的缓存配置选项
 * @returns BuildCache 实例
 * 
 * @example 基本用法
 * ```ts
 * import { createBuildCache } from '@ldesign/doc'
 * 
 * const cache = createBuildCache('/path/to/project')
 * ```
 * 
 * @example 自定义配置
 * ```ts
 * const cache = createBuildCache('/path/to/project', {
 *   cacheDir: '/custom/cache/dir',
 *   maxAge: 24 * 60 * 60 * 1000, // 1 天
 *   enabled: process.env.NODE_ENV === 'production'
 * })
 * ```
 */
export function createBuildCache(root: string, options?: Partial<CacheOptions>): BuildCache {
  const cacheDir = options?.cacheDir || resolve(root, '.ldoc-cache')
  
  return new BuildCache({
    cacheDir,
    enabled: options?.enabled ?? true,
    version: options?.version,
    maxAge: options?.maxAge,
    maxEntries: options?.maxEntries
  })
}

/**
 * 缓存装饰器 - 用于包装异步函数
 */
export function withCache<T>(
  cache: BuildCache,
  type: string,
  keyFn: (...args: unknown[]) => string,
  hashFn: (...args: unknown[]) => string
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const key = keyFn(...args)
      const hash = hashFn(...args)

      // 尝试从缓存获取
      const cached = cache.get<T>(type, key, hash)
      if (cached !== null) {
        return cached
      }

      // 执行原函数
      const result = await originalMethod.apply(this, args)

      // 写入缓存
      cache.set(type, key, hash, result)

      return result
    }

    return descriptor
  }
}
