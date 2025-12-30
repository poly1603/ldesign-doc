/**
 * 项目诊断工具
 * 
 * 检查 LDoc 项目的配置、依赖和环境问题，并提供修复建议。
 * 
 * @example
 * ```bash
 * ldoc doctor
 * ```
 */

import { existsSync, readFileSync, statSync } from 'fs'
import { resolve, join, dirname } from 'path'
import pc from 'picocolors'
import * as logger from './logger'

/**
 * 诊断检查项
 */
export interface DiagnosticCheck {
  /** 检查名称 */
  name: string
  /** 检查描述 */
  description: string
  /** 检查类别 */
  category: 'config' | 'deps' | 'env' | 'files' | 'performance'
  /** 检查函数 */
  check: (ctx: DiagnosticContext) => Promise<DiagnosticResult> | DiagnosticResult
}

/**
 * 诊断结果
 */
export interface DiagnosticResult {
  /** 状态 */
  status: 'pass' | 'warn' | 'fail' | 'skip'
  /** 消息 */
  message: string
  /** 详细信息 */
  details?: string[]
  /** 修复建议 */
  fix?: {
    /** 修复描述 */
    description: string
    /** 修复命令 */
    command?: string
    /** 文档链接 */
    docUrl?: string
  }
}

/**
 * 诊断上下文
 */
export interface DiagnosticContext {
  /** 项目根目录 */
  root: string
  /** 包管理器 */
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun'
  /** package.json 内容 */
  packageJson?: Record<string, unknown>
  /** 配置文件路径 */
  configPath?: string
  /** 用户配置 */
  userConfig?: Record<string, unknown>
}

/**
 * 诊断报告
 */
export interface DiagnosticReport {
  /** 检查结果列表 */
  results: Array<{
    check: DiagnosticCheck
    result: DiagnosticResult
  }>
  /** 统计 */
  summary: {
    total: number
    passed: number
    warnings: number
    failed: number
    skipped: number
  }
  /** 总体状态 */
  status: 'healthy' | 'warnings' | 'issues'
}

// ============== 内置检查项 ==============

