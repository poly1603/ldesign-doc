/**
 * Vite 插件系统
 */

import { resolve, dirname, relative } from 'path'
import { readFileSync, existsSync } from 'fs'
import type { Plugin, PluginOption, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import yaml from 'js-yaml'
import type { SiteConfig, MarkdownRenderer } from '../shared/types'
import type { PluginContainer } from '../plugin/pluginContainer'
import { normalizePath } from '../shared/utils'

// Demo 组件信息
interface DemoInfo {
  id: string
  src: string           // 源文件路径
  absolutePath: string  // 绝对路径
  code: string          // 源代码
  title?: string
  type?: 'vue' | 'html' | 'react'  // demo 类型
}

export interface VitePluginOptions {
  md: MarkdownRenderer
  pluginContainer: PluginContainer
  command: 'serve' | 'build'
}

// 存储 demo 代码块，用于生成虚拟模块
const demoCodeMap = new Map<string, { code: string; language: string }>()

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

  // Demo 虚拟模块插件
  plugins.push(createDemoPlugin(config))

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
      const fileDir = dirname(filePath)

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

      // 解析 demo，支持多种语法：
      // 1. <demo src="./xxx.vue" /> 标签
      // 2. ```vue-demo 代码块（可以是 src="./xxx.vue" 或直接写代码）
      // 3. ```html-demo 纯 HTML 演示
      // 4. ```react-demo React 组件演示（未来支持）
      const demos: DemoInfo[] = []
      let demoIndex = 0

      // 支持的 demo 类型：vue-demo, html-demo, react-demo
      const demoTypes = ['vue', 'html', 'react']

      // 解析 ```xxx-demo 代码块
      for (const demoType of demoTypes) {
        const regex = new RegExp(
          '```' + demoType + '-demo(?:\\s+src=["\']([^"\']+)["\'])?(?:\\s+title=["\']([^"\']+)["\'])?\\s*\\n([\\s\\S]*?)```',
          'gi'
        )
        markdown = markdown.replace(regex, (match, src, title, inlineCode) => {
          const demoId = `Demo${demoIndex++}`
          let demoCode = ''
          let absolutePath = ''
          const ext = demoType === 'vue' ? '.vue' : demoType === 'react' ? '.tsx' : '.html'

          if (src) {
            // 引用外部文件
            absolutePath = resolve(fileDir, src)
            if (existsSync(absolutePath)) {
              demoCode = readFileSync(absolutePath, 'utf-8')
            }
          } else if (inlineCode && inlineCode.trim()) {
            // 内联代码 - 生成临时虚拟模块
            demoCode = inlineCode.trim()
            // 为内联代码创建虚拟路径
            absolutePath = `virtual:demo/${filePath}/${demoId}${ext}`
            // 存储内联代码供虚拟模块使用
            demoCodeMap.set(absolutePath, { code: demoCode, language: demoType })
          }

          if (demoCode) {
            demos.push({
              id: demoId,
              src: src || `inline-${demoId}`,
              absolutePath: normalizePath(absolutePath),
              code: demoCode,
              title,
              type: demoType as 'vue' | 'html' | 'react'
            })
            return `<!--DEMO_${demoId}-->`
          }
          return match
        })
      }

      // 解析 <demo src="./xxx.vue" /> 标签
      markdown = markdown.replace(
        /<demo\s+src=["']([^"']+)["'](?:\s+title=["']([^"']+)["'])?\s*\/?>/gi,
        (match, src, title) => {
          const demoId = `Demo${demoIndex++}`
          const absolutePath = resolve(fileDir, src)

          let demoCode = ''
          if (existsSync(absolutePath)) {
            demoCode = readFileSync(absolutePath, 'utf-8')
          }

          demos.push({
            id: demoId,
            src,
            absolutePath: normalizePath(absolutePath),
            code: demoCode,
            title
          })

          // 返回占位符，稍后替换
          return `<!--DEMO_${demoId}-->`
        }
      )

      // 创建页面数据对象，供插件扩展
      const relativePath = filePath.replace(config.srcDir, '').replace(/^[\\/]/, '')
      const pageData = {
        title: frontmatter.title as string || '',
        description: frontmatter.description as string || '',
        frontmatter,
        headers: [],
        relativePath,
        filePath,
        lastUpdated: Date.now()
      }

      // 创建页面上下文
      const pageContext = {
        siteConfig: config,
        content: markdown,
        filePath,
        relativePath
      }

      // 调用 extendPageData 钩子，让插件扩展页面数据
      await pluginContainer.callHook('extendPageData', pageData, pageContext)

      // 渲染 Markdown
      const html = md.render(markdown, { path: filePath })

      // 根据框架生成组件代码（使用扩展后的 frontmatter）
      let result: string
      if (config.framework === 'react' ||
        (config.framework === 'auto' && hasReactImport(code))) {
        result = generateReactComponent(html, pageData.frontmatter)
      } else {
        // 默认生成 Vue 组件，传入 demos 信息
        result = generateVueComponent(html, pageData.frontmatter, demos)

        // 调试：输出生成的代码
        if (demos.length > 0) {
          console.log('[ldoc:demo] File:', filePath)
          console.log('[ldoc:demo] Demos found:', demos.length)
          demos.forEach(d => console.log(`  - ${d.id}: ${d.absolutePath}`))
          console.log('[ldoc:demo] Generated code preview:', result.slice(0, 500))
        }
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
 * 如果有 demo 组件，使用模板模式；否则使用 v-html 模式
 */
function generateVueComponent(
  html: string,
  frontmatter: Record<string, unknown>,
  demos: DemoInfo[] = []
): string {
  const frontmatterJson = JSON.stringify(frontmatter)
  const componentId = `md_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // 如果没有 demo，使用简单的 v-html 模式
  if (demos.length === 0) {
    const htmlJson = JSON.stringify(html)
    return `
<template>
  <div class="ldoc-content" v-html="contentHtml"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const componentId = '${componentId}'
const contentHtml = ref(${htmlJson})
const frontmatter = ${frontmatterJson}

const updatePageData = () => {
  if (typeof window !== 'undefined' && window.__LDOC_PAGE_DATA__) {
    window.__LDOC_PAGE_DATA__.value = {
      ...window.__LDOC_PAGE_DATA__.value,
      frontmatter: { ...frontmatter },
      _hmrId: componentId
    }
  }
}

updatePageData()
onMounted(() => { updatePageData() })

if (import.meta.hot) {
  import.meta.hot.accept(() => { updatePageData() })
}

defineExpose({ frontmatter })
</script>
`
  }

  // 有 demo 组件时，使用运行时挂载方案
  // 在 HTML 中插入占位符，onMounted 时动态挂载组件
  // Vue demos 需要导入组件
  const vueDemos = demos.filter(d => d.type !== 'html')
  const demoImports = vueDemos.map(d => {
    // 虚拟模块使用 virtual: 前缀，实际文件使用 /@fs/ 前缀
    const importPath = d.absolutePath.startsWith('virtual:')
      ? d.absolutePath
      : `/@fs/${d.absolutePath}`
    return `import ${d.id} from '${importPath}'`
  }).join('\n')

  // 对代码也使用 URI 编码 + Base64 处理 UTF-8
  const demoCodeMapStr = demos.map(d =>
    `  '${d.id}': '${Buffer.from(encodeURIComponent(d.code)).toString('base64')}'`
  ).join(',\n')

  // 记录每个 demo 的类型
  const demoTypesMap = demos.map(d =>
    `  '${d.id}': '${d.type || 'vue'}'`
  ).join(',\n')

  const demoComponentsMap = vueDemos.map(d =>
    `  '${d.id}': ${d.id}`
  ).join(',\n')

  // 替换 HTML 中的占位符为 div 容器
  let processedHtml = html
  for (const demo of demos) {
    const placeholder = `<!--DEMO_${demo.id}-->`
    processedHtml = processedHtml.replace(
      placeholder,
      `<div class="ldoc-demo" id="ldoc-demo-${demo.id}"><div class="ldoc-demo-preview" id="ldoc-demo-preview-${demo.id}"></div><div class="ldoc-demo-actions"><button class="ldoc-demo-btn ldoc-demo-copy" data-demo-id="${demo.id}" title="复制代码"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg></button><button class="ldoc-demo-btn ldoc-demo-toggle" data-demo-id="${demo.id}" title="展开代码"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg></button></div><div class="ldoc-demo-code" id="ldoc-demo-code-${demo.id}" style="display:none"><pre><code></code></pre></div></div>`
    )
  }

  // 使用 URI 编码 + Base64 处理 UTF-8 字符
  const htmlEncoded = Buffer.from(encodeURIComponent(processedHtml)).toString('base64')

  return `
<template>
  <div class="ldoc-content" ref="contentRef" v-html="contentHtml"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, createApp, h } from 'vue'
${demoImports}

// UTF-8 安全的 Base64 解码
const decodeBase64 = (str) => decodeURIComponent(atob(str))

// 代码转义（简单版，不做复杂语法高亮避免正则问题）
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const componentId = '${componentId}'
const frontmatter = ${frontmatterJson}
const contentHtml = ref(typeof atob !== 'undefined' ? decodeBase64('${htmlEncoded}') : '')
const contentRef = ref(null)

const demoCode = {
${demoCodeMapStr}
}

const demoTypes = {
${demoTypesMap}
}

const demoComponents = {
${demoComponentsMap}
}

const mountedApps = []

onMounted(() => {
  // 挂载所有 demo
  for (const [id, code] of Object.entries(demoCode)) {
    const container = document.getElementById('ldoc-demo-preview-' + id)
    const demoType = demoTypes[id] || 'vue'
    
    if (container) {
      if (demoType === 'html') {
        // HTML demo: 直接渲染 HTML
        container.innerHTML = decodeBase64(code)
      } else if (demoComponents[id]) {
        // Vue demo: 挂载 Vue 组件
        const app = createApp({ render: () => h(demoComponents[id]) })
        app.mount(container)
        mountedApps.push(app)
      }
    }
    
    // 填充代码（从 Base64 解码并高亮）
    const codeEl = document.querySelector('#ldoc-demo-code-' + id + ' code')
    if (codeEl && code) {
      codeEl.innerHTML = escapeHtml(decodeBase64(code))
    }
  }
  
  // 绑定按钮事件
  document.querySelectorAll('.ldoc-demo-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const demoId = btn.dataset.demoId
      const codeEl = document.getElementById('ldoc-demo-code-' + demoId)
      if (codeEl) {
        codeEl.style.display = codeEl.style.display === 'none' ? 'block' : 'none'
      }
    })
  })
  
  document.querySelectorAll('.ldoc-demo-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const demoId = btn.dataset.demoId
      const code = demoCode[demoId] ? decodeBase64(demoCode[demoId]) : ''
      if (code) {
        try {
          await navigator.clipboard.writeText(code)
          btn.title = '已复制!'
          setTimeout(() => { btn.title = '复制代码' }, 2000)
        } catch (e) {
          console.error('复制失败:', e)
        }
      }
    })
  })
  
  updatePageData()
})

