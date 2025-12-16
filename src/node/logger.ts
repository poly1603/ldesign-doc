/**
 * CLI 日志输出工具 - 统一美观的控制台输出
 */

import pc from 'picocolors'

const version = '0.1.0'

// 品牌色彩
const brand = {
  primary: pc.cyan,
  success: pc.green,
  warning: pc.yellow,
  error: pc.red,
  info: pc.blue,
  dim: pc.gray,
  bold: pc.bold,
  white: pc.white
}

// Unicode 图标
const icons = {
  logo: '◆',
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  arrow: '→',
  dot: '●',
  star: '★',
  rocket: '🚀',
  package: '📦',
  folder: '📁',
  file: '📄',
  link: '🔗',
  time: '⏱',
  server: '🌐',
  build: '🔨',
  preview: '👁'
}

// 绘制横线
function line(char: string = '─', length: number = 50): string {
  return char.repeat(length)
}

// ASCII Art Logo
function getLogo(): string {
  return `
  ${brand.primary('╔═══════════════════════════════════════════╗')}
  ${brand.primary('║')}                                           ${brand.primary('║')}
  ${brand.primary('║')}    ${brand.bold(brand.primary('L'))}${brand.white('Design')} ${brand.dim('Doc')}  ${brand.success(`v${version}`)}              ${brand.primary('║')}
  ${brand.primary('║')}    ${brand.dim('Modern Documentation Framework')}         ${brand.primary('║')}
  ${brand.primary('║')}                                           ${brand.primary('║')}
  ${brand.primary('╚═══════════════════════════════════════════╝')}`
}

// 简洁 Logo
function getCompactLogo(): string {
  return `
  ${brand.primary(icons.logo)} ${brand.bold(brand.primary('LDoc'))} ${brand.success(`v${version}`)}`
}

// 打印 Banner
export function printBanner(compact: boolean = false): void {
  console.log(compact ? getCompactLogo() : getLogo())
  console.log()
}

// 打印命令标题
export function printCommandTitle(command: string, description: string): void {
  const icon = command === 'dev' ? icons.rocket
    : command === 'build' ? icons.build
      : command === 'preview' ? icons.preview
        : icons.star

  console.log(`  ${icon} ${brand.bold(brand.white(description))}`)
  console.log(`  ${brand.dim(line('─', 45))}`)
  console.log()
}

// 打印服务器信息
export function printServerInfo(options: {
  type: 'dev' | 'preview'
  port: number
  base?: string
  host?: string
}): void {
  const { type, port, base = '/', host } = options
  const localUrl = `http://localhost:${port}${base}`
  const networkUrl = host ? `http://${host}:${port}${base}` : `http://0.0.0.0:${port}${base}`

  const typeLabel = type === 'dev' ? 'Development' : 'Preview'

  console.log()
  console.log(`  ${brand.success(icons.success)} ${brand.bold(brand.success(`${typeLabel} server running`))}`)
  console.log()
  console.log(`  ${brand.dim('┌─────────────────────────────────────────┐')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.dim('Local:')}    ${brand.info(localUrl)}${' '.repeat(Math.max(0, 24 - localUrl.length))}${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.dim('Network:')}  ${brand.info(networkUrl)}${' '.repeat(Math.max(0, 24 - networkUrl.length))}${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('└─────────────────────────────────────────┘')}`)
  console.log()
  console.log(`  ${brand.dim('press')} ${brand.white('h')} ${brand.dim('to show help')}`)
  console.log()
}

// 打印构建开始
export function printBuildStart(): void {
  console.log()
  console.log(`  ${icons.build} ${brand.bold(brand.primary('Building for production...'))}`)
  console.log(`  ${brand.dim(line('─', 45))}`)
  console.log()
}

// 打印构建步骤
export function printBuildStep(step: string, detail?: string): void {
  const detailStr = detail ? brand.dim(` (${detail})`) : ''
  console.log(`  ${brand.dim(icons.arrow)} ${brand.white(step)}${detailStr}`)
}

// 打印构建完成
export function printBuildComplete(duration: number, outDir: string): void {
  console.log()
  console.log(`  ${brand.dim('┌─────────────────────────────────────────┐')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.success(icons.success)} ${brand.bold(brand.success('Build completed!'))}                  ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.dim(icons.time + ' Time:')}    ${brand.white(duration + 'ms')}${' '.repeat(Math.max(0, 22 - String(duration).length))}${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.dim(icons.folder + ' Output:')}  ${brand.info(outDir.length > 18 ? '...' + outDir.slice(-15) : outDir)}${' '.repeat(Math.max(0, 22 - Math.min(outDir.length, 18)))}${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('└─────────────────────────────────────────┘')}`)
  console.log()
  console.log(`  ${brand.dim('Run')} ${brand.primary('ldoc preview')} ${brand.dim('to preview the build')}`)
  console.log()
}

