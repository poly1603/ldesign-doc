/**
 * 翻译状态追踪模块
 * 
 * 比较源文件和翻译文件的修改时间，生成翻译状态报告
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SiteConfig } from '../../shared/types'

export interface TranslationStatusOptions {
  /** 源语言 */
  sourceLocale: string
  /** 报告输出路径 */
  reportPath?: string
}

export interface TranslationStatus {
  /** 文件路径 */
  filePath: string
  /** 源文件路径 */
  sourceFilePath: string
  /** 翻译文件路径 */
  translationFilePath: string
  /** 状态：up-to-date（最新）、outdated（过期）、missing（缺失） */
  status: 'up-to-date' | 'outdated' | 'missing'
  /** 源文件修改时间 */
  sourceModifiedTime?: number
  /** 翻译文件修改时间 */
  translationModifiedTime?: number
  /** 语言代码 */
  locale: string
}

export interface TranslationReport {
  /** 生成时间 */
  generatedAt: number
  /** 源语言 */
  sourceLocale: string
  /** 翻译状态列表 */
  translations: TranslationStatus[]
  /** 统计信息 */
  summary: {
    total: number
    upToDate: number
    outdated: number
    missing: number
    byLocale: Record<string, {
      total: number
      upToDate: number
      outdated: number
      missing: number
    }>
  }
}

class TranslationStatusTracker {
  private config: SiteConfig | null = null
  private options: TranslationStatusOptions | null = null
  private statusCache: Map<string, TranslationStatus> = new Map()

  /**
   * 初始化翻译状态追踪器
   */
  async initialize(config: SiteConfig, options: TranslationStatusOptions): Promise<void> {
    this.config = config
    this.options = options
    this.statusCache.clear()

    // 扫描所有文件并构建状态缓存
    await this.scanFiles()
  }

  /**
   * 扫描所有文件
   */
  private async scanFiles(): Promise<void> {
    if (!this.config || !this.options) return

    const srcDir = path.resolve(this.config.root, this.config.srcDir)
    const locales = Object.keys(this.config.locales)

    // 获取所有源文件（排除语言子目录）
    const sourceFiles = await this.getMarkdownFiles(srcDir, locales)

    for (const sourceFile of sourceFiles) {
      const relativePath = path.relative(srcDir, sourceFile)

      // 检查每个语言的翻译状态
      for (const locale of locales) {
        if (locale === this.options.sourceLocale) continue

        const status = await this.checkTranslationStatus(
          sourceFile,
          relativePath,
          locale
        )

        const key = `${locale}:${relativePath}`
        this.statusCache.set(key, status)
      }
    }
  }

  /**
   * 获取目录下所有 Markdown 文件（排除语言子目录）
   */
  private async getMarkdownFiles(dir: string, excludeDirs: string[] = []): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          // 跳过语言子目录
          if (excludeDirs.includes(entry.name)) {
            continue
          }

          // 递归扫描子目录
          const subFiles = await this.getMarkdownFiles(fullPath, excludeDirs)
          files.push(...subFiles)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // 目录不存在或无法访问，忽略
    }

    return files
  }

  /**
   * 检查单个文件的翻译状态
   */
  private async checkTranslationStatus(
    sourceFile: string,
    relativePath: string,
    locale: string
  ): Promise<TranslationStatus> {
    if (!this.config || !this.options) {
      throw new Error('TranslationStatusTracker not initialized')
    }

    const srcDir = path.resolve(this.config.root, this.config.srcDir)
    const localeConfig = this.config.locales[locale]

    // 构建翻译文件路径
    // 假设翻译文件在 locale 子目录下，如 /en/guide/intro.md
    const localePrefix = localeConfig?.link?.replace(/^\/|\/$/g, '') || locale
    const translationFile = path.join(srcDir, localePrefix, relativePath)

    const status: TranslationStatus = {
      filePath: relativePath,
      sourceFilePath: sourceFile,
      translationFilePath: translationFile,
      status: 'missing',
      locale
    }

    try {
      // 获取源文件修改时间
      const sourceStat = await fs.stat(sourceFile)
      status.sourceModifiedTime = sourceStat.mtimeMs

      // 检查翻译文件是否存在
      try {
        const translationStat = await fs.stat(translationFile)
        status.translationModifiedTime = translationStat.mtimeMs

        // 比较修改时间
        if (translationStat.mtimeMs >= sourceStat.mtimeMs) {
          status.status = 'up-to-date'
        } else {
          status.status = 'outdated'
        }
      } catch {
        // 翻译文件不存在
        status.status = 'missing'
      }
    } catch (error) {
      // 源文件不存在或无法访问
      console.warn(`Failed to check translation status for ${sourceFile}:`, error)
    }

    return status
  }

  /**
   * 获取指定文件的翻译状态
   */
  getStatus(relativePath: string, locale: string): TranslationStatus | undefined {
    const key = `${locale}:${relativePath}`
    return this.statusCache.get(key)
  }

  /**
   * 获取所有翻译状态
   */
  getAllStatuses(): TranslationStatus[] {
    return Array.from(this.statusCache.values())
  }

  /**
   * 生成翻译状态报告
   */
  async generateReport(config: SiteConfig): Promise<TranslationReport> {
    if (!this.options) {
      throw new Error('TranslationStatusTracker not initialized')
    }

    const translations = this.getAllStatuses()

    // 计算统计信息
    const summary = {
      total: translations.length,
      upToDate: 0,
      outdated: 0,
      missing: 0,
      byLocale: {} as Record<string, {
        total: number
        upToDate: number
        outdated: number
        missing: number
      }>
    }

    for (const translation of translations) {
      // 全局统计
      if (translation.status === 'up-to-date') summary.upToDate++
      else if (translation.status === 'outdated') summary.outdated++
      else if (translation.status === 'missing') summary.missing++

      // 按语言统计
      if (!summary.byLocale[translation.locale]) {
        summary.byLocale[translation.locale] = {
          total: 0,
          upToDate: 0,
          outdated: 0,
          missing: 0
        }
      }

      const localeSummary = summary.byLocale[translation.locale]
      localeSummary.total++
      if (translation.status === 'up-to-date') localeSummary.upToDate++
      else if (translation.status === 'outdated') localeSummary.outdated++
      else if (translation.status === 'missing') localeSummary.missing++
    }

    const report: TranslationReport = {
      generatedAt: Date.now(),
      sourceLocale: this.options.sourceLocale,
      translations,
      summary
    }

    // 写入报告文件
    if (this.options.reportPath) {
      const reportPath = path.resolve(config.root, this.options.reportPath)
      await fs.mkdir(path.dirname(reportPath), { recursive: true })
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8')
      console.log(`Translation status report generated: ${reportPath}`)
    }

    return report
  }

  /**
   * 检测过期的翻译
   * 当源文件更新时，标记对应的翻译为过期
   */
  async markOutdatedTranslations(sourceFilePath: string): Promise<void> {
    if (!this.config || !this.options) return

    const srcDir = path.resolve(this.config.root, this.config.srcDir)
    const relativePath = path.relative(srcDir, sourceFilePath)
    const locales = Object.keys(this.config.locales)

    for (const locale of locales) {
      if (locale === this.options.sourceLocale) continue

      const status = await this.checkTranslationStatus(
        sourceFilePath,
        relativePath,
        locale
      )

      const key = `${locale}:${relativePath}`
      this.statusCache.set(key, status)
    }
  }
}

// 导出单例实例
export const translationStatusTracker = new TranslationStatusTracker()
