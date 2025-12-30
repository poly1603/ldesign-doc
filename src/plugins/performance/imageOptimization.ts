/**
 * 图片自动优化
 * 集成 sharp 进行图片处理、生成 WebP 格式、添加 lazy loading 属性
 */

import { resolve, join, dirname, extname, basename } from 'path'
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import type { SiteConfig } from '../../shared/types'

export interface ImageOptimizationOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 是否生成 WebP 格式 */
  webp?: boolean
  /** WebP 质量 (0-100) */
  webpQuality?: number
  /** 是否添加 lazy loading */
  lazyLoading?: boolean
  /** 排除的图片路径模式 */
  exclude?: RegExp[]
}

/**
 * 支持的图片格式
 */
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

/**
 * 检查是否为图片文件
 */
function isImageFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase()
  return SUPPORTED_FORMATS.includes(ext)
}

/**
 * 检查是否应该排除该图片
 */
function shouldExclude(filePath: string, excludePatterns: RegExp[] = []): boolean {
  return excludePatterns.some(pattern => pattern.test(filePath))
}

/**
 * 图片优化主函数
 */
export async function imageOptimization(
  config: SiteConfig,
  options: ImageOptimizationOptions = {}
): Promise<void> {
  const {
    webp = true,
    webpQuality = 80,
    lazyLoading = true,
    exclude = []
  } = options

  // 尝试加载 sharp，如果不存在则跳过优化
  let sharp: typeof import('sharp') | null = null
  try {
    sharp = (await import('sharp')).default
  } catch (error) {
    console.warn('Sharp not installed, skipping image optimization. Install with: npm install sharp')
    return
  }

  // 扫描源目录中的图片
  const images = await scanImages(config.srcDir, exclude)

  if (images.length === 0) {
    return
  }

  console.log(`Optimizing ${images.length} images...`)

  // 创建优化后的图片目录
  const optimizedDir = resolve(config.outDir, 'assets', 'images')
  if (!existsSync(optimizedDir)) {
    mkdirSync(optimizedDir, { recursive: true })
  }

  // 处理每张图片
  for (const imagePath of images) {
    try {
      const relativePath = imagePath.replace(config.srcDir, '').replace(/^[/\\]/, '')
      const outputPath = resolve(optimizedDir, basename(imagePath))

      // 生成 WebP 版本
      if (webp && sharp) {
        const webpPath = outputPath.replace(extname(outputPath), '.webp')
        await sharp(imagePath)
          .webp({ quality: webpQuality })
          .toFile(webpPath)
      }

      // 如果启用了 lazy loading，记录图片路径以便后续处理 HTML
      if (lazyLoading) {
        // 这将在 HTML 生成阶段处理
        config.imageOptimization = config.imageOptimization || {}
        config.imageOptimization.lazyLoadImages = config.imageOptimization.lazyLoadImages || []
        config.imageOptimization.lazyLoadImages.push(relativePath)
      }
    } catch (error) {
      console.warn(`Failed to optimize image ${imagePath}:`, error)
    }
  }
}

/**
 * 扫描目录中的所有图片
 */
async function scanImages(dir: string, exclude: RegExp[] = []): Promise<string[]> {
  const images: string[] = []

  function scan(currentDir: string) {
    if (!existsSync(currentDir)) {
      return
    }

    const items = readdirSync(currentDir)
    for (const item of items) {
      const fullPath = join(currentDir, item)

      // 跳过 node_modules 和隐藏目录
      if (item === 'node_modules' || item.startsWith('.')) {
        continue
      }

      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        scan(fullPath)
      } else if (isImageFile(fullPath) && !shouldExclude(fullPath, exclude)) {
        images.push(fullPath)
      }
    }
  }

  scan(dir)
  return images
}

/**
 * 为 HTML 中的图片添加 lazy loading 属性
 */
export function addLazyLoadingToHtml(html: string, imagePaths: string[] = []): string {
  // 为所有 img 标签添加 loading="lazy" 属性
  return html.replace(/<img\s+([^>]*?)>/gi, (match, attrs) => {
    // 如果已经有 loading 属性，跳过
    if (/loading\s*=/.test(attrs)) {
      return match
    }
    // 确保属性之间有空格
    const trimmedAttrs = attrs.trim()
    return `<img ${trimmedAttrs} loading="lazy">`
  })
}

/**
 * 生成 WebP 的 picture 元素
 */
export function generatePictureElement(
  src: string,
  alt: string = '',
  attrs: Record<string, string> = {}
): string {
  const webpSrc = src.replace(extname(src), '.webp')

  // Escape HTML attributes
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  const escapedAlt = escapeHtml(alt)
  const attrsStr = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ')

  const attrsWithSpace = attrsStr ? ` ${attrsStr}` : ''

  return `<picture><source srcset="${webpSrc}" type="image/webp"><img src="${src}" alt="${escapedAlt}"${attrsWithSpace} loading="lazy"></picture>`
}
