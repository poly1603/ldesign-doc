/**
 * ldoc-plugin-word-count
 * 显示文章字数统计
 */

import type { LDocPlugin, SiteConfig, MarkdownRenderer, PageData } from '@ldesign/doc'

export interface WordCountOptions {
  /**
   * 插件选项示例
   */
  enabled?: boolean
}

/**
 * 创建 word-count 插件
 */
export function wordCountPlugin(options: WordCountOptions = {}): LDocPlugin {
  const { enabled = true } = options

  return {
    name: 'ldoc-plugin-word-count',

    /**
     * 修改配置
     */
    config(config, env) {
      if (!enabled) return
      
      // 在此修改配置
      console.log(`[ldoc-plugin-word-count] Config hook called in ${env.mode} mode`)
      
      return config
    },

    /**
     * 配置解析完成后
     */
    configResolved(config: SiteConfig) {
      if (!enabled) return
      
      console.log(`[ldoc-plugin-word-count] Config resolved`)
    },

    /**
     * 扩展 Markdown 渲染器
     */
    extendMarkdown(md: MarkdownRenderer) {
      if (!enabled) return
      
      // 在此添加 markdown-it 插件
      // md.use(yourMarkdownPlugin)
      
      console.log(`[ldoc-plugin-word-count] Markdown extended`)
    },

    /**
     * 扩展页面数据
     */
    async extendPageData(pageData: PageData) {
      if (!enabled) return
      
      // 在此修改页面数据
      // pageData.frontmatter.customField = 'value'
    },

    /**
     * 构建开始
     */
    buildStart(config: SiteConfig) {
      if (!enabled) return
      
      console.log(`[ldoc-plugin-word-count] Build started`)
    },

    /**
     * 构建结束
     */
    buildEnd(config: SiteConfig) {
      if (!enabled) return
      
      console.log(`[ldoc-plugin-word-count] Build completed`)
    },

    /**
     * 客户端配置文件路径（可选）
     * 返回一个客户端代码文件的路径，会在浏览器端执行
     */
    clientConfigFile: new URL('./client.js', import.meta.url).pathname
  }
}

export default wordCountPlugin
