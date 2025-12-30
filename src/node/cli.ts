/**
 * CLI 入口
 */

import { cac } from 'cac'
import pc from 'picocolors'
import * as logger from './logger'

// 版本号 - 构建时会被替换或从包信息获取
const version = '0.1.0'

const cli = cac('ldoc')

// 版本信息
cli.version(version)

// version 命令
cli
  .command('version', 'Show version')
  .action(() => {
    logger.printBanner(true)
    console.log()
  })

// dev 命令
cli
  .command('[root]', 'Start development server')
  .alias('dev')
  .option('--port <port>', 'Server port', { default: 5173 })
  .option('--host [host]', 'Server host')
  .option('--open', 'Open browser on startup')
  .option('--force', 'Force re-optimize dependencies')
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { createLDoc } = await import('./createLDoc')

      logger.printBanner()
      logger.printCommandTitle('dev', 'Starting Development Server')

      const ldoc = await createLDoc(root, {
        command: 'serve',
        mode: 'development'
      })

      await ldoc.serve()
    } catch (error) {
      logger.printError('Error starting dev server', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// build 命令
cli
  .command('build [root]', 'Build for production')
  .option('--outDir <dir>', 'Output directory', { default: '.ldoc/dist' })
  .option('--minify', 'Minify output', { default: true })
  .option('--sourcemap', 'Generate source maps')
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { build } = await import('./build')

      logger.printBanner()

      await build(root)
    } catch (error) {
      logger.printError('Build failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// preview 命令
cli
  .command('preview [root]', 'Preview production build')
  .option('--port <port>', 'Server port', { default: 4173 })
  .option('--host [host]', 'Server host')
  .option('--open', 'Open browser on startup')
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { serve } = await import('./serve')

      logger.printBanner()
      logger.printCommandTitle('preview', 'Starting Preview Server')

      await serve(root, {
        port: options.port as number,
        host: options.host as string | boolean,
        open: options.open as boolean
      })
    } catch (error) {
      logger.printError('Preview failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// init 命令
cli
  .command('init [root]', 'Initialize documentation in an existing project')
  .option('--template <template>', 'Template to use', { default: 'default' })
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { initProject } = await import('./init')

      logger.printBanner()
      logger.printCommandTitle('init', 'Initializing Documentation')

      await initProject(root, options.template as string)

      logger.printInitComplete(root)
    } catch (error) {
      logger.printError('Initialization failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// create 命令 - 创建插件或主题项目
cli
  .command('create <type> <name>', 'Create a new LDoc plugin or theme project')
  .option('-d, --desc <description>', 'Project description')
  .option('-a, --author <author>', 'Author name')
  .action(async (type: string, name: string, options: Record<string, unknown>) => {
    try {
      if (type !== 'plugin' && type !== 'theme') {
        console.error(pc.red(`\n  Invalid type: ${type}`))
        console.error(pc.gray('  Valid types: plugin, theme'))
        process.exit(1)
      }

      const { createProject } = await import('./create')

      logger.printBanner()
      logger.printCommandTitle('create', `Creating ${type} project`)

      await createProject({
        name,
        type: type as 'plugin' | 'theme',
        description: options.desc as string,
        author: options.author as string
      })
    } catch (error) {
      logger.printError(`Failed to create ${type}`, error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// deploy 命令 - 一键部署到静态托管平台
cli
  .command('deploy [root]', 'Deploy to static hosting platform')
  .option('-p, --platform <platform>', 'Deploy platform (netlify, vercel, github-pages, cloudflare, surge)')
  .option('--preview', 'Preview deployment (not production)')
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { resolveConfig } = await import('./config')
      const { deploy } = await import('./deploy')

      logger.printBanner()
      logger.printCommandTitle('deploy', 'Deploying to hosting platform')

      // 加载配置
      const config = await resolveConfig(root, 'build', 'production')

      // 执行部署
      const result = await deploy(config, {
        platform: options.platform as any,
        preview: options.preview as boolean
      })

      if (!result.success) {
        process.exit(1)
      }
    } catch (error) {
      logger.printError('Deployment failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// upgrade 命令 - 更新 ldoc 版本
cli
  .command('upgrade', 'Upgrade ldoc to the latest version')
  .option('-g, --global', 'Upgrade global installation')
  .action(async (options: Record<string, unknown>) => {
    try {
      const { upgrade } = await import('./upgrade')

      logger.printBanner()
      logger.printCommandTitle('upgrade', 'Upgrading LDesign Doc')

      await upgrade({
        global: options.global as boolean
      })
    } catch (error) {
      logger.printError('Upgrade failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// new 命令 - 创建新页面
cli
  .command('new <type> [path]', 'Create a new documentation page')
  .option('--template <template>', 'Template to use (default, api, guide, tutorial, minimal)')
  .option('--title <title>', 'Page title')
  .option('--description <description>', 'Page description')
  .option('--tags <tags>', 'Comma-separated tags')
  .option('--list-templates', 'List available templates')
  .action(async (type: string, path: string | undefined, options: Record<string, unknown>) => {
    try {
      const { scaffoldPage, scaffoldPageInteractive, listTemplates } = await import('./scaffold')

      // List templates if requested
      if (options.listTemplates) {
        listTemplates()
        return
      }

      // Only support 'page' type for now
      if (type !== 'page') {
        console.error(pc.red(`\n  Invalid type: ${type}`))
        console.error(pc.gray('  Valid types: page'))
        console.error(pc.gray('  Example: ldoc new page my-page.md'))
        process.exit(1)
      }

      logger.printBanner()

      // Interactive mode if no path provided
      if (!path) {
        await scaffoldPageInteractive(process.cwd())
        return
      }

      // Non-interactive mode
      const tags = options.tags
        ? String(options.tags)
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
        : undefined

      const result = await scaffoldPage(process.cwd(), {
        path,
        template: options.template as any,
        title: options.title as string,
        description: options.description as string,
        tags
      })

      console.log()
      console.log(pc.green('✔ Page created successfully!'))
      console.log(pc.gray(`  File: ${result.filePath}`))
      console.log()
    } catch (error) {
      logger.printError('Failed to create page', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// lint 命令 - 检查文档质量
cli
  .command('lint [root]', 'Check documentation for issues')
  .option('--no-broken-links', 'Skip broken link checks')
  .option('--no-spelling', 'Skip spelling checks')
  .option('--no-style', 'Skip style checks')
  .option('--dictionary <words>', 'Custom dictionary (comma-separated)')
  .option('--max-line-length <length>', 'Maximum line length', { default: 120 })
  .option('--output <file>', 'Output report to file')
  .action(async (root: string = '.', options: Record<string, unknown>) => {
    try {
      const { resolveConfig } = await import('./config')
      const { scanPages } = await import('./pages')
      const { lintDocumentation, generateLintSummary } = await import('./linter')
      const { writeFileSync } = await import('fs')

      logger.printBanner()
      logger.printCommandTitle('lint', 'Checking Documentation')

      // Load config
      const config = await resolveConfig(root, 'build', 'production')

      // Scan pages
      console.log(pc.gray('  Scanning pages...'))
      const pages = await scanPages(config)
      console.log(pc.gray(`  Found ${pages.length} pages\n`))

      // Parse custom dictionary
      const customDictionary = options.dictionary
        ? String(options.dictionary)
          .split(',')
          .map(w => w.trim())
          .filter(w => w.length > 0)
        : []

      // Run linter
      console.log(pc.gray('  Running checks...'))
      const report = await lintDocumentation(pages, {
        checkBrokenLinks: options.brokenLinks !== false,
        checkSpelling: options.spelling !== false,
        checkStyle: options.style !== false,
        customDictionary,
        styleRules: {
          maxLineLength: options.maxLineLength as number
        }
      })

      // Generate summary
      const summary = generateLintSummary(report)

      // Output to file if requested
      if (options.output) {
        writeFileSync(options.output as string, summary, 'utf-8')
        console.log(pc.green(`\n✔ Report saved to ${options.output}`))
      }

      // Print summary
      console.log()
      console.log(summary)
      console.log()

      // Exit with error code if issues found
      if (report.totalIssues > 0) {
        console.log(pc.yellow(`⚠ Found ${report.totalIssues} issue(s)`))
        process.exit(1)
      } else {
        console.log(pc.green('✔ No issues found!'))
      }
    } catch (error) {
      logger.printError('Lint failed', error instanceof Error ? error.message : String(error))
      console.error(error)
      process.exit(1)
    }
  })

// 帮助信息
cli.help()

// 无效命令
cli.on('command:*', () => {
  logger.printError('Unknown command: ' + cli.args.join(' '))
  cli.outputHelp()
  process.exit(1)
})

// 解析命令行参数
export function run(): void {
  cli.parse()
}

// 直接运行
export { cli }

// 作为入口点
run()
