/**
 * 创建插件/主题项目模板
 */

import { resolve, join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import pc from 'picocolors'

export type ProjectType = 'plugin' | 'theme'

interface CreateOptions {
  name: string
  type: ProjectType
  description?: string
  author?: string
}

/**
 * 创建插件或主题项目
 */
export async function createProject(options: CreateOptions): Promise<void> {
  const { name, type, description, author } = options
  const targetDir = resolve(process.cwd(), name)

  // 检查目录是否已存在
  if (existsSync(targetDir)) {
    throw new Error(`Directory "${name}" already exists`)
  }

  // 创建目录
  mkdirSync(targetDir, { recursive: true })

  if (type === 'plugin') {
    await createPluginProject(targetDir, name, description, author)
  } else {
    await createThemeProject(targetDir, name, description, author)
  }

  console.log(pc.green(`\n  ✓ Created ${type} project: ${name}`))
  console.log(pc.gray('\n  Next steps:'))
  console.log(pc.white(`    cd ${name}`))
  console.log(pc.white('    pnpm install'))
  console.log(pc.white('    pnpm dev'))
  console.log()
}

/**
 * 创建插件项目
 */
async function createPluginProject(
  targetDir: string,
  name: string,
  description?: string,
  author?: string
): Promise<void> {
  // 规范化包名
  const packageName = name.startsWith('ldoc-plugin-')
    ? name
    : `ldoc-plugin-${name.replace(/^@[^/]+\//, '')}`

  const pluginName = name.replace(/^ldoc-plugin-/, '').replace(/^@[^/]+\/ldoc-plugin-/, '')

  // 创建目录结构
  const dirs = ['src', 'dist']
  for (const dir of dirs) {
    mkdirSync(join(targetDir, dir), { recursive: true })
  }

  // package.json
  const pkg = {
    name: packageName,
    version: '0.1.0',
    description: description || `LDoc plugin - ${pluginName}`,
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js'
      },
      './client': {
        types: './dist/client.d.ts',
        import: './dist/client.js'
      }
    },
    files: ['dist'],
    scripts: {
      dev: 'tsup --watch',
      build: 'tsup',
      prepublishOnly: 'pnpm build'
    },
    keywords: ['ldoc', 'ldoc-plugin', 'documentation'],
    author: author || '',
    license: 'MIT',
    peerDependencies: {
      '@ldesign/doc': '>=1.0.0'
    },
    devDependencies: {
      '@ldesign/doc': '^1.0.0',
      'tsup': '^8.0.0',
      'typescript': '^5.0.0'
    }
  }

  writeFileSync(
    join(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  )
  console.log(pc.gray('  Created: package.json'))

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      declaration: true,
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src']
  }

  writeFileSync(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  )
  console.log(pc.gray('  Created: tsconfig.json'))

  // tsup.config.ts
  const tsupConfig = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    client: 'src/client.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@ldesign/doc', 'vue', 'vite']
})
`

  writeFileSync(join(targetDir, 'tsup.config.ts'), tsupConfig)
  console.log(pc.gray('  Created: tsup.config.ts'))

  // src/index.ts - 主入口（Node.js 端）
  const indexTs = `/**
 * ${packageName}
 * ${description || `LDoc plugin - ${pluginName}`}
 */

import type { LDocPlugin, SiteConfig, MarkdownRenderer, PageData } from '@ldesign/doc'

export interface ${toPascalCase(pluginName)}Options {
  /**
   * 插件选项示例
   */
  enabled?: boolean
}

/**
 * 创建 ${pluginName} 插件
 */