// 打印进度条
export function printProgress(current: number, total: number, label: string): void {
  const width = 30
  const percent = Math.round((current / total) * 100)
  const filled = Math.round((current / total) * width)
  const empty = width - filled

  const bar = brand.primary('█'.repeat(filled)) + brand.dim('░'.repeat(empty))
  process.stdout.write(`\r  ${bar} ${brand.dim(percent + '%')} ${brand.dim(label)}`)

  if (current === total) {
    console.log()
  }
}

// 打印错误
export function printError(title: string, message?: string): void {
  console.log()
  console.log(`  ${brand.error(icons.error)} ${brand.bold(brand.error(title))}`)
  if (message) {
    console.log(`  ${brand.dim(message)}`)
  }
  console.log()
}

// 打印警告
export function printWarning(message: string): void {
  console.log(`  ${brand.warning(icons.warning)} ${brand.warning(message)}`)
}

// 打印信息
export function printInfo(message: string): void {
  console.log(`  ${brand.info(icons.info)} ${message}`)
}

// 打印成功
export function printSuccess(message: string): void {
  console.log(`  ${brand.success(icons.success)} ${brand.success(message)}`)
}

// 打印步骤列表
export function printSteps(title: string, steps: string[]): void {
  console.log()
  console.log(`  ${brand.bold(brand.white(title))}`)
  console.log()
  steps.forEach((step, index) => {
    console.log(`  ${brand.dim((index + 1) + '.')} ${brand.white(step)}`)
  })
  console.log()
}

// 打印键值对列表
export function printKeyValues(items: Array<{ key: string; value: string; icon?: string }>): void {
  const maxKeyLength = Math.max(...items.map(item => item.key.length))

  items.forEach(item => {
    const icon = item.icon ? item.icon + ' ' : '  '
    const padding = ' '.repeat(maxKeyLength - item.key.length)
    console.log(`  ${brand.dim(icon)}${brand.dim(item.key + ':')}${padding} ${brand.white(item.value)}`)
  })
}

// 打印初始化完成
export function printInitComplete(root: string): void {
  console.log()
  console.log(`  ${brand.dim('┌─────────────────────────────────────────┐')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}  ${brand.success(icons.success)} ${brand.bold(brand.success('Initialized successfully!'))}          ${brand.dim('│')}`)
  console.log(`  ${brand.dim('│')}                                         ${brand.dim('│')}`)
  console.log(`  ${brand.dim('└─────────────────────────────────────────┘')}`)
  console.log()
  console.log(`  ${brand.bold(brand.white('Next steps:'))}`)
  console.log()
  console.log(`  ${brand.dim('1.')} ${brand.primary('pnpm install')}`)
  console.log(`  ${brand.dim('2.')} ${brand.primary('pnpm docs:dev')}`)
  console.log()
  console.log(`  ${brand.dim(icons.folder)} Edit docs in ${brand.info('.ldesign/docs/')}`)
  console.log(`  ${brand.dim(icons.file)} Configure in ${brand.info('.ldesign/doc.config.ts')}`)
  console.log()
}

// 打印端口占用提示
export function printPortInUse(port: number): void {
  console.log(`  ${brand.warning(icons.warning)} Port ${brand.white(String(port))} is in use, trying another...`)
}

// 打印 HMR 更新信息
export function printHMRUpdate(type: 'config' | 'markdown' | 'style', file?: string): void {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const typeColors = {
    config: brand.primary,
    markdown: brand.success,
    style: brand.info
  }

  const typeLabels = {
    config: '⚙️  config',
    markdown: '📄 markdown',
    style: '🎨 style'
  }

  const color = typeColors[type]
  const label = typeLabels[type]
  const fileInfo = file ? ` ${brand.dim(file)}` : ''

  console.log(`  ${brand.dim(time)} ${color(icons.arrow)} ${color(label)}${fileInfo}`)
}

// 打印配置重载状态
export function printConfigReload(status: 'start' | 'success' | 'error', error?: string): void {
  if (status === 'start') {
    console.log()
    console.log(`  ${brand.primary('⚡')} ${brand.bold(brand.primary('Config changed, hot reloading...'))}`)
  } else if (status === 'success') {
    console.log(`  ${brand.success(icons.success)} ${brand.success('Config reloaded successfully')}`)
    console.log()
  } else if (status === 'error') {
    console.log(`  ${brand.error(icons.error)} ${brand.error('Failed to reload config')}`)
    if (error) {
      console.log(`  ${brand.dim(error)}`)
    }
    console.log(`  ${brand.warning(icons.warning)} ${brand.warning('Falling back to server restart...')}`)
    console.log()
  }
}

// 打印分隔线
export function printDivider(): void {
  console.log(`  ${brand.dim(line('─', 45))}`)
}

// 打印空行
export function printNewLine(count: number = 1): void {
  for (let i = 0; i < count; i++) {
    console.log()
  }
}

// 导出品牌色彩和图标
export { brand, icons }
