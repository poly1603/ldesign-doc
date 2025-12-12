/**
 * LDoc 管理系统后端 API
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { join, dirname, basename, extname, relative } from 'path'
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, unlinkSync } from 'fs'
import type { SiteConfig } from '../../shared/types'
import { generateAdminHTML } from './ui'
import pc from 'picocolors'

export interface AdminServerOptions {
  port?: number
  host?: string
  docsPort?: number  // 文档服务器端口
}

/**
 * 创建管理系统服务器
 */
export function createAdminServer(config: SiteConfig, options: AdminServerOptions = {}): Server {
  const { port = 8880, host = '0.0.0.0', docsPort = 5173 } = options

  console.log(pc.gray(`  [Admin] Creating server on port ${port}...`))

  const server = createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const parsedUrl = parseUrl(req.url || '/', true)
    const pathname = parsedUrl.pathname || '/'

    // API 路由
    if (pathname.startsWith('/api/')) {
      await handleApiRequest(req, res, pathname, config)
      return
    }

    // 返回管理界面 HTML
    const html = generateAdminHTML({ docsPort })
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(pc.yellow(`  ⚠️ Admin port ${port} is in use, trying ${port + 1}...`))
      server.listen(port + 1, host)
    } else {
      console.error(pc.red(`  ❌ Admin server error: ${err.message}`))
    }
  })

  server.listen(port, host, () => {
    const addr = server.address()
    const actualPort = typeof addr === 'object' && addr ? addr.port : port
    console.log(pc.cyan(`  📝 Admin UI: `) + pc.green(`http://localhost:${actualPort}/`))
  })

  return server
}

/**
 * 处理 API 请求
 */
async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  config: SiteConfig
): Promise<void> {
  const method = req.method || 'GET'
  let body: Record<string, unknown> = {}

  if (method === 'POST' || method === 'PUT') {
    body = await parseBody(req)
  }

  const query = parseUrl(req.url || '/', true).query as Record<string, string>

  try {
    let result: { status: number; data: unknown }

    // 路由处理
    if (pathname === '/api/config') {
      result = handleConfig(method, body, config)
    } else if (pathname === '/api/site') {
      result = handleSite(config)
    } else if (pathname === '/api/pages') {
      result = handlePages(method, body, config)
    } else if (pathname.startsWith('/api/pages/')) {
      const pagePath = decodeURIComponent(pathname.slice('/api/pages/'.length))
      result = handlePage(method, pagePath, body, config)
    } else if (pathname === '/api/nav') {
      result = handleNav(config)
    } else if (pathname === '/api/sidebar') {
      result = handleSidebar(config)
    } else if (pathname === '/api/tree') {
      result = handleTree(config)
    } else if (pathname === '/api/upload') {
      result = handleUpload(body, config)
    } else {
      result = { status: 404, data: { error: 'Not Found' } }
    }

    res.writeHead(result.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result.data))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: String(err) }))
  }
}

// 配置管理
function handleConfig(method: string, body: Record<string, unknown>, config: SiteConfig) {
  if (method === 'GET') {
    const content = config.configPath && existsSync(config.configPath)
      ? readFileSync(config.configPath, 'utf-8')
      : ''
    return { status: 200, data: { config: content, path: config.configPath } }
  }

  if (method === 'PUT' && config.configPath) {
    writeFileSync(config.configPath, body.content as string, 'utf-8')
    return { status: 200, data: { success: true, message: '配置已保存' } }
  }

  return { status: 400, data: { error: '无效请求' } }
}

// 站点信息
function handleSite(config: SiteConfig) {
  return {
    status: 200,
    data: {
      title: config.title,
      description: config.description,
      base: config.base,
      lang: config.lang,
      srcDir: config.srcDir,
      outDir: config.outDir,
      root: config.root
    }
  }
}

// 页面列表
function handlePages(method: string, body: Record<string, unknown>, config: SiteConfig) {
  if (method === 'GET') {
    const pages = scanMarkdownFiles(config.srcDir)
    return { status: 200, data: { pages } }
  }

  if (method === 'POST') {
    const { path: filePath, content, frontmatter } = body as {
      path: string
      content: string
      frontmatter?: Record<string, unknown>
    }
    const fullPath = join(config.srcDir, filePath)
    const dir = dirname(fullPath)

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    let fileContent = content
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      const fm = generateFrontmatter(frontmatter)
      fileContent = `---\n${fm}---\n\n${content}`
    }

    writeFileSync(fullPath, fileContent, 'utf-8')
    return { status: 201, data: { success: true, path: filePath } }
  }

  return { status: 400, data: { error: '无效请求' } }
}

