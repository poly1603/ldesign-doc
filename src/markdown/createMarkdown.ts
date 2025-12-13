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

import mathjax3 from 'markdown-it-mathjax3'

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

  // 添加 mathjax3 插件
  md.use(mathjax3)

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

  // 步骤列表容器
  md.use(containerPlugin, 'steps', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number }

      if (token.nesting === 1) {
        return '<div class="steps-container"><ol class="steps">\n'
      }

      return '</ol></div>\n'
    }
  })

  // 文件树容器
  md.use(containerPlugin, 'file-tree', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number }

      if (token.nesting === 1) {
        return '<div class="file-tree">\n'
      }

      return '</div>\n'
    }
  })

  // 卡片容器
  md.use(containerPlugin, 'card', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const title = token.info.trim().slice('card'.length).trim()
        return `<div class="card-container">${title ? `<div class="card-title">${title}</div>` : ''}\n<div class="card-content">\n`
      }

      return '</div></div>\n'
    }
  })

  // 卡片网格容器
  md.use(containerPlugin, 'card-grid', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const cols = token.info.trim().slice('card-grid'.length).trim() || '3'
        return `<div class="card-grid" style="--grid-cols: ${cols}">\n`
      }

      return '</div>\n'
    }
  })

  // 标签页容器
  md.use(containerPlugin, 'tabs', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number }

      if (token.nesting === 1) {
        return '<div class="tabs-container">\n'
      }

      return '</div>\n'
    }
  })

  // 单个标签
  md.use(containerPlugin, 'tab', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const label = token.info.trim().slice('tab'.length).trim() || 'Tab'
        return `<div class="tab-item" data-label="${label}">\n`
      }

      return '</div>\n'
    }
  })

  // 视频容器
  md.use(containerPlugin, 'video', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const src = token.info.trim().slice('video'.length).trim()
        if (src) {
          return `<div class="video-container"><video controls preload="metadata"><source src="${src}" type="video/mp4"></video></div>\n`
        }
        return '<div class="video-container">\n'
      }

      return '</div>\n'
    }
  })

  // 音频容器
  md.use(containerPlugin, 'audio', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const src = token.info.trim().slice('audio'.length).trim()
        if (src) {
          return `<div class="audio-container"><audio controls preload="metadata"><source src="${src}" type="audio/mpeg"></audio></div>\n`
        }
        return '<div class="audio-container">\n'
      }

      return '</div>\n'
    }
  })

  // 徽章/标签
  md.use(containerPlugin, 'badge', {
    render(tokens: unknown[], idx: number) {
      const token = tokens[idx] as { nesting: number; info: string }

      if (token.nesting === 1) {
        const info = token.info.trim().slice('badge'.length).trim()
        const [type, text] = info.split(' ')
        const badgeType = ['tip', 'warning', 'danger', 'info'].includes(type) ? type : 'tip'
        const badgeText = text || type || ''
        return `<span class="badge ${badgeType}">${badgeText}</span>`
      }

      return ''
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
  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim()
    const lang = info.split(/\s+/)[0] || 'text'
    const code = token.content

    // Mermaid 图表支持
    if (lang === 'mermaid') {
      return `<div class="mermaid">${code}</div>`
    }

    // 解析高亮行信息，如 typescript{2,4-5}
    const highlightLines = parseHighlightLines(info)

    // 使用代码高亮
    let highlighted = highlighter(code, lang)

    // 处理高亮行
    if (highlightLines.length > 0) {
      highlighted = addLineHighlight(highlighted, highlightLines)
    }

    // 计算实际行数 - 基于高亮输出中的 .line 元素数量
    const lineMatches = highlighted.match(/<span class="line/g)
    const actualLineCount = lineMatches ? lineMatches.length : code.trimEnd().split('\n').length
    const showLineNumbers = options.lineNumbers !== false && actualLineCount > 1

    const lineNumbersHtml = showLineNumbers
      ? `<div class="vp-code-line-numbers">${Array.from({ length: actualLineCount }, (_, i) => `<span class="line-number">${i + 1}</span>`).join('')}</div>`
      : ''

    // 使用 Base64 编码存储代码，避免 HTML 属性值中的特殊字符问题
    const base64Code = Buffer.from(code.trim(), 'utf-8').toString('base64')

    // 包装代码块
    return `<div class="vp-code-block${showLineNumbers ? ' line-numbers' : ''}" data-lang="${lang}">
  <div class="vp-code-header">
    <span class="vp-code-lang">${lang}</span>
    <button class="vp-code-copy" data-code-base64="${base64Code}" title="复制代码">
      <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </button>
  </div>
  <div class="vp-code-content">
    ${lineNumbersHtml}
    <pre><code class="language-${lang}">${highlighted}</code></pre>
  </div>
</div>`
  }
}

/**
 * 解析高亮行配置
 */
function parseHighlightLines(info: string): number[] {
  const match = info.match(/\{([\d,-]+)\}/)
  if (!match) return []

  const lines: number[] = []
  const parts = match[1].split(',')

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number)
      for (let i = start; i <= end; i++) {
        lines.push(i)
      }
    } else {
      lines.push(Number(part))
    }
  }

  return lines
}

/**
 * 添加行高亮 - 给已有的 .line 元素添加高亮类
 */
function addLineHighlight(html: string, highlightLines: number[]): string {
  const lines = html.split('\n')
  return lines.map((line, i) => {
    const lineNum = i + 1
    if (highlightLines.includes(lineNum)) {
      // 替换 class="line" 为 class="line highlighted"
      return line.replace('<span class="line">', '<span class="line highlighted">')
    }
    return line
  }).join('\n')
}

/**
 * HTML 转义
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 设置行号 (保留兼容性，但主要逻辑已移到 setupCodeHighlight)
 */
function setupLineNumbers(md: MarkdownIt): void {
  // 行号逻辑已整合到 setupCodeHighlight
}
