/**
 * 站点数据生成 - 统一 dev 和 build 的数据结构
 */

import { resolve } from 'path'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import matter from 'gray-matter'
import type { SiteConfig, PageData } from '../../shared/types'

export interface RouteData {
  path: string
  filePath: string
  title: string
  frontmatter: Record<string, unknown>
}

/**
 * 扫描目录获取所有页面文件（.md 和 .vue）
 */
function scanPageFiles(dir: string, prefix: string = ''): { relativePath: string; fullPath: string; type: 'md' | 'vue' }[] {
  const files: { relativePath: string; fullPath: string; type: 'md' | 'vue' }[] = []

  if (!existsSync(dir)) return files

  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      // 跳过特殊目录
      if (['public', 'node_modules', '.git', 'demos'].includes(entry.name)) continue
      // 递归扫描
      files.push(...scanPageFiles(fullPath, `${prefix}${entry.name}/`))
    } else if (entry.name.endsWith('.md')) {
      files.push({
        relativePath: `${prefix}${entry.name}`,
        fullPath,
        type: 'md'
      })
    } else if (entry.name.endsWith('.vue')) {
      files.push({
        relativePath: `${prefix}${entry.name}`,
        fullPath,
        type: 'vue'
      })
    }
  }

  return files
}

// 保持向后兼容
function scanMarkdownFiles(dir: string, prefix: string = ''): { relativePath: string; fullPath: string }[] {
  return scanPageFiles(dir, prefix).filter(f => f.type === 'md')
}

/**
 * 解析 frontmatter
 */
function parseFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
  try {
    const { data, content: body } = matter(content)
    return { data, content: body }
  } catch {
    return { data: {}, content }
  }
}

/**
 * 将文件路径转换为路由路径
 * docs/guide/getting-started.md -> /guide/getting-started
 * docs/index.md -> /
 * docs/guide/index.md -> /guide
 */
function filePathToRoutePath(relativePath: string): string {
  // 移除 .md 或 .vue 后缀
  let routePath = relativePath.replace(/\.(md|vue)$/, '')

  // 处理 index 文件
  if (routePath === 'index') {
    return '/'
  }

  // 移除尾部的 /index
  routePath = routePath.replace(/\/index$/, '')

  // 添加前导 /
  return '/' + routePath
}

/**
 * 生成路由数据（支持 .md 和 .vue 文件）
 */
export async function generateRoutes(config: SiteConfig): Promise<RouteData[]> {
  const srcDir = config.srcDir
  const files = scanPageFiles(srcDir)

  const routes: RouteData[] = []

  for (const file of files) {
    const content = readFileSync(file.fullPath, 'utf-8')

    let frontmatter: Record<string, unknown> = {}
    let title = ''

    if (file.type === 'md') {
      const parsed = parseFrontmatter(content)
      frontmatter = parsed.data
      const baseName = file.relativePath.replace(/\.md$/, '').split('/').pop() || ''
      title = (frontmatter.title as string) || (baseName === 'index' ? '' : baseName)
    } else {
      // Vue 文件：尝试从注释中提取 frontmatter 或使用文件名
      const titleMatch = content.match(/<!--\s*title:\s*(.+?)\s*-->/)
      const baseName = file.relativePath.replace(/\.vue$/, '').split('/').pop() || ''
      title = titleMatch ? titleMatch[1] : baseName
      frontmatter = { title, layout: 'page' }
    }

    const routePath = filePathToRoutePath(file.relativePath)

    routes.push({
      path: routePath,
      filePath: file.fullPath,
      title,
      frontmatter
    })
  }

  // 按路径排序，确保 / 在最前面
  routes.sort((a, b) => {
    if (a.path === '/') return -1
    if (b.path === '/') return 1
    return a.path.localeCompare(b.path)
  })

  return routes
}

/**
 * 从 PageData 数组转换为 RouteData 数组
 * 用于 build 模式，保留插件扩展的 frontmatter 数据
 */
export function pageDataToRoutes(pages: PageData[]): RouteData[] {
  return pages.map(page => ({
    path: '/' + page.relativePath.replace(/\.md$/, '').replace(/\/index$/, '').replace(/^index$/, ''),
    filePath: page.filePath,
    title: page.title,
    frontmatter: page.frontmatter
  })).map(r => ({
    ...r,
    path: r.path === '' ? '/' : r.path
  })).sort((a, b) => {
    if (a.path === '/') return -1
    if (b.path === '/') return 1
    return a.path.localeCompare(b.path)
  })
}

/**
 * 生成路由代码
 */
