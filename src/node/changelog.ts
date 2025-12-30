/**
 * @module changelog
 * @description Changelog 更新日志生成器
 *
 * 功能:
 * - 从 Git 历史生成更新日志
 * - 支持 Conventional Commits 规范
 * - 自动分类 (feat, fix, docs, etc.)
 * - 生成 Markdown 格式
 *
 * @example
 * ```ts
 * import { generateChangelog } from '@ldesign/doc/node'
 *
 * const changelog = await generateChangelog({
 *   from: 'v1.0.0',
 *   to: 'HEAD',
 *   outputFile: './CHANGELOG.md'
 * })
 * ```
 */

import { execSync } from 'node:child_process'
import { writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

/**
 * Commit 类型定义
 */
export interface CommitType {
  /** 类型标识 */
  type: string
  /** 显示标题 */
  title: string
  /** Emoji 图标 */
  emoji: string
  /** 是否在 changelog 中显示 */
  visible: boolean
}

/**
 * 默认的 Commit 类型配置
 */
export const DEFAULT_COMMIT_TYPES: CommitType[] = [
  { type: 'feat', title: '✨ 新功能', emoji: '✨', visible: true },
  { type: 'fix', title: '🐛 Bug 修复', emoji: '🐛', visible: true },
  { type: 'perf', title: '⚡ 性能优化', emoji: '⚡', visible: true },
  { type: 'refactor', title: '♻️ 代码重构', emoji: '♻️', visible: true },
  { type: 'docs', title: '📝 文档更新', emoji: '📝', visible: true },
  { type: 'style', title: '💄 代码样式', emoji: '💄', visible: false },
  { type: 'test', title: '✅ 测试', emoji: '✅', visible: false },
  { type: 'build', title: '📦 构建', emoji: '📦', visible: false },
  { type: 'ci', title: '👷 CI', emoji: '👷', visible: false },
  { type: 'chore', title: '🔧 其他', emoji: '🔧', visible: false },
  { type: 'revert', title: '⏪ 回滚', emoji: '⏪', visible: true }
]

/**
 * 解析后的 Commit 信息
 */
export interface ParsedCommit {
  /** Commit Hash */
  hash: string
  /** 短 Hash */
  shortHash: string
  /** 类型 (feat, fix, etc.) */
  type: string
  /** 作用域 */
  scope?: string
  /** 主题/标题 */
  subject: string
  /** 完整消息 */
  body?: string
  /** 作者 */
  author: string
  /** 作者邮箱 */
  email: string
  /** 提交日期 */
  date: Date
  /** 是否是 Breaking Change */
  breaking: boolean
  /** Breaking Change 描述 */
  breakingNote?: string
  /** 关联的 Issue */
  issues: string[]
  /** 关联的 PR */
  prs: string[]
}

/**
 * 版本信息
 */
export interface VersionInfo {
  /** 版本号 */
  version: string
  /** 发布日期 */
  date: Date
  /** 提交列表 */
  commits: ParsedCommit[]
  /** 按类型分组的提交 */
  grouped: Record<string, ParsedCommit[]>
  /** Breaking Changes */
  breakingChanges: ParsedCommit[]
}

/**
 * Changelog 生成配置
 */
export interface ChangelogOptions {
  /** 起始 tag/commit (不包含) */
  from?: string
  /** 结束 tag/commit (包含) */
  to?: string
  /** 版本号 (用于标题) */
  version?: string
  /** 输出文件路径 */
  outputFile?: string
  /** 是否追加到现有文件 */
  append?: boolean
  /** Commit 类型配置 */
  types?: CommitType[]
  /** 仓库 URL (用于生成链接) */
  repoUrl?: string
  /** 是否包含作者信息 */
  includeAuthors?: boolean
  /** 是否包含 commit hash 链接 */
  includeLinks?: boolean
  /** 标题格式 */
  titleFormat?: string
  /** 日期格式 */
  dateFormat?: 'iso' | 'short' | 'long'
  /** 工作目录 */
  cwd?: string
}

/**
 * 解析单个 Commit 消息
 */
function parseCommitMessage(message: string): {
  type: string
  scope?: string
  subject: string
  breaking: boolean
} {
  // Conventional Commits 格式: type(scope)!: subject
  const regex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/
  const match = message.match(regex)

  if (match) {
    return {
      type: match[1],
      scope: match[2],
      subject: match[4],
      breaking: !!match[3]
    }
  }

  // 非标准格式，尝试提取类型
  const simpleRegex = /^(\w+):\s*(.+)$/
  const simpleMatch = message.match(simpleRegex)

  if (simpleMatch) {
    return {
      type: simpleMatch[1],
      subject: simpleMatch[2],
      breaking: false
    }
  }

  // 无法解析，归类为 other
  return {
    type: 'other',
    subject: message,
    breaking: false
  }
}

/**
 * 从 Commit 消息中提取 Issue 和 PR 引用
 */
function extractReferences(body: string): { issues: string[]; prs: string[] } {
  const issues: string[] = []
  const prs: string[] = []

  // 匹配 #123 格式的引用
  const refs = body.match(/#\d+/g) || []

  for (const ref of refs) {
    // 简单启发式：如果前面有 PR 相关词汇则认为是 PR
    if (/(?:pr|pull|merge)/i.test(body.slice(Math.max(0, body.indexOf(ref) - 20), body.indexOf(ref)))) {
      prs.push(ref)
    } else {
      issues.push(ref)
    }
  }

  return { issues: [...new Set(issues)], prs: [...new Set(prs)] }
}

/**
 * 检测 Breaking Change
 */
function detectBreakingChange(body: string): string | undefined {
  // 查找 BREAKING CHANGE: 或 BREAKING-CHANGE:
  const match = body.match(/BREAKING[- ]CHANGE[S]?:\s*(.+?)(?:\n\n|$)/i)
  return match ? match[1].trim() : undefined
}

/**
 * 获取 Git commits
 */
function getGitCommits(options: {
  from?: string
  to?: string
  cwd?: string
}): ParsedCommit[] {
  const { from, to = 'HEAD', cwd = process.cwd() } = options

  // Git log 格式: hash|shortHash|author|email|date|subject
  const format = '%H|%h|%an|%ae|%aI|%s'
  const range = from ? `${from}..${to}` : to

  let command = `git log ${range} --format="${format}" --no-merges`

  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    }).trim()

    if (!output) return []

    const commits: ParsedCommit[] = []

    for (const line of output.split('\n')) {
      const [hash, shortHash, author, email, date, subject] = line.split('|')

      // 获取完整的 commit body
      let body = ''
      try {
        body = execSync(`git log -1 ${hash} --format="%b"`, {
          cwd,
          encoding: 'utf-8'
        }).trim()
      } catch {
        // 忽略错误
      }

      const parsed = parseCommitMessage(subject)
      const refs = extractReferences(`${subject}\n${body}`)
      const breakingNote = parsed.breaking ? subject : detectBreakingChange(body)

      commits.push({
        hash,
        shortHash,
        type: parsed.type,
        scope: parsed.scope,
        subject: parsed.subject,
        body: body || undefined,
        author,
        email,
        date: new Date(date),
        breaking: parsed.breaking || !!breakingNote,
        breakingNote,
        issues: refs.issues,
        prs: refs.prs
      })
    }

    return commits
  } catch (error) {
    console.error('Failed to get git commits:', error)
    return []
  }
}

