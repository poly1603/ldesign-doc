/**
 * 文档分析插件 - 支持多平台分析、文档健康检查和搜索追踪
 * 
 * 功能：
 * - 多平台分析脚本注入（Google Analytics、Plausible、Umami）
 * - 文档健康检查（断链检测、过期内容检测）
 * - 搜索查询追踪和内容缺口识别
 * - 分析仪表板
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, SiteConfig, PageData } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * Google Analytics 配置
 */
export interface GoogleAnalyticsConfig {
  /** 测量 ID (G-XXXXXXXXXX) */
  measurementId: string
  /** 是否启用增强测量 */
  enhancedMeasurement?: boolean
  /** 自定义维度 */
  customDimensions?: Record<string, string>
}

/**
 * Plausible 配置
 */
export interface PlausibleConfig {
  /** 域名 */
  domain: string
  /** API 主机地址 */
  apiHost?: string
  /** 是否启用自动出站链接追踪 */
  trackOutboundLinks?: boolean
}

/**
 * Umami 配置
 */
export interface UmamiConfig {
  /** 网站 ID */
  websiteId: string
  /** 脚本源地址 */
  src: string
  /** 数据域名 */
  dataDomain?: string
}

/**
 * 自定义分析配置
 */
export interface CustomAnalyticsConfig {
  /** 自定义脚本内容 */
  script?: string
  /** 页面浏览追踪函数 */
  trackPageView?: (path: string) => void
  /** 事件追踪函数 */
  trackEvent?: (name: string, data?: Record<string, unknown>) => void
}

/**
 * 文档健康检查配置
 */
export interface HealthCheckConfig {
  /** 是否启用 */
  enabled: boolean
  /** 是否检查断链 */
  checkBrokenLinks?: boolean
  /** 检查过期内容配置 */
  checkOutdated?: {
    enabled: boolean
    /** 最大过期天数 */
    maxAgeDays?: number
  }
  /** 输出报告路径 */
  reportPath?: string
}

/**
 * 搜索追踪配置
 */
export interface SearchTrackingConfig {
  /** 是否启用 */
  enabled: boolean
  /** 存储方式 */
  storage?: 'local' | 'api'
  /** API 端点（当 storage 为 'api' 时） */
  endpoint?: string
  /** 最小结果数阈值（低于此值视为内容缺口） */
  minResultsThreshold?: number
}

/**
 * 分析插件选项
 */
export interface AnalyticsOptions {
  /** 分析提供商 */
  provider: 'google' | 'plausible' | 'umami' | 'custom'

  /** Google Analytics 配置 */
  google?: GoogleAnalyticsConfig

  /** Plausible 配置 */
  plausible?: PlausibleConfig

  /** Umami 配置 */
  umami?: UmamiConfig

  /** 自定义分析配置 */
  custom?: CustomAnalyticsConfig

  /** 文档健康检查 */
  healthCheck?: HealthCheckConfig

  /** 搜索追踪 */
  searchTracking?: SearchTrackingConfig

  /** 是否在开发模式下启用 */
  enableInDev?: boolean
}

/**
 * 健康检查报告
 */
export interface HealthCheckReport {
  /** 生成时间 */
  generatedAt: string
  /** 总页面数 */
  totalPages: number
  /** 断链列表 */
  brokenLinks: BrokenLink[]
  /** 过期内容列表 */
  outdatedContent: OutdatedContent[]
  /** 健康评分 (0-100) */
  healthScore: number
}

/**
 * 断链信息
 */
export interface BrokenLink {
  /** 源页面路径 */
  sourcePage: string
  /** 断链 URL */
  brokenUrl: string
  /** 链接文本 */
  linkText?: string
  /** 行号 */
  line?: number
}

/**
 * 过期内容信息
 */
export interface OutdatedContent {
  /** 页面路径 */
  page: string
  /** 最后更新时间 */
  lastUpdated: string
  /** 过期天数 */
  daysOld: number
  /** 页面标题 */
  title: string
}

/**
 * 搜索查询记录
 */
export interface SearchQueryLog {
  /** 查询文本 */
  query: string
  /** 结果数量 */
  resultCount: number
  /** 查询时间 */
  timestamp: string
  /** 是否为内容缺口 */
  isContentGap: boolean
}

// ============== 辅助函数 ==============

// 导入脚本生成函数
export {
  generateGoogleAnalyticsScript,
  generatePlausibleScript,
  generateUmamiScript,
  generateCustomScript,
  injectScripts
} from './scriptInjection'

import {
  generateGoogleAnalyticsScript,
  generatePlausibleScript,
  generateUmamiScript,
  generateCustomScript
} from './scriptInjection'

/**
 * 验证分析配置
 */
