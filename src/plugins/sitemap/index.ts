/**
 * 站点地图插件
 * 
 * 功能：
 * - 扫描所有页面
 * - 构建站点地图数据
 * - 生成站点地图页面
 * - 注入站点地图数据到客户端
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import type { LDocPlugin, SiteConfig } from '../../shared/types'
import { buildSitemapData, generateSitemapPageData, type SitemapData } from '../../node/sitemap'

export interface SitemapPluginOptions {
  /** 是否启用站点地图 */
  enabled?: boolean
  /** 站点地图页面路径 */
  sitemapPath?: string
  /** 是否包含隐藏页面 */
  includeHidden?: boolean
}

export function sitemapPlugin(options: SitemapPluginOptions = {}): LDocPlugin {
  const {
    enabled = true,
    sitemapPath = '/sitemap.html',
    includeHidden = false
  } = options

  let sitemapData: SitemapData | null = null
  let siteConfig: SiteConfig | null = null

  return {
    name: 'ldoc:sitemap',
    enforce: 'post',

    configResolved(config) {
      siteConfig = config
    },

    async buildStart(config) {
      if (!enabled) return

      console.log('Building sitemap data...')

      // Get all pages
      const { scanPages } = await import('../../node/pages')
      const pages = await scanPages(config)

      // Build sitemap data
      sitemapData = buildSitemapData(pages, config)

      console.log(`Found ${sitemapData.pages.length} pages across ${Object.keys(sitemapData.categories).length} categories`)
    },

    async generateBundle(config) {
      if (!enabled || !sitemapData) return

      console.log('Generating sitemap page...')

      const outDir = config.outDir
      const pageData = generateSitemapPageData(sitemapData)

      // Generate HTML for sitemap page
      const html = generateSitemapHtml(pageData, config)
      const filePath = resolve(outDir, sitemapPath.replace(/^\//, ''))

      // Ensure directory exists
      mkdirSync(dirname(filePath), { recursive: true })
      writeFileSync(filePath, html, 'utf-8')

      // Generate sitemap data file for client
      const dataFilePath = resolve(outDir, 'sitemap-data.json')
      writeFileSync(dataFilePath, JSON.stringify(sitemapData, null, 2), 'utf-8')

      console.log(`Generated sitemap page with ${sitemapData.pages.length} pages`)
    },

    headScripts() {
      if (!enabled || !sitemapData) return []

      // Inject sitemap data into the page
      return [
        `window.__SITEMAP_DATA__ = ${JSON.stringify(sitemapData)};`
      ]
    }
  }
}

/**
 * Generate HTML for sitemap page
 */
function generateSitemapHtml(
  pageData: { title: string; description: string; pages: any[]; categories: any[] },
  config: SiteConfig
): string {
  const { title, description, pages, categories } = pageData

  return `<!DOCTYPE html>
<html lang="${config.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${config.title}</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="${config.base}assets/style.css">
</head>
<body>
  <div id="app">
    <div class="vp-sitemap">
      <div class="sitemap-header">
        <h1 class="sitemap-title">
          <span class="sitemap-icon">🗺️</span>
          ${title}
        </h1>
        <p class="sitemap-description">${description}</p>
      </div>
      
      <div class="sitemap-categories">
        ${categories.map(category => `
          <section class="category-section">
            <h2 class="category-title">
              <span class="category-icon">📁</span>
              ${category.name}
              <span class="category-count">(${category.count})</span>
            </h2>
            <ul class="category-pages">
              ${category.pages.map((page: any) => `
                <li class="category-page-item">
                  <a href="${page.path}" class="page-link">${page.title}</a>
                  ${page.description ? `<p class="page-description">${page.description}</p>` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        `).join('')}
      </div>
    </div>
  </div>
  <script type="module" src="${config.base}assets/main.js"></script>
</body>
</html>`
}

export default sitemapPlugin
