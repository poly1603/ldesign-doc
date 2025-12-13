/**
 * 组件演示插件
 * 
 * 支持在 Markdown 中展示 Vue/React 组件的渲染效果和源代码
 * 
 * 用法：
 * 1. 内联代码块：
 *    ```vue demo
 *    <template>
 *      <button @click="count++">Count: {{ count }}</button>
 *    </template>
 *    <script setup>
 *    import { ref } from 'vue'
 *    const count = ref(0)
 *    </script>
 *    ```
 * 
 * 2. 引入外部文件：
 *    ```vue demo src="./demos/Button.vue"
 *    ```
 * 
 * 3. 使用 Demo 组件：
 *    <Demo src="./demos/Button.vue" />
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, MarkdownRenderer } from '../../shared/types'
import type MarkdownIt from 'markdown-it'

export interface DemoPluginOptions {
  /** 组件展示的默认标题 */
  defaultTitle?: string
  /** 是否默认展开代码 */
  defaultExpanded?: boolean
  /** 代码展开按钮文本 */
  expandText?: string
  /** 代码收起按钮文本 */
  collapseText?: string
  /** 复制成功提示文本 */
  copySuccessText?: string
  /** 是否显示在线编辑按钮 */
  showPlayground?: boolean
  /** 在线编辑器链接模板 */
  playgroundUrl?: string
}

/**
 * 解析 demo 指令的参数
 */
function parseDemoParams(info: string): { src?: string; title?: string; expanded?: boolean } {
  const params: { src?: string; title?: string; expanded?: boolean } = {}

  // 匹配 src="xxx"
  const srcMatch = info.match(/src=["']([^"']+)["']/)
  if (srcMatch) {
    params.src = srcMatch[1]
  }

  // 匹配 title="xxx"
  const titleMatch = info.match(/title=["']([^"']+)["']/)
  if (titleMatch) {
    params.title = titleMatch[1]
  }

  // 匹配 expanded
  if (info.includes('expanded')) {
    params.expanded = true
  }

  return params
}

/**
 * 生成唯一的组件 ID
 */
function generateDemoId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 扩展 Markdown，支持 demo 代码块
 */
function extendMarkdownForDemo(md: MarkdownIt, options: DemoPluginOptions) {
  const defaultFenceRenderer = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, mdOptions, env, self) => {
    const token = tokens[idx]
    const info = token.info.trim()
    const code = token.content

    // 检查是否是 demo 代码块
    const isDemoVue = info.startsWith('vue demo') || info.startsWith('vue:demo')
    const isDemoReact = info.startsWith('jsx demo') || info.startsWith('tsx demo') ||
      info.startsWith('react demo') || info.startsWith('jsx:demo') ||
      info.startsWith('tsx:demo') || info.startsWith('react:demo')

    if (!isDemoVue && !isDemoReact) {
      return defaultFenceRenderer(tokens, idx, mdOptions, env, self)
    }

    const params = parseDemoParams(info)
    const demoId = generateDemoId()
    const language = isDemoVue ? 'vue' : 'tsx'
    const expanded = params.expanded ?? options.defaultExpanded ?? false

    // 对代码进行 HTML 转义
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

    // 生成 demo 容器 HTML
    // 注意：实际渲染需要客户端组件配合
    return `
<div class="ldoc-demo" data-demo-id="${demoId}" data-language="${language}" data-expanded="${expanded}">
  <div class="ldoc-demo-title">${params.title || options.defaultTitle || '示例'}</div>
  <div class="ldoc-demo-preview" data-demo-code="${encodeURIComponent(code)}">
    <!-- 组件将在客户端渲染 -->
    <div class="ldoc-demo-loading">加载中...</div>
  </div>
  <div class="ldoc-demo-actions">
    <button class="ldoc-demo-action ldoc-demo-copy" title="复制代码">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
      </svg>
    </button>
    <button class="ldoc-demo-action ldoc-demo-toggle" title="${options.expandText || '展开代码'}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    </button>
  </div>
  <div class="ldoc-demo-code" style="display: ${expanded ? 'block' : 'none'}">
    <pre><code class="language-${language}">${escapedCode}</code></pre>
  </div>
</div>
`
  }
}

/**
 * Demo 容器自定义指令
 */
function addDemoContainer(md: MarkdownIt, options: DemoPluginOptions) {
  // 注册 ::: demo 容器
  const containerPlugin = require('markdown-it-container')

  md.use(containerPlugin, 'demo', {
    validate: (params: string) => params.trim().startsWith('demo'),
    render: (tokens: any[], idx: number) => {
      const token = tokens[idx]

      if (token.nesting === 1) {
        // 开始标签
        const params = parseDemoParams(token.info.slice(4).trim())
        const demoId = generateDemoId()

        return `
<div class="ldoc-demo-container" data-demo-id="${demoId}">
  <div class="ldoc-demo-title">${params.title || options.defaultTitle || '示例'}</div>
  <div class="ldoc-demo-content">
`
      } else {
        // 结束标签
        return `
  </div>
</div>
`
      }
    }
  })
}

export function demoPlugin(options: DemoPluginOptions = {}): LDocPlugin {
  return definePlugin({
    name: 'ldoc-plugin-demo',

    extendMarkdown(md: MarkdownRenderer) {
      extendMarkdownForDemo(md as unknown as MarkdownIt, options)

      // 尝试添加容器支持（如果 markdown-it-container 可用）
      try {
        addDemoContainer(md as unknown as MarkdownIt, options)
      } catch {
        // markdown-it-container 不可用，跳过
      }
    }
  })
}

export default demoPlugin
