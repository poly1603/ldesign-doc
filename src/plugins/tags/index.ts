/**
 * 标签系统插件
 * 
 * 功能：
 * - 从页面 frontmatter 中提取标签
 * - 构建标签索引
 * - 生成标签页面
 * - 注入标签数据到客户端
 */

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import type { LDocPlugin, SiteConfig, PageData } from '../../shared/types'
import { buildTagIndex, getTagList, generateTagPageData, type TagIndex } from '../../node/tags'

export interface TagsPluginOptions {
  /** 是否启用标签系统 */
  enabled?: boolean
  /** 标签页面路径前缀 */
  tagPagePrefix?: string
  /** 是否生成标签云页面 */
  generateTagCloud?: boolean
  /** 标签云页面路径 */
  tagCloudPath?: string
}

export function tagsPlugin(options: TagsPluginOptions = {}): LDocPlugin {
  const {
    enabled = true,
    tagPagePrefix = '/tags',
    generateTagCloud = true,
    tagCloudPath = '/tags.html'
  } = options

  let tagIndex: TagIndex | null = null
  let siteConfig: SiteConfig | null = null

  return {
    name: 'ldoc:tags',
    enforce: 'post',

    configResolved(config) {
      siteConfig = config
    },

    async buildStart(config) {
      if (!enabled) return

      console.log('Building tag index...')

      // Get all pages
      const { scanPages } = await import('../../node/pages')
      const pages = await scanPages(config)

      // Build tag index
      tagIndex = buildTagIndex(pages, config)

      console.log(`Found ${tagIndex.tags.size} tags across ${tagIndex.pages.length} pages`)
    },

    async generateBundle(config) {
      if (!enabled || !tagIndex) return

      console.log('Generating tag pages...')

      const outDir = config.outDir
      const tagsDir = resolve(outDir, 'tags')

      // Create tags directory
      mkdirSync(tagsDir, { recursive: true })

      // Generate individual tag pages
      const tagList = getTagList(tagIndex)
      for (const tagInfo of tagList) {
        const pageData = generateTagPageData(tagInfo.name, tagIndex)
        if (!pageData) continue

        // Generate HTML for tag page
        const html = generateTagPageHtml(tagInfo.name, pageData, config)
        const fileName = `${encodeURIComponent(tagInfo.name)}.html`
        const filePath = resolve(tagsDir, fileName)

        writeFileSync(filePath, html, 'utf-8')
      }

      // Generate tag cloud page if enabled
      if (generateTagCloud) {
        const html = generateTagCloudHtml(tagList, config)
        const filePath = resolve(outDir, tagCloudPath.replace(/^\//, ''))

        // Ensure directory exists
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, html, 'utf-8')
      }

      // Generate tag index data file for client
      const tagIndexData = {
        tags: Object.fromEntries(
          Array.from(tagIndex.tags.entries()).map(([name, info]) => [
            name,
            {
              name: info.name,
              count: info.count,
              pages: info.pages
            }
          ])
        ),
        pages: tagIndex.pages
      }

      const dataFilePath = resolve(outDir, 'tag-index.json')
      writeFileSync(dataFilePath, JSON.stringify(tagIndexData, null, 2), 'utf-8')

      console.log(`Generated ${tagList.length} tag pages`)
    },

    headScripts() {
      if (!enabled || !tagIndex) return []

      // Inject tag index data into the page
      const tagIndexData = {
        tags: Object.fromEntries(
          Array.from(tagIndex.tags.entries()).map(([name, info]) => [
            name,
            {
              name: info.name,
              count: info.count,
              pages: info.pages
            }
          ])
        ),
        pages: tagIndex.pages
      }

      return [
        `window.__TAG_INDEX__ = ${JSON.stringify(tagIndexData)};`
      ]
    }
  }
}

/**
 * Generate HTML for a tag page
 */
function generateTagPageHtml(
  tagName: string,
  pageData: { title: string; description: string; pages: any[] },
  config: SiteConfig
): string {
  const { title, description, pages } = pageData

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
    <div class="vp-tag-page">
      <div class="tag-header">
        <h1 class="tag-title">
          <span class="tag-icon">#</span>
          ${tagName}
        </h1>
        <p class="tag-description">${description}</p>
      </div>
      <div class="tag-pages">
        ${pages.map(page => `
          <article class="tag-page-item">
            <h3 class="page-title">
              <a href="${page.path}">${page.title}</a>
            </h3>
            ${page.description ? `<p class="page-description">${page.description}</p>` : ''}
            <div class="page-meta">
              ${page.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
              ${page.lastUpdated ? `<time class="page-date">${new Date(page.lastUpdated).toLocaleDateString()}</time>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
      <div class="tag-footer">
        <a href="/tags.html" class="back-link">← Back to all tags</a>
      </div>
    </div>
  </div>
  <script type="module" src="${config.base}assets/main.js"></script>
</body>
</html>`
}

/**
 * Generate HTML for tag cloud page
 */
function generateTagCloudHtml(tagList: any[], config: SiteConfig): string {
  return `<!DOCTYPE html>
<html lang="${config.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tags | ${config.title}</title>
  <meta name="description" content="Browse all tags">
  <link rel="stylesheet" href="${config.base}assets/style.css">
</head>
<body>
  <div id="app">
    <div class="vp-tag-cloud">
      <h1 class="tag-cloud-title">All Tags</h1>
      <div class="tag-cloud-container">
        ${tagList.map(tag => {
    const maxCount = Math.max(...tagList.map(t => t.count))
    const minCount = Math.min(...tagList.map(t => t.count))
    const ratio = maxCount === minCount ? 1 : (tag.count - minCount) / (maxCount - minCount)
    const fontSize = 14 + ratio * 18

    return `
            <a href="/tags/${encodeURIComponent(tag.name)}.html" 
               class="tag-cloud-item" 
               style="font-size: ${fontSize}px">
              ${tag.name}
              <span class="tag-count">(${tag.count})</span>
            </a>
          `
  }).join('')}
      </div>
    </div>
  </div>
  <script type="module" src="${config.base}assets/main.js"></script>
</body>
</html>`
}

export default tagsPlugin
