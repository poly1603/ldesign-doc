/**
 * 项目初始化
 */

import { resolve, join } from 'path'
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs'
import pc from 'picocolors'

/**
 * 初始化新项目
 */
export async function initProject(root: string, template: string): Promise<void> {
  const targetDir = resolve(process.cwd(), root)

  // 检查目录是否存在
  if (existsSync(targetDir)) {
    const files = require('fs').readdirSync(targetDir)
    if (files.length > 0) {
      console.log(pc.yellow(`  Warning: Directory ${root} is not empty.`))
    }
  } else {
    mkdirSync(targetDir, { recursive: true })
  }

  // 创建目录结构
  const dirs = [
    'docs',
    'docs/guide',
    'docs/api',
    'docs/public',
    '.ldoc'
  ]

  for (const dir of dirs) {
    const dirPath = join(targetDir, dir)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
    }
  }

  // 创建配置文件
  const configContent = `import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Documentation',
  description: 'A documentation site powered by LDoc',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Config', link: '/api/config' },
            { text: 'Theme', link: '/api/theme' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    }
  }
})
`

  writeFileSync(join(targetDir, 'ldoc.config.ts'), configContent)

  // 创建首页
  const indexContent = `---
layout: home
title: Home
hero:
  name: My Project
  text: Powerful Documentation System
  tagline: Build beautiful documentation sites with ease
  actions:
    - text: Get Started
      link: /guide/
    - text: View on GitHub
      link: https://github.com/your-repo
      theme: alt
features:
  - title: ⚡️ Lightning Fast
    details: Powered by Vite, experience instant server start and HMR.
  - title: 📝 Markdown First
    details: Write documentation in Markdown with Vue/React component support.
  - title: 🎨 Customizable
    details: Fully customizable themes and powerful plugin system.
  - title: 🔒 Auth Ready
    details: Built-in authentication support for private documentation.
---
`

  writeFileSync(join(targetDir, 'docs/index.md'), indexContent)

  // 创建指南页面
  const guideIndexContent = `# Introduction

Welcome to the documentation!

## What is LDoc?

LDoc is a powerful documentation framework that helps you build beautiful documentation sites.

## Features

- 📝 **Markdown Support** - Write documentation in Markdown
- 🎨 **Theme System** - Fully customizable themes
- 🔌 **Plugin System** - Extend functionality with plugins
- ⚡ **Fast** - Powered by Vite
- 🔒 **Auth Support** - Built-in authentication

## Quick Links

- [Quick Start](/guide/quick-start)
- [Configuration](/api/config)
- [Theme Development](/api/theme)
`

  writeFileSync(join(targetDir, 'docs/guide/index.md'), guideIndexContent)

  // 创建快速开始页面
  const quickStartContent = `# Quick Start

## Installation

\`\`\`bash
# npm
npm install @ldesign/doc

# pnpm
pnpm add @ldesign/doc

# yarn
yarn add @ldesign/doc
\`\`\`

## Configuration

Create a \`ldoc.config.ts\` file in your project root:

\`\`\`ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Documentation',
  description: 'A documentation site powered by LDoc',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' }
    ]
  }
})
\`\`\`

## Development

Start the development server:

\`\`\`bash
npx ldoc dev
\`\`\`

## Build

Build for production:

\`\`\`bash
npx ldoc build
\`\`\`

## Preview

Preview the production build:

\`\`\`bash
npx ldoc preview
\`\`\`
`

  writeFileSync(join(targetDir, 'docs/guide/quick-start.md'), quickStartContent)

  // 创建 API 文档
  const apiConfigContent = `# Configuration

## Site Config

### title

- Type: \`string\`
- Default: \`'LDoc'\`

The title of the site.

### description

- Type: \`string\`
- Default: \`'A LDesign Documentation Site'\`

The description of the site.

### base

- Type: \`string\`
- Default: \`'/'\`

The base URL of the site.

## Theme Config

See [Theme](/api/theme) for theme configuration options.
`

  writeFileSync(join(targetDir, 'docs/api/config.md'), apiConfigContent)

  const apiThemeContent = `# Theme

## Built-in Theme

LDoc comes with a beautiful default theme.

### Configuration

\`\`\`ts
export default defineConfig({
  themeConfig: {
    // Navigation
    nav: [],
    
    // Sidebar
    sidebar: {},
    
    // Social Links
    socialLinks: [],
    
    // Footer
    footer: {}
  }
})
\`\`\`

## Custom Theme

You can create your own theme:

\`\`\`ts
import { defineTheme } from '@ldesign/doc'
import Layout from './Layout.vue'

export default defineTheme({
  Layout,
  enhanceApp({ app }) {
    // Register global components
  }
})
\`\`\`
`

  writeFileSync(join(targetDir, 'docs/api/theme.md'), apiThemeContent)

  // 创建 package.json（如果不存在）
  const pkgPath = join(targetDir, 'package.json')
  if (!existsSync(pkgPath)) {
    const pkgContent = {
      name: 'my-docs',
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'ldoc dev docs',
        build: 'ldoc build docs',
        preview: 'ldoc preview docs'
      },
      devDependencies: {
        '@ldesign/doc': 'workspace:*'
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkgContent, null, 2))
  }

  console.log(pc.green('  Created project structure:'))
  console.log(pc.gray('    docs/'))
  console.log(pc.gray('    ├── index.md'))
  console.log(pc.gray('    ├── guide/'))
  console.log(pc.gray('    │   ├── index.md'))
  console.log(pc.gray('    │   └── quick-start.md'))
  console.log(pc.gray('    └── api/'))
  console.log(pc.gray('        ├── config.md'))
  console.log(pc.gray('        └── theme.md'))
  console.log(pc.gray('    ldoc.config.ts'))
  console.log(pc.gray('    package.json'))
}
