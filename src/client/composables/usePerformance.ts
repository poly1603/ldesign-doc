/**
 * @module usePerformance
 * @description 运行时性能监控 Composable
 *
 * 功能:
 * - 页面加载性能指标收集
 * - Core Web Vitals (FCP, LCP, CLS, FID, INP, TTFB)
 * - 资源加载分析
 * - 自定义性能标记
 *
 * @example
 * ```ts
 * const { metrics, mark, measure, getResourceTiming } = usePerformance()
 *
 * // 自定义性能标记
 * mark('componentMounted')
 * mark('dataLoaded')
 * const duration = measure('loadTime', 'componentMounted', 'dataLoaded')
 *
 * // 获取性能指标
 * console.log(metrics.value) // { fcp, lcp, cls, fid, ttfb }
 * ```
 */

import { ref, onMounted, onUnmounted, readonly, type Ref } from 'vue'

/**
 * Core Web Vitals 指标
 */
export interface WebVitalsMetrics {
  /** First Contentful Paint - 首次内容绘制 (ms) */
  fcp?: number
  /** Largest Contentful Paint - 最大内容绘制 (ms) */
  lcp?: number
  /** Cumulative Layout Shift - 累积布局偏移 (score) */
  cls?: number
  /** First Input Delay - 首次输入延迟 (ms) */
  fid?: number
  /** Interaction to Next Paint - 交互到下一次绘制 (ms) */
  inp?: number
  /** Time to First Byte - 首字节时间 (ms) */
  ttfb?: number
  /** DOM Content Loaded (ms) */
  domContentLoaded?: number
  /** Page Load Complete (ms) */
  loadComplete?: number
  /** DOM Interactive (ms) */
  domInteractive?: number
}

/**
 * 资源加载信息
 */
export interface ResourceTiming {
  /** 资源名称/URL */
  name: string
  /** 资源类型 */
  type: string
  /** 传输大小 (bytes) */
  transferSize: number
  /** 解码后大小 (bytes) */
  decodedSize: number
  /** 加载耗时 (ms) */
  duration: number
  /** 开始时间 (ms) */
  startTime: number
}

/**
 * 性能报告
 */
export interface PerformanceReport {
  /** 基础指标 */
  metrics: WebVitalsMetrics
  /** 资源加载统计 */
  resources: {
    total: number
    totalSize: number
    byType: Record<string, { count: number; size: number; duration: number }>
  }
  /** 自定义测量结果 */
  measures: Record<string, number>
  /** 页面信息 */
  page: {
    url: string
    title: string
    timestamp: number
  }
}

/**
 * 性能评分等级
 */
export type PerformanceGrade = 'good' | 'needs-improvement' | 'poor'

/**
 * 评估 Core Web Vitals 等级
 */
export function gradeWebVitals(metrics: WebVitalsMetrics): Record<keyof WebVitalsMetrics, PerformanceGrade | null> {
  const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    cls: { good: 0.1, poor: 0.25 },
    fid: { good: 100, poor: 300 },
    inp: { good: 200, poor: 500 },
    ttfb: { good: 800, poor: 1800 }
  }

  const grades: Record<string, PerformanceGrade | null> = {}

  for (const [key, value] of Object.entries(metrics)) {
    if (value === undefined) {
      grades[key] = null
      continue
    }

    const threshold = thresholds[key as keyof typeof thresholds]
    if (!threshold) {
      grades[key] = null
      continue
    }

    if (value <= threshold.good) {
      grades[key] = 'good'
    } else if (value <= threshold.poor) {
      grades[key] = 'needs-improvement'
    } else {
      grades[key] = 'poor'
    }
  }

  return grades as Record<keyof WebVitalsMetrics, PerformanceGrade | null>
}

/**
 * 运行时性能监控 Composable
 *
 * @description 收集和监控页面性能指标，包括 Core Web Vitals
 *
 * @param options - 配置选项
 * @returns 性能监控工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePerformance } from '@ldesign/doc/client'
 *
 * const { metrics, grades, report, mark, measure } = usePerformance({
 *   reportCallback: (report) => {
 *     // 发送到分析服务
 *     analytics.send(report)
 *   }
 * })
 * </script>
 *
 * <template>
 *   <div v-if="metrics.lcp">
 *     LCP: {{ metrics.lcp.toFixed(0) }}ms
 *     <span :class="grades.lcp">{{ grades.lcp }}</span>
 *   </div>
 * </template>
 * ```
 */