onUnmounted(() => {
  // 卸载所有 demo 应用
  mountedApps.forEach(app => app.unmount())
})

const updatePageData = () => {
  if (typeof window !== 'undefined' && window.__LDOC_PAGE_DATA__) {
    window.__LDOC_PAGE_DATA__.value = {
      ...window.__LDOC_PAGE_DATA__.value,
      frontmatter: { ...frontmatter },
      _hmrId: componentId
    }
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => { updatePageData() })
}

defineExpose({ frontmatter })
</script>

<style>
.ldoc-demo {
  border: 1px solid var(--vp-c-divider, #e5e7eb);
  border-radius: 12px;
  margin: 20px 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.ldoc-demo-preview {
  padding: 32px 24px;
  background: var(--vp-c-bg, #fff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}
.ldoc-demo-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid var(--vp-c-divider, #e5e7eb);
  background: var(--vp-c-bg-soft, #f9fafb);
}
.ldoc-demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2, #6b7280);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.ldoc-demo-btn:hover {
  background: var(--vp-c-bg-mute, #f3f4f6);
  color: var(--ldoc-c-brand, var(--vp-c-brand, #3b82f6));
}
.ldoc-demo-code {
  background: #1a1a1a;
  max-height: 400px;
  overflow: auto;
  position: relative;
}
.ldoc-demo-code::before {
  content: 'Vue';
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ldoc-demo-code pre {
  margin: 0;
  padding: 20px;
  padding-top: 32px;
}
.ldoc-demo-code code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.75;
  color: #e1e1e1;
  white-space: pre;
  display: block;
  tab-size: 2;
}
/* 滚动条样式 */
.ldoc-demo-code::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.ldoc-demo-code::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
.ldoc-demo-code::-webkit-scrollbar-track {
  background: transparent;
}
</style>
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
 * Demo 虚拟模块插件 - 支持在 Markdown 中渲染 Vue 组件
 */
function createDemoPlugin(config: SiteConfig): Plugin {
  // 使用特殊的文件系统路径作为虚拟模块 ID
  const DEMO_PREFIX = '/@ldoc-demo/'

  return {
    name: 'ldoc:demo',
    enforce: 'pre',

    resolveId(id) {
      // 处理 demo 虚拟模块
      if (id.startsWith('virtual:demo/') && id.endsWith('.vue')) {
        // 转换为可被 Vue 插件处理的路径格式
        const demoPath = id.slice('virtual:demo/'.length)
        return DEMO_PREFIX + demoPath
      }
      return null
    },

    load(id) {
      if (id.startsWith(DEMO_PREFIX) && id.endsWith('.vue')) {
        const demoPath = 'virtual:demo/' + id.slice(DEMO_PREFIX.length)
        const demo = demoCodeMap.get(demoPath)

        if (demo) {
          // 返回 Vue SFC 代码
          return demo.code
        }

        return `
<template>
  <div class="demo-error">Demo not found: ${demoPath}</div>
</template>
`
      }
      return null
    }
  }
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
import builtinPlugins from '@ldesign/doc/plugins/builtin-client';
${imports}

const plugins = [];

// 添加内置插件
plugins.push({
  name: 'ldoc-builtin-plugins',
  ...builtinPlugins
});

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
        console.log('[ldoc] markdown changed:', file)

        // 读取文件并解析 frontmatter
        const content = readFileSync(file, 'utf-8')

        // 解析 frontmatter
        const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
        let frontmatter: Record<string, unknown> = {}
        if (frontmatterMatch) {
          try {
            frontmatter = yaml.load(frontmatterMatch[1]) as Record<string, unknown> || {}
          } catch { }
        }

        // 发送自定义消息给客户端
        server.ws.send({
          type: 'custom',
          event: 'ldoc:frontmatter-update',
          data: { file, frontmatter }
        })

        return undefined
      }

      return undefined
    }
  }
}
