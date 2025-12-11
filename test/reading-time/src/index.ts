/**
 * ldoc-plugin-reading-time
 * 显示文章阅读时间的 LDoc 插件
 * 
 * 特性：
 * - 自动计算文章阅读时间
 * - 通过 Slot 系统自动注入 UI（无需主题支持）
 * - 提供全局组件供手动使用
 */

import { readFileSync } from 'node:fs'
import type { LDocPlugin, PageData } from '@ldesign/doc'

// 使用包导出路径（package.json exports 中定义的 ./client）
const clientConfigFile = 'ldoc-plugin-reading-time/client'

export interface ReadingTimeOptions {
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean
  /**
   * 每分钟阅读字数（中文）
   * @default 300
   */
  wordsPerMinute?: number
  /**
   * 是否包含代码块
   * @default true
   */
  includeCode?: boolean
}

export interface ReadingTimeData {
  /** 阅读时间（分钟） */
  minutes: number
  /** 字数 */
  words: number
  /** 格式化的阅读时间文本 */
  text: string
}

/**
 * 计算文本的阅读时间
 */
function calculateReadingTime(content: string, options: ReadingTimeOptions): ReadingTimeData {
  const { wordsPerMinute = 300, includeCode = true } = options

  let text = content

  // 移除代码块（如果不包含）
  if (!includeCode) {
    text = text.replace(/```[\s\S]*?```/g, '')
    text = text.replace(/`[^`]+`/g, '')
  }

  // 移除 HTML 标签
  text = text.replace(/<[^>]*>/g, '')

  // 移除 Markdown 语法
  text = text.replace(/[#*_~`\[\]()]/g, '')

  // 计算中文字数
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length

  // 计算英文单词数
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

  // 总字数（中文字符 + 英文单词）
  const words = chineseChars + englishWords

  // 计算阅读时间
  const minutes = Math.ceil(words / wordsPerMinute)

  return {
    minutes,
    words,
    text: minutes < 1 ? '不到 1 分钟' : `约 ${minutes} 分钟`
  }
}

/**
 * 创建阅读时间插件
 */
export function readingTimePlugin(options: ReadingTimeOptions = {}): LDocPlugin {
  const { enabled = true } = options

  return {
    name: 'ldoc-plugin-reading-time',

    // 客户端配置文件路径 - 包含 slots 和 globalComponents
    clientConfigFile,

    /**
     * 扩展页面数据 - 添加阅读时间
     */
    async extendPageData(pageData: PageData) {
      if (!enabled) return

      try {
        // 读取文件内容
        const content = readFileSync(pageData.filePath, 'utf-8')

        // 计算阅读时间
        const readingTime = calculateReadingTime(content, options)

        // 将阅读时间添加到 frontmatter
        pageData.frontmatter = pageData.frontmatter || {}
        pageData.frontmatter.readingTime = readingTime
      } catch {
        // 文件读取失败时跳过
      }
    },

    /**
     * 构建开始
     */
    buildStart() {
      if (!enabled) return
      console.log(`[reading-time] 阅读时间插件已启用`)
    }
  }
}

// 导出类型
export type { LDocPlugin, PageData }

export default readingTimePlugin
