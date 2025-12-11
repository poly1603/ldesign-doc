/**
 * 项目初始化
 * 在已有项目中初始化文档系统
 */

import { resolve, join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import pc from 'picocolors'

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
      console.log(pc.yellow(`  Warning: .ldesign/doc.config.ts already exists, skipping...`))
      return
    }
  }

  // 创建 .ldesign 目录结构
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
      console.log(pc.gray(`  Created: ${dir}/`))
    }
  }

  // 获取项目名称（从 package.json 或目录名）
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

  // 创建配置文件
  const configContent = `import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: '${projectName} 文档',
  description: '${projectName} 项目文档',
  
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
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '配置', link: '/api/config' }
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
  }
})
`

  writeFileSync(join(ldesignDir, 'doc.config.ts'), configContent)
  console.log(pc.gray(`  Created: .ldesign/doc.config.ts`))

  // 文档目录路径
  const docsDir = join(ldesignDir, 'docs')

  // 创建首页
  const indexContent = `---
layout: home
title: 首页
hero:
  name: ${projectName}
  text: 项目文档
  tagline: 使用 LDoc 构建的文档系统
  actions:
    - text: 快速开始
      link: /guide/
    - text: GitHub
      link: https://github.com/your-repo
      theme: alt
features:
  - title: ⚡️ 极速启动
    details: 基于 Vite 构建，享受即时的开发服务器启动和热更新。
  - title: 📝 Markdown 优先
    details: 使用 Markdown 编写文档，支持 Vue 组件扩展。
  - title: 🎨 高度可定制
    details: 完全可定制的主题和强大的插件系统。
  - title: 🔍 内置搜索
    details: 开箱即用的全文搜索功能。
---
`

  writeFileSync(join(docsDir, 'index.md'), indexContent)
  console.log(pc.gray(`  Created: .ldesign/docs/index.md`))

  // 创建指南页面
  const guideIndexContent = `# 介绍

欢迎使用 ${projectName} 文档！

## 什么是 LDoc？

LDoc 是一个强大的文档框架，帮助你快速构建精美的文档站点。

## 特性

- 📝 **Markdown 支持** - 使用 Markdown 编写文档
- 🎨 **主题系统** - 完全可定制的主题
- 🔌 **插件系统** - 通过插件扩展功能
- ⚡ **极速** - 基于 Vite 构建
- 🔍 **内置搜索** - 开箱即用的搜索功能

## 快速链接

- [快速开始](/guide/getting-started)
- [配置参考](/api/config)
`

  writeFileSync(join(docsDir, 'guide/index.md'), guideIndexContent)
  console.log(pc.gray(`  Created: .ldesign/docs/guide/index.md`))

  // 创建快速开始页面
  const gettingStartedContent = `# 快速开始

## 安装

\`\`\`bash
# pnpm
pnpm add -D @ldesign/doc

# npm
npm install -D @ldesign/doc

# yarn
yarn add -D @ldesign/doc
\`\`\`

## 初始化

在项目中运行初始化命令：

\`\`\`bash
npx ldoc init
\`\`\`

这将创建 \`.ldesign\` 目录和必要的配置文件。

## 开发

启动开发服务器：

\`\`\`bash
pnpm docs:dev
\`\`\`

## 构建

构建生产版本：

\`\`\`bash
pnpm docs:build
\`\`\`

## 预览

预览构建结果：

\`\`\`bash
pnpm docs:preview
\`\`\`
`

  writeFileSync(join(docsDir, 'guide/getting-started.md'), gettingStartedContent)
  console.log(pc.gray(`  Created: .ldesign/docs/guide/getting-started.md`))

  // 创建 API 文档
  const apiConfigContent = `# 配置

## 站点配置

### title

- 类型: \`string\`
- 默认值: \`'LDoc'\`

站点标题。

### description

- 类型: \`string\`
- 默认值: \`'A LDesign Documentation Site'\`

站点描述。

### base

- 类型: \`string\`
- 默认值: \`'/'\`

站点基础路径。

## 主题配置

\`\`\`ts
export default defineConfig({
  themeConfig: {
    // 导航栏
    nav: [],
    
    // 侧边栏
    sidebar: {},
    
    // 社交链接
    socialLinks: [],
    
    // 页脚
    footer: {}
  }
})
\`\`\`
`

  writeFileSync(join(docsDir, 'api/config.md'), apiConfigContent)
  console.log(pc.gray(`  Created: .ldesign/docs/api/config.md`))

  // 更新或创建 package.json 脚本
  if (existsSync(pkgPath)) {
    // 已有 package.json，添加脚本
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      pkg.scripts = pkg.scripts || {}

      // 添加文档相关脚本
      const scriptsToAdd = {
        'docs:dev': 'ldoc dev',
        'docs:build': 'ldoc build',
        'docs:preview': 'ldoc preview'
      }

      let scriptsAdded = false
      for (const [key, value] of Object.entries(scriptsToAdd)) {
        if (!pkg.scripts[key]) {
          pkg.scripts[key] = value
          scriptsAdded = true
        }
      }

      // 添加 @ldesign/doc 到 devDependencies
      pkg.devDependencies = pkg.devDependencies || {}
      if (!pkg.devDependencies['@ldesign/doc']) {
        pkg.devDependencies['@ldesign/doc'] = '^1.0.0'
      }

      if (scriptsAdded) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
        console.log(pc.gray(`  Updated: package.json (added docs:dev, docs:build, docs:preview scripts)`))
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
        '@ldesign/doc': '^1.0.0'
      }
    }

    writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + '\n')
    console.log(pc.gray(`  Created: package.json`))
  }

  // 打印最终结构
  console.log()
  console.log(pc.green('  ✓ Created documentation structure:'))
  console.log(pc.gray('    .ldesign/'))
  console.log(pc.gray('    ├── doc.config.ts'))
  console.log(pc.gray('    └── docs/'))
  console.log(pc.gray('        ├── index.md'))
  console.log(pc.gray('        ├── guide/'))
  console.log(pc.gray('        │   ├── index.md'))
  console.log(pc.gray('        │   └── getting-started.md'))
  console.log(pc.gray('        └── api/'))
  console.log(pc.gray('            └── config.md'))
}
