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

        // 导出端点
        app.use('/__ldoc/export', async (req, res) => {
          try {
            const url = new URL(req.url || '/', `http://localhost:${currentPort}`)
            const format = (url.searchParams.get('format') || 'pdf').toLowerCase()
            const path = url.searchParams.get('path') || '/'

            // 构建目标 URL
            const normalizedPath = path.startsWith('/') ? path : `/${path}`
            const basePath = config.base.endsWith('/') ? config.base.slice(0, -1) : config.base
            const targetUrl = `http://localhost:${currentPort}${basePath}${normalizedPath}`

            // 动态导入导出功能
            let playwright: any
            try {
              const id = 'play' + 'wright'
              playwright = await import(/* @vite-ignore */ id)

              // 尝试启动浏览器，如果失败则提供友好的错误信息
              try {
                await playwright.chromium.launch({ headless: true })
              } catch (browserError: any) {
                res.statusCode = 500
                res.setHeader('content-type', 'application/json; charset=utf-8')
                res.end(JSON.stringify({
                  message: 'Playwright browsers not installed. Please run: npx playwright install chromium',
                  error: browserError.message,
                  setupCommand: 'npx playwright install chromium'
                }))
                return
              }
            } catch {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({
                message: 'Playwright is required for export functionality. Install it with: pnpm add -D playwright && npx playwright install chromium',
                setupCommands: [
                  'pnpm add -D playwright',
                  'npx playwright install chromium'
                ]
              }))
              return
            }

            const browser = await playwright.chromium.launch({ headless: true })
            try {
              const context = await browser.newContext()
              const page = await context.newPage()
              await page.goto(targetUrl, { waitUntil: 'networkidle' })

              // 等待 Mermaid/ECharts 渲染完成
              try {
                await page.waitForFunction(() => {
                  const nodes = Array.from(document.querySelectorAll('.mermaid, .ldoc-echarts')) as HTMLElement[]
                  if (nodes.length === 0) return true
                  return nodes.every(n => n.getAttribute('data-rendered') === 'true')
                }, { timeout: 30000 })
              } catch {
                // ignore
              }

              if (format === 'pdf') {
                // PDF 导出样式
                const pdfCss = `
@media print {
  @page {
    margin: 14mm 14mm 16mm 14mm;
  }

  html, body {
    background: #fff !important;
  }

  body {
    font-size: 13px !important;
    line-height: 1.65 !important;
    color: #111827 !important;
  }

  .vp-nav,
  .vp-sidebar,
  .vp-local-nav,
  .back-to-top,
  .vp-related-pages,
  .vp-social-share,
  .vp-breadcrumb,
  .vp-doc-edit,
  .vp-doc-pagination,
  .vp-subpage-toc,
  .skip-link,
  .ldoc-export-button {
    display: none !important;
  }

  .vp-doc {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }

  .vp-doc-content {
    padding: 0 !important;
    max-width: none !important;
  }

  .vp-doc-body {
    padding: 0 !important;
  }

  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
    break-inside: avoid;
  }

  pre, code, blockquote {
    page-break-inside: avoid;
  }

  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid;
  }

  table {
    page-break-inside: avoid;
  }

  a {
    color: #000 !important;
    text-decoration: underline !important;
  }

  .mermaid, .ldoc-echarts {
    page-break-inside: avoid;
    max-width: 100% !important;
  }
}
`

                await page.emulateMediaType('print')
                await page.addStyleTag({ content: pdfCss })

                const pdfBuffer = await page.pdf({
                  format: 'A4',
                  margin: {
                    top: '14mm',
                    right: '14mm',
                    bottom: '16mm',
                    left: '14mm'
                  },
                  printBackground: true,
                  scale: 0.98,
                  displayHeaderFooter: false,
                  preferCSSPageSize: false
                })

                res.statusCode = 200
                res.setHeader('content-type', 'application/pdf')
                res.setHeader('content-disposition', `attachment; filename="ldoc-export.pdf"`)
                res.setHeader('content-length', String(pdfBuffer.length))
                res.setHeader('accept-ranges', 'bytes')
                res.end(pdfBuffer)
                return
              } else if (format === 'html') {
                const html = await page.content()

                res.statusCode = 200
                res.setHeader('content-type', 'text/html; charset=utf-8')
                res.setHeader('content-disposition', `attachment; filename="ldoc-export.html"`)
                res.setHeader('content-length', String(Buffer.byteLength(html, 'utf-8')))
                res.end(html)
                return
              }

              res.statusCode = 400
              res.setHeader('content-type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ message: 'Unsupported format' }))
            } finally {
              await browser.close()
            }
          } catch (error: any) {
            console.error('Export error:', error)
            res.statusCode = 500
            res.setHeader('content-type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({
              message: 'Export failed',
              error: error.message || 'Unknown error'
            }))
          }
        })

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
