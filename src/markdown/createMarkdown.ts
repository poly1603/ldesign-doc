/**
 * Markdown 渲染器
 */

import MarkdownIt from 'markdown-it'
import anchorPlugin from 'markdown-it-anchor'
import tocPlugin from 'markdown-it-table-of-contents'
import containerPlugin from 'markdown-it-container'
import type { SiteConfig, MarkdownOptions, MarkdownRenderer } from '../shared/types'
import { slugify } from '../shared/utils'
import { createCodeHighlighter } from './highlight'

/**
 * 创建 Markdown 渲染器
 */
export async function createMarkdownRenderer(
  config: SiteConfig
): Promise<MarkdownRenderer> {
  const options = config.markdown || {}

  // 创建 markdown-it 实例
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  })

  // 添加 anchor 插件
  md.use(anchorPlugin, {
    permalink: anchorPlugin.permalink.linkInsideHeader({
      symbol: '#',
      placement: 'before'
    }),
    slugify,
    ...options.anchor
  })

  // 添加目录插件
  md.use(tocPlugin, {
    includeLevel: [2, 3],
    containerClass: 'table-of-contents',
    slugify,
    ...options.toc
  })

  // 添加 emoji 插件 (暂时禁用，存在 ESM 兼容问题)
  // md.use(emojiPlugin)

  // 添加容器插件
  setupContainers(md, options.container as Record<string, string | undefined> | undefined)

  // 设置代码高亮
  const highlighter = await createCodeHighlighter(options)
  setupCodeHighlight(md, highlighter, options)

  // 设置行号
  if (options.lineNumbers) {
    setupLineNumbers(md)
  }

  // 调用用户自定义配置
  if (options.config) {
    options.config(md as unknown as MarkdownRenderer)
  }

  return md as unknown as MarkdownRenderer
}

/**
 * 设置自定义容器
 */
function setupContainers(md: MarkdownIt, options?: Record<string, string | undefined>): void {
  const containerTypes = ['tip', 'warning', 'danger', 'info', 'details']

  const labels: Record<string, string> = {
    tip: options?.tipLabel || 'TIP',
    warning: options?.warningLabel || 'WARNING',
    danger: options?.dangerLabel || 'DANGER',
    info: options?.infoLabel || 'INFO',
    details: options?.detailsLabel || 'Details'
  }

  for (const type of containerTypes) {
    md.use(containerPlugin, type, {
      render(tokens: unknown[], idx: number) {
        const token = tokens[idx] as { nesting: number; info: string }
        const title = token.info.trim().slice(type.length).trim() || labels[type]

        if (token.nesting === 1) {
          if (type === 'details') {
            return `<details class="custom-block details"><summary>${title}</summary>\n`
          }
          return `<div class="custom-block ${type}"><p class="custom-block-title">${title}</p>\n`
        }

        return type === 'details' ? '</details>\n' : '</div>\n'
      }
    })
  }

  // Vue 组件演示容器
  md.use(containerPlugin, 'demo', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const info = token.info.trim().slice('demo'.length).trim()
        return `<Demo${info ? ` info="${info}"` : ''}>\n`
      }

      return '</Demo>\n'
    }
  })

  // React 组件演示容器
  md.use(containerPlugin, 'react-demo', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const info = token.info.trim().slice('react-demo'.length).trim()
        return `<ReactDemo${info ? ` info="${info}"` : ''}>\n`
      }

      return '</ReactDemo>\n'
    }
  })

  // 代码组容器
  md.use(containerPlugin, 'code-group', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number }

      if (token.nesting === 1) {
        return '<CodeGroup>\n'
      }

      return '</CodeGroup>\n'
    }
  })
}

/**
 * 设置代码高亮
 */
function setupCodeHighlight(
  md: MarkdownIt,
  highlighter: (code: string, lang: string) => string,
  options: MarkdownOptions
): void {
  const defaultFence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    const lang = token.info.trim().split(/\s+/)[0] || 'text'
    const code = token.content

    // 使用代码高亮
    const highlighted = highlighter(code, lang)

    // 包装代码块
    const preClass = options.preWrapper !== false ? 'language-' + lang : ''

    return `<div class="language-${lang}${options.lineNumbers ? ' line-numbers-mode' : ''}">
<pre class="${preClass}"><code>${highlighted}</code></pre>
</div>`
  }
}

/**
 * 设置行号
 */
function setupLineNumbers(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    const code = token.content
    const lines = code.split('\n')

    // 生成行号
    const lineNumbers = lines
      .map((_, i) => `<span class="line-number">${i + 1}</span>`)
      .join('')

    const result = defaultFence(tokens, idx, opts, env, self)

    // 在代码块后添加行号
    return result.replace(
      '</div>',
      `<div class="line-numbers-wrapper">${lineNumbers}</div></div>`
    )
  }
}
