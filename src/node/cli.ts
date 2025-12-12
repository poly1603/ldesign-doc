/**
 * CLI 入口
 */

import { cac } from 'cac'
import pc from 'picocolors'

// 版本号 - 构建时会被替换或从包信息获取
const version = '1.0.0'

const cli = cac('ldoc')

// 版本信息
cli.version(version)

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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))
      console.log(pc.gray('  Starting development server...\n'))

      const ldoc = await createLDoc(root, {
        command: 'serve',
        mode: 'development'
      })

      await ldoc.serve()
    } catch (error) {
      console.error(pc.red('\n  Error starting dev server:\n'))
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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))

      await build(root)
    } catch (error) {
      console.error(pc.red('\n  Build failed:\n'))
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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))
      console.log(pc.gray('  Starting preview server...\n'))

      await serve(root, {
        port: options.port as number,
        host: options.host as string | boolean,
        open: options.open as boolean
      })
    } catch (error) {
      console.error(pc.red('\n  Preview failed:\n'))
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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))
      console.log(pc.gray('  Initializing documentation system...\n'))

      await initProject(root, options.template as string)

      console.log(pc.green('\n  ✓ Documentation system initialized successfully!'))
      console.log(pc.gray('\n  Next steps:'))
      console.log(pc.white('    1. pnpm install'))
      console.log(pc.white('    2. pnpm docs:dev'))
      console.log()
      console.log(pc.gray('  Edit your docs in .ldesign/docs/'))
      console.log(pc.gray('  Configure in .ldesign/doc.config.ts'))
      console.log()
    } catch (error) {
      console.error(pc.red('\n  Initialization failed:\n'))
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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))
      console.log(pc.gray(`  Creating ${type} project...\n`))

      await createProject({
        name,
        type: type as 'plugin' | 'theme',
        description: options.desc as string,
        author: options.author as string
      })
    } catch (error) {
      console.error(pc.red(`\n  Failed to create ${type}:\n`))
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

      console.log(pc.cyan('\n  LDoc') + pc.green(` v${version}`))

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
      console.error(pc.red('\n  Deployment failed:\n'))
      console.error(error)
      process.exit(1)
    }
  })

// 帮助信息
cli.help()

// 无效命令
cli.on('command:*', () => {
  console.error(pc.red('\n  Unknown command: ' + cli.args.join(' ')))
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
