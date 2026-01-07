/**
 * 侧边栏自动生成器
 * 
 * 根据文件目录结构自动生成侧边栏配置
 * 
 * @example
 * ```ts
 * export default defineConfig({
 *   themeConfig: {
 *     sidebar: {
 *       '/guide/': 'auto',
 *       '/api/': { base: '/api/', collapsed: true }
 *     }
 *   }
 * })
 * ```
 */

import { resolve, basename, extname, relative, dirname } from 'path'
import { readdirSync, statSync, readFileSync, existsSync } from 'fs'
import matter from 'gray-matter'
import type { SidebarItem } from '../types/theme'
import { normalizePath } from '../shared/utils'

/**
 * 侧边栏自动生成选项
 */
export interface SidebarAutoOptions {
  /** 基础路径 */
  base?: string
  /** 是否默认折叠 */
  collapsed?: boolean
  /** 排除的文件/目录模式 */
  exclude?: string[]
  /** 是否递归子目录 */
  recursive?: boolean
}

/**
 * 文件/目录信息
 */
interface FileInfo {
  name: string
  path: string
  isDirectory: boolean
  order: number
  title: string
  frontmatter: Record<string, unknown>
}

/**
 * 生成侧边栏配置
 * 
 * @param srcDir - 文档源目录
 * @param targetPath - 目标路径（如 '/guide/'）
 * @param options - 生成选项
 * @returns 侧边栏配置数组
 */
export function generateSidebar(
  srcDir: string,
  targetPath: string,
  options: SidebarAutoOptions = {}
): SidebarItem[] {
  const {
    base,
    collapsed,
    exclude = [],
    recursive = true
  } = options

  // 计算实际目录路径
  const cleanPath = targetPath.replace(/^\/|\/$/g, '')
  const dirPath = resolve(srcDir, cleanPath)

  if (!existsSync(dirPath)) {
    console.warn(`[sidebarGenerator] Directory not found: ${dirPath}`)
    return []
  }

  // 扫描目录
  const items = scanDirectory(dirPath, srcDir, cleanPath, {
    exclude,
    recursive,
    collapsed
  })

  return items
}

/**
 * 扫描目录并生成侧边栏项
 */
function scanDirectory(
  dirPath: string,
  srcDir: string,
  basePath: string,
  options: {
    exclude: string[]
    recursive: boolean
    collapsed?: boolean
  }
): SidebarItem[] {
  const { exclude, recursive, collapsed } = options

  // 读取目录内容
  let entries: string[]
  try {
    entries = readdirSync(dirPath)
  } catch (error) {
    console.warn(`[sidebarGenerator] Failed to read directory: ${dirPath}`)
    return []
  }

  // 收集文件信息
  const fileInfos: FileInfo[] = []

  for (const entry of entries) {
    // 跳过隐藏文件
    if (entry.startsWith('.')) continue
    
    // 跳过排除的文件
    if (shouldExclude(entry, exclude)) continue

    const entryPath = resolve(dirPath, entry)
    const stat = statSync(entryPath)

    if (stat.isDirectory()) {
      // 目录处理
      const indexPath = resolve(entryPath, 'index.md')
      const frontmatter = existsSync(indexPath) 
        ? extractFrontmatter(indexPath)
        : {}

      fileInfos.push({
        name: entry,
        path: entryPath,
        isDirectory: true,
        order: typeof frontmatter.order === 'number' ? frontmatter.order : 999,
        title: typeof frontmatter.title === 'string' 
          ? frontmatter.title 
          : formatTitle(entry),
        frontmatter
      })
    } else if (entry.endsWith('.md')) {
      // Markdown 文件处理
      const frontmatter = extractFrontmatter(entryPath)
      
      // 跳过 index.md（将在目录处理中使用）
      if (entry === 'index.md') continue

      fileInfos.push({
        name: entry,
        path: entryPath,
        isDirectory: false,
        order: typeof frontmatter.order === 'number' ? frontmatter.order : 999,
        title: typeof frontmatter.title === 'string'
          ? frontmatter.title
          : formatTitle(entry.replace(/\.md$/, '')),
        frontmatter
      })
    }
  }

  // 排序：先按 order，再按名称
  fileInfos.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.name.localeCompare(b.name)
  })

  // 生成侧边栏项
  const items: SidebarItem[] = []

  for (const info of fileInfos) {
    if (info.isDirectory) {
      // 目录 -> 分组
      const subPath = `${basePath}/${info.name}`
      
      if (recursive) {
        const children = scanDirectory(info.path, srcDir, subPath, options)
        
        // 检查是否有 index.md
        const indexPath = resolve(info.path, 'index.md')
        const hasIndex = existsSync(indexPath)

        const item: SidebarItem = {
          text: info.title,
          collapsed: info.frontmatter.collapsed as boolean ?? collapsed,
          items: children
        }

        // 如果有 index.md，添加链接
        if (hasIndex) {
          item.link = `/${subPath}/`
        }

        items.push(item)
      }
    } else {
      // 文件 -> 链接
      const link = `/${basePath}/${info.name.replace(/\.md$/, '')}`
      
      const item: SidebarItem = {
        text: info.title,
        link
      }

      // 支持 docFooterText
      if (typeof info.frontmatter.docFooterText === 'string') {
        (item as any).docFooterText = info.frontmatter.docFooterText
      }

      // 支持 badge
      if (info.frontmatter.badge) {
        (item as any).badge = info.frontmatter.badge
      }

      items.push(item)
    }
  }

  return items
}

/**
 * 提取 frontmatter
 */
function extractFrontmatter(filePath: string): Record<string, unknown> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const { data } = matter(content)
    return data
  } catch {
    return {}
  }
}

/**
 * 格式化标题
 * 将文件名转换为可读标题
 */
function formatTitle(name: string): string {
  return name
    // 移除数字前缀（如 01-intro -> intro）
    .replace(/^\d+-/, '')
    // 将连字符和下划线替换为空格
    .replace(/[-_]/g, ' ')
    // 首字母大写
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * 检查是否应该排除
 */
function shouldExclude(name: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // 简单的通配符匹配
    if (pattern.includes('*')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*') + '$'
      )
      if (regex.test(name)) return true
    } else if (name === pattern) {
      return true
    }
  }
  return false
}

/**
 * 处理侧边栏配置中的 'auto' 值
 * 
 * @param sidebar - 原始侧边栏配置
 * @param srcDir - 文档源目录
 * @returns 处理后的侧边栏配置
 */
export function resolveSidebarAuto(
  sidebar: Record<string, unknown>,
  srcDir: string
): Record<string, SidebarItem[]> {
  const result: Record<string, SidebarItem[]> = {}

  for (const [path, config] of Object.entries(sidebar)) {
    if (config === 'auto') {
      // 简单的 'auto' 配置
      result[path] = generateSidebar(srcDir, path)
    } else if (
      typeof config === 'object' && 
      config !== null && 
      !Array.isArray(config) &&
      (config as any).items === 'auto'
    ) {
      // 带选项的 auto 配置
      const options = config as SidebarAutoOptions & { items: 'auto' }
      result[path] = generateSidebar(srcDir, path, options)
    } else if (
      typeof config === 'object' &&
      config !== null &&
      !Array.isArray(config) &&
      'base' in config
    ) {
      // 可能是 SidebarAutoOptions
      const opts = config as SidebarAutoOptions
      result[path] = generateSidebar(srcDir, path, opts)
    } else {
      // 保持原样
      result[path] = config as SidebarItem[]
    }
  }

  return result
}
