/**
 * 预览服务器
 */

import { resolve } from 'path'
import { existsSync } from 'fs'
import polka from 'polka'
import sirv from 'sirv'
import compression from 'compression'
import pc from 'picocolors'
import type { SiteConfig } from '../shared/types'
import { resolveConfig } from './config'

export interface ServeOptions {
  port?: number
  host?: string | boolean
  open?: boolean
}

/**
 * 启动预览服务器
 */
export async function serve(
  root: string = process.cwd(),
  options: ServeOptions = {}
): Promise<{
  close: () => Promise<void>
  port: number
}> {
  const { port = 4173, host = 'localhost', open = false } = options

  // 解析配置
  const config = await resolveConfig(root, 'build', 'production')

  // 检查构建输出是否存在
  if (!existsSync(config.outDir)) {
    console.error(pc.red(`Build output not found at ${config.outDir}`))
    console.log(pc.gray('Run `ldoc build` first to generate the production build.'))
    process.exit(1)
  }

  // 创建服务器
  const app = polka()

  // 启用压缩
  app.use(compression() as never)

  // 静态文件服务
  app.use(
    config.base,
    sirv(config.outDir, {
      maxAge: 31536000, // 1 year
      immutable: true,
      single: true, // SPA fallback
      gzip: true,
      brotli: true
    }) as never
  )

  // 启动服务器
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      const hostStr = host === true ? '0.0.0.0' : (host || 'localhost')
      const url = `http://${hostStr}:${port}${config.base}`

      console.log()
      console.log(pc.green('  ✓ Production preview server running at:'))
      console.log()
      console.log(`    ${pc.cyan('Local:')}   ${pc.blue(url)}`)

      if (host === true) {
        console.log(`    ${pc.cyan('Network:')} ${pc.blue(`http://0.0.0.0:${port}${config.base}`)}`)
      }

      console.log()
      console.log(pc.gray('  press Ctrl+C to stop'))
      console.log()

      // 自动打开浏览器
      if (open) {
        import('open').then((m) => m.default(url)).catch(() => { })
      }

      resolve({
        close: () => new Promise((res) => {
          server.server?.close(() => res())
        }),
        port
      })
    })

    server.server?.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(pc.red(`Port ${port} is already in use.`))
        console.log(pc.gray(`Try using a different port with --port <port>`))
      }
      reject(err)
    })
  })
}
