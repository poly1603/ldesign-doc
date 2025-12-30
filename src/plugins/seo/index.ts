/**
 * @module @ldesign/doc/plugins/seo
 * @description SEO 优化插件
 *
 * 功能:
 * - 自动生成 meta description, keywords
 * - Open Graph (Facebook/LinkedIn)
 * - Twitter Cards
 * - JSON-LD 结构化数据
 * - 规范链接 (canonical URL)
 *
 * @example
 * ```ts
 * import { seoPlugin } from '@ldesign/doc/plugins/seo'
 *
 * export default defineConfig({
 *   plugins: [
 *     seoPlugin({
 *       siteName: 'My Docs',
 *       siteUrl: 'https://docs.example.com',
 *       twitter: '@myaccount',
 *       ogImage: '/og-image.png'
 *     })
 *   ]
 * })
 * ```
 */

import type { LDocPlugin } from '../../shared/types'
import { definePlugin } from '../../plugin/definePlugin'

/**
 * SEO 插件配置选项
 */
export interface SeoPluginOptions {
  /** 站点名称 */
  siteName?: string

  /** 站点 URL（用于生成完整的 canonical URL） */
  siteUrl?: string

  /** 默认作者 */
  author?: string

  /** Twitter 账号 (带 @) */
  twitter?: string

  /** 默认 Open Graph 图片路径 */
  ogImage?: string

  /** 默认 Open Graph 图片宽度 */
  ogImageWidth?: number

  /** 默认 Open Graph 图片高度 */
  ogImageHeight?: number

  /** 是否自动生成 JSON-LD */
  jsonLd?: boolean

  /** JSON-LD 类型 */
  jsonLdType?: 'WebSite' | 'TechArticle' | 'Article' | 'FAQPage'

  /** 组织信息（用于 JSON-LD） */
  organization?: {
    name: string
    url?: string
    logo?: string
  }

  /** 默认关键词 */
  defaultKeywords?: string[]

  /** 语言代码 */
  locale?: string

  /** 备用语言列表 */
  alternateLocales?: string[]

  /** 是否添加 canonical 链接 */
  canonical?: boolean

  /** 是否添加 robots meta */
  robots?: string

  /** 自定义 meta 标签 */
  customMeta?: Array<Record<string, string>>
}

/**
 * 页面 frontmatter 中的 SEO 配置
 */
export interface PageSeoConfig {
  /** 页面标题（覆盖默认） */
  title?: string
  /** 页面描述 */
  description?: string
  /** 关键词 */
  keywords?: string | string[]
  /** 自定义 OG 图片 */
  image?: string
  /** 是否禁止索引 */
  noindex?: boolean
  /** 是否禁止跟踪链接 */
  nofollow?: boolean
  /** 文章类型 */
  type?: 'article' | 'website'
  /** 发布日期 */
  publishedTime?: string
  /** 修改日期 */
  modifiedTime?: string
  /** 作者 */
  author?: string
  /** 标签 */
  tags?: string[]
}

/**
 * 生成 meta 标签数组
 */
