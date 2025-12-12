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

  // Markdown 插件（传入 pluginContainer 以支持 extendPageData）
  plugins.push(createMarkdownPlugin(config, md, pluginContainer))

  // 虚拟模块插件
  plugins.push(createVirtualModulesPlugin(config, pluginContainer))

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
function createMarkdownPlugin(
  config: SiteConfig,
  md: MarkdownRenderer,
  pluginContainer: PluginContainer
): Plugin {
  return {
    name: 'ldoc:markdown',
    enforce: 'pre',

    async transform(code, id) {
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

      // 创建页面数据对象，供插件扩展
      const pageData = {
        title: frontmatter.title as string || '',
        description: frontmatter.description as string || '',
        frontmatter,
        headers: [],
        relativePath: filePath.replace(config.srcDir, '').replace(/^\//, ''),
        filePath,
        lastUpdated: Date.now()
      }

      // 调用 extendPageData 钩子，让插件扩展页面数据
      await pluginContainer.callHook('extendPageData', pageData)

      // 渲染 Markdown
      const html = md.render(markdown, { path: filePath })

      // 根据框架生成组件代码（使用扩展后的 frontmatter）
      let result: string
      if (config.framework === 'react' ||
        (config.framework === 'auto' && hasReactImport(code))) {
        result = generateReactComponent(html, pageData.frontmatter)
      } else {
        // 默认生成 Vue 组件
        result = generateVueComponent(html, pageData.frontmatter)
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
import { onMounted, onUnmounted } from 'vue'

const content = ${htmlJson}
const frontmatter = ${frontmatterJson}

// 组件挂载时更新全局 pageData，使插件可以访问扩展后的 frontmatter
onMounted(() => {
  if (window.__LDOC_PAGE_DATA__) {
    // 合并扩展的 frontmatter 到全局 pageData
    const pageData = window.__LDOC_PAGE_DATA__
    pageData.value = {
      ...pageData.value,
      frontmatter: { ...pageData.value.frontmatter, ...frontmatter }
    }
  }
})

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
function createVirtualModulesPlugin(config: SiteConfig, pluginContainer: PluginContainer): Plugin {
  // 收集有客户端配置文件的插件
  const clientPlugins = config.userPlugins
    .filter(p => p.clientConfigFile)
    .map((plugin, index) => ({
      name: plugin.name,
      path: normalizePath(plugin.clientConfigFile!),
      varName: `clientPlugin${index}`
    }))

  // 生成导入语句
  const imports = clientPlugins
    .map(p => `import * as ${p.varName} from '${p.path}';`)
    .join('\n')

  // 生成插件数组
  const pluginsPush = clientPlugins
    .map(p => `plugins.push({ name: '${p.name}', ...${p.varName} });`)
    .join('\n')

  // 调试日志
  console.log('[ldoc] Client plugins to load:', clientPlugins.map(p => ({ name: p.name, path: p.path })))

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
    'virtual:ldoc/plugins': `
// 插件客户端配置 - 自动生成
console.log('[ldoc] Loading virtual:ldoc/plugins module');
${imports}

const plugins = [];
${pluginsPush}
console.log('[ldoc] Client plugins loaded:', plugins.map(p => p.name));

export { plugins };
export default plugins;
`,
    '@theme': config.themePkg
      ? `
export { default } from '${config.themePkg}'
export * from '${config.themePkg}'
`
      : `
export { default } from '${normalizePath(config.themeDir)}/index'
export * from '${normalizePath(config.themeDir)}/index'
`,
    // 主题样式虚拟模块
    // 始终导入默认主题的基础样式，因为大多数自定义主题都继承默认主题
    // npm 包主题的自定义样式会在其入口文件中导入
    '@theme-styles': config.themePkg
      ? `import '@ldesign/doc/theme-default/styles/index.css'`
      : `import '${normalizePath(config.themeDir)}/styles/index.css'`
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