export function ${toCamelCase(pluginName)}Plugin(options: ${toPascalCase(pluginName)}Options = {}): LDocPlugin {
  const { enabled = true } = options

  return {
    name: '${packageName}',

    /**
     * 修改配置
     */
    config(config, env) {
      if (!enabled) return
      
      // 在此修改配置
      console.log(\`[${packageName}] Config hook called in \${env.mode} mode\`)
      
      return config
    },

    /**
     * 配置解析完成后
     */
    configResolved(config: SiteConfig) {
      if (!enabled) return
      
      console.log(\`[${packageName}] Config resolved\`)
    },

    /**
     * 扩展 Markdown 渲染器
     */
    extendMarkdown(md: MarkdownRenderer) {
      if (!enabled) return
      
      // 在此添加 markdown-it 插件
      // md.use(yourMarkdownPlugin)
      
      console.log(\`[${packageName}] Markdown extended\`)
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
      
      console.log(\`[${packageName}] Build started\`)
    },

    /**
     * 构建结束
     */
    buildEnd(config: SiteConfig) {
      if (!enabled) return
      
      console.log(\`[${packageName}] Build completed\`)
    },

    /**
     * 客户端配置文件路径（可选）
     * 返回一个客户端代码文件的路径，会在浏览器端执行
     */
    clientConfigFile: new URL('./client.js', import.meta.url).pathname
  }
}

export default ${toCamelCase(pluginName)}Plugin
`

  writeFileSync(join(targetDir, 'src/index.ts'), indexTs)
  console.log(pc.gray('  Created: src/index.ts'))

  // src/client.ts - 客户端代码
  const clientTs = `/**
 * 客户端代码
 * 此文件在浏览器端执行
 */

import type { EnhanceAppContext } from '@ldesign/doc'

/**
 * 增强 Vue 应用
 */
export function enhanceApp({ app, router, siteData }: EnhanceAppContext) {
  // 注册全局组件
  // app.component('MyComponent', MyComponent)
  
  // 添加全局属性
  // app.config.globalProperties.$myPlugin = {}
  
  // 路由守卫
  // router.beforeEach((to, from, next) => {
  //   next()
  // })
  
  console.log('[${packageName}] Client enhanced')
}

export default {
  enhanceApp
}
`

  writeFileSync(join(targetDir, 'src/client.ts'), clientTs)
  console.log(pc.gray('  Created: src/client.ts'))

  // README.md
  const readme = `# ${packageName}

${description || `LDoc plugin - ${pluginName}`}

## Installation

\`\`\`bash
pnpm add ${packageName}
\`\`\`

## Usage

\`\`\`ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import ${toCamelCase(pluginName)}Plugin from '${packageName}'

export default defineConfig({
  plugins: [
    ${toCamelCase(pluginName)}Plugin({
      enabled: true
    })
  ]
})
\`\`\`

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \`enabled\` | \`boolean\` | \`true\` | Enable or disable the plugin |

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build
\`\`\`

## License

MIT
`

  writeFileSync(join(targetDir, 'README.md'), readme)
  console.log(pc.gray('  Created: README.md'))

  // .gitignore
  const gitignore = `node_modules
dist
*.log
.DS_Store
`

  writeFileSync(join(targetDir, '.gitignore'), gitignore)
  console.log(pc.gray('  Created: .gitignore'))
}

/**
 * 创建主题项目
 */
async function createThemeProject(
  targetDir: string,
  name: string,
  description?: string,
  author?: string
): Promise<void> {
  // 规范化包名
  const packageName = name.startsWith('ldoc-theme-')
    ? name
    : `ldoc-theme-${name.replace(/^@[^/]+\//, '')}`

  const themeName = name.replace(/^ldoc-theme-/, '').replace(/^@[^/]+\/ldoc-theme-/, '')

  // 创建目录结构
  const dirs = [
    'src',
    'src/components',
    'src/styles',
    'src/composables',
    'dev',
    'dev/docs',
    'dev/docs/guide',
    'dev/docs/public',
    'dist'
  ]
  for (const dir of dirs) {
    mkdirSync(join(targetDir, dir), { recursive: true })
  }

  // package.json
  const pkg = {
    name: packageName,
    version: '0.1.0',
    description: description || `LDoc theme - ${themeName}`,
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js'
      },
      './styles': './dist/styles/index.css',
      './package.json': './package.json'
    },
    files: ['dist'],
    scripts: {
      dev: 'concurrently "vite build --watch" "pnpm preview"',
      'dev:build': 'vite build --watch',
      preview: 'ldoc dev dev',
      build: 'vite build && vue-tsc --declaration --emitDeclarationOnly',
      prepublishOnly: 'pnpm build'
    },
    keywords: ['ldoc', 'ldoc-theme', 'documentation', 'theme'],
    author: author || '',
    license: 'MIT',
    peerDependencies: {
      '@ldesign/doc': '>=1.0.0',
      'vue': '>=3.3.0'
    },
    devDependencies: {
      '@ldesign/doc': '^1.0.0',
      '@vitejs/plugin-vue': '^5.0.0',
      'concurrently': '^8.0.0',
      'typescript': '^5.0.0',
      'vite': '^5.0.0',
      'vue': '^3.4.0',
      'vue-tsc': '^2.0.0'
    }
  }

  writeFileSync(
    join(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n'
  )
  console.log(pc.gray('  Created: package.json'))

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      jsx: 'preserve',
      esModuleInterop: true,
      skipLibCheck: true,
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      types: ['vite/client']
    },
    include: ['src/**/*.ts', 'src/**/*.vue'],
    exclude: ['node_modules']
  }

  writeFileSync(
    join(targetDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  )
  console.log(pc.gray('  Created: tsconfig.json'))

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', '@ldesign/doc', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    cssCodeSplit: false,
    outDir: 'dist'
  }
})
`

  writeFileSync(join(targetDir, 'vite.config.ts'), viteConfig)
  console.log(pc.gray('  Created: vite.config.ts'))

  // src/index.ts - 主题入口
  const indexTs = `/**
 * ${packageName}
 * ${description || `LDoc theme - ${themeName}`}
 */

