/**
 * Web App Manifest 生成模块
 * 根据配置生成符合 W3C 标准的 manifest.json
 */

import type { ManifestConfig, ManifestIcon } from './index'
import type { SiteConfig } from '../../shared/types'

/**
 * Web App Manifest 完整类型定义
 * 基于 W3C Web App Manifest 规范
 */
export interface WebAppManifest {
  /** 应用名称（必需） */
  name: string
  /** 应用短名称 */
  short_name?: string
  /** 应用描述 */
  description?: string
  /** 启动 URL */
  start_url: string
  /** 应用范围 */
  scope?: string
  /** 显示模式 */
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
  /** 应用方向 */
  orientation?:
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary'
  /** 主题色 */
  theme_color?: string
  /** 背景色 */
  background_color?: string
  /** 应用图标 */
  icons?: ManifestIconData[]
  /** 应用分类 */
  categories?: string[]
  /** 应用语言 */
  lang?: string
  /** 文本方向 */
  dir?: 'ltr' | 'rtl' | 'auto'
  /** 相关应用 */
  related_applications?: RelatedApplication[]
  /** 是否优先使用相关应用 */
  prefer_related_applications?: boolean
  /** 快捷方式 */
  shortcuts?: Shortcut[]
  /** 截图 */
  screenshots?: Screenshot[]
}

/**
 * Manifest 图标数据
 */
export interface ManifestIconData {
  src: string
  sizes: string
  type?: string
  purpose?: 'any' | 'maskable' | 'monochrome'
}

/**
 * 相关应用
 */
export interface RelatedApplication {
  platform: string
  url?: string
  id?: string
}

/**
 * 快捷方式
 */
export interface Shortcut {
  name: string
  short_name?: string
  description?: string
  url: string
  icons?: ManifestIconData[]
}

/**
 * 截图
 */
export interface Screenshot {
  src: string
  sizes: string
  type?: string
  label?: string
}

/**
 * 生成 Web App Manifest
 * @param config Manifest 配置
 * @param siteConfig 站点配置
 * @returns Manifest 对象
 */
export function generateManifest(
  config: ManifestConfig,
  siteConfig: SiteConfig
): WebAppManifest {
  const {
    name,
    shortName,
    description,
    themeColor = '#3eaf7c',
    backgroundColor = '#ffffff',
    display = 'standalone',
    orientation = 'any',
    icons = [],
    startUrl = '/',
    scope = '/'
  } = config

  // 规范化 URL（确保以 / 开头，不重复 base）
  const normalizeUrl = (url: string): string => {
    const cleanUrl = url.replace(/^\//, '')
    const base = siteConfig.base.replace(/\/$/, '')
    return base ? `${base}/${cleanUrl}` : `/${cleanUrl}`
  }

  return {
    name: name || siteConfig.title,
    short_name: shortName || name || siteConfig.title,
    description: description || siteConfig.description,
    theme_color: themeColor,
    background_color: backgroundColor,
    display,
    orientation,
    start_url: normalizeUrl(startUrl),
    scope: normalizeUrl(scope),
    icons: icons.map((icon) => ({
      src: normalizeUrl(icon.src),
      sizes: icon.sizes,
      type: icon.type || inferIconType(icon.src),
      purpose: icon.purpose || 'any'
    })),
    lang: siteConfig.lang || 'en',
    dir: 'ltr'
  }
}

/**
 * 推断图标类型
 * @param src 图标路径
 * @returns MIME 类型
 */
export function inferIconType(src: string): string {
  const ext = src.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon'
  }
  return typeMap[ext || ''] || 'image/png'
}

/**
 * 验证 Manifest 配置
 * @param config Manifest 配置
 * @returns 验证结果
 */
export function validateManifestConfig(config: ManifestConfig): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 必需字段验证
  if (!config.name) {
    errors.push('Manifest name is required')
  }

  // 图标验证
  if (!config.icons || config.icons.length === 0) {
    warnings.push('No icons specified. PWA installation may not work properly.')
  } else {
    // 检查推荐的图标尺寸
    const sizes = config.icons.map((icon) => icon.sizes)
    const recommendedSizes = ['192x192', '512x512']
    const missingSizes = recommendedSizes.filter((size) => !sizes.includes(size))

    if (missingSizes.length > 0) {
      warnings.push(
        `Missing recommended icon sizes: ${missingSizes.join(', ')}. ` +
        'For best PWA support, include icons at 192x192 and 512x512.'
      )
    }

    // 检查 maskable 图标
    const hasMaskable = config.icons.some((icon) => icon.purpose === 'maskable')
    if (!hasMaskable) {
      warnings.push(
        'No maskable icon specified. Consider adding a maskable icon for better Android support.'
      )
    }
  }

  // 颜色验证
  if (config.themeColor && !isValidColor(config.themeColor)) {
    warnings.push(`Invalid theme_color: ${config.themeColor}. Should be a valid CSS color.`)
  }

  if (config.backgroundColor && !isValidColor(config.backgroundColor)) {
    warnings.push(
      `Invalid background_color: ${config.backgroundColor}. Should be a valid CSS color.`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证颜色值
 * @param color 颜色字符串
 * @returns 是否有效
 */
function isValidColor(color: string): boolean {
  // 简单验证：十六进制颜色或 CSS 颜色名
  return /^#[0-9A-Fa-f]{3,8}$/.test(color) || /^[a-z]+$/i.test(color)
}

/**
 * 生成默认图标配置
 * @param basePath 图标基础路径
 * @returns 图标配置数组
 */
export function generateDefaultIcons(basePath = '/icons'): ManifestIcon[] {
  return [
    {
      src: `${basePath}/icon-72x72.png`,
      sizes: '72x72',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-96x96.png`,
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-128x128.png`,
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-144x144.png`,
      sizes: '144x144',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-152x152.png`,
      sizes: '152x152',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-384x384.png`,
      sizes: '384x384',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: `${basePath}/icon-maskable-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: `${basePath}/icon-maskable-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}

/**
 * 序列化 Manifest 为 JSON 字符串
 * @param manifest Manifest 对象
 * @returns JSON 字符串
 */
export function serializeManifest(manifest: WebAppManifest): string {
  return JSON.stringify(manifest, null, 2)
}