const builtinChecks: DiagnosticCheck[] = [
  // 配置文件检查
  {
    name: 'config-exists',
    description: '检查配置文件是否存在',
    category: 'config',
    check: (ctx) => {
      const configFiles = [
        '.ldesign/doc.config.ts',
        '.ldesign/doc.config.js',
        'ldoc.config.ts',
        'ldoc.config.js'
      ]

      for (const file of configFiles) {
        if (existsSync(resolve(ctx.root, file))) {
          return {
            status: 'pass',
            message: `找到配置文件: ${file}`
          }
        }
      }

      return {
        status: 'fail',
        message: '未找到配置文件',
        fix: {
          description: '创建配置文件',
          command: 'ldoc init',
          docUrl: 'https://ldoc.ldesign.dev/guide/getting-started'
        }
      }
    }
  },

  // 文档目录检查
  {
    name: 'docs-dir',
    description: '检查文档目录是否存在',
    category: 'files',
    check: (ctx) => {
      const docsDirs = [
        '.ldesign/docs',
        'docs'
      ]

      for (const dir of docsDirs) {
        const fullPath = resolve(ctx.root, dir)
        if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
          return {
            status: 'pass',
            message: `找到文档目录: ${dir}`
          }
        }
      }

      return {
        status: 'fail',
        message: '未找到文档目录',
        fix: {
          description: '创建文档目录并添加第一个文档',
          command: 'mkdir -p docs && echo "# Hello" > docs/index.md'
        }
      }
    }
  },

  // package.json 检查
  {
    name: 'package-json',
    description: '检查 package.json 是否存在',
    category: 'deps',
    check: (ctx) => {
      const pkgPath = resolve(ctx.root, 'package.json')
      if (!existsSync(pkgPath)) {
        return {
          status: 'fail',
          message: '未找到 package.json',
          fix: {
            description: '初始化 npm 项目',
            command: 'npm init -y'
          }
        }
      }

      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        ctx.packageJson = pkg
        return {
          status: 'pass',
          message: `项目名称: ${pkg.name || 'unnamed'}`
        }
      } catch (e) {
        return {
          status: 'fail',
          message: 'package.json 解析失败',
          details: [(e as Error).message]
        }
      }
    }
  },

  // @ldesign/doc 依赖检查
  {
    name: 'ldoc-installed',
    description: '检查 @ldesign/doc 是否已安装',
    category: 'deps',
    check: (ctx) => {
      const pkg = ctx.packageJson
      if (!pkg) {
        return { status: 'skip', message: '跳过（无 package.json）' }
      }

      const deps = {
        ...(pkg.dependencies as Record<string, string> || {}),
        ...(pkg.devDependencies as Record<string, string> || {})
      }

      if (deps['@ldesign/doc']) {
        return {
          status: 'pass',
          message: `已安装 @ldesign/doc@${deps['@ldesign/doc']}`
        }
      }

      return {
        status: 'fail',
        message: '未安装 @ldesign/doc',
        fix: {
          description: '安装 @ldesign/doc',
          command: `${ctx.packageManager} add @ldesign/doc`
        }
      }
    }
  },

  // Node.js 版本检查
  {
    name: 'node-version',
    description: '检查 Node.js 版本',
    category: 'env',
    check: () => {
      const version = process.version
      const major = parseInt(version.slice(1).split('.')[0], 10)

      if (major < 18) {
        return {
          status: 'fail',
          message: `Node.js 版本过低: ${version}`,
          details: ['LDoc 需要 Node.js 18 或更高版本'],
          fix: {
            description: '升级 Node.js',
            docUrl: 'https://nodejs.org/'
          }
        }
      }

      if (major < 20) {
        return {
          status: 'warn',
          message: `Node.js ${version}（建议使用 v20+）`
        }
      }

      return {
        status: 'pass',
        message: `Node.js ${version}`
      }
    }
  },

  // TypeScript 配置检查
  {
    name: 'tsconfig',
    description: '检查 TypeScript 配置',
    category: 'config',
    check: (ctx) => {
      const tsconfigPath = resolve(ctx.root, 'tsconfig.json')
      if (!existsSync(tsconfigPath)) {
        return {
          status: 'warn',
          message: '未找到 tsconfig.json',
          details: ['建议添加 TypeScript 配置以获得更好的类型支持'],
          fix: {
            description: '创建 tsconfig.json',
            command: 'npx tsc --init'
          }
        }
      }

      try {
        const content = readFileSync(tsconfigPath, 'utf-8')
        // 简单检查是否包含常见配置
        if (!content.includes('compilerOptions')) {
          return {
            status: 'warn',
            message: 'tsconfig.json 配置可能不完整'
          }
        }
        return {
          status: 'pass',
          message: '找到 tsconfig.json'
        }
      } catch {
        return {
          status: 'warn',
          message: 'tsconfig.json 解析失败'
        }
      }
    }
  },

  // Git 仓库检查
  {
    name: 'git-repo',
    description: '检查 Git 仓库',
    category: 'env',
    check: (ctx) => {
      const gitDir = resolve(ctx.root, '.git')
      if (!existsSync(gitDir)) {
        return {
          status: 'warn',
          message: '未初始化 Git 仓库',
          details: ['某些功能（如最后更新时间）需要 Git'],
          fix: {
            description: '初始化 Git 仓库',
            command: 'git init'
          }
        }
      }

      return {
        status: 'pass',
        message: 'Git 仓库已初始化'
      }
    }
  },

  // 缓存目录检查
  {
    name: 'cache-dir',
    description: '检查缓存目录状态',
    category: 'performance',
    check: (ctx) => {
      const cacheDirs = [
        '.ldoc-cache',
        'node_modules/.cache/ldoc'
      ]

      for (const dir of cacheDirs) {
        const fullPath = resolve(ctx.root, dir)
        if (existsSync(fullPath)) {
          try {
            const stat = statSync(fullPath)
            const sizeMB = (stat.size / 1024 / 1024).toFixed(1)
            return {
              status: 'pass',
              message: `缓存目录存在: ${dir}`,
              details: [`缓存大小约 ${sizeMB} MB`]
            }
          } catch {
            // 忽略错误
          }
        }
      }

      return {
        status: 'warn',
        message: '未找到缓存目录',
        details: ['首次构建后会自动创建缓存']
      }
    }
  },

  // 依赖版本冲突检查
  {
    name: 'peer-deps',
    description: '检查 peer 依赖',
    category: 'deps',
    check: (ctx) => {
      const pkg = ctx.packageJson
      if (!pkg) {
        return { status: 'skip', message: '跳过（无 package.json）' }
      }

      const deps = {
        ...(pkg.dependencies as Record<string, string> || {}),
        ...(pkg.devDependencies as Record<string, string> || {})
      }

      const issues: string[] = []

      // 检查 Vue 版本
      if (deps.vue) {
        const vueVersion = deps.vue.replace(/[\^~]/, '')
        if (!vueVersion.startsWith('3')) {
          issues.push(`Vue 版本 ${deps.vue} 可能不兼容，建议使用 Vue 3.x`)
        }
      }

      // 检查 Vite 版本
      if (deps.vite) {
        const viteVersion = deps.vite.replace(/[\^~]/, '')
        const major = parseInt(viteVersion.split('.')[0], 10)
        if (major < 5) {
          issues.push(`Vite 版本 ${deps.vite} 较旧，建议升级到 5.x`)
        }
      }

      if (issues.length > 0) {
        return {
          status: 'warn',
          message: '发现潜在的依赖问题',
          details: issues
        }
      }

      return {
        status: 'pass',
        message: '依赖版本检查通过'
      }
    }
  },

  // 入口文件检查
  {
    name: 'entry-file',
    description: '检查文档入口文件',
    category: 'files',
    check: (ctx) => {
      const entryFiles = [
        '.ldesign/docs/index.md',
        'docs/index.md',
        '.ldesign/docs/README.md',
        'docs/README.md'
      ]

      for (const file of entryFiles) {
        if (existsSync(resolve(ctx.root, file))) {
          return {
            status: 'pass',
            message: `找到入口文件: ${file}`
          }
        }
      }

      return {
        status: 'warn',
        message: '未找到文档入口文件',
        details: ['建议创建 docs/index.md 作为首页'],
        fix: {
          description: '创建入口文件',
          command: 'ldoc new page index.md --title "首页"'
        }
      }
    }
  }
]

