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

详细开发指南请查看 [DEVELOPMENT.md](./DEVELOPMENT.md)。

## License

MIT
`

  writeFileSync(join(targetDir, 'README.md'), readme)
  console.log(pc.gray('  Created: README.md'))

  // DEVELOPMENT.md - 插件开发指南
  const pluginDevGuide = `# ${packageName} 开发指南

本文档介绍如何开发、调试、打包和发布此插件。

## 项目结构

\`\`\`
src/
├── index.ts      # 插件入口（Node 端）
└── client.ts     # 客户端代码（可选）
\`\`\`

## 开发流程

### 1. 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 2. 开发模式

\`\`\`bash
pnpm dev
\`\`\`

### 3. 在其他项目测试

\`\`\`bash
# 在插件目录
pnpm link --global

# 在测试项目
pnpm link --global ${packageName}
\`\`\`

## 插件开发要点

### 插件入口 (index.ts)

\`\`\`ts
import type { LDocPlugin, PageData } from '@ldesign/doc'

export interface PluginOptions {
  enabled?: boolean
}

export function ${toCamelCase(pluginName)}(options: PluginOptions = {}): LDocPlugin {
  return {
    name: '${packageName}',
    
    // 客户端配置文件（如果有）
    clientConfigFile: '${packageName}/client',
    
    // 扩展页面数据
    async extendPageData(pageData: PageData) {
      // 修改 pageData.frontmatter
    },
    
    // 构建开始
    buildStart() {
      console.log('[plugin] 插件已启用')
    }
  }
}

export default ${toCamelCase(pluginName)}
\`\`\`

### 客户端代码 (client.ts)

\`\`\`ts
import { defineComponent, h } from 'vue'
import type { PluginSlots } from '@ldesign/doc'

// 自定义组件
export const MyComponent = defineComponent({
  setup() {
    return () => h('div', 'Hello from plugin')
  }
})

// 导出 slots（注入到主题的指定位置）
export const slots: PluginSlots = {
  'doc-top': MyComponent
}

// 导出全局组件
export const globalComponents = {
  MyComponent
}
\`\`\`

### 可用的生命周期钩子

\`\`\`ts
{
  // Node 端
  config(config, env)           // 修改配置
  configResolved(config)        // 配置解析完成
  extendMarkdown(md)            // 扩展 Markdown
  extendPageData(pageData)      // 扩展页面数据
  buildStart(config)            // 构建开始
  buildEnd(config)              // 构建结束
  
  // 客户端
  slots                         // 注入 UI 到主题
  globalComponents              // 注册全局组件
  enhanceApp(ctx)               // 增强 Vue 应用
}
\`\`\`

## 调试技巧

1. 使用 \`console.log\` 在 Node 端调试
2. 使用 Vue DevTools 调试客户端组件
3. 检查浏览器控制台查看错误

## 打包构建

\`\`\`bash
pnpm build
\`\`\`

## 发布到 npm

\`\`\`bash
npm login
pnpm publish
\`\`\`

### 版本管理

\`\`\`bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
\`\`\`

## 注意事项

1. **exports 配置** - package.json 需要正确配置 exports
2. **客户端代码** - 如有客户端代码需要单独导出
3. **类型导出** - 导出 TypeScript 类型供用户使用

## 许可证

MIT
`

  writeFileSync(join(targetDir, 'DEVELOPMENT.md'), pluginDevGuide)
  console.log(pc.gray('  Created: DEVELOPMENT.md'))

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
      external: ['vue', '@ldesign/doc', '@ldesign/doc/theme-default', '@ldesign/doc/client', 'vue-router'],
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

  // src/index.ts - 主题入口（继承默认主题）
  const indexTs = `/**
 * ${packageName}
 * ${description || `LDoc theme - ${themeName}`}
 * 
 * 基于 LDoc 默认主题，添加自定义样式和功能
 */

import type { Theme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'

// 导入自定义样式（覆盖默认主题样式）
import './styles/index.css'

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

  // src/Layout.vue - 继承默认主题，添加自定义 Banner
  const layoutVue = `<script setup lang="ts">
/**
 * 自定义主题 Layout
 * 继承默认主题，只添加一个顶部标识 banner
 * 
 * 你可以在这里：
 * 1. 修改 banner 的样式和内容
 * 2. 添加更多自定义组件
 * 3. 覆盖默认主题的部分功能
 */

// 导入默认主题的 Layout 组件
import { Layout as DefaultLayout } from '@ldesign/doc/theme-default'
</script>

<template>
  <div class="custom-theme-wrapper">
    <!-- 🎨 自定义顶部标识 Banner - 你可以修改这里 -->
    <div class="custom-theme-banner">
      <span class="banner-icon">🎨</span>
      <span class="banner-text">自定义主题 - ${packageName}</span>
    </div>
    
    <!-- 使用默认主题的 Layout（包含导航栏、侧边栏、内容区、页脚等） -->
    <DefaultLayout />
  </div>
</template>

<style scoped>
/* 自定义主题包装器 */
.custom-theme-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 🎨 自定义顶部标识 Banner - 你可以修改这里的样式 */
.custom-theme-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
}

.banner-icon {
  font-size: 16px;
}

.banner-text {
  letter-spacing: 0.5px;
}

/* 响应式：移动端隐藏 banner 文字 */
@media (max-width: 640px) {
  .banner-text {
    display: none;
  }
}
</style>
`

  writeFileSync(join(targetDir, 'src/Layout.vue'), layoutVue)
  console.log(pc.gray('  Created: src/Layout.vue'))

  // src/NotFound.vue - 直接使用默认主题的 404 页面
  const notFoundVue = `<script setup lang="ts">
