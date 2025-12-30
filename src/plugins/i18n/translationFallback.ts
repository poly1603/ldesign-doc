/**
 * 翻译回退模块
 * 
 * 当翻译缺失时显示源语言内容，并添加翻译缺失提示
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SiteConfig, PageData } from '../../shared/types'

export interface TranslationFallbackOptions {
  /** 回退语言 */
  fallbackLocale: string
  /** 是否显示翻译缺失提示 */
  showMissingNotice: boolean
  /** 翻译缺失提示文本 */
  missingNoticeText?: string
}

export interface FallbackContent {
  /** 是否使用了回退内容 */
  isFallback: boolean
  /** 内容 */
  content: string
  /** 源语言 */
  sourceLocale?: string
  /** 目标语言 */
  targetLocale: string
}

class TranslationFallback {
  private config: SiteConfig | null = null
  private options: TranslationFallbackOptions | null = null
  private fallbackCache: Map<string, FallbackContent> = new Map()

  /**
   * 初始化翻译回退
   */
  initialize(config: SiteConfig, options: TranslationFallbackOptions): void {
    this.config = config
    this.options = options
    this.fallbackCache.clear()
  }

  /**
   * 解析回退内容
   * 当请求的翻译文件不存在时，返回源语言内容
   */
  async resolveFallbackContent(
    relativePath: string,
    targetLocale: string
  ): Promise<FallbackContent> {
    if (!this.config || !this.options) {
      throw new Error('TranslationFallback not initialized')
    }

    const cacheKey = `${targetLocale}:${relativePath}`

    // 检查缓存
    if (this.fallbackCache.has(cacheKey)) {
      return this.fallbackCache.get(cacheKey)!
    }

    const srcDir = path.resolve(this.config.root, this.config.srcDir)
    const localeConfig = this.config.locales[targetLocale]

    // 构建翻译文件路径
    const localePrefix = localeConfig?.link?.replace(/^\/|\/$/g, '') || targetLocale
    const translationFile = path.join(srcDir, localePrefix, relativePath)

    let result: FallbackContent = {
      isFallback: false,
      content: '',
      targetLocale
    }

    try {
      // 尝试读取翻译文件
      result.content = await fs.readFile(translationFile, 'utf-8')
      result.isFallback = false
    } catch {
      // 翻译文件不存在，使用回退内容
      try {
        const fallbackFile = path.join(srcDir, relativePath)
        result.content = await fs.readFile(fallbackFile, 'utf-8')
        result.isFallback = true
        result.sourceLocale = this.options.fallbackLocale

        // 添加翻译缺失提示
        if (this.options.showMissingNotice) {
          result.content = this.addMissingNotice(result.content, targetLocale)
        }
      } catch {
        // 回退文件也不存在
        result.content = ''
        result.isFallback = true
      }
    }

    // 缓存结果
    this.fallbackCache.set(cacheKey, result)

    return result
  }

  /**
   * 添加翻译缺失提示
   */
  private addMissingNotice(content: string, targetLocale: string): string {
    const noticeText = this.options?.missingNoticeText ||
      this.getDefaultNoticeText(targetLocale)

    const notice = `
:::warning ${this.getNoticeTitle(targetLocale)}
${noticeText}
:::

`

    return notice + content
  }

  /**
   * 获取默认提示文本
   */
  private getDefaultNoticeText(locale: string): string {
    const messages: Record<string, string> = {
      'en': 'This page is not yet translated. You are viewing the content in the default language.',
      'zh-CN': '此页面尚未翻译。您正在查看默认语言的内容。',
      'zh-TW': '此頁面尚未翻譯。您正在查看預設語言的內容。',
      'ja': 'このページはまだ翻訳されていません。デフォルト言語のコンテンツを表示しています。',
      'ko': '이 페이지는 아직 번역되지 않았습니다. 기본 언어의 콘텐츠를 보고 있습니다.',
      'es': 'Esta página aún no ha sido traducida. Está viendo el contenido en el idioma predeterminado.',
      'fr': 'Cette page n\'a pas encore été traduite. Vous consultez le contenu dans la langue par défaut.',
      'de': 'Diese Seite wurde noch nicht übersetzt. Sie sehen den Inhalt in der Standardsprache.',
      'ru': 'Эта страница еще не переведена. Вы просматриваете содержимое на языке по умолчанию.',
      'ar': 'لم تتم ترجمة هذه الصفحة بعد. أنت تشاهد المحتوى باللغة الافتراضية.'
    }

    return messages[locale] || messages['en']
  }

  /**
   * 获取提示标题
   */
  private getNoticeTitle(locale: string): string {
    const titles: Record<string, string> = {
      'en': 'Translation Missing',
      'zh-CN': '翻译缺失',
      'zh-TW': '翻譯缺失',
      'ja': '翻訳が不足しています',
      'ko': '번역 누락',
      'es': 'Traducción faltante',
      'fr': 'Traduction manquante',
      'de': 'Übersetzung fehlt',
      'ru': 'Перевод отсутствует',
      'ar': 'الترجمة مفقودة'
    }

    return titles[locale] || titles['en']
  }

  /**
   * 检查页面是否使用了回退内容
   */
  isFallbackPage(relativePath: string, locale: string): boolean {
    const cacheKey = `${locale}:${relativePath}`
    const cached = this.fallbackCache.get(cacheKey)
    return cached?.isFallback ?? false
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.fallbackCache.clear()
  }

  /**
   * 扩展页面数据，添加回退信息
   */
  extendPageData(pageData: PageData, locale: string): void {
    if (!this.config) return

    const isFallback = this.isFallbackPage(pageData.relativePath, locale)

    // 添加自定义字段到 frontmatter
    if (!pageData.frontmatter) {
      pageData.frontmatter = {}
    }

    pageData.frontmatter._translationFallback = {
      isFallback,
      sourceLocale: isFallback ? this.options?.fallbackLocale : undefined,
      targetLocale: locale
    }
  }
}

// 导出单例实例
export const translationFallback = new TranslationFallback()