/**
 * 检测包管理器
 */
function detectPackageManager(root: string): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  if (existsSync(resolve(root, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(resolve(root, 'yarn.lock'))) return 'yarn'
  if (existsSync(resolve(root, 'bun.lockb'))) return 'bun'
  return 'npm'
}

/**
 * 运行诊断
 */
export async function runDiagnostics(
  root: string = process.cwd(),
  options: {
    /** 只检查特定类别 */
    categories?: DiagnosticCheck['category'][]
    /** 额外的检查项 */
    extraChecks?: DiagnosticCheck[]
  } = {}
): Promise<DiagnosticReport> {
  const { categories, extraChecks = [] } = options

  // 创建诊断上下文
  const ctx: DiagnosticContext = {
    root,
    packageManager: detectPackageManager(root)
  }

  // 合并检查项
  let checks = [...builtinChecks, ...extraChecks]

  // 过滤类别
  if (categories && categories.length > 0) {
    checks = checks.filter(c => categories.includes(c.category))
  }

  // 运行检查
  const results: DiagnosticReport['results'] = []
  for (const check of checks) {
    try {
      const result = await check.check(ctx)
      results.push({ check, result })
    } catch (error) {
      results.push({
        check,
        result: {
          status: 'fail',
          message: '检查执行失败',
          details: [(error as Error).message]
        }
      })
    }
  }

  // 计算统计
  const summary = {
    total: results.length,
    passed: results.filter(r => r.result.status === 'pass').length,
    warnings: results.filter(r => r.result.status === 'warn').length,
    failed: results.filter(r => r.result.status === 'fail').length,
    skipped: results.filter(r => r.result.status === 'skip').length
  }

  // 确定总体状态
  let status: DiagnosticReport['status'] = 'healthy'
  if (summary.failed > 0) {
    status = 'issues'
  } else if (summary.warnings > 0) {
    status = 'warnings'
  }

  return { results, summary, status }
}

/**
 * 打印诊断报告
 */
export function printDiagnosticReport(report: DiagnosticReport): void {
  console.log()
  console.log(pc.bold(pc.cyan('  🩺 LDoc 项目诊断报告')))
  console.log(pc.gray('  ─'.repeat(25)))
  console.log()

  // 按类别分组
  const byCategory = new Map<string, DiagnosticReport['results']>()
  for (const item of report.results) {
    const cat = item.check.category
    if (!byCategory.has(cat)) {
      byCategory.set(cat, [])
    }
    byCategory.get(cat)!.push(item)
  }

  const categoryLabels: Record<string, string> = {
    config: '⚙️  配置检查',
    deps: '📦 依赖检查',
    env: '🖥️  环境检查',
    files: '📁 文件检查',
    performance: '🚀 性能检查'
  }

  for (const [category, items] of byCategory) {
    console.log(pc.bold(`  ${categoryLabels[category] || category}`))

    for (const { check, result } of items) {
      const icon = result.status === 'pass' ? pc.green('✓')
        : result.status === 'warn' ? pc.yellow('⚠')
          : result.status === 'fail' ? pc.red('✗')
            : pc.gray('○')

      const statusColor = result.status === 'pass' ? pc.green
        : result.status === 'warn' ? pc.yellow
          : result.status === 'fail' ? pc.red
            : pc.gray

      console.log(`    ${icon} ${pc.dim(check.name.padEnd(18))} ${statusColor(result.message)}`)

      // 显示详细信息
      if (result.details && result.details.length > 0) {
        for (const detail of result.details) {
          console.log(`      ${pc.gray('└─')} ${pc.gray(detail)}`)
        }
      }

      // 显示修复建议
      if (result.fix && result.status !== 'pass') {
        console.log(`      ${pc.blue('💡')} ${pc.blue(result.fix.description)}`)
        if (result.fix.command) {
          console.log(`         ${pc.gray('$')} ${pc.white(result.fix.command)}`)
        }
        if (result.fix.docUrl) {
          console.log(`         ${pc.gray('📖')} ${pc.dim(result.fix.docUrl)}`)
        }
      }
    }

    console.log()
  }

  // 打印摘要
  console.log(pc.gray('  ─'.repeat(25)))
  const { summary } = report

  const statusIcon = report.status === 'healthy' ? pc.green('✓')
    : report.status === 'warnings' ? pc.yellow('⚠')
      : pc.red('✗')

  const statusText = report.status === 'healthy' ? pc.green('健康')
    : report.status === 'warnings' ? pc.yellow('有警告')
      : pc.red('有问题')

  console.log(`  ${statusIcon} 总体状态: ${statusText}`)
  console.log()
  console.log(`    ${pc.green('✓')} 通过: ${summary.passed}`)
  console.log(`    ${pc.yellow('⚠')} 警告: ${summary.warnings}`)
  console.log(`    ${pc.red('✗')} 失败: ${summary.failed}`)
  if (summary.skipped > 0) {
    console.log(`    ${pc.gray('○')} 跳过: ${summary.skipped}`)
  }
  console.log()

  // 如果有问题，给出下一步建议
  if (report.status === 'issues') {
    console.log(pc.red('  请修复上述问题后再继续使用 LDoc'))
    console.log()
  } else if (report.status === 'warnings') {
    console.log(pc.yellow('  建议处理上述警告以获得最佳体验'))
    console.log()
  }
}

/**
 * 导出内置检查项（供扩展使用）
 */
export { builtinChecks }