// 单页面操作
function handlePage(method: string, pagePath: string, body: Record<string, unknown>, config: SiteConfig) {
  const fullPath = join(config.srcDir, pagePath)

  if (method === 'GET') {
    if (!existsSync(fullPath)) {
      return { status: 404, data: { error: '页面不存在' } }
    }
    const content = readFileSync(fullPath, 'utf-8')
    const { frontmatter, body: mdBody } = parseFrontmatter(content)
    return { status: 200, data: { path: pagePath, content: mdBody, frontmatter, raw: content } }
  }

  if (method === 'PUT') {
    const { content, frontmatter } = body as { content: string; frontmatter?: Record<string, unknown> }
    let fileContent = content
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      const fm = generateFrontmatter(frontmatter)
      fileContent = `---\n${fm}---\n\n${content}`
    }
    writeFileSync(fullPath, fileContent, 'utf-8')
    return { status: 200, data: { success: true } }
  }

  if (method === 'DELETE') {
    if (existsSync(fullPath)) {
      unlinkSync(fullPath)
      return { status: 200, data: { success: true } }
    }
    return { status: 404, data: { error: '页面不存在' } }
  }

  return { status: 400, data: { error: '无效请求' } }
}

// 导航配置
function handleNav(config: SiteConfig) {
  const themeConfig = (config as unknown as { themeConfig?: { nav?: unknown[] } }).themeConfig
  return { status: 200, data: { nav: themeConfig?.nav || [] } }
}

// 侧边栏配置
function handleSidebar(config: SiteConfig) {
  const themeConfig = (config as unknown as { themeConfig?: { sidebar?: unknown } }).themeConfig
  return { status: 200, data: { sidebar: themeConfig?.sidebar || {} } }
}

// 文件树
function handleTree(config: SiteConfig) {
  const tree = buildFileTree(config.srcDir, config.srcDir)
  return { status: 200, data: { tree } }
}

// 文件上传
function handleUpload(body: Record<string, unknown>, config: SiteConfig) {
  const { filename, content, folder = 'public' } = body as {
    filename: string
    content: string
    folder?: string
  }

  const targetDir = join(config.srcDir, folder)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  const targetPath = join(targetDir, filename)
  const buffer = Buffer.from(content, 'base64')
  writeFileSync(targetPath, buffer)

  return { status: 200, data: { success: true, url: `/${folder}/${filename}` } }
}

// 工具函数
function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) }
      catch { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

function scanMarkdownFiles(dir: string, basePath = ''): Array<{ path: string; title: string; updatedAt: string }> {
  const files: Array<{ path: string; title: string; updatedAt: string }> = []
  if (!existsSync(dir)) return files

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const relativePath = basePath ? `${basePath}/${entry}` : entry
    const stat = statSync(fullPath)

    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'public' && entry !== 'node_modules') {
      files.push(...scanMarkdownFiles(fullPath, relativePath))
    } else if (extname(entry) === '.md') {
      const content = readFileSync(fullPath, 'utf-8')
      const { frontmatter } = parseFrontmatter(content)
      files.push({
        path: relativePath,
        title: (frontmatter.title as string) || basename(entry, '.md'),
        updatedAt: stat.mtime.toISOString()
      })
    }
  }
  return files
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const [, fmContent, body] = match
  const frontmatter: Record<string, unknown> = {}

  for (const line of fmContent.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value: unknown = line.slice(colonIndex + 1).trim()
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10)
      frontmatter[key] = value
    }
  }
  return { frontmatter, body: body.trim() }
}

function generateFrontmatter(fm: Record<string, unknown>): string {
  return Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => typeof v === 'string' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`)
    .join('\n') + '\n'
}

function buildFileTree(dir: string, rootDir: string): Array<{ name: string; path: string; type: 'file' | 'directory'; children?: unknown[] }> {
  const tree: Array<{ name: string; path: string; type: 'file' | 'directory'; children?: unknown[] }> = []
  if (!existsSync(dir)) return tree

  const entries = readdirSync(dir).sort((a, b) => {
    const aIsDir = statSync(join(dir, a)).isDirectory()
    const bIsDir = statSync(join(dir, b)).isDirectory()
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    return a.localeCompare(b)
  })

  for (const entry of entries) {
    if (entry.startsWith('.')) continue
    const fullPath = join(dir, entry)
    const relativePath = relative(rootDir, fullPath).replace(/\\/g, '/')
    const stat = statSync(fullPath)

    if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'public') {
      tree.push({ name: entry, path: relativePath, type: 'directory', children: buildFileTree(fullPath, rootDir) })
    } else if (extname(entry) === '.md') {
      tree.push({ name: entry, path: relativePath, type: 'file' })
    }
  }
  return tree
}