import type { Theme, EnhanceAppContext } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导入样式
import './styles/index.css'

/**
 * 主题配置选项
 */
export interface ${toPascalCase(themeName)}ThemeOptions {
  /**
   * 主色调
   */
  primaryColor?: string
}

/**
 * 创建主题
 */
export function create${toPascalCase(themeName)}Theme(options: ${toPascalCase(themeName)}ThemeOptions = {}): Theme {
  return {
    Layout,
    NotFound,
    
    enhanceApp({ app, router, siteData }: EnhanceAppContext) {
      // 注册全局组件
      // app.component('CustomComponent', CustomComponent)
      
      // 设置主色调
      if (options.primaryColor && typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--theme-primary', options.primaryColor)
      }
    }
  }
}

// 导出默认主题
export const theme: Theme = {
  Layout,
  NotFound
}

// 导出组件供自定义使用
export { Layout, NotFound }

export default theme
`

  writeFileSync(join(targetDir, 'src/index.ts'), indexTs)
  console.log(pc.gray('  Created: src/index.ts'))

  // src/Layout.vue - 主布局组件
  const layoutVue = `<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 可以从 @ldesign/doc/client 导入内置 composables
// import { usePageData, useSiteData, useRoute } from '@ldesign/doc/client'

const isDark = ref(false)

onMounted(() => {
  // 检测系统主题
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
})

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <div class="theme-${themeName}" :class="{ dark: isDark }">
    <!-- 头部 -->
    <header class="theme-header">
      <div class="header-content">
        <a href="/" class="logo">
          <span class="logo-text">LDoc Theme</span>
        </a>
        
        <nav class="nav">
          <a href="/">首页</a>
          <a href="/guide/">指南</a>
        </nav>
        
        <div class="header-actions">
          <button @click="toggleDark" class="theme-toggle">
            {{ isDark ? '🌙' : '☀️' }}
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主内容区 -->
    <main class="theme-main">
      <div class="content-wrapper">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <slot name="sidebar" />
        </aside>
        
        <!-- 内容 -->
        <article class="content">
          <!-- Vue Router 视图 -->
          <router-view />
        </article>
        
        <!-- 大纲 -->
        <aside class="outline">
          <slot name="outline" />
        </aside>
      </div>
    </main>
    
    <!-- 页脚 -->
    <footer class="theme-footer">
      <p>Built with LDoc</p>
    </footer>
  </div>
</template>