export function generateRoutesCode(routes: RouteData[], mode: 'dev' | 'build'): string {
  if (mode === 'dev') {
    // Dev 模式使用动态导入
    return `
// Auto-generated routes
export const routes = [
${routes.map(r => `  {
    path: '${r.path}',
    component: () => import('${r.filePath.replace(/\\/g, '/')}'),
    meta: { 
      title: '${r.title}',
      frontmatter: ${JSON.stringify(r.frontmatter)}
    }
  }`).join(',\n')},
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@theme').then(m => m.default?.NotFound || m.NotFound)
  }
]
`
  } else {
    // Build 模式使用静态导入
    return `
// Auto-generated routes
${routes.map((r, i) => `import Page${i} from '${r.filePath.replace(/\\/g, '/')}'`).join('\n')}
import theme from '@theme'
const NotFound = theme.NotFound

export const routes = [
${routes.map((r, i) => `  {
    path: '${r.path}',
    component: Page${i},
    meta: { 
      title: '${r.title}',
      frontmatter: ${JSON.stringify(r.frontmatter)}
    }
  }`).join(',\n')},
  {
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]
`
  }
}

/**
 * 生成站点数据代码
 */
export function generateSiteDataCode(config: SiteConfig): string {
  return `
// Site data
export const siteData = {
  base: '${config.base}',
  title: '${config.title}',
  description: '${config.description}',
  lang: '${config.lang}',
  themeConfig: ${JSON.stringify(config.themeConfig)},
  locales: ${JSON.stringify(config.locales || {})},
  head: ${JSON.stringify(config.head)}
}
`
}

/**
 * 生成主入口代码
 */
export function generateMainCode(config: SiteConfig): string {
  return `
import { createApp, ref, provide, h, Transition } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import { routes } from './routes'
import { siteData } from './siteData'
// 从虚拟模块导入主题（支持 npm 包和本地主题）
import theme from '@theme'
const Layout = theme.Layout

// 导入主题样式
import '@theme-styles'

// 导入插件系统
import { createPluginSlotsContext, providePluginSlots, collectPluginSlots } from '@ldesign/doc/client'

// 导入插件客户端配置
import clientPlugins from 'virtual:ldoc/plugins'

// 创建响应式数据
const siteDataRef = ref(siteData)
const pageDataRef = ref({
  title: '',
  description: '',
  frontmatter: {},
  relativePath: ''
})

// 注入符号
const pageDataSymbol = Symbol.for('ldoc:pageData')
const siteDataSymbol = Symbol.for('ldoc:siteData')

// 全局变量
window.__LDOC_PAGE_DATA__ = pageDataRef
window.__LDOC_SITE_DATA__ = siteDataRef

// 创建插件 Slot 上下文
const pluginSlotsContext = createPluginSlotsContext()

// 收集插件的 slots 和全局组件
console.log('[ldoc] Client plugins:', clientPlugins)
collectPluginSlots(clientPlugins, pluginSlotsContext)

// 创建路由
const router = createRouter({
  history: createWebHistory('${config.base}'),
  routes
})

// 路由守卫
router.beforeResolve(async (to) => {
  const meta = to.meta || {}
  pageDataRef.value = {
    title: meta.title || siteData.title,
    description: meta.description || siteData.description,
    frontmatter: meta.frontmatter || {},
    relativePath: to.path
  }
  
  document.title = pageDataRef.value.title 
    ? pageDataRef.value.title + ' | ' + siteData.title
    : siteData.title
})

// 根组件
const RootComponent = {
  setup() {
    provide(pageDataSymbol, pageDataRef)
    provide(siteDataSymbol, siteDataRef)
    
    // 提供插件 Slots 上下文
    providePluginSlots(pluginSlotsContext)
    
    return () => h(Layout)
  }
}

// 创建应用
const app = createApp(RootComponent)
app.use(router)
app.mount('#app')

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
}
`
}

/**
 * 生成 HTML 模板
 */
export function generateHtmlTemplate(config: SiteConfig, scriptSrc: string = './main.ts'): string {
  const headTags = config.head.map(tag => {
    const [tagName, attrs, content] = tag
    const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
    return content ? `<${tagName} ${attrStr}>${content}</${tagName}>` : `<${tagName} ${attrStr}>`
  }).join('\n    ')

  return `<!DOCTYPE html>
<html lang="${config.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <meta name="description" content="${config.description}">
  ${headTags}
</head>
<body>
  <div id="app"></div>
  <script type="module" src="${scriptSrc}"></script>
</body>
</html>
`
}
