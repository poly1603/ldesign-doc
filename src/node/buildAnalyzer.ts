/**
 * 构建性能分析器
 * 
 * 用于分析 LDoc 构建过程的性能，识别瓶颈并提供优化建议。
 * 
 * @example
 * ```ts
 * import { BuildAnalyzer } from './buildAnalyzer'
 * 
 * const analyzer = new BuildAnalyzer()
 * 
 * analyzer.startPhase('markdown')
 * // ... 处理 Markdown
 * analyzer.endPhase('markdown')
 * 
 * analyzer.trackFile('docs/guide.md', 1024, 50)
 * 
 * const report = analyzer.generateReport()
 * analyzer.printReport(report)
 * ```
 */

import pc from 'picocolors'
import { existsSync, statSync, readdirSync } from 'fs'
import { join, extname, relative } from 'path'

/**
 * 构建阶段
 */
export interface BuildPhase {
  /** 阶段名称 */
  name: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 耗时（毫秒） */
  duration?: number
  /** 子阶段 */
  children?: BuildPhase[]
  /** 阶段元数据 */
  meta?: Record<string, unknown>
}

/**
 * 文件分析信息
 */
export interface FileAnalysis {
  /** 文件路径 */
  path: string
  /** 文件大小（字节） */
  size: number
  /** 处理时间（毫秒） */
  processingTime: number
  /** 文件类型 */
  type: string
  /** 缓存命中 */
  cached?: boolean
}

/**
 * 构建报告
 */
export interface BuildAnalysisReport {
  /** 总构建时间 */
  totalTime: number
  /** 各阶段耗时 */
  phases: BuildPhase[]
  /** 文件分析 */
  files: FileAnalysis[]
  /** 瓶颈分析 */
  bottlenecks: Bottleneck[]
  /** 优化建议 */
  suggestions: Suggestion[]
  /** 统计摘要 */
  summary: {
    /** 总文件数 */
    totalFiles: number
    /** 总文件大小 */
    totalSize: number
    /** 平均文件处理时间 */
    avgProcessingTime: number
    /** 缓存命中率 */
    cacheHitRate: number
    /** 各类型文件统计 */
    filesByType: Record<string, { count: number; size: number; time: number }>
  }
}

/**
 * 瓶颈信息
 */
export interface Bottleneck {
  /** 类型 */
  type: 'slow-phase' | 'large-file' | 'slow-file' | 'no-cache'
  /** 描述 */
  description: string
  /** 影响程度 (1-10) */
  impact: number
  /** 相关信息 */
  details: Record<string, unknown>
}

/**
 * 优化建议
 */
export interface Suggestion {
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 优先级 */
  priority: 'high' | 'medium' | 'low'
  /** 预期提升 */
  expectedImprovement?: string
}

/**
 * 构建性能分析器
 */
export class BuildAnalyzer {
  private phases: Map<string, BuildPhase> = new Map()
  private phaseStack: string[] = []
  private files: FileAnalysis[] = []
  private buildStartTime: number = 0
  private buildEndTime: number = 0

  /**
   * 开始构建分析
   */
  startBuild(): void {
    this.buildStartTime = performance.now()
    this.phases.clear()
    this.phaseStack = []
    this.files = []
  }

  /**
   * 结束构建分析
   */
  endBuild(): void {
    this.buildEndTime = performance.now()
  }

  /**
   * 开始一个构建阶段
   */
  startPhase(name: string, meta?: Record<string, unknown>): void {
    const phase: BuildPhase = {
      name,
      startTime: performance.now(),
      meta,
      children: []
    }

    // 如果有父阶段，添加为子阶段
    if (this.phaseStack.length > 0) {
      const parentName = this.phaseStack[this.phaseStack.length - 1]
      const parent = this.phases.get(parentName)
      if (parent && parent.children) {
        parent.children.push(phase)
      }
    }

    this.phases.set(name, phase)
    this.phaseStack.push(name)
  }

