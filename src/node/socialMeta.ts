/**
 * 社交 Meta 标签生成器
 * 
 * 自动生成 Open Graph 和 Twitter Card meta 标签
 * 用于社交媒体分享时的预览展示
 */

import type { PageData, SiteConfig, HeadConfig } from '../types'

/**
 * 社交 Meta 配置选项
 */
export interface SocialMetaOptions {
  /** 是否启用 */
  enabled?: boolean
  /** Twitter 用户名（如 @username） */
  twitter?: string
  /** 默认 OG 图片 */
  ogImage?: string
  /** Twitter Card 类型 */
  twitterCard?: 'summary' | 'summary_large_image'
  /** 站点名称 */
  siteName?: string
}

/**
 * 生成社交 Meta 标签
 * 
 * @param page - 页面数据
 * @param site - 站点配置
 * @param options - 社交 Meta 选项
 * @returns HeadConfig 数组
 */
export function generateSocialMeta(
  page: PageData,
  site: SiteConfig,
  options: SocialMetaOptions = {}
): HeadConfig[] {
  const {
    enabled = true,
    twitter,
    ogImage,
    twitterCard = 'summary_large_image',
    siteName
  } = options

  if (!enabled) {
    return []
  }

  const metas: HeadConfig[] = []

  // 页面标题
  const title = String(page.frontmatter?.title || page.title || site.title || '')
  
  // 页面描述
  const description = String(page.frontmatter?.description || page.description || site.description || '')

  // 页面 URL
  const url = getPageUrl(page, site)

  // 页面图片（优先使用 frontmatter 中的配置）
  const image = getPageImage(page, site, ogImage)

  // ========== Open Graph Meta ==========
  
  // og:title
  if (title) {
    metas.push(['meta', { property: 'og:title', content: title }])
  }

  // og:description
  if (description) {
    metas.push(['meta', { property: 'og:description', content: description }])
  }

  // og:type
  metas.push(['meta', { property: 'og:type', content: 'website' }])

  // og:url
  if (url) {
    metas.push(['meta', { property: 'og:url', content: url }])
  }

  // og:image
  if (image) {
    metas.push(['meta', { property: 'og:image', content: image }])
    // 可选的图片尺寸
    metas.push(['meta', { property: 'og:image:width', content: '1200' }])
    metas.push(['meta', { property: 'og:image:height', content: '630' }])
  }

  // og:site_name
  const siteNameValue = siteName || site.title
  if (siteNameValue) {
    metas.push(['meta', { property: 'og:site_name', content: siteNameValue }])
  }

  // og:locale
  if (site.lang) {
    metas.push(['meta', { property: 'og:locale', content: site.lang.replace('-', '_') }])
  }

  // ========== Twitter Card Meta ==========
  
  // twitter:card
  metas.push(['meta', { name: 'twitter:card', content: twitterCard }])

  // twitter:title
  if (title) {
    metas.push(['meta', { name: 'twitter:title', content: title }])
  }

  // twitter:description
  if (description) {
    metas.push(['meta', { name: 'twitter:description', content: description }])
  }

  // twitter:image
  if (image) {
    metas.push(['meta', { name: 'twitter:image', content: image }])
  }

  // twitter:site (站点的 Twitter 账号)
  if (twitter) {
    const twitterHandle = twitter.startsWith('@') ? twitter : `@${twitter}`
    metas.push(['meta', { name: 'twitter:site', content: twitterHandle }])
  }

  return metas
}

/**
 * 获取页面 URL
 */
function getPageUrl(page: PageData, site: SiteConfig): string | null {
  // 检查 frontmatter 中是否有自定义 URL
  if (page.frontmatter?.url) {
    return String(page.frontmatter.url)
  }

  // 检查站点是否配置了域名
  const siteUrl = (site as any).url || (site as any).siteUrl
  if (!siteUrl) {
    return null
  }

  // 构建完整 URL
  const base = site.base || '/'
  const path = page.relativePath
    .replace(/\.md$/, '.html')
    .replace(/index\.html$/, '')

  return `${siteUrl.replace(/\/$/, '')}${base}${path}`
}

/**
 * 获取页面图片
 */
function getPageImage(
  page: PageData,
  site: SiteConfig,
  defaultImage?: string
): string | null {
  // 优先使用 frontmatter 中的图片
  const fmImage = page.frontmatter?.image || page.frontmatter?.ogImage
  if (fmImage) {
    return resolveImageUrl(String(fmImage), site)
  }

  // 使用默认图片
  if (defaultImage) {
    return resolveImageUrl(defaultImage, site)
  }

  return null
}

/**
 * 解析图片 URL（将相对路径转为绝对路径）
 */
function resolveImageUrl(image: string, site: SiteConfig): string {
  // 已经是绝对 URL
  if (/^https?:\/\//.test(image)) {
    return image
  }

  // 相对路径，需要拼接站点 URL
  const siteUrl = (site as any).url || (site as any).siteUrl
  if (!siteUrl) {
    return image
  }

  const base = site.base || '/'
  const imagePath = image.startsWith('/') ? image : `/${image}`
  
  return `${siteUrl.replace(/\/$/, '')}${base.replace(/\/$/, '')}${imagePath}`
}

/**
 * 合并 head 配置，避免重复
 * 
 * @param existing - 现有的 head 配置
 * @param socialMeta - 社交 meta 配置
 * @returns 合并后的 head 配置
 */
export function mergeHeadConfig(
  existing: HeadConfig[],
  socialMeta: HeadConfig[]
): HeadConfig[] {
  const result = [...existing]
  
  // 已存在的 meta 标签的键
  const existingKeys = new Set<string>()
  
  for (const item of existing) {
    if (item[0] === 'meta') {
      const attrs = item[1] as Record<string, string>
      const key = attrs.property || attrs.name
      if (key) {
        existingKeys.add(key)
      }
    }
  }

  // 只添加不存在的 meta 标签
  for (const item of socialMeta) {
    if (item[0] === 'meta') {
      const attrs = item[1] as Record<string, string>
      const key = attrs.property || attrs.name
      if (key && !existingKeys.has(key)) {
        result.push(item)
      }
    } else {
      result.push(item)
    }
  }

  return result
}
