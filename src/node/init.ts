/**
 * 项目初始化
 * 从 playground 模板复制文件
 */

import { resolve, join, dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import pc from 'picocolors'
import prompts from 'prompts'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 获取 playground 模板目录路径
 */
function getPlaygroundPath(): string {
  // 尝试多种路径
  const possiblePaths = [
    // 开发模式：src/node/init.ts -> playground
    resolve(__dirname, '../../playground'),
    // 构建后：dist/es/node/init.js -> playground
    resolve(__dirname, '../../../playground'),
    // 从 node_modules 安装的包
    resolve(__dirname, '../../../../playground')
  ]

  for (const p of possiblePaths) {
    if (existsSync(resolve(p, '.ldesign/doc.config.ts'))) {
      return p
    }
  }

  // 最后尝试通过 require.resolve 找到包路径
  try {
    const pkgPath = require.resolve('@ldesign/doc/package.json')
    const pkgRoot = dirname(pkgPath)
    const playgroundPath = resolve(pkgRoot, 'playground')
    if (existsSync(resolve(playgroundPath, '.ldesign/doc.config.ts'))) {
      return playgroundPath
    }
  } catch {
    // ignore
  }

  throw new Error('Could not find playground template directory')
}

/**
 * 递归复制目录
 */
function copyDir(src: string, dest: string, filter?: (name: string) => boolean): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }

  const items = readdirSync(src)
  for (const item of items) {
    // 跳过不需要的文件/目录
    if (item === 'node_modules' || item === '.doc-cache' || item === 'package.json') {
      continue
    }

    if (filter && !filter(item)) {
      continue
    }

    const srcPath = join(src, item)
    const destPath = join(dest, item)
    const stat = statSync(srcPath)

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, filter)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

/**
 * 初始化文档系统
 * @param root 项目根目录
 * @param template 模板类型
 */
export async function initProject(root: string, template: string): Promise<void> {
  const targetDir = resolve(process.cwd(), root)
  const ldesignDir = join(targetDir, '.ldesign')

  // 检查 .ldesign 目录是否已存在
  if (existsSync(ldesignDir)) {
    const configPath = join(ldesignDir, 'doc.config.ts')
    if (existsSync(configPath)) {
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: '.ldesign/doc.config.ts 已存在，是否覆盖？',
        initial: false
      })

      if (!overwrite) {
        console.log(pc.yellow('  已取消初始化'))
        return
      }
    }
  }

  // 获取 playground 模板路径
  let playgroundPath: string
  try {
    playgroundPath = getPlaygroundPath()
    console.log(pc.gray(`  Using template from: ${playgroundPath}`))
  } catch (err) {
    console.log(pc.red(`  Error: ${(err as Error).message}`))
    console.log(pc.yellow('  Falling back to inline template...'))
    await initProjectFallback(root, template)
    return
  }

  // 复制 .ldesign 目录
  const srcLdesignDir = join(playgroundPath, '.ldesign')
  console.log(pc.gray('  Copying .ldesign directory...'))
  copyDir(srcLdesignDir, ldesignDir)

  // 获取项目名称并更新配置文件
  let projectName = 'My Project'
  const pkgPath = join(targetDir, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      projectName = pkg.name || projectName
    } catch {
      // ignore
    }
  }

  // 更新 doc.config.ts 中的项目名称
  const configPath = join(ldesignDir, 'doc.config.ts')
  // 创建干净的配置文件（不使用 playground 的复杂配置）
  const cleanConfig = `import { defineConfig } from '@ldesign/doc'
import {
  searchPlugin,
  progressPlugin,
  copyCodePlugin,
  imageViewerPlugin,
  readingTimePlugin
} from '@ldesign/doc/plugins'

export default defineConfig({
  title: '${projectName} 文档',
  description: '${projectName} 项目文档',
  lang: 'zh-CN',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: \`Copyright © \${new Date().getFullYear()}\`
    }
  },

  plugins: [
    searchPlugin({ hotkeys: ['/', 'Ctrl+K'] }),
    progressPlugin({ color: 'var(--ldoc-c-brand)', height: 3 }),
    copyCodePlugin({ showLanguage: true }),
    imageViewerPlugin({ zoom: true }),
    readingTimePlugin({ wordsPerMinute: 300 })
  ]
})
`
  writeFileSync(configPath, cleanConfig)

  // 更新首页的项目名称
  const indexPath = join(ldesignDir, 'docs/index.md')
  if (existsSync(indexPath)) {
    let indexContent = readFileSync(indexPath, 'utf-8')
    // 替换 hero name
    indexContent = indexContent.replace(
      /name:\s*LDesign Doc/,
      `name: ${projectName}`
    )
    writeFileSync(indexPath, indexContent)
  }

  console.log(pc.green('  ✓ Copied .ldesign directory'))

  // 更新或创建 package.json 脚本
  await updatePackageJson(targetDir, pkgPath)

  // 打印成功信息
  printSuccess()
}

/**
 * 更新 package.json
 */