  /**
   * 结束一个构建阶段
   */
  endPhase(name: string): void {
    const phase = this.phases.get(name)
    if (phase) {
      phase.endTime = performance.now()
      phase.duration = phase.endTime - phase.startTime
    }

    // 从栈中移除
    const index = this.phaseStack.indexOf(name)
    if (index !== -1) {
      this.phaseStack.splice(index, 1)
    }
  }

  /**
   * 追踪文件处理
   */
  trackFile(
    path: string,
    size: number,
    processingTime: number,
    cached: boolean = false
  ): void {
    const ext = extname(path).toLowerCase()
    const type = this.getFileType(ext)

    this.files.push({
      path,
      size,
      processingTime,
      type,
      cached
    })
  }

  /**
   * 获取文件类型
   */
  private getFileType(ext: string): string {
    const typeMap: Record<string, string> = {
      '.md': 'markdown',
      '.vue': 'vue',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.css': 'style',
      '.scss': 'style',
      '.less': 'style',
      '.json': 'data',
      '.yaml': 'data',
      '.yml': 'data',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.webp': 'image'
    }
    return typeMap[ext] || 'other'
  }

  /**
   * 生成分析报告
   */
  generateReport(): BuildAnalysisReport {
    const totalTime = this.buildEndTime - this.buildStartTime
    const phases = this.getTopLevelPhases()

    // 计算统计摘要
    const summary = this.calculateSummary()

    // 识别瓶颈
    const bottlenecks = this.identifyBottlenecks(phases, summary)

    // 生成优化建议
    const suggestions = this.generateSuggestions(bottlenecks, summary)

    return {
      totalTime,
      phases,
      files: this.files,
      bottlenecks,
      suggestions,
      summary
    }
  }

  /**
   * 获取顶层阶段
   */
  private getTopLevelPhases(): BuildPhase[] {
    const result: BuildPhase[] = []
    const childNames = new Set<string>()

    // 收集所有子阶段名称
    for (const phase of this.phases.values()) {
      if (phase.children) {
        for (const child of phase.children) {
          childNames.add(child.name)
        }
      }
    }

    // 过滤出顶层阶段
    for (const phase of this.phases.values()) {
      if (!childNames.has(phase.name)) {
        result.push(phase)
      }
    }

    // 按开始时间排序
    return result.sort((a, b) => a.startTime - b.startTime)
  }

  /**
   * 计算统计摘要
   */
  private calculateSummary(): BuildAnalysisReport['summary'] {
    const totalFiles = this.files.length
    const totalSize = this.files.reduce((sum, f) => sum + f.size, 0)
    const totalTime = this.files.reduce((sum, f) => sum + f.processingTime, 0)
    const cachedFiles = this.files.filter(f => f.cached).length
    const cacheHitRate = totalFiles > 0 ? cachedFiles / totalFiles : 0

    // 按类型统计
    const filesByType: Record<string, { count: number; size: number; time: number }> = {}
    for (const file of this.files) {
      if (!filesByType[file.type]) {
        filesByType[file.type] = { count: 0, size: 0, time: 0 }
      }
      filesByType[file.type].count++
      filesByType[file.type].size += file.size
      filesByType[file.type].time += file.processingTime
    }

    return {
      totalFiles,
      totalSize,
      avgProcessingTime: totalFiles > 0 ? totalTime / totalFiles : 0,
      cacheHitRate,
      filesByType
    }
  }

