
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'
import prompts from 'prompts'
import pc from 'picocolors'
import * as logger from './logger'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

interface UpgradeOptions {
  global?: boolean
}

export async function upgrade(options: UpgradeOptions = {}): Promise<void> {
  try {
    // 1. 获取当前版本
    const pkgPath = path.resolve(__dirname, '../../package.json')
    const pkg = require(pkgPath)
    const currentVersion = pkg.version

    logger.printInfo(`Current version: ${pc.cyan(currentVersion)}`)
    logger.printInfo('Fetching available versions...')

    // 2. 获取所有可用版本
    let versions: string[] = []
    try {
      const versionsJson = execSync('npm view @ldesign/doc versions --json', { encoding: 'utf-8' })
      versions = JSON.parse(versionsJson)
    } catch (e) {
      // 如果 JSON 解析失败，可能是只有一个版本，或者 npm 输出格式不同
      const output = execSync('npm view @ldesign/doc versions', { encoding: 'utf-8' })
      // 处理类似 [ '0.0.1', '0.0.2' ] 的输出
      const cleaned = output.replace(/'/g, '"')
      try {
        versions = JSON.parse(cleaned)
      } catch {
        // 还是失败，尝试简单的字符串分割（针对单行或多行输出）
        versions = output.split(/[\s,]+/).filter(v => v.match(/^\d+\.\d+\.\d+/))
      }
    }

    if (!versions || versions.length === 0) {
      logger.printError('Failed to fetch versions', 'No versions found')
      return
    }

    // 倒序排列，最新的在前面
    versions.reverse()
    const latestVersion = versions[0]

    if (currentVersion === latestVersion) {
      logger.printSuccess('Already up to date!')
      const { force } = await prompts({
        type: 'confirm',
        name: 'force',
        message: 'Do you want to reinstall/force update anyway?',
        initial: false
      })
      if (!force) return
    } else {
      logger.printInfo(`Latest version: ${pc.green(latestVersion)}`)
    }

    // 3. 选择版本
    const { version } = await prompts({
      type: 'select',
      name: 'version',
      message: 'Select version to install',
      choices: versions.map(v => ({
        title: v === currentVersion ? `${v} (current)` : v === latestVersion ? `${v} (latest)` : v,
        value: v
      })),
      initial: 0
    })

    if (!version) {
      console.log('Update cancelled')
      return
    }

    // 4. 检测包管理器和安装方式
    let pm = 'npm'
    let cmd = 'install'
    let args = [`@ldesign/doc@${version}`]
    let isGlobal = options.global

    // 检测本地是否有 package.json 且包含 @ldesign/doc
    const localPkgPath = path.resolve(process.cwd(), 'package.json')
    const hasLocalPkg = fs.existsSync(localPkgPath)
    let isLocalDep = false

    if (hasLocalPkg) {
      const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf-8'))
      const deps = { ...localPkg.dependencies, ...localPkg.devDependencies }
      if (deps['@ldesign/doc']) {
        isLocalDep = true
      }
    }

    // 如果指定了全局，或者不在本地依赖中，则询问或默认为全局
    if (!isGlobal && !isLocalDep) {
      const { scope } = await prompts({
        type: 'select',
        name: 'scope',
        message: 'Where to install?',
        choices: [
          { title: 'Global', value: 'global' },
          { title: 'Current Project', value: 'local' }
        ]
      })
      isGlobal = scope === 'global'
    }

    // 检测使用的包管理器 (简单检测 lock 文件)
    if (fs.existsSync(path.resolve(process.cwd(), 'pnpm-lock.yaml'))) {
      pm = 'pnpm'
      cmd = 'add'
    } else if (fs.existsSync(path.resolve(process.cwd(), 'yarn.lock'))) {
      pm = 'yarn'
      cmd = 'add'
    }

    if (isGlobal) {
      args.unshift('-g')
      // 全局安装通常使用 npm 或 pnpm
      // 如果检测到是 pnpm 环境但要全局安装，可能需要 pnpm add -g
    } else {
      // 本地安装，如果是开发依赖，加上 -D
      if (hasLocalPkg) {
        const localPkg = JSON.parse(fs.readFileSync(localPkgPath, 'utf-8'))
        if (localPkg.devDependencies && localPkg.devDependencies['@ldesign/doc']) {
          if (pm === 'npm' || pm === 'pnpm' || pm === 'yarn') {
            args.push('-D')
          }
        }
      }
    }

    const commandStr = `${pm} ${cmd} ${args.join(' ')}`

    logger.printInfo(`Running: ${commandStr}`)

    try {
      execSync(commandStr, { stdio: 'inherit' })
      logger.printSuccess(`Successfully updated to v${version}`)
    } catch (e) {
      logger.printError('Update failed', e instanceof Error ? e.message : String(e))
    }

  } catch (error) {
    logger.printError('Error checking updates', error instanceof Error ? error.message : String(error))
  }
}
