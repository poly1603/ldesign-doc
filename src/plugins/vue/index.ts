/**
 * Vue 插件 - 支持在文档中渲染 Vue 组件
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, MarkdownRenderer } from '../../shared/types'

export interface VuePluginOptions {
  /** 是否启用 Vue DevTools */
  devtools?: boolean
  /** 自定义 Vue 配置 */
  vueOptions?: Record<string, unknown>
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
 * Vue 组件演示插件
 */
export function vuePlugin(options: VuePluginOptions = {}): LDocPlugin {
  return definePlugin({
    name: 'ldoc:vue',

    vitePlugins() {
      return [
        // Vue 相关的 Vite 插件已在核心中添加
      ]
    },

    extendMarkdown(md: MarkdownRenderer) {
      // 添加 Vue 代码块支持
      const mdIt = md as MdRenderer
      const defaultFence = mdIt.renderer.rules.fence

      mdIt.renderer.rules.fence = (tokens: any[], idx: number, opts: any, env: any, self: any) => {
        const token = tokens[idx]
        const info = token.info?.trim() || ''

        // 检测 vue demo 标记
        if (info.startsWith('vue') && info.includes('demo')) {
          const code = token.content
          const id = `vue-demo-${Math.random().toString(36).slice(2, 8)}`

          return `
<div class="vue-demo-container" id="${id}">
  <div class="vue-demo-preview"></div>
  <details class="vue-demo-code">
    <summary>查看代码</summary>
    ${defaultFence ? defaultFence(tokens, idx, opts, env, self) : code}
  </details>
</div>
<script type="module">
import { createApp, h } from 'vue'
// 动态编译和渲染 Vue 组件
</script>
`
        }

        return defaultFence ? defaultFence(tokens, idx, opts, env, self) : token.content
      }
    }
  })
}

export default vuePlugin
