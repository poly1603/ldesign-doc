/**
 * Vite 插件系统
 */

import { resolve, dirname } from 'path'
import type { Plugin, PluginOption, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import yaml from 'js-yaml'
import type { SiteConfig, MarkdownRenderer } from '../shared/types'
import type { PluginContainer } from '../plugin/pluginContainer'
import { normalizePath } from '../shared/utils'

export interface VitePluginOptions {
  md: MarkdownRenderer
  pluginContainer: PluginContainer
  command: 'serve' | 'build'
}

/**
 * 创建 Vite 插件列表
 */
export async function createVitePlugins(
  config: SiteConfig,
  options: VitePluginOptions
): Promise<Plugin[]> {
  const { md, pluginContainer, command } = options
  const plugins: PluginOption[] = []

  // 根据框架添加插件
  if (config.framework === 'vue' || config.framework === 'auto') {
    plugins.push(vue({
      include: [/\.vue$/, /\.md$/]
    }))
  }

  if (config.framework === 'react' || config.framework === 'auto') {
    plugins.push(react())
  }

  // Markdown 插件
  plugins.push(createMarkdownPlugin(config, md))

  // 虚拟模块插件
  plugins.push(createVirtualModulesPlugin(config))

  // 页面数据插件
  plugins.push(createPageDataPlugin(config, md))

  // 热更新插件
  if (command === 'serve') {
    plugins.push(createHMRPlugin(config, pluginContainer))
  }

  // 获取用户插件提供的 Vite 插件
  const userVitePlugins = await pluginContainer.getVitePlugins()
  plugins.push(...userVitePlugins)

  // 展开嵌套数组并过滤掉无效值
  return plugins.flat().filter((p): p is Plugin => !!p)
}

/**
 * Markdown 转换插件
 */
function createMarkdownPlugin(config: SiteConfig, md: MarkdownRenderer): Plugin {
  return {
    name: 'ldoc:markdown',
    enforce: 'pre',

    transform(code, id) {
      if (!id.endsWith('.md')) return null

      const filePath = normalizePath(id)

      // 解析 frontmatter
      const frontmatterMatch = code.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      let frontmatter: Record<string, unknown> = {}
      let markdown = code

      if (frontmatterMatch) {
        try {
          frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown> || {}
          markdown = code.slice(frontmatterMatch[0].length)
        } catch { }
      }

      // 渲染 Markdown
      const html = md.render(markdown, { path: filePath })

      // 根据框架生成组件代码
      let result: string
      if (config.framework === 'react' ||
        (config.framework === 'auto' && hasReactImport(code))) {
        result = generateReactComponent(html, frontmatter)
      } else {
        // 默认生成 Vue 组件
        result = generateVueComponent(html, frontmatter)
      }

      return {
        code: result,
        map: null
      }
    }
  }
}

/**
 * 生成 Vue 组件代码
 */
function generateVueComponent(html: string, frontmatter: Record<string, unknown>): string {
  // 使用 JSON.stringify 安全转义 HTML
  const htmlJson = JSON.stringify(html)
  const frontmatterJson = JSON.stringify(frontmatter)

  return `
<template>
  <div class="ldoc-content" v-html="content"></div>
</template>

<script setup>
const content = ${htmlJson}
const frontmatter = ${frontmatterJson}

defineExpose({ frontmatter })
</script>
`
}

/**
 * 生成 React 组件代码
 */
function generateReactComponent(html: string, frontmatter: Record<string, unknown>): string {
  return `
import React from 'react'

export const frontmatter = ${JSON.stringify(frontmatter)}

export default function MarkdownPage() {
  return (
    <div 
      className="ldoc-content" 
      dangerouslySetInnerHTML={{ __html: ${JSON.stringify(html)} }}
    />
  )
}
`
}

/**
 * 检查是否有 React 导入
 */
function hasReactImport(code: string): boolean {
  return /import\s+.*\s+from\s+['"]react['"]/.test(code)
}


/**
 * 虚拟模块插件
 */
function createVirtualModulesPlugin(config: SiteConfig): Plugin {
  const virtualModules: Record<string, string> = {
    'virtual:ldoc/site-data': `
export const siteData = ${JSON.stringify({
      base: config.base,
      title: config.title,
      description: config.description,
      lang: config.lang,
      themeConfig: config.themeConfig,
      locales: config.locales
    })}
`,
    'virtual:ldoc/theme-config': `
export const themeConfig = ${JSON.stringify(config.themeConfig)}
`,
    '@theme': `
export { default } from '${normalizePath(config.themeDir)}/index'
export * from '${normalizePath(config.themeDir)}/index'
`
  }

  return {
    name: 'ldoc:virtual-modules',

    resolveId(id) {
      if (id in virtualModules || id.startsWith('virtual:ldoc/')) {
        return '\0' + id
      }
      return null
    },

    load(id) {
      if (id.startsWith('\0')) {
        const realId = id.slice(1)
        return virtualModules[realId] || null
      }
      return null
    }
  }
}

/**
 * 页面数据插件
 */
function createPageDataPlugin(config: SiteConfig, md: MarkdownRenderer): Plugin {
  return {
    name: 'ldoc:page-data',

    resolveId(id) {
      if (id === 'virtual:ldoc/page-data') {
        return '\0virtual:ldoc/page-data'
      }
      return null
    },

    load(id) {
      if (id === '\0virtual:ldoc/page-data') {
        // 动态返回当前页面数据
        return `
export function usePageData() {
  // TODO: 实现页面数据 hook
  return {}
}
`
      }
      return null
    }
  }
}

/**
 * HMR 热更新插件
 */
function createHMRPlugin(config: SiteConfig, pluginContainer: PluginContainer): Plugin {
  return {
    name: 'ldoc:hmr',

    handleHotUpdate(ctx) {
      const { file, server } = ctx

      // 配置文件变化
      if (config.configPath && file === config.configPath) {
        console.log('[ldoc] config changed, restarting server...')
        server.restart()
        return []
      }

      // Markdown 文件变化
      if (file.endsWith('.md')) {
        // 通知插件
        pluginContainer.callHook('handleHotUpdate', {
          file: normalizePath(file),
          timestamp: Date.now(),
          modules: ctx.modules
        })
      }

      return undefined
    }
  }
}
