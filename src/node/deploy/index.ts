/**
 * LDoc 一键部署模块
 * 支持部署到常见的免费静态托管平台
 */

import pc from 'picocolors'
import { existsSync } from 'fs'
import { join } from 'path'
import type { SiteConfig, DeployConfig, DeployPlatform } from '../../shared/types'

// 重新导出类型供外部使用
export type { DeployConfig, DeployPlatform }

/**
 * 部署结果
 */
export interface DeployResult {
  success: boolean
  url?: string
  message?: string
  error?: Error
}

/**
 * 部署到指定平台
 */
export async function deploy(
  config: SiteConfig,
  options: {
    platform?: DeployPlatform
    preview?: boolean
  } = {}
): Promise<DeployResult> {
  const deployConfig = config.deploy

  if (!deployConfig) {
    return {
      success: false,
      message: '未配置部署信息，请在 doc.config.ts 中添加 deploy 配置'
    }
  }

  const platform = options.platform || deployConfig.platform
  // 使用实际的 outDir 配置，默认是 .ldesign/.doc-cache/dist
  const outDir = deployConfig.outDir || config.outDir

  // 检查构建目录是否存在
  if (!existsSync(outDir)) {
    console.log(pc.yellow('⚠️  构建目录不存在，正在执行构建...'))
    // 这里应该调用 build 函数，但为了避免循环依赖，我们返回错误提示
    return {
      success: false,
      message: `构建目录 ${outDir} 不存在，请先运行 ldoc build`
    }
  }

  console.log(pc.cyan(`\n🚀 正在部署到 ${platform}...\n`))

  try {
    let result: DeployResult

    switch (platform) {
      case 'netlify':
        result = await deployToNetlify(outDir, deployConfig.netlify, options.preview)
        break
      case 'vercel':
        result = await deployToVercel(outDir, deployConfig.vercel, options.preview)
        break
      case 'github-pages':
        result = await deployToGitHubPages(outDir, deployConfig.githubPages)
        break
      case 'cloudflare':
        result = await deployToCloudflare(outDir, deployConfig.cloudflare)
        break
      case 'surge':
        result = await deployToSurge(outDir, deployConfig.surge)
        break
      default:
        result = {
          success: false,
          message: `不支持的部署平台: ${platform}`
        }
    }

    if (result.success) {
      console.log(pc.green(`\n✅ 部署成功！`))
      if (result.url) {
        console.log(pc.cyan(`🌐 访问地址: ${result.url}\n`))
      }
    } else {
      console.log(pc.red(`\n❌ 部署失败: ${result.message}\n`))
    }

    return result
  } catch (error) {
    const err = error as Error
    console.log(pc.red(`\n❌ 部署出错: ${err.message}\n`))
    return {
      success: false,
      error: err,
      message: err.message
    }
  }
}

/**
 * 部署到 Netlify
 */
async function deployToNetlify(
  outDir: string,
  config?: DeployConfig['netlify'],
  preview?: boolean
): Promise<DeployResult> {
  const token = config?.token || process.env.NETLIFY_AUTH_TOKEN

  if (!token) {
    return {
      success: false,
      message: '未配置 Netlify Token，请设置环境变量 NETLIFY_AUTH_TOKEN 或在配置中提供 token'
    }
  }

  try {
    // 动态导入 netlify-cli 或使用 API
    const { execSync } = await import('child_process')

    // 检查是否安装了 netlify-cli
    try {
      execSync('netlify --version', { stdio: 'ignore' })
    } catch {
      console.log(pc.yellow('正在安装 netlify-cli...'))
      execSync('npm install -g netlify-cli', { stdio: 'inherit' })
    }

    // 构建部署命令
    let cmd = `netlify deploy --dir="${outDir}" --auth="${token}"`

    if (config?.siteId) {
      cmd += ` --site="${config.siteId}"`
    }

    if (config?.prod !== false && !preview) {
      cmd += ' --prod'
    }

    // 执行部署
    const output = execSync(cmd, { encoding: 'utf-8' })

    // 解析部署 URL
    const urlMatch = output.match(/Website URL:\s*(https?:\/\/[^\s]+)/i) ||
      output.match(/Unique Deploy URL:\s*(https?:\/\/[^\s]+)/i)

    return {
      success: true,
      url: urlMatch?.[1],
      message: '部署成功'
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      error: err,
      message: `Netlify 部署失败: ${err.message}`
    }
  }
}

/**
 * 部署到 Vercel
 */
async function deployToVercel(
  outDir: string,
  config?: DeployConfig['vercel'],
  preview?: boolean
): Promise<DeployResult> {
  const token = config?.token || process.env.VERCEL_TOKEN

  if (!token) {
    return {
      success: false,
      message: '未配置 Vercel Token，请设置环境变量 VERCEL_TOKEN 或在配置中提供 token'
    }
  }

  try {
    const { execSync } = await import('child_process')

    // 检查是否安装了 vercel-cli
    try {
      execSync('vercel --version', { stdio: 'ignore' })
    } catch {
      console.log(pc.yellow('正在安装 vercel...'))
      execSync('npm install -g vercel', { stdio: 'inherit' })
    }

    // 构建部署命令
    let cmd = `vercel "${outDir}" --token="${token}" --yes`

    if (config?.prod !== false && !preview) {
      cmd += ' --prod'
    }

    if (config?.projectName) {
      cmd += ` --name="${config.projectName}"`
    }

    // 执行部署
    const output = execSync(cmd, { encoding: 'utf-8' })

    // 解析部署 URL（Vercel 输出的最后一行通常是 URL）
    const lines = output.trim().split('\n')
    const url = lines[lines.length - 1]?.trim()

    return {
      success: true,
      url: url?.startsWith('http') ? url : undefined,
      message: '部署成功'
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      error: err,
      message: `Vercel 部署失败: ${err.message}`
    }
  }
}

