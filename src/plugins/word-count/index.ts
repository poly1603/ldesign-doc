/**
 * 字数统计插件
 */
import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData } from '../../shared/types'

export interface WordCountPluginOptions {
  /** 是否统计代码块 */
  countCode?: boolean
}

/**
 * 统计中英文字数
 */
function countWords(content: string, countCode: boolean): { words: number; characters: number } {
  let text = content

  // 移除 frontmatter
  text = text.replace(/^---[\s\S]*?---/, '')

  // 是否移除代码块
  if (!countCode) {
    text = text.replace(/```[\s\S]*?```/g, '')
    text = text.replace(/`[^`]+`/g, '')
  }

  // 移除 HTML 标签
  text = text.replace(/<[^>]+>/g, '')

  // 移除 Markdown 语法
  text = text.replace(/[#*_~\[\]()!|>]/g, '')

  // 统计中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length

  // 统计英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

  // 统计总字符数（不含空白）
  const characters = text.replace(/\s/g, '').length

  return {
    words: chineseChars + englishWords,
    characters
  }
}

export function wordCountPlugin(options: WordCountPluginOptions = {}): LDocPlugin {
  const { countCode = false } = options

  return definePlugin({
    name: 'ldoc-plugin-word-count',

    extendPageData(pageData: PageData) {
      // 从文件路径读取内容计算字数（如果可用）
      if (typeof require !== 'undefined' && pageData.filePath) {
        try {
          const fs = require('fs')
          const content = fs.readFileSync(pageData.filePath, 'utf-8')
          const stats = countWords(content, countCode)
          pageData.frontmatter._wordCount = stats
        } catch {
          pageData.frontmatter._wordCount = { words: 0, characters: 0 }
        }
      }
    }
  })
}

export default wordCountPlugin