export function validateAnalyticsConfig(options: AnalyticsOptions): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (options.provider === 'google' && !options.google?.measurementId) {
    errors.push('Google Analytics requires measurementId')
  }

  if (options.provider === 'plausible' && !options.plausible?.domain) {
    errors.push('Plausible requires domain')
  }

  if (options.provider === 'umami' && (!options.umami?.websiteId || !options.umami?.src)) {
    errors.push('Umami requires websiteId and src')
  }

  if (options.provider === 'custom' && !options.custom?.script) {
    errors.push('Custom analytics requires script')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// ============== 插件实现 ==============

/**
 * 文档分析插件
 * 
 * @example
 * ```ts
 * import { analyticsPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     analyticsPlugin({
 *       provider: 'google',
 *       google: {
 *         measurementId: 'G-XXXXXXXXXX'
 *       },
 *       healthCheck: {
 *         enabled: true,
 *         checkBrokenLinks: true,
 *         checkOutdated: {
 *           enabled: true,
 *           maxAgeDays: 365
 *         }
 *       },
 *       searchTracking: {
 *         enabled: true,
 *         minResultsThreshold: 3
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function analyticsPlugin(options: AnalyticsOptions): LDocPlugin {
  // 验证配置
  const validation = validateAnalyticsConfig(options)
  if (!validation.valid) {
    throw new Error(`[Analytics Plugin] Configuration errors: ${validation.errors.join(', ')}`)
  }

  const {
    provider,
    google,
    plausible,
    umami,
    custom,
    healthCheck = { enabled: false },
    searchTracking = { enabled: false },
    enableInDev = false
  } = options

  let siteConfig: SiteConfig
  const allPages: PageData[] = []

  return definePlugin({
    name: 'ldoc:analytics',
    enforce: 'post',

    configResolved(config) {
      siteConfig = config
    },

    // 收集页面数据用于健康检查
    async extendPageData(pageData) {
      if (healthCheck.enabled) {
        allPages.push(pageData)
      }
    },

    // 注入分析脚本
    headScripts: (() => {
      // 开发模式下不注入（除非明确启用）
      if (process.env.NODE_ENV === 'development' && !enableInDev) {
        return []
      }

      const scripts: string[] = []

      // 根据提供商生成对应脚本
      switch (provider) {
        case 'google':
          if (google) {
            scripts.push(generateGoogleAnalyticsScript(google))
          }
          break
        case 'plausible':
          if (plausible) {
            scripts.push(generatePlausibleScript(plausible))
          }
          break
        case 'umami':
          if (umami) {
            scripts.push(generateUmamiScript(umami))
          }
          break
        case 'custom':
          if (custom) {
            scripts.push(generateCustomScript(custom))
          }
          break
      }

      // 添加搜索追踪脚本
      if (searchTracking.enabled) {
        scripts.push(`
<script>
  // 搜索查询追踪
  (function() {
    const minResults = ${searchTracking.minResultsThreshold || 3};
    const storage = '${searchTracking.storage || 'local'}';
    const endpoint = '${searchTracking.endpoint || ''}';

    window.addEventListener('ldoc:search-query', (e) => {
      const { query, resultCount } = e.detail;
      const log = {
        query,
        resultCount,
        timestamp: new Date().toISOString(),
        isContentGap: resultCount < minResults
      };

      if (storage === 'local') {
        const logs = JSON.parse(localStorage.getItem('ldoc-search-logs') || '[]');
        logs.push(log);
        // 保留最近 100 条
        if (logs.length > 100) logs.shift();
        localStorage.setItem('ldoc-search-logs', JSON.stringify(logs));
      } else if (storage === 'api' && endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        }).catch(err => console.error('Failed to log search query:', err));
      }
    });
  })();
</script>
`)
      }

      return scripts
    })(),

    // 构建结束时生成健康检查报告
    async buildEnd(config) {
      if (!healthCheck.enabled) {
        return
      }

      const fs = await import('fs/promises')
      const path = await import('path')

      // 导入健康检查模块
      const { performHealthCheck } = await import('./healthCheck')

      const report = await performHealthCheck(allPages, {
        checkBrokenLinks: healthCheck.checkBrokenLinks ?? true,
        checkOutdated: healthCheck.checkOutdated?.enabled ?? false,
        maxAgeDays: healthCheck.checkOutdated?.maxAgeDays ?? 365
      })

      const reportPath = path.join(
        config.outDir,
        healthCheck.reportPath || 'health-report.json'
      )

      await fs.writeFile(
        reportPath,
        JSON.stringify(report, null, 2),
        'utf-8'
      )

      console.log(`✓ Health check report generated: ${healthCheck.reportPath || 'health-report.json'}`)
      console.log(`  Health Score: ${report.healthScore}/100`)
      console.log(`  Broken Links: ${report.brokenLinks.length}`)
      console.log(`  Outdated Content: ${report.outdatedContent.length}`)
    }
  })
}

/**
 * 创建分析配置辅助函数
 */
export function defineAnalyticsConfig(config: AnalyticsOptions): AnalyticsOptions {
  return config
}

export default analyticsPlugin