/**
 * 部署到 GitHub Pages
 */
async function deployToGitHubPages(
  outDir: string,
  config?: DeployConfig['githubPages']
): Promise<DeployResult> {
  try {
    const { execSync } = await import('child_process')
    const { writeFileSync } = await import('fs')
    const { join: pathJoin } = await import('path')

    // 检查是否安装了 gh-pages
    try {
      execSync('npx gh-pages --version', { stdio: 'ignore' })
    } catch {
      console.log(pc.yellow('正在安装 gh-pages...'))
      execSync('npm install -g gh-pages', { stdio: 'inherit' })
    }

    // 如果配置了 CNAME
    if (config?.cname) {
      writeFileSync(pathJoin(outDir, 'CNAME'), config.cname)
    }

    // 添加 .nojekyll 文件
    writeFileSync(pathJoin(outDir, '.nojekyll'), '')

    // 构建部署命令
    let cmd = `npx gh-pages -d "${outDir}"`

    if (config?.branch) {
      cmd += ` -b "${config.branch}"`
    }

    if (config?.repo) {
      cmd += ` -r "https://github.com/${config.repo}.git"`
    }

    // 执行部署
    execSync(cmd, { stdio: 'inherit' })

    // 构建访问 URL
    let url: string | undefined
    if (config?.cname) {
      url = `https://${config.cname}`
    } else if (config?.repo) {
      const [username, repo] = config.repo.split('/')
      url = `https://${username}.github.io/${repo}/`
    }

    return {
      success: true,
      url,
      message: '部署成功'
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      error: err,
      message: `GitHub Pages 部署失败: ${err.message}`
    }
  }
}

/**
 * 部署到 Cloudflare Pages
 */
async function deployToCloudflare(
  outDir: string,
  config?: DeployConfig['cloudflare']
): Promise<DeployResult> {
  const accountId = config?.accountId || process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = config?.apiToken || process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !apiToken) {
    return {
      success: false,
      message: '未配置 Cloudflare 凭据，请设置环境变量 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN'
    }
  }

  if (!config?.projectName) {
    return {
      success: false,
      message: '未配置 Cloudflare Pages 项目名称'
    }
  }

  try {
    const { execSync } = await import('child_process')

    // 检查是否安装了 wrangler
    try {
      execSync('npx wrangler --version', { stdio: 'ignore' })
    } catch {
      console.log(pc.yellow('正在安装 wrangler...'))
      execSync('npm install -g wrangler', { stdio: 'inherit' })
    }

    // 构建部署命令
    const cmd = `npx wrangler pages deploy "${outDir}" --project-name="${config.projectName}"`

    // 设置环境变量并执行
    const env = {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_API_TOKEN: apiToken
    }

    const output = execSync(cmd, { encoding: 'utf-8', env })

    // 解析部署 URL
    const urlMatch = output.match(/(https:\/\/[^\s]+\.pages\.dev)/i)

    return {
      success: true,
      url: urlMatch?.[1],
      message: '部署成功'
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      error: err,
      message: `Cloudflare Pages 部署失败: ${err.message}`
    }
  }
}

/**
 * 部署到 Surge
 */
async function deployToSurge(
  outDir: string,
  config?: DeployConfig['surge']
): Promise<DeployResult> {
  if (!config?.domain) {
    return {
      success: false,
      message: '未配置 Surge 域名，请在配置中提供 domain (如: my-docs.surge.sh)'
    }
  }

  try {
    const { execSync } = await import('child_process')

    // 检查是否安装了 surge
    try {
      execSync('surge --version', { stdio: 'ignore' })
    } catch {
      console.log(pc.yellow('正在安装 surge...'))
      execSync('npm install -g surge', { stdio: 'inherit' })
    }

    // 构建部署命令
    let cmd = `surge "${outDir}" "${config.domain}"`

    // 如果配置了 token
    const token = config.token || process.env.SURGE_TOKEN
    if (token) {
      cmd += ` --token "${token}"`
    }

    // 执行部署
    execSync(cmd, { stdio: 'inherit' })

    return {
      success: true,
      url: `https://${config.domain}`,
      message: '部署成功'
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      error: err,
      message: `Surge 部署失败: ${err.message}`
    }
  }
}

/**
 * 获取所有支持的平台
 */
export function getSupportedPlatforms(): DeployPlatform[] {
  return ['netlify', 'vercel', 'github-pages', 'cloudflare', 'surge']
}

/**
 * 获取平台显示名称
 */
export function getPlatformDisplayName(platform: DeployPlatform): string {
  const names: Record<DeployPlatform, string> = {
    'netlify': 'Netlify',
    'vercel': 'Vercel',
    'github-pages': 'GitHub Pages',
    'cloudflare': 'Cloudflare Pages',
    'surge': 'Surge.sh'
  }
  return names[platform] || platform
}