export function usePerformance(options: {
  /** 是否自动收集指标 */
  autoCollect?: boolean
  /** 性能报告回调 */
  reportCallback?: (report: PerformanceReport) => void
  /** 是否在开发模式下启用 */
  enableInDev?: boolean
} = {}) {
  const {
    autoCollect = true,
    reportCallback,
    enableInDev = true
  } = options

  // 性能指标
  const metrics = ref<WebVitalsMetrics>({})
  const customMeasures = ref<Record<string, number>>({})

  // 是否在浏览器环境
  const isBrowser = typeof window !== 'undefined' && typeof performance !== 'undefined'

  // 检查是否应该启用
  const shouldEnable = isBrowser && (enableInDev || (import.meta as any).env?.PROD)

  // 清理函数列表
  const cleanupFns: Array<() => void> = []

  /**
   * 获取导航计时
   */
  const getNavigationTiming = (): Partial<WebVitalsMetrics> => {
    if (!shouldEnable) return {}

    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!timing) return {}

    return {
      ttfb: timing.responseStart - timing.requestStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.fetchStart,
      loadComplete: timing.loadEventEnd - timing.fetchStart,
      domInteractive: timing.domInteractive - timing.fetchStart
    }
  }

  /**
   * 收集 FCP
   */
  const collectFCP = () => {
    if (!shouldEnable) return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.value.fcp = entry.startTime
        }
      }
    })

    try {
      observer.observe({ type: 'paint', buffered: true })
      cleanupFns.push(() => observer.disconnect())
    } catch {
      // PerformanceObserver 不支持某些类型
    }
  }

  /**
   * 收集 LCP
   */
  const collectLCP = () => {
    if (!shouldEnable) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        metrics.value.lcp = lastEntry.startTime
      }
    })

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
      cleanupFns.push(() => observer.disconnect())
    } catch {
      // 不支持
    }
  }

  /**
   * 收集 CLS
   */
  const collectCLS = () => {
    if (!shouldEnable) return

    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
        // 忽略用户输入后的布局偏移
        if (!entry.hadRecentInput && entry.value !== undefined) {
          const firstSessionEntry = sessionEntries[0] as PerformanceEntry | undefined
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1] as PerformanceEntry | undefined

          // 如果间隔超过 1 秒或总时长超过 5 秒，开始新会话
          if (sessionValue &&
              firstSessionEntry &&
              lastSessionEntry &&
              (entry.startTime - lastSessionEntry.startTime < 1000) &&
              (entry.startTime - firstSessionEntry.startTime < 5000)) {
            sessionValue += entry.value
            sessionEntries.push(entry)
          } else {
            sessionValue = entry.value
            sessionEntries = [entry]
          }

          // 更新 CLS 值（取最大会话值）
          if (sessionValue > clsValue) {
            clsValue = sessionValue
            metrics.value.cls = clsValue
          }
        }
      }
    })

    try {
      observer.observe({ type: 'layout-shift', buffered: true })
      cleanupFns.push(() => observer.disconnect())
    } catch {
      // 不支持
    }
  }

  /**
   * 收集 FID
   */
  const collectFID = () => {
    if (!shouldEnable) return

    const observer = new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0] as PerformanceEntry & { processingStart?: number }
      if (firstInput && firstInput.processingStart !== undefined) {
        metrics.value.fid = firstInput.processingStart - firstInput.startTime
      }
    })

    try {
      observer.observe({ type: 'first-input', buffered: true })
      cleanupFns.push(() => observer.disconnect())
    } catch {
      // 不支持
    }
  }

  /**
   * 收集 INP (Interaction to Next Paint)
   */
  const collectINP = () => {
    if (!shouldEnable) return

    const interactions: number[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { duration?: number; interactionId?: number }>) {
        if (entry.interactionId && entry.duration !== undefined) {
          interactions.push(entry.duration)

          // 计算 INP (使用 p98)
          if (interactions.length > 0) {
            interactions.sort((a, b) => b - a)
            const index = Math.min(interactions.length - 1, Math.floor(interactions.length * 0.02))
            metrics.value.inp = interactions[index]
          }
        }
      }
    })

    try {
      observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit)
      cleanupFns.push(() => observer.disconnect())
    } catch {
      // 不支持
    }
  }

  /**
   * 创建性能标记
   */
  const mark = (name: string): void => {
    if (!shouldEnable) return
    performance.mark(name)
  }

  /**
   * 测量两个标记之间的时间
   */
  const measure = (name: string, startMark: string, endMark?: string): number | undefined => {
    if (!shouldEnable) return undefined

    try {
      const measureEntry = performance.measure(name, startMark, endMark)
      customMeasures.value[name] = measureEntry.duration
      return measureEntry.duration
    } catch {
      return undefined
    }
  }

  /**
   * 获取资源加载时间
   */
  const getResourceTiming = (): ResourceTiming[] => {
    if (!shouldEnable) return []

    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return entries.map(entry => ({
      name: entry.name,
      type: entry.initiatorType,
      transferSize: entry.transferSize,
      decodedSize: entry.decodedBodySize,
      duration: entry.duration,
      startTime: entry.startTime
    }))
  }

  /**
   * 获取资源统计
   */
  const getResourceStats = () => {
    const resources = getResourceTiming()
    const byType: Record<string, { count: number; size: number; duration: number }> = {}

    let totalSize = 0

    for (const resource of resources) {
      totalSize += resource.transferSize

      if (!byType[resource.type]) {
        byType[resource.type] = { count: 0, size: 0, duration: 0 }
      }

      byType[resource.type].count++
      byType[resource.type].size += resource.transferSize
      byType[resource.type].duration += resource.duration
    }

    return {
      total: resources.length,
      totalSize,
      byType
    }
  }

  /**
   * 生成性能报告
   */
  const generateReport = (): PerformanceReport => {
    return {
      metrics: { ...metrics.value },
      resources: getResourceStats(),
      measures: { ...customMeasures.value },
      page: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        title: typeof document !== 'undefined' ? document.title : '',
        timestamp: Date.now()
      }
    }
  }

  /**
   * 获取性能等级
   */
  const grades = ref<Record<keyof WebVitalsMetrics, PerformanceGrade | null>>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    inp: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    domInteractive: null
  })

  /**
   * 更新等级
   */
  const updateGrades = () => {
    grades.value = gradeWebVitals(metrics.value)
  }

  /**
   * 清除所有性能标记和测量
   */
  const clearMarks = () => {
    if (!shouldEnable) return
    performance.clearMarks()
    performance.clearMeasures()
    customMeasures.value = {}
  }

  // 生命周期
  onMounted(() => {
    if (!shouldEnable || !autoCollect) return

    // 收集导航计时
    const navTiming = getNavigationTiming()
    Object.assign(metrics.value, navTiming)

    // 收集 Core Web Vitals
    collectFCP()
    collectLCP()
    collectCLS()
    collectFID()
    collectINP()

    // 页面完全加载后更新等级
    if (document.readyState === 'complete') {
      updateGrades()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          updateGrades()

          // 触发报告回调
          if (reportCallback) {
            reportCallback(generateReport())
          }
        }, 0)
      })
    }
  })

  onUnmounted(() => {
    // 清理所有 observers
    for (const cleanup of cleanupFns) {
      cleanup()
    }
  })

  return {
    /** 性能指标（只读） */
    metrics: readonly(metrics) as Readonly<Ref<WebVitalsMetrics>>,
    /** 性能等级 */
    grades: readonly(grades),
    /** 自定义测量结果 */
    measures: readonly(customMeasures),
    /** 创建性能标记 */
    mark,
    /** 测量两点之间的时间 */
    measure,
    /** 获取资源加载时间 */
    getResourceTiming,
    /** 获取资源统计 */
    getResourceStats,
    /** 生成性能报告 */
    generateReport,
    /** 评估指标等级 */
    gradeMetrics: updateGrades,
    /** 清除标记 */
    clearMarks
  }
}

/**
 * 简单的性能追踪器（非响应式，用于一次性测量）
 */
export function createPerformanceTracker() {
  const marks: Record<string, number> = {}

  return {
    /** 记录时间点 */
    mark(name: string) {
      marks[name] = performance.now()
    },

    /** 测量两点之间的时间 */
    measure(startMark: string, endMark?: string): number {
      const start = marks[startMark] || 0
      const end = endMark ? marks[endMark] || performance.now() : performance.now()
      return end - start
    },

    /** 获取所有标记 */
    getMarks() {
      return { ...marks }
    }
  }
}

export default usePerformance
