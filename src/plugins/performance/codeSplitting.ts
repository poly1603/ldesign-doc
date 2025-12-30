/**
 * 代码分割优化
 * 配置 Vite 分块策略、提取公共依赖
 */

import type { SiteConfig } from '../../shared/types'
import type { ManualChunksOption } from 'rollup'

export interface CodeSplittingOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 公共依赖提取阈值 */
  minChunks?: number
  /** 最大并行请求数 */
  maxParallelRequests?: number
}

/**
 * 代码分割配置
 */
export function codeSplitting(
  config: SiteConfig,
  options: CodeSplittingOptions = {}
): void {
  const {
    minChunks = 2,
    maxParallelRequests = 30
  } = options

  // 确保 vite 配置存在
  if (!config.vite) {
    config.vite = {}
  }

  if (!config.vite.build) {
    config.vite.build = {}
  }

  if (!config.vite.build.rollupOptions) {
    config.vite.build.rollupOptions = {}
  }

  if (!config.vite.build.rollupOptions.output) {
    config.vite.build.rollupOptions.output = {}
  }

  // 配置手动分块策略
  const manualChunks: ManualChunksOption = (id: string) => {
    // Vue 核心库
    if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
      return 'vendor-vue'
    }

    // React 核心库
    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
      return 'vendor-react'
    }

    // Vue Router
    if (id.includes('node_modules/vue-router/')) {
      return 'vendor-vue-router'
    }

    // Markdown 相关
    if (id.includes('node_modules/markdown-it') || id.includes('node_modules/shiki')) {
      return 'vendor-markdown'
    }

    // Mermaid 图表库（较大）
    if (id.includes('node_modules/mermaid/')) {
      return 'vendor-mermaid'
    }

    // 其他 node_modules 依赖
    if (id.includes('node_modules/')) {
      return 'vendor-common'
    }

    // 主题相关代码
    if (id.includes('/theme-default/') || id.includes('/theme/')) {
      return 'theme'
    }

    // 插件代码
    if (id.includes('/plugins/')) {
      return 'plugins'
    }

    return undefined
  }

  // 应用分块配置
  if (typeof config.vite.build.rollupOptions.output === 'object' && !Array.isArray(config.vite.build.rollupOptions.output)) {
    config.vite.build.rollupOptions.output.manualChunks = manualChunks
  }

  // 配置代码分割优化
  config.vite.build.rollupOptions.output = {
    ...config.vite.build.rollupOptions.output,
    chunkFileNames: 'assets/[name].[hash].js',
    entryFileNames: 'assets/[name].[hash].js',
    assetFileNames: 'assets/[name].[hash].[ext]',
    manualChunks
  }

  // 配置优化选项
  if (!config.vite.build.commonjsOptions) {
    config.vite.build.commonjsOptions = {}
  }

  // 提取公共依赖
  config.vite.build.commonjsOptions.include = [/node_modules/]
}

/**
 * 分析构建产物并生成报告
 */
export interface ChunkInfo {
  name: string
  size: number
  imports: string[]
}

export function analyzeChunks(outDir: string): ChunkInfo[] {
  // TODO: 实现构建产物分析
  // 这将在构建完成后分析生成的 chunk 文件
  return []
}

/**
 * 计算最优分块策略
 */
export function calculateOptimalChunks(
  modules: Map<string, Set<string>>,
  minChunks: number
): Map<string, string[]> {
  const chunks = new Map<string, string[]>()

  // 统计每个模块被引用的次数
  const moduleRefCount = new Map<string, number>()

  for (const [, deps] of modules) {
    for (const dep of deps) {
      moduleRefCount.set(dep, (moduleRefCount.get(dep) || 0) + 1)
    }
  }

  // 将被多次引用的模块提取为公共 chunk
  for (const [module, count] of moduleRefCount) {
    if (count >= minChunks) {
      const chunkName = `common-${chunks.size}`
      chunks.set(chunkName, [module])
    }
  }

  return chunks
}
