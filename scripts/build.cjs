/**
 * 构建脚本 (CommonJS)
 */

const { build } = require('vite')
const { resolve, join } = require('path')
const vue = require('@vitejs/plugin-vue')
const { execSync } = require('child_process')
const { rmSync, mkdirSync, existsSync, cpSync } = require('fs')

const rootDir = resolve(__dirname, '..')

// 外部依赖
const external = [
  'vue',
  'vue-router',
  'react',
  'react-dom',
  'react-dom/client',
  'vite',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-react',
  '@vue/compiler-sfc',
  'shiki',
  '@shikijs/core',
  '@shikijs/transformers',
  'markdown-it',
  'markdown-it-anchor',
  'markdown-it-container',
  'markdown-it-emoji',
  'markdown-it-table-of-contents',
  'markdown-it-front-matter',
  'gray-matter',
  'globby',
  'fast-glob',
  'chokidar',
  'cac',
  'picocolors',
  'sirv',
  'compression',
  'polka',
  'nanoid',
  'ora',
  'debug',
  'defu',
  'ufo',
  // 评论插件可选依赖
  '@waline/client',
  'gitalk',
  'twikoo',
  /^node:/,
  // Node.js 内建模块
  'fs',
  'fs/promises',
  'node:fs',
  'node:fs/promises',
  'path',
  'node:path',
  'url',
  'node:url',
  'module',
  'node:module',
  'child_process',
  'node:child_process',
  'http',
  'node:http',
  'https',
  'node:https',
  'crypto',
  'node:crypto',
  'os',
  'node:os',
  'stream',
  'node:stream',
  'util',
  'node:util',
  'events',
  'node:events',
  'assert',
  'node:assert',
  'buffer',
  'node:buffer',
  'tty',
  'node:tty',
  'zlib',
  'node:zlib',
  'cluster',
  'node:cluster',
  'net',
  'node:net',
  'dns',
  'node:dns',
  'tls',
  'node:tls',
  'readline',
  'node:readline',
  'repl',
  'node:repl',
  'perf_hooks',
  'node:perf_hooks',
  'v8',
  'node:v8',
  'inspector',
  'node:inspector',
  'async_hooks',
  'node:async_hooks',
  'trace_events',
  'node:trace_events',
  'worker_threads',
  'node:worker_threads',
  'domain',
  'node:domain',
  'constants',
  'node:constants',
  'process',
  'node:process',
  'querystring',
  'node:querystring',
  'string_decoder',
  'node:string_decoder',
  'timers',
  'node:timers',
  'console',
  'node:console'
].filter(name => typeof name !== 'string' || !name.startsWith('@ldesign/doc'))

async function buildLibrary() {
  console.log('🚀 Building @ldesign/doc...\n')

  // 清理输出目录
  const distDir = resolve(rootDir, 'dist')
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true })
  }
  mkdirSync(distDir, { recursive: true })

  // 构建 Node.js 端代码 (CLI)
  console.log('📦 Building Node.js CLI...')
  await build({
    root: rootDir,
    configFile: false,
    build: {
      outDir: 'dist/es/node',
      ssr: true,
      lib: {
        entry: resolve(rootDir, 'src/node/cli.ts'),
        formats: ['es'],
        fileName: () => 'cli.js'
      },
      rollupOptions: {
        external,
        output: {
          preserveModules: false
        }
      },
      emptyOutDir: true,
      minify: false,
      sourcemap: true
    }
  })

  // 构建核心库
  console.log('📦 Building core library...')
  await build({
    root: rootDir,
    plugins: [vue.default ? vue.default() : vue()],
    configFile: false,
    build: {
      outDir: 'dist/es',
      target: 'esnext', // 支持 top-level await
      lib: {
        entry: {
          index: resolve(rootDir, 'src/index.ts'),
          'client/index': resolve(rootDir, 'src/client/index.ts'),
          'theme/index': resolve(rootDir, 'src/theme/index.ts'),
          'plugin/index': resolve(rootDir, 'src/plugin/index.ts'),
          'plugins/index': resolve(rootDir, 'src/plugins/index.ts'),
          'plugins/builtin-client': resolve(rootDir, 'src/plugins/builtin-client.ts'),
          'plugins/api-doc/client': resolve(rootDir, 'src/plugins/api-doc/client.ts'),
          'plugins/auth/client': resolve(rootDir, 'src/plugins/auth/client.ts'),
          'plugins/back-to-top/client': resolve(rootDir, 'src/plugins/back-to-top/client.ts'),
          'plugins/comment/client': resolve(rootDir, 'src/plugins/comment/client.ts'),
          'plugins/demo/client': resolve(rootDir, 'src/plugins/demo/client.ts'),
          'plugins/component-playground/client': resolve(rootDir, 'src/plugins/component-playground/client.ts'),
          'plugins/export/client': resolve(rootDir, 'src/plugins/export/client.ts'),
          'plugins/feedback/client': resolve(rootDir, 'src/plugins/feedback/client.ts'),
          'plugins/pwa/client': resolve(rootDir, 'src/plugins/pwa/client.ts'),
          'plugins/search/client': resolve(rootDir, 'src/plugins/search/client.ts'),
          'plugins/search-enhanced/client': resolve(rootDir, 'src/plugins/search-enhanced/client.ts'),
          'plugins/security/client': resolve(rootDir, 'src/plugins/security/client.ts'),
          'plugins/version/client': resolve(rootDir, 'src/plugins/version/client.ts'),
          'markdown/index': resolve(rootDir, 'src/markdown/index.ts')
        },
        formats: ['es'],
        fileName: (_, entryName) => `${entryName}.js`
      },
      rollupOptions: {
        external
      },
      emptyOutDir: false,
      minify: false,
      sourcemap: true
    }
  })

  // 复制 theme-default 目录 (Vue 组件需要在运行时编译)
  console.log('📁 Copying theme-default...')
  const themeDefaultSrc = resolve(rootDir, 'src/theme-default')
  const themeDefaultDest = resolve(rootDir, 'dist/es/theme-default')
  if (existsSync(themeDefaultSrc)) {
    cpSync(themeDefaultSrc, themeDefaultDest, { recursive: true })
  }

  // 生成类型声明
  console.log('📝 Generating type declarations...')
  try {
    execSync('npx tsc --emitDeclarationOnly --declaration --outDir dist/types', {
      cwd: rootDir,
      stdio: 'inherit'
    })
  } catch (e) {
    console.warn('⚠️  Type generation had errors, continuing...')
  }

  console.log('\n✅ Build completed!')
}

buildLibrary().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