/**
 * 自定义主题 NotFound
 * 直接使用默认主题的 NotFound 组件
 * 
 * 如果你需要自定义 404 页面，可以：
 * 1. 取消注释下面的自定义模板
 * 2. 或者完全重写这个组件
 */
import { NotFound as DefaultNotFound } from '@ldesign/doc/theme-default'
</script>

<template>
  <!-- 使用默认主题的 404 页面 -->
  <DefaultNotFound />
  
  <!-- 
  如果你想自定义 404 页面，可以取消下面的注释并删除上面的 DefaultNotFound：
  
  <div class="not-found">
    <h1>404</h1>
    <p>页面未找到</p>
    <a href="/">返回首页</a>
  </div>
  -->
</template>
`

  writeFileSync(join(targetDir, 'src/NotFound.vue'), notFoundVue)
  console.log(pc.gray('  Created: src/NotFound.vue'))

  // src/styles/index.css - 自定义主题样式（覆盖默认主题）
  const stylesCSS = `/**
 * ${packageName} - 自定义主题样式
 * 
 * 这个文件用于覆盖默认主题的样式
 * 默认主题已经包含了完整的样式，你只需要修改你想要改变的部分
 */

/* 
 * 🎨 自定义 CSS 变量 - 修改这里来改变主题颜色
 * 取消注释并修改你想要的颜色
 */
/*
:root {
  --vp-c-brand-1: #667eea;
  --vp-c-brand-2: #764ba2;
  --vp-c-brand-3: #5a4fcf;
}
*/

/*
 * 🎨 自定义样式示例 - 你可以在这里添加自己的样式
 */

/* 示例：自定义链接颜色 */
/*
a {
  color: #667eea;
}
a:hover {
  color: #764ba2;
}
*/

/* 示例：自定义代码块样式 */
/*
pre {
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}
*/
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
├── README.md
├── DEVELOPMENT.md  # 开发指南
└── .gitignore
\`\`\`

## License

MIT
`

  writeFileSync(join(targetDir, 'README.md'), readme)
  console.log(pc.gray('  Created: README.md'))

  // DEVELOPMENT.md - 详细开发指南
  const developmentGuide = `# ${packageName} 开发指南

本文档详细介绍如何开发、调试、打包和发布此主题。

## 项目结构

\`\`\`
src/
├── index.ts              # 主题入口（必须导出 theme 对象）
├── Layout.vue            # 主布局组件（必须）
├── NotFound.vue          # 404 页面（必须）
├── components/           # 自定义组件
└── styles/index.css      # 主题样式
dev/                      # 开发预览
├── doc.config.ts         # 预览配置
└── docs/                 # 预览文档
\`\`\`

## 开发流程

### 1. 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 2. 启动开发模式

\`\`\`bash
pnpm dev
\`\`\`

这会同时运行：
- \\\`vite build --watch\\\` - 监听源码变化自动构建
- \\\`ldoc dev dev\\\` - 启动预览服务

打开 http://localhost:5173 查看效果。

### 3. 修改代码

编辑 \\\`src/\\\` 目录下的文件，保存后自动重新构建和刷新。

## 主题开发要点

### 必须导出的内容

\`\`\`ts
// src/index.ts
import type { Theme } from '@ldesign/doc'
import Layout from './Layout.vue'
import NotFound from './NotFound.vue'
import './styles/index.css'

export const theme: Theme = {
  Layout,      // 主布局组件（必须）
  NotFound,    // 404 页面
}

export default theme
\`\`\`

### Layout 组件要求

\`\`\`vue
<script setup lang="ts">
import { useData } from '@ldesign/doc/client'
const { site, page, frontmatter } = useData()
</script>

<template>
  <div class="layout">
    <header>{{ site.title }}</header>
    <main>
      <!-- 必须包含 router-view -->
      <router-view />
    </main>
  </div>
</template>
\`\`\`

### 可用的 Composables

\`\`\`ts
import {
  useData,         // 站点和页面数据
  useRoute,        // 当前路由
  useSidebarItems, // 侧边栏数据
  useThemeConfig   // 主题配置
} from '@ldesign/doc/client'
\`\`\`

### CSS 变量规范

\`\`\`css
:root {
  --theme-primary: #3b82f6;
  --theme-bg: #ffffff;
  --theme-text: #1f2937;
  --theme-border: #e5e7eb;
}

.dark {
  --theme-bg: #1f2937;
  --theme-text: #f9fafb;
}
\`\`\`

## 调试技巧

1. **Vue DevTools** - 查看组件树和状态
2. **打印数据** - \\\`console.log(useData())\\\`
3. **热更新失效** - 硬刷新或重启服务

## 打包构建

\`\`\`bash
pnpm build
\`\`\`

输出到 \\\`dist/\\\` 目录。

## 发布到 npm

\`\`\`bash
# 登录
npm login

# 发布
pnpm publish
\`\`\`

### 版本管理

\`\`\`bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0  
npm version major  # 1.0.0 -> 2.0.0
\`\`\`

## 注意事项

1. **package.json exports** - 必须导出 \\\`./package.json\\\`
2. **样式导入** - 在 index.ts 中导入样式文件
3. **router-view** - Layout 必须包含 router-view
4. **响应式设计** - 适配移动端和桌面端

## 许可证

MIT
`

  writeFileSync(join(targetDir, 'DEVELOPMENT.md'), developmentGuide)
  console.log(pc.gray('  Created: DEVELOPMENT.md'))

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