<style scoped>
.theme-${themeName} {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.theme-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--theme-bg, #fff);
  border-bottom: 1px solid var(--theme-border, #e5e7eb);
  padding: 0 24px;
  height: 64px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--theme-text, #1f2937);
  font-weight: 600;
  font-size: 18px;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  color: var(--theme-text-secondary, #6b7280);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav a:hover {
  color: var(--theme-primary, #3b82f6);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
}

.theme-main {
  flex: 1;
  padding: 24px;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr 220px;
  gap: 32px;
}

.sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.content {
  min-width: 0;
}

.outline {
  position: sticky;
  top: 88px;
  height: fit-content;
}

.theme-footer {
  border-top: 1px solid var(--theme-border, #e5e7eb);
  padding: 24px;
  text-align: center;
  color: var(--theme-text-secondary, #6b7280);
  font-size: 14px;
}

/* 暗色模式 */
.dark {
  --theme-bg: #1f2937;
  --theme-text: #f9fafb;
  --theme-text-secondary: #9ca3af;
  --theme-border: #374151;
}

/* 响应式 */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .sidebar,
  .outline {
    display: none;
  }
}
</style>
`

  writeFileSync(join(targetDir, 'src/Layout.vue'), layoutVue)
  console.log(pc.gray('  Created: src/Layout.vue'))

  // src/NotFound.vue - 404 页面
  const notFoundVue = `<script setup lang="ts">
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found h1 {
  font-size: 72px;
  font-weight: 700;
  color: var(--theme-primary, #3b82f6);
  margin: 0;
}

.not-found p {
  font-size: 18px;
  color: var(--theme-text-secondary, #6b7280);
  margin: 16px 0 24px;
}

.not-found a {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--theme-primary, #3b82f6);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.not-found a:hover {
  background: var(--theme-primary-dark, #2563eb);
}
</style>
`

  writeFileSync(join(targetDir, 'src/NotFound.vue'), notFoundVue)
  console.log(pc.gray('  Created: src/NotFound.vue'))

  // src/styles/index.css - 主题样式
  const stylesCSS = `/**
 * ${packageName} - 主题样式
 */

/* CSS 变量 */
:root {
  --theme-primary: #3b82f6;
  --theme-primary-dark: #2563eb;
  --theme-bg: #ffffff;
  --theme-text: #1f2937;
  --theme-text-secondary: #6b7280;
  --theme-border: #e5e7eb;
  --theme-code-bg: #f3f4f6;
}

.dark {
  --theme-primary: #60a5fa;
  --theme-primary-dark: #3b82f6;
  --theme-bg: #1f2937;
  --theme-text: #f9fafb;
  --theme-text-secondary: #9ca3af;
  --theme-border: #374151;
  --theme-code-bg: #111827;
}

/* 基础样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--theme-bg);
  color: var(--theme-text);
  line-height: 1.6;
}

/* Markdown 内容样式 */
.content h1,
.content h2,
.content h3,
.content h4,
.content h5,
.content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.content h1 { font-size: 2em; }
.content h2 { font-size: 1.5em; }
.content h3 { font-size: 1.25em; }

.content p {
  margin: 16px 0;
}

.content a {
  color: var(--theme-primary);
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

.content code {
  background: var(--theme-code-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.content pre {
  background: var(--theme-code-bg);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.content pre code {
  background: transparent;
  padding: 0;
}

.content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--theme-primary);
  background: var(--theme-code-bg);
  border-radius: 0 8px 8px 0;
}

.content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.content th,
.content td {
  padding: 12px;
  border: 1px solid var(--theme-border);
  text-align: left;
}

.content th {
  background: var(--theme-code-bg);
  font-weight: 600;
}
`

  writeFileSync(join(targetDir, 'src/styles/index.css'), stylesCSS)
  console.log(pc.gray('  Created: src/styles/index.css'))

  // README.md
  const readme = `# ${packageName}

${description || `LDoc theme - ${themeName}`}

## Installation

\`\`\`bash
pnpm add ${packageName}
\`\`\`

## Usage

### 基础用法

\`\`\`ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  theme: '${packageName}'
})
\`\`\`

### 带选项

\`\`\`ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import { create${toPascalCase(themeName)}Theme } from '${packageName}'

export default defineConfig({
  theme: create${toPascalCase(themeName)}Theme({
    primaryColor: '#10b981'
  })
})
\`\`\`

## Customization

### CSS 变量

\`\`\`css
:root {
  --theme-primary: #3b82f6;
  --theme-bg: #ffffff;
  --theme-text: #1f2937;
}
\`\`\`

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build
\`\`\`

## Theme Structure

\`\`\`
${packageName}/
├── src/
│   ├── index.ts          # 主题入口
│   ├── Layout.vue        # 主布局组件
│   ├── NotFound.vue      # 404 页面
│   ├── components/       # 组件目录
│   ├── composables/      # 组合式函数
│   └── styles/
│       └── index.css     # 主题样式
├── package.json
└── README.md
\`\`\`

## License

MIT
`

  writeFileSync(join(targetDir, 'README.md'), readme)
  console.log(pc.gray('  Created: README.md'))

  // .gitignore
  const gitignore = `node_modules
dist
*.log
.DS_Store
`

  writeFileSync(join(targetDir, '.gitignore'), gitignore)
  console.log(pc.gray('  Created: .gitignore'))

  // env.d.ts
  const envDts = `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
`

  writeFileSync(join(targetDir, 'env.d.ts'), envDts)
  console.log(pc.gray('  Created: env.d.ts'))

  // ===== 开发预览文档 =====

  // dev/doc.config.ts - 开发预览配置
  const devConfig = `import { defineConfig } from '@ldesign/doc'
import theme from '../dist/index.js'

export default defineConfig({
  title: '${toPascalCase(themeName)} Theme Preview',
  description: '主题开发预览',
  lang: 'zh-CN',
  srcDir: 'docs',
  
  // 使用本地开发的主题
  theme,
  
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '${toPascalCase(themeName)} Theme',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/guide/components' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '组件', link: '/guide/components' }
          ]
        }
      ]
    },
    
    footer: {
      message: '主题开发预览',
      copyright: 'Copyright © 2024'
    }
  }
})
`

  writeFileSync(join(targetDir, 'dev/doc.config.ts'), devConfig)
  console.log(pc.gray('  Created: dev/doc.config.ts'))

  // dev/docs/index.md - 首页
  const devIndex = `---
layout: home
hero:
  name: ${toPascalCase(themeName)} Theme
  text: LDoc 自定义主题
  tagline: 现代化文档主题开发预览
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/
    - theme: alt
      text: 组件预览
      link: /guide/components
features:
  - icon: 🎨
    title: 自定义设计
    details: 完全自定义的主题设计
  - icon: 🌙
    title: 暗色模式
    details: 支持亮色/暗色主题切换
  - icon: 📱
    title: 响应式布局
    details: 适配各种屏幕尺寸
---
`

  writeFileSync(join(targetDir, 'dev/docs/index.md'), devIndex)
  console.log(pc.gray('  Created: dev/docs/index.md'))

  // dev/docs/guide/index.md - 指南首页
  const devGuide = `# 介绍

欢迎使用 ${toPascalCase(themeName)} 主题！

## 安装

\`\`\`bash
pnpm add ${packageName}
\`\`\`

## 配置

\`\`\`ts
import { defineConfig } from '@ldesign/doc'
import theme from '${packageName}'

export default defineConfig({
  theme
})
\`\`\`

## 主题特性

### 响应式设计

主题默认支持响应式布局，适配各种屏幕尺寸。

### 暗色模式

点击右上角的主题切换按钮体验暗色模式。

### 代码高亮

支持语法高亮的代码块：

\`\`\`ts
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 引用块

> 这是一个引用块示例

### 表格

| 功能 | 支持 |
|------|------|
| 暗色模式 | ✅ |
| 响应式 | ✅ |
| 代码高亮 | ✅ |
`

  writeFileSync(join(targetDir, 'dev/docs/guide/index.md'), devGuide)
  console.log(pc.gray('  Created: dev/docs/guide/index.md'))

  // dev/docs/guide/components.md - 组件预览
  const devComponents = `# 组件预览

本页展示主题的各种组件效果。

## 标题

# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本样式

这是普通文本。**这是加粗文本**。*这是斜体文本*。~~这是删除线文本~~。

## 链接

这是一个 [内部链接](/guide/)。

这是一个 [外部链接](https://github.com)。

## 列表

### 无序列表

- 项目一
- 项目二
  - 子项目
  - 子项目
- 项目三

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 代码

行内代码：\`const foo = 'bar'\`

代码块：

\`\`\`ts
interface Theme {
  Layout: Component
  NotFound?: Component
  enhanceApp?: (ctx: EnhanceAppContext) => void
}

export function defineTheme(theme: Theme): Theme {
  return theme
}
\`\`\`

## 提示块

::: tip 提示
这是一个提示信息。
:::

::: warning 警告
这是一个警告信息。
:::

::: danger 危险
这是一个危险提示。
:::

::: info 信息
这是一个普通信息。
:::

## 表格

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| \`Layout\` | \`Component\` | - | 布局组件 |
| \`NotFound\` | \`Component\` | - | 404 页面 |
| \`enhanceApp\` | \`Function\` | - | 增强函数 |

## 图片

![占位图片](https://via.placeholder.com/600x300/3b82f6/ffffff?text=Theme+Preview)

## 分割线

---

## 引用

> 好的设计是让产品变得有用。
> 
> — Dieter Rams
`

  writeFileSync(join(targetDir, 'dev/docs/guide/components.md'), devComponents)
  console.log(pc.gray('  Created: dev/docs/guide/components.md'))

  // dev/docs/public/logo.svg - Logo
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#3b82f6"/>
  <text x="64" y="80" text-anchor="middle" fill="white" font-size="48" font-weight="bold" font-family="system-ui">T</text>
</svg>`

  writeFileSync(join(targetDir, 'dev/docs/public/logo.svg'), logoSvg)
  console.log(pc.gray('  Created: dev/docs/public/logo.svg'))
}

// 工具函数
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}
