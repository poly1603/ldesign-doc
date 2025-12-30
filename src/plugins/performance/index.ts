/**
 * 性能优化插件
 * 提供图片优化、代码分割、预加载等性能优化功能
 */

import type { LDocPlugin } from '../../shared/types'
import type { SiteConfig } from '../../shared/types'
import { imageOptimization } from './imageOptimization'
import { codeSplitting } from './codeSplitting'
import { preloadHints } from './preloadHints'

export interface PerformanceOptions {
  /**
   * 图片优化配置
   */
  imageOptimization?: {
    /** 是否启用 */
    enabled?: boolean
    /** 是否生成 WebP 格式 */
    webp?: boolean
    /** WebP 质量 (0-100) */
    webpQuality?: number
    /** 是否添加 lazy loading */
    lazyLoading?: boolean
    /** 排除的图片路径模式 */
    exclude?: RegExp[]
  }

  /**
   * 代码分割配置
   */
  codeSplitting?: {
    /** 是否启用 */
    enabled?: boolean
    /** 公共依赖提取阈值 */
    minChunks?: number
    /** 最大并行请求数 */
    maxParallelRequests?: number
  }

  /**
   * 预加载提示配置
   */
  preloadHints?: {
    /** 是否启用 */
    enabled?: boolean
    /** 预加载策略 */
    strategy?: 'prefetch' | 'preload' | 'both'
    /** 最大预加载链接数 */
    maxLinks?: number
  }
}

/**
 * 性能优化插件
 */
export function performancePlugin(options: PerformanceOptions = {}): LDocPlugin {
  const {
    imageOptimization: imageOpts = { enabled: true },
    codeSplitting: codeSplittingOpts = { enabled: true },
    preloadHints: preloadOpts = { enabled: true }
  } = options

  return {
    name: '@ldesign/doc-plugin-performance',

    async configResolved(config: SiteConfig) {
      // 图片优化
      if (imageOpts.enabled !== false) {
        await imageOptimization(config, imageOpts)
      }
    },

    async buildStart(config: SiteConfig) {
      // 代码分割在构建时配置
      if (codeSplittingOpts.enabled !== false) {
        codeSplitting(config, codeSplittingOpts)
      }
    },

    async buildEnd(config: SiteConfig) {
      // 预加载提示在构建结束后添加
      if (preloadOpts.enabled !== false) {
        await preloadHints(config, preloadOpts)
      }
    }
  }
}

export { imageOptimization } from './imageOptimization'
export { codeSplitting } from './codeSplitting'
export { preloadHints } from './preloadHints'