function generateMetaTags(
  pageData: { title?: string; description?: string; frontmatter?: PageSeoConfig },
  options: SeoPluginOptions,
  pagePath: string
): Array<[string, Record<string, string>]> {
  const tags: Array<[string, Record<string, string>]> = []
  const fm = pageData.frontmatter || {}

  const title = fm.title || pageData.title || options.siteName || ''
  const description = fm.description || pageData.description || ''
  const keywords = Array.isArray(fm.keywords)
    ? fm.keywords
    : typeof fm.keywords === 'string'
      ? fm.keywords.split(',').map(k => k.trim())
      : options.defaultKeywords || []

  const fullUrl = options.siteUrl
    ? `${options.siteUrl.replace(/\/$/, '')}${pagePath}`
    : ''

  const ogImage = fm.image || options.ogImage
  const fullOgImage = ogImage && options.siteUrl
    ? ogImage.startsWith('http')
      ? ogImage
      : `${options.siteUrl.replace(/\/$/, '')}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    : ogImage

  // 基础 meta
  if (description) {
    tags.push(['meta', { name: 'description', content: description }])
  }

  if (keywords.length > 0) {
    tags.push(['meta', { name: 'keywords', content: keywords.join(', ') }])
  }

  if (fm.author || options.author) {
    tags.push(['meta', { name: 'author', content: fm.author || options.author || '' }])
  }

  // Robots
  if (fm.noindex || fm.nofollow) {
    const robotsValues: string[] = []
    if (fm.noindex) robotsValues.push('noindex')
    if (fm.nofollow) robotsValues.push('nofollow')
    tags.push(['meta', { name: 'robots', content: robotsValues.join(', ') }])
  } else if (options.robots) {
    tags.push(['meta', { name: 'robots', content: options.robots }])
  }

  // Canonical URL
  if (options.canonical && fullUrl) {
    tags.push(['link', { rel: 'canonical', href: fullUrl }])
  }

  // Open Graph
  tags.push(['meta', { property: 'og:type', content: fm.type || 'website' }])
  tags.push(['meta', { property: 'og:title', content: title }])

  if (description) {
    tags.push(['meta', { property: 'og:description', content: description }])
  }

  if (fullUrl) {
    tags.push(['meta', { property: 'og:url', content: fullUrl }])
  }

  if (options.siteName) {
    tags.push(['meta', { property: 'og:site_name', content: options.siteName }])
  }

  if (options.locale) {
    tags.push(['meta', { property: 'og:locale', content: options.locale }])
  }

  if (options.alternateLocales) {
    for (const locale of options.alternateLocales) {
      tags.push(['meta', { property: 'og:locale:alternate', content: locale }])
    }
  }

  if (fullOgImage) {
    tags.push(['meta', { property: 'og:image', content: fullOgImage }])
    if (options.ogImageWidth) {
      tags.push(['meta', { property: 'og:image:width', content: String(options.ogImageWidth) }])
    }
    if (options.ogImageHeight) {
      tags.push(['meta', { property: 'og:image:height', content: String(options.ogImageHeight) }])
    }
  }

  // 文章元数据
  if (fm.type === 'article') {
    if (fm.publishedTime) {
      tags.push(['meta', { property: 'article:published_time', content: fm.publishedTime }])
    }
    if (fm.modifiedTime) {
      tags.push(['meta', { property: 'article:modified_time', content: fm.modifiedTime }])
    }
    if (fm.author) {
      tags.push(['meta', { property: 'article:author', content: fm.author }])
    }
    if (fm.tags) {
      for (const tag of fm.tags) {
        tags.push(['meta', { property: 'article:tag', content: tag }])
      }
    }
  }

  // Twitter Cards
  tags.push(['meta', { name: 'twitter:card', content: fullOgImage ? 'summary_large_image' : 'summary' }])
  tags.push(['meta', { name: 'twitter:title', content: title }])

  if (description) {
    tags.push(['meta', { name: 'twitter:description', content: description }])
  }

  if (options.twitter) {
    tags.push(['meta', { name: 'twitter:site', content: options.twitter }])
    tags.push(['meta', { name: 'twitter:creator', content: options.twitter }])
  }

  if (fullOgImage) {
    tags.push(['meta', { name: 'twitter:image', content: fullOgImage }])
  }

  // 自定义 meta
  if (options.customMeta) {
    for (const meta of options.customMeta) {
      tags.push(['meta', meta])
    }
  }

  return tags
}

/**
 * 生成 JSON-LD 结构化数据
 */
function generateJsonLd(
  pageData: { title?: string; description?: string; frontmatter?: PageSeoConfig },
  options: SeoPluginOptions,
  pagePath: string
): Record<string, unknown> | null {
  if (!options.jsonLd) return null

  const fm = pageData.frontmatter || {}
  const title = fm.title || pageData.title || options.siteName || ''
  const description = fm.description || pageData.description || ''
  const fullUrl = options.siteUrl
    ? `${options.siteUrl.replace(/\/$/, '')}${pagePath}`
    : ''

  const type = options.jsonLdType || 'WebSite'

  const baseJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    url: fullUrl || undefined,
    description: description || undefined
  }

  // WebSite 类型
  if (type === 'WebSite') {
    if (options.organization) {
      baseJsonLd.publisher = {
        '@type': 'Organization',
        name: options.organization.name,
        url: options.organization.url,
        logo: options.organization.logo
          ? { '@type': 'ImageObject', url: options.organization.logo }
          : undefined
      }
    }

    // 添加搜索功能
    if (options.siteUrl) {
      baseJsonLd.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${options.siteUrl}?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  }

  // TechArticle / Article 类型
  if (type === 'TechArticle' || type === 'Article') {
    baseJsonLd.headline = title
    baseJsonLd.author = fm.author || options.author
      ? { '@type': 'Person', name: fm.author || options.author }
      : undefined

    if (fm.publishedTime) {
      baseJsonLd.datePublished = fm.publishedTime
    }
    if (fm.modifiedTime) {
      baseJsonLd.dateModified = fm.modifiedTime
    }

    if (fm.image || options.ogImage) {
      const image = fm.image || options.ogImage
      baseJsonLd.image = image?.startsWith('http')
        ? image
        : options.siteUrl
          ? `${options.siteUrl.replace(/\/$/, '')}${image?.startsWith('/') ? '' : '/'}${image}`
          : image
    }

    if (options.organization) {
      baseJsonLd.publisher = {
        '@type': 'Organization',
        name: options.organization.name,
        logo: options.organization.logo
          ? { '@type': 'ImageObject', url: options.organization.logo }
          : undefined
      }
    }
  }

  // 清理 undefined 值
  return JSON.parse(JSON.stringify(baseJsonLd))
}

/**
 * SEO 插件默认配置
 */
const defaultOptions: SeoPluginOptions = {
  canonical: true,
  jsonLd: true,
  jsonLdType: 'WebSite',
  locale: 'zh-CN',
  ogImageWidth: 1200,
  ogImageHeight: 630
}

/**
 * SEO 优化插件
 *
 * @description 自动为页面添加 SEO 相关的 meta 标签和结构化数据
 *
 * @example
 * ```ts
 * // ldoc.config.ts
 * import { seoPlugin } from '@ldesign/doc/plugins/seo'
 *
 * export default defineConfig({
 *   plugins: [
 *     seoPlugin({
 *       siteName: 'LDesign Docs',
 *       siteUrl: 'https://ldesign.dev',
 *       twitter: '@ldesign',
 *       ogImage: '/images/og-default.png',
 *       organization: {
 *         name: 'LDesign Team',
 *         logo: '/images/logo.png'
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function seoPlugin(userOptions: SeoPluginOptions = {}): LDocPlugin {
  const options = { ...defaultOptions, ...userOptions }

  return definePlugin({
    name: 'ldoc-plugin-seo',
    meta: {
      description: 'SEO 优化插件 - 自动生成 meta 标签和结构化数据',
      author: 'LDesign Team'
    },

    // 扩展页面数据，添加 SEO 相关信息
    extendPageData(pageData, ctx) {
      const { siteConfig } = ctx

      // 合并站点配置
      const mergedOptions = {
        ...options,
        siteName: options.siteName || siteConfig.title,
        siteUrl: options.siteUrl || siteConfig.base
      }

      // 将 SEO 配置存储在页面数据中
      const pagePath = pageData.relativePath?.replace(/\.md$/, '.html') || '/'
      const seoData = {
        metaTags: generateMetaTags(pageData as any, mergedOptions, `/${pagePath}`),
        jsonLd: generateJsonLd(pageData as any, mergedOptions, `/${pagePath}`)
      }

      // 扩展 frontmatter
      if (!pageData.frontmatter.description && pageData.description) {
        pageData.frontmatter.description = pageData.description
      }

      // 存储到页面数据中供主题使用
      ;(pageData as any).seo = seoData
    },

    // 通过 headScripts 注入 JSON-LD
    headScripts(ctx) {
      const scripts: string[] = []

      // JSON-LD 结构化数据（站点级别）
      if (options.jsonLd && options.siteUrl) {
        const siteJsonLd = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: options.siteName || ctx.siteConfig?.title,
          url: options.siteUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${options.siteUrl}?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }

        scripts.push(
          `(function(){var s=document.createElement('script');s.type='application/ld+json';s.textContent=${JSON.stringify(JSON.stringify(siteJsonLd))};document.head.appendChild(s);})()`
        )
      }

      return scripts
    }
  })
}

export default seoPlugin
