/**
 * 共享工具函数
 */

import { createHash } from 'crypto'
import { resolve, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

/**
 * 获取当前文件所在目录
 */
export function getDirname(importMetaUrl: string): string {
  return dirname(fileURLToPath(importMetaUrl))
}

/**
 * 规范化路径
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/')
}

/**
 * 生成短哈希
 */
export function getHash(text: string, length = 8): string {
  return createHash('sha256').update(text).digest('hex').slice(0, length)
}

/**
 * 去除前缀斜杠
 */
export function removeLeadingSlash(str: string): string {
  return str.replace(/^\//, '')
}

/**
 * 确保前缀斜杠
 */
export function ensureLeadingSlash(str: string): string {
  return str.startsWith('/') ? str : '/' + str
}

/**
 * 去除尾部斜杠
 */
export function removeTrailingSlash(str: string): string {
  return str.replace(/\/$/, '')
}

/**
 * 确保尾部斜杠
 */
export function ensureTrailingSlash(str: string): string {
  return str.endsWith('/') ? str : str + '/'
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (!source) return target

  for (const key in source) {
    const targetValue = target[key as keyof T]
    const sourceValue = source[key as keyof T]

    if (isObject(targetValue) && isObject(sourceValue)) {
      deepMerge(targetValue as object, sourceValue as object)
    } else if (sourceValue !== undefined) {
      (target as Record<string, unknown>)[key] = sourceValue
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * 判断是否为外部链接
 */
export function isExternalUrl(url: string): boolean {
  return /^[a-z]+:/i.test(url)
}

/**
 * 解析路径为绝对路径
 */
export function resolveFromRoot(root: string, ...paths: string[]): string {
  return resolve(root, ...paths)
}

/**
 * 获取相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return normalizePath(relative(from, to))
}

/**
 * Slugify 字符串 (用于生成 anchor)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string {
  const { locale = 'zh-CN', ...formatOptions } = options || {}
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    ...formatOptions
  }).format(new Date(date))
}

/**
 * 转义 HTML
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 生成唯一 ID
 */
export function uniqueId(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 11)
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { times?: number; delay?: number } = {}
): Promise<T> {
  const { times = 3, delay = 1000 } = options
  let lastError: Error | undefined

  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < times - 1) {
        await sleep(delay)
      }
    }
  }

  throw lastError
}
