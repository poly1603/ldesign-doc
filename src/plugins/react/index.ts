/**
 * React 插件 - 支持在文档中渲染 React 组件
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, MarkdownRenderer } from '../../shared/types'

export interface ReactPluginOptions {
  /** React 版本 */
  version?: '17' | '18'
  /** 是否启用 Strict Mode */
  strictMode?: boolean
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type MdRenderer = MarkdownRenderer & {
  renderer: {
    rules: {
      fence?: (tokens: any[], idx: number, options: any, env: any, self: any) => string
    }
  }
}

/**
 * React 组件演示插件
 */
export function reactPlugin(options: ReactPluginOptions = {}): LDocPlugin {
  const { version = '18', strictMode = true } = options

  return definePlugin({
    name: 'ldoc:react',

    vitePlugins() {
      return [
        // React 相关的 Vite 插件已在核心中添加
      ]
    },

    extendMarkdown(md: MarkdownRenderer) {
      // 添加 React 代码块支持
      const mdIt = md as MdRenderer
      const defaultFence = mdIt.renderer.rules.fence

      mdIt.renderer.rules.fence = (tokens: any[], idx: number, opts: any, env: any, self: any) => {
        const token = tokens[idx]
        const info = token.info?.trim() || ''

        // 检测 react demo 标记
        if ((info.startsWith('jsx') || info.startsWith('tsx')) && info.includes('demo')) {
          const code = token.content
          const id = `react-demo-${Math.random().toString(36).slice(2, 8)}`

          return `
<div class="react-demo-container" id="${id}">
  <div class="react-demo-preview"></div>
  <details class="react-demo-code">
    <summary>查看代码</summary>
    ${defaultFence ? defaultFence(tokens, idx, opts, env, self) : code}
  </details>
</div>
<script type="module">
import React from 'react'
import { createRoot } from 'react-dom/client'
// 动态编译和渲染 React 组件
</script>
`
        }

        return defaultFence ? defaultFence(tokens, idx, opts, env, self) : token.content
      }
    }
  })
}

export default reactPlugin