  /**
   * 识别瓶颈
   */
  private identifyBottlenecks(
    phases: BuildPhase[],
    summary: BuildAnalysisReport['summary']
  ): Bottleneck[] {
    const bottlenecks: Bottleneck[] = []
    const totalTime = this.buildEndTime - this.buildStartTime

    // 检查慢阶段（占比超过 30%）
    for (const phase of phases) {
      if (phase.duration && phase.duration / totalTime > 0.3) {
        bottlenecks.push({
          type: 'slow-phase',
          description: `阶段 "${phase.name}" 耗时过长，占总时间 ${((phase.duration / totalTime) * 100).toFixed(1)}%`,
          impact: Math.min(10, Math.round((phase.duration / totalTime) * 10)),
          details: {
            phase: phase.name,
            duration: phase.duration,
            percentage: phase.duration / totalTime
          }
        })
      }
    }

    // 检查大文件（超过 100KB）
    const largeFiles = this.files.filter(f => f.size > 100 * 1024)
    if (largeFiles.length > 0) {
      bottlenecks.push({
        type: 'large-file',
        description: `发现 ${largeFiles.length} 个大文件（>100KB），可能影响构建速度`,
        impact: Math.min(10, largeFiles.length),
        details: {
          files: largeFiles.map(f => ({ path: f.path, size: f.size }))
        }
      })
    }

    // 检查慢文件（处理时间超过 100ms）
    const slowFiles = this.files.filter(f => f.processingTime > 100)
    if (slowFiles.length > 0) {
      bottlenecks.push({
        type: 'slow-file',
        description: `发现 ${slowFiles.length} 个处理缓慢的文件（>100ms）`,
        impact: Math.min(10, slowFiles.length),
        details: {
          files: slowFiles.map(f => ({
            path: f.path,
            time: f.processingTime
          }))
        }
      })
    }

    // 检查缓存命中率
    if (summary.cacheHitRate < 0.5 && this.files.length > 10) {
      bottlenecks.push({
        type: 'no-cache',
        description: `缓存命中率较低（${(summary.cacheHitRate * 100).toFixed(1)}%），建议检查缓存配置`,
        impact: Math.round((1 - summary.cacheHitRate) * 5),
        details: {
          hitRate: summary.cacheHitRate,
          cachedFiles: this.files.filter(f => f.cached).length,
          totalFiles: this.files.length
        }
      })
    }

    // 按影响程度排序
    return bottlenecks.sort((a, b) => b.impact - a.impact)
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    bottlenecks: Bottleneck[],
    summary: BuildAnalysisReport['summary']
  ): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 基于瓶颈生成建议
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.type) {
        case 'slow-phase':
          suggestions.push({
            title: '优化构建阶段',
            description: `考虑并行化 "${bottleneck.details.phase}" 阶段或使用更高效的处理方式`,
            priority: 'high',
            expectedImprovement: `可能减少 ${Math.round((bottleneck.details.percentage as number) * 50)}% 构建时间`
          })
          break

        case 'large-file':
          suggestions.push({
            title: '优化大文件',
            description: '考虑压缩大文件、使用图片优化或拆分大型文档',
            priority: 'medium',
            expectedImprovement: '减少文件处理时间和输出体积'
          })
          break

        case 'slow-file':
          suggestions.push({
            title: '检查慢速文件',
            description: '某些文件处理时间过长，可能包含复杂的 Markdown 或大量代码块',
            priority: 'medium',
            expectedImprovement: '优化后可显著减少构建时间'
          })
          break

        case 'no-cache':
          suggestions.push({
            title: '启用构建缓存',
            description: '确保构建缓存已启用，并检查缓存目录是否正确配置',
            priority: 'high',
            expectedImprovement: '重复构建可加速 50% 以上'
          })
          break
      }
    }

    // 通用建议
    if (summary.totalFiles > 100) {
      suggestions.push({
        title: '考虑增量构建',
        description: '文件数量较多，建议使用增量构建只处理变更的文件',
        priority: 'medium'
      })
    }

    if (summary.filesByType.markdown?.count > 50) {
      suggestions.push({
        title: '并行 Markdown 处理',
        description: 'Markdown 文件较多，考虑使用 Worker 池并行处理',
        priority: 'low'
      })
    }

    return suggestions
  }

  /**
   * 打印分析报告
   */
  printReport(report: BuildAnalysisReport): void {
    console.log()
    console.log(pc.bold(pc.cyan('  📊 构建性能分析报告')))
    console.log(pc.gray('  ─'.repeat(25)))
    console.log()

    // 总耗时
    console.log(pc.bold('  总构建时间: ') + pc.green(`${report.totalTime.toFixed(0)}ms`))
    console.log()

    // 阶段耗时
    console.log(pc.bold('  📦 阶段耗时:'))
    for (const phase of report.phases) {
      const percentage = ((phase.duration || 0) / report.totalTime * 100).toFixed(1)
      const bar = this.generateBar(Number(percentage), 20)
      console.log(`    ${pc.dim(phase.name.padEnd(20))} ${pc.yellow(((phase.duration || 0).toFixed(0) + 'ms').padStart(8))} ${bar} ${pc.gray(percentage + '%')}`)
    }
    console.log()

    // 文件统计
    console.log(pc.bold('  📄 文件统计:'))
    console.log(`    总文件数: ${pc.white(String(report.summary.totalFiles))}`)
    console.log(`    总大小: ${pc.white(this.formatSize(report.summary.totalSize))}`)
    console.log(`    平均处理时间: ${pc.white(report.summary.avgProcessingTime.toFixed(1) + 'ms')}`)
    console.log(`    缓存命中率: ${pc.white((report.summary.cacheHitRate * 100).toFixed(1) + '%')}`)
    console.log()

    // 按类型统计
    console.log(pc.bold('  📊 文件类型分布:'))
    for (const [type, stats] of Object.entries(report.summary.filesByType)) {
      console.log(`    ${pc.dim(type.padEnd(12))} ${pc.white(String(stats.count).padStart(4))} 个  ${pc.gray(this.formatSize(stats.size).padStart(10))}  ${pc.gray((stats.time.toFixed(0) + 'ms').padStart(8))}`)
    }
    console.log()

    // 瓶颈
    if (report.bottlenecks.length > 0) {
      console.log(pc.bold(pc.yellow('  ⚠️  发现的瓶颈:')))
      for (const bottleneck of report.bottlenecks) {
        const impactBar = '█'.repeat(bottleneck.impact) + '░'.repeat(10 - bottleneck.impact)
        console.log(`    ${pc.yellow('•')} ${bottleneck.description}`)
        console.log(`      ${pc.gray('影响程度:')} ${pc.yellow(impactBar)} ${bottleneck.impact}/10`)
      }
      console.log()
    }

    // 优化建议
    if (report.suggestions.length > 0) {
      console.log(pc.bold(pc.green('  💡 优化建议:')))
      for (const suggestion of report.suggestions) {
        const priorityColor = suggestion.priority === 'high' ? pc.red : suggestion.priority === 'medium' ? pc.yellow : pc.gray
        console.log(`    ${pc.green('•')} ${pc.bold(suggestion.title)} ${priorityColor(`[${suggestion.priority}]`)}`)
        console.log(`      ${pc.gray(suggestion.description)}`)
        if (suggestion.expectedImprovement) {
          console.log(`      ${pc.gray('预期提升:')} ${pc.green(suggestion.expectedImprovement)}`)
        }
      }
      console.log()
    }
  }

  /**
   * 生成进度条
   */
  private generateBar(percentage: number, width: number): string {
    const filled = Math.round((percentage / 100) * width)
    const empty = width - filled
    return pc.cyan('█'.repeat(filled)) + pc.gray('░'.repeat(empty))
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  /**
   * 导出报告为 JSON
   */
  exportJSON(report: BuildAnalysisReport): string {
    return JSON.stringify(report, null, 2)
  }
}

/**
 * 分析输出目录
 */
export function analyzeOutputDir(outDir: string): {
  totalSize: number
  files: Array<{ path: string; size: number }>
  byExtension: Record<string, { count: number; size: number }>
} {
  const files: Array<{ path: string; size: number }> = []
  const byExtension: Record<string, { count: number; size: number }> = {}

  function scan(dir: string) {
    if (!existsSync(dir)) return

    const items = readdirSync(dir)
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        scan(fullPath)
      } else {
        const size = stat.size
        const ext = extname(item).toLowerCase() || 'no-ext'

        files.push({ path: relative(outDir, fullPath), size })

        if (!byExtension[ext]) {
          byExtension[ext] = { count: 0, size: 0 }
        }
        byExtension[ext].count++
        byExtension[ext].size += size
      }
    }
  }

  scan(outDir)

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return {
    totalSize,
    files: files.sort((a, b) => b.size - a.size),
    byExtension
  }
}

/**
 * 创建构建分析器实例
 */
export function createBuildAnalyzer(): BuildAnalyzer {
  return new BuildAnalyzer()
}