/**
 * 获取最新的 Git tag
 */
export function getLatestTag(cwd: string = process.cwd()): string | undefined {
  try {
    return execSync('git describe --tags --abbrev=0', {
      cwd,
      encoding: 'utf-8'
    }).trim()
  } catch {
    return undefined
  }
}

/**
 * 获取所有 Git tags
 */
export function getAllTags(cwd: string = process.cwd()): string[] {
  try {
    const output = execSync('git tag --sort=-creatordate', {
      cwd,
      encoding: 'utf-8'
    }).trim()
    return output ? output.split('\n') : []
  } catch {
    return []
  }
}

/**
 * 格式化日期
 */
function formatDate(date: Date, format: 'iso' | 'short' | 'long'): string {
  switch (format) {
    case 'iso':
      return date.toISOString().split('T')[0]
    case 'short':
      return date.toLocaleDateString('zh-CN')
    case 'long':
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    default:
      return date.toISOString().split('T')[0]
  }
}

/**
 * 生成 Markdown 格式的 Changelog
 */
function generateMarkdown(
  versionInfo: VersionInfo,
  options: ChangelogOptions
): string {
  const {
    types = DEFAULT_COMMIT_TYPES,
    repoUrl,
    includeAuthors = false,
    includeLinks = true,
    titleFormat = '## {version} ({date})',
    dateFormat = 'iso'
  } = options

  const lines: string[] = []

  // 版本标题
  const title = titleFormat
    .replace('{version}', versionInfo.version)
    .replace('{date}', formatDate(versionInfo.date, dateFormat))

  lines.push(title)
  lines.push('')

  // Breaking Changes
  if (versionInfo.breakingChanges.length > 0) {
    lines.push('### ⚠️ Breaking Changes')
    lines.push('')
    for (const commit of versionInfo.breakingChanges) {
      let line = `- ${commit.breakingNote || commit.subject}`
      if (includeLinks && repoUrl) {
        line += ` ([${commit.shortHash}](${repoUrl}/commit/${commit.hash}))`
      }
      lines.push(line)
    }
    lines.push('')
  }

  // 按类型分组的提交
  for (const typeConfig of types) {
    if (!typeConfig.visible) continue

    const commits = versionInfo.grouped[typeConfig.type]
    if (!commits || commits.length === 0) continue

    lines.push(`### ${typeConfig.title}`)
    lines.push('')

    for (const commit of commits) {
      let line = '- '

      // 作用域
      if (commit.scope) {
        line += `**${commit.scope}:** `
      }

      // 主题
      line += commit.subject

      // Issue/PR 引用
      const refs = [...commit.issues, ...commit.prs]
      if (refs.length > 0 && repoUrl) {
        const refLinks = refs.map(ref => {
          const num = ref.replace('#', '')
          return `[${ref}](${repoUrl}/issues/${num})`
        })
        line += ` (${refLinks.join(', ')})`
      }

      // Commit 链接
      if (includeLinks && repoUrl) {
        line += ` ([${commit.shortHash}](${repoUrl}/commit/${commit.hash}))`
      }

      // 作者
      if (includeAuthors) {
        line += ` - @${commit.author}`
      }

      lines.push(line)
    }

    lines.push('')
  }

  // 其他未分类的提交
  const otherCommits = versionInfo.grouped['other']
  if (otherCommits && otherCommits.length > 0) {
    lines.push('### 🔄 其他更改')
    lines.push('')
    for (const commit of otherCommits) {
      let line = `- ${commit.subject}`
      if (includeLinks && repoUrl) {
        line += ` ([${commit.shortHash}](${repoUrl}/commit/${commit.hash}))`
      }
      lines.push(line)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * 生成 Changelog
 *
 * @description 从 Git 历史生成 Markdown 格式的更新日志
 *
 * @example
 * ```ts
 * // 生成从最新 tag 到 HEAD 的 changelog
 * const changelog = await generateChangelog({
 *   outputFile: './CHANGELOG.md',
 *   repoUrl: 'https://github.com/user/repo'
 * })
 *
 * // 生成指定范围的 changelog
 * const changelog = await generateChangelog({
 *   from: 'v1.0.0',
 *   to: 'v2.0.0',
 *   version: '2.0.0'
 * })
 * ```
 */
export async function generateChangelog(options: ChangelogOptions = {}): Promise<string> {
  const {
    from = getLatestTag(options.cwd),
    to = 'HEAD',
    version = 'Unreleased',
    outputFile,
    append = true,
    types = DEFAULT_COMMIT_TYPES,
    cwd = process.cwd()
  } = options

  console.log(`📝 Generating changelog from ${from || 'beginning'} to ${to}...`)

  // 获取 commits
  const commits = getGitCommits({ from, to, cwd })

  if (commits.length === 0) {
    console.log('No commits found in the specified range.')
    return ''
  }

  console.log(`Found ${commits.length} commits`)

  // 按类型分组
  const grouped: Record<string, ParsedCommit[]> = {}
  const breakingChanges: ParsedCommit[] = []

  for (const commit of commits) {
    // 收集 Breaking Changes
    if (commit.breaking) {
      breakingChanges.push(commit)
    }

    // 按类型分组
    if (!grouped[commit.type]) {
      grouped[commit.type] = []
    }
    grouped[commit.type].push(commit)
  }

  // 创建版本信息
  const versionInfo: VersionInfo = {
    version,
    date: new Date(),
    commits,
    grouped,
    breakingChanges
  }

  // 生成 Markdown
  const markdown = generateMarkdown(versionInfo, options)

  // 写入文件
  if (outputFile) {
    if (append && existsSync(outputFile)) {
      const existing = await readFile(outputFile, 'utf-8')
      // 在标题后插入新内容
      const titleMatch = existing.match(/^#[^\n]+\n+/)
      if (titleMatch) {
        const newContent = existing.slice(0, titleMatch[0].length) +
          markdown + '\n' +
          existing.slice(titleMatch[0].length)
        await writeFile(outputFile, newContent, 'utf-8')
      } else {
        await writeFile(outputFile, markdown + '\n' + existing, 'utf-8')
      }
    } else {
      const header = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n'
      await writeFile(outputFile, header + markdown, 'utf-8')
    }
    console.log(`✅ Changelog written to ${outputFile}`)
  }

  return markdown
}

/**
 * 获取版本之间的 Commit 统计
 */
export function getCommitStats(
  from?: string,
  to: string = 'HEAD',
  cwd: string = process.cwd()
): {
  total: number
  byType: Record<string, number>
  authors: Record<string, number>
  breaking: number
} {
  const commits = getGitCommits({ from, to, cwd })

  const byType: Record<string, number> = {}
  const authors: Record<string, number> = {}
  let breaking = 0

  for (const commit of commits) {
    // 按类型统计
    byType[commit.type] = (byType[commit.type] || 0) + 1

    // 按作者统计
    authors[commit.author] = (authors[commit.author] || 0) + 1

    // Breaking changes
    if (commit.breaking) breaking++
  }

  return {
    total: commits.length,
    byType,
    authors,
    breaking
  }
}

export default {
  generateChangelog,
  getLatestTag,
  getAllTags,
  getCommitStats,
  DEFAULT_COMMIT_TYPES
}
