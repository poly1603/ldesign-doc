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
  /^node:/,
  'fs',
  'path',
  'url',
  'module',
  'child_process',
  'http',
  'crypto',
  'os',
  'stream',
  'util',
  'events',
  'assert',
  'buffer'
]

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
      lib: {
        entry: {
          index: resolve(rootDir, 'src/index.ts'),
          'client/index': resolve(rootDir, 'src/client/index.ts'),
          'theme/index': resolve(rootDir, 'src/theme/index.ts'),
          'plugin/index': resolve(rootDir, 'src/plugin/index.ts'),
          'plugins/index': resolve(rootDir, 'src/plugins/index.ts'),
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
