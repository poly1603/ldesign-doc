/**
 * @ldesign/doc - 国际化增强插件
 * 
 * 提供翻译状态追踪、翻译回退和 RTL 布局支持
 */

import type { LDocPlugin, SiteConfig } from '../../shared/types'
import { translationStatusTracker } from './translationStatus'
import { translationFallback } from './translationFallback'
import { rtlLayoutSupport } from './rtlLayout'

export interface I18nPluginOptions {
  /**
   * 翻译状态追踪配置
   */
  statusTracking?: {
    /** 是否启用翻译状态追踪 */
    enabled?: boolean
    /** 源语言，默认为站点的 lang 配置 */
    sourceLocale?: string
    /** 生成翻译状态报告的输出路径 */
    reportPath?: string
  }

  /**
   * 翻译回退配置
   */
  fallback?: {
    /** 是否启用翻译回退 */
    enabled?: boolean
    /** 回退语言，默认为源语言 */
    fallbackLocale?: string
    /** 是否显示翻译缺失提示 */
    showMissingNotice?: boolean
    /** 翻译缺失提示文本 */
    missingNoticeText?: string
  }

  /**
   * RTL 布局支持配置
   */
  rtl?: {
    /** 是否启用 RTL 布局支持 */
    enabled?: boolean
    /** RTL 语言列表 */
    rtlLocales?: string[]
  }
}

/**
 * 国际化增强插件
 */
export function i18nPlugin(options: I18nPluginOptions = {}): LDocPlugin {
  const {
    statusTracking = { enabled: true },
    fallback = { enabled: true },
    rtl = { enabled: true }
  } = options

  return {
    name: '@ldesign/doc-plugin-i18n',
    enforce: 'pre',

    async configResolved(config: SiteConfig) {
      // 初始化翻译状态追踪
      if (statusTracking.enabled) {
        await translationStatusTracker.initialize(config, {
          sourceLocale: statusTracking.sourceLocale || config.lang,
          reportPath: statusTracking.reportPath
        })
      }

      // 初始化翻译回退
      if (fallback.enabled) {
        translationFallback.initialize(config, {
          fallbackLocale: fallback.fallbackLocale || config.lang,
          showMissingNotice: fallback.showMissingNotice ?? true,
          missingNoticeText: fallback.missingNoticeText
        })
      }

      // 初始化 RTL 布局支持
      if (rtl.enabled) {
        rtlLayoutSupport.initialize(config, {
          rtlLocales: rtl.rtlLocales
        })
      }
    },

    async buildEnd(config: SiteConfig) {
      // 生成翻译状态报告
      if (statusTracking.enabled) {
        await translationStatusTracker.generateReport(config)
      }
    },

    headStyles(ctx) {
      const styles: string[] = []

      // 注入 RTL 样式
      if (rtl.enabled) {
        const rtlStyle = rtlLayoutSupport.generateStyles(ctx.siteData.lang)
        if (rtlStyle) {
          styles.push(rtlStyle)
        }
      }

      return styles
    }
  }
}

export * from './translationStatus'
export * from './translationFallback'
export * from './rtlLayout'