async function updatePackageJson(targetDir: string, pkgPath: string): Promise<void> {
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      pkg.scripts = pkg.scripts || {}

      const scriptsToAdd: Record<string, string> = {
        'docs:dev': 'ldoc dev',
        'docs:build': 'ldoc build',
        'docs:preview': 'ldoc preview'
      }

      let scriptsChanged = false
      const scriptsToConfirm: string[] = []

      for (const [key, value] of Object.entries(scriptsToAdd)) {
        if (pkg.scripts[key] && pkg.scripts[key] !== value) {
          scriptsToConfirm.push(key)
        } else if (!pkg.scripts[key]) {
          pkg.scripts[key] = value
          scriptsChanged = true
        }
      }

      // 询问是否覆盖已存在的脚本
      if (scriptsToConfirm.length > 0) {
        console.log(pc.yellow(`\n  检测到已存在的脚本:`))
        for (const script of scriptsToConfirm) {
          console.log(`    ${script}: "${pkg.scripts[script]}"`)
        }

        const { overwrite } = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: '是否覆盖这些脚本为 ldoc 命令？',
          initial: true
        })

        if (overwrite) {
          for (const script of scriptsToConfirm) {
            pkg.scripts[script] = scriptsToAdd[script]
            scriptsChanged = true
          }
        }
      }

      // 添加 @ldesign/doc 到 devDependencies
      pkg.devDependencies = pkg.devDependencies || {}
      pkg.dependencies = pkg.dependencies || {}

      if (!pkg.dependencies['@ldesign/doc'] && !pkg.devDependencies['@ldesign/doc']) {
        pkg.devDependencies['@ldesign/doc'] = '^0.0.6'
        console.log(pc.gray(`  Added: @ldesign/doc to devDependencies`))
        scriptsChanged = true
      }

      if (scriptsChanged) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
        console.log(pc.green('  ✓ Updated package.json'))
      }
    } catch {
      console.log(pc.yellow(`  Warning: Could not update package.json`))
    }
  } else {
    // 创建新的 package.json
    const newPkg = {
      name: 'my-docs',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        'docs:dev': 'ldoc dev',
        'docs:build': 'ldoc build',
        'docs:preview': 'ldoc preview'
      },
      devDependencies: {
        '@ldesign/doc': '^0.0.6'
      }
    }

    writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + '\n')
    console.log(pc.green('  ✓ Created package.json'))
  }
}

/**
 * 打印成功信息
 */
function printSuccess(): void {
  console.log()
  console.log(pc.green('  ✓ 文档系统初始化完成！'))
  console.log()
  console.log('  下一步:')
  console.log()
  console.log(`  1. 安装依赖:`)
  console.log(pc.cyan(`     pnpm install`))
  console.log()
  console.log(`  2. 启动开发服务器:`)
  console.log(pc.cyan(`     pnpm docs:dev`))
  console.log()
  console.log(pc.gray('  📁 文档目录: .ldesign/docs/'))
  console.log(pc.gray('  📄 配置文件: .ldesign/doc.config.ts'))
}

/**
 * 降级方案：使用内联模板
 */
async function initProjectFallback(root: string, template: string): Promise<void> {
  const targetDir = resolve(process.cwd(), root)
  const ldesignDir = join(targetDir, '.ldesign')

  // 创建目录结构
  const dirs = [
    '.ldesign',
    '.ldesign/docs',
    '.ldesign/docs/guide',
    '.ldesign/docs/api',
    '.ldesign/docs/public'
  ]

  for (const dir of dirs) {
    const dirPath = join(targetDir, dir)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
  }

  // 获取项目名称
  let projectName = 'My Project'
  const pkgPath = join(targetDir, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      projectName = pkg.name || projectName
    } catch {
      // ignore
    }
  }

  // 创建基础配置文件
  const configContent = `import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: '${projectName} 文档',
  description: '${projectName} 项目文档',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '介绍', link: '/guide/' }
          ]
        }
      ]
    },
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: \`Copyright © \${new Date().getFullYear()}\`
    }
  }
})
`

  writeFileSync(join(ldesignDir, 'doc.config.ts'), configContent)

  // 创建首页
  const indexContent = `---
layout: home
title: ${projectName} 文档

hero:
  name: ${projectName}
  text: 项目文档
  tagline: 使用 LDoc 构建的现代化文档系统
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/your-repo

features:
  - icon: zap
    title: 极速启动
    details: 基于 Vite 构建，享受毫秒级热更新
  - icon: file-text
    title: Markdown 增强
    details: 代码高亮、容器语法等丰富扩展
  - icon: palette
    title: 高度可定制
    details: 灵活的主题和插件系统
---
`

  writeFileSync(join(ldesignDir, 'docs/index.md'), indexContent)

  // 创建指南页面
  const guideContent = `# 介绍

欢迎使用 ${projectName} 文档！

## 快速开始

\`\`\`bash
pnpm docs:dev
\`\`\`
`

  writeFileSync(join(ldesignDir, 'docs/guide/index.md'), guideContent)

  console.log(pc.green('  ✓ Created .ldesign directory (fallback template)'))

  // 更新 package.json
  await updatePackageJson(targetDir, pkgPath)

  // 打印成功信息
  printSuccess()
}

export default initProject
