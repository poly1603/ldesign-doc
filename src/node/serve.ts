/**
 * 预览服务器
 */

import { existsSync } from 'fs'
import polka from 'polka'
import sirv from 'sirv'
import pc from 'picocolors'
import * as logger from './logger'
import type { SiteConfig } from '../shared/types'
import { resolveConfig } from './config'

export interface ServeOptions {
  port?: number
  host?: string | boolean
  open?: boolean
}

/**
 * 尝试在指定端口启动服务器，如果端口被占用则尝试下一个
 */
async function tryStartServer(
  config: { outDir: string; base: string },
  startPort: number,
  maxAttempts: number = 10
): Promise<{ server: any; port: number }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPort = startPort + attempt

    try {
      const result = await new Promise<{ server: any; port: number }>((resolve, reject) => {
        const app = polka()

        // 静态文件服务
        app.use(
          config.base,
          sirv(config.outDir, {
            maxAge: 31536000,
            immutable: true,
            single: true,
            dev: false
          }) as never
        )

        const polkaInstance = app.listen(currentPort)
        const server = (polkaInstance as any).server

        if (server) {
          server.once('listening', () => {
            resolve({ server: polkaInstance, port: currentPort })
          })

          server.once('error', (err: NodeJS.ErrnoException) => {
            reject(err)
          })
        } else {
          // 如果没有 server，假设成功
          resolve({ server: polkaInstance, port: currentPort })
        }
      })

      return result
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        logger.printPortInUse(currentPort)
        continue
      }
      throw err
    }
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`)
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
  const { port: requestedPort = 4173, host = 'localhost', open = false } = options

  // 解析配置
  const config = await resolveConfig(root, 'build', 'production')

  // 检查构建输出是否存在
  if (!existsSync(config.outDir)) {
    console.error(pc.red(`Build output not found at ${config.outDir}`))
    console.log(pc.gray('Run `ldoc build` first to generate the production build.'))
    process.exit(1)
  }

  // 启动服务器（自动尝试其他端口）
  const { server: polkaInstance, port } = await tryStartServer(
    { outDir: config.outDir, base: config.base },
    requestedPort,
    10
  )

  const hostStr = host === true ? '0.0.0.0' : (host || 'localhost')
  const url = `http://${hostStr}:${port}${config.base}`

  logger.printServerInfo({
    type: 'preview',
    port,
    base: config.base,
    host: host === true ? '0.0.0.0' : undefined
  })

  // 自动打开浏览器
  if (open) {
    import('open').then((m) => m.default(url)).catch(() => { })
  }

  return {
    close: () => new Promise<void>((res) => {
      const server = (polkaInstance as any).server
      if (server) {
        server.close(() => res())
      } else {
        res()
      }
    }),
    port
  }
}
