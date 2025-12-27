/**
 * 贡献者显示属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 16: Contributor display
 * Validates: Requirements 4.5
 */

import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { extractContributors } from './index'
import type { Contributor, ContributorConfig } from './index'

// Helper function to create a properly typed execSync mock
function createExecSyncMock(returnValue: string) {
  return vi.fn((_command: string, _options?: { cwd?: string; encoding?: string }) => returnValue)
}

// ============== 自定义生成器 ==============

/**
 * 生成贡献者名称（确保有效且符合实际）
 * 生成类似真实姓名的字符串，只包含字母和空格
 */
const contributorNameArb = fc.oneof(
  fc.constant('John Doe'),
  fc.constant('Jane Smith'),
  fc.constant('Alice Johnson'),
  fc.constant('Bob Wilson'),
  // 生成更真实的姓名：字母和空格
  fc.tuple(
    fc.string({ minLength: 2, maxLength: 10 }).filter(s => /^[A-Za-z]+$/.test(s)),
    fc.string({ minLength: 2, maxLength: 10 }).filter(s => /^[A-Za-z]+$/.test(s))
  ).map(([first, last]) => `${first} ${last}`)
)

/**
 * 生成邮箱地址（确保足够的多样性和唯一性）
 */
const emailArb = fc.tuple(
  fc.string({ minLength: 5, maxLength: 15 }).filter(s => s.length > 0 && /^[a-z0-9]+$/.test(s)),
  fc.constantFrom('example.com', 'test.com', 'mail.com', 'email.com', 'domain.com')
).map(([local, domain]) => `${local}@${domain}`)

/**
 * 生成 Unix 时间戳
 */
const unixTimestampArb = fc
  .integer({ min: 1577836800, max: 1735689600 }) // 2020-01-01 to 2025-01-01
  .map((ts) => ts.toString())

/**
 * 生成 Git 日志行
 */
const gitLogLineArb = fc
  .tuple(contributorNameArb, emailArb, unixTimestampArb)
  .map(([name, email, timestamp]) => `${name}|${email}|${timestamp}`)

/**
 * 生成 Git 日志输出
 */
const gitLogOutputArb = fc
  .array(gitLogLineArb, { minLength: 1, maxLength: 20 })
  .map((lines) => lines.join('\n') + '\n')

/**
 * 生成文件路径
 */
const filePathArb = fc.oneof(
  fc.constant('README.md'),
  fc.constant('src/index.ts'),
  fc.constant('docs/guide.md'),
  fc.webPath()
    .map((p) => p.replace(/^\//, ''))
    .filter((p) => p.length > 0) // 确保路径不为空
)

/**
 * 生成贡献者配置
 */
const contributorConfigArb: fc.Arbitrary<ContributorConfig> = fc.record({
  enabled: fc.constant(true),
  mode: fc.option(fc.constantFrom('avatars', 'list', 'detailed'), { nil: undefined }),
  maxCount: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
  showStats: fc.option(fc.boolean(), { nil: undefined }),
  repoPath: fc.option(fc.constant(process.cwd()), { nil: undefined })
})

/**
 * 生成贡献者对象
 */
const contributorArb: fc.Arbitrary<Contributor> = fc.record({
  name: contributorNameArb,
  email: emailArb,
  avatar: fc.option(fc.webUrl(), { nil: undefined }),
  commits: fc.option(fc.integer({ min: 1, max: 100 }), { nil: undefined }),
  lastCommit: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date() }).map((d) => d.toISOString()),
    { nil: undefined }
  )
})

// ============== 属性测试 ==============

describe('Feedback Plugin - Contributor Display', () => {
  /**
   * Property 16: Contributor display
   * For any page with contributor metadata, the rendered page SHALL display
   * the contributor information.
   */
  it('Property 16: extracts contributors from git history correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        filePathArb,
        gitLogOutputArb,
        contributorConfigArb,
        async (filePath, gitLogOutput, config) => {
          // Create mock dependencies with proper typing
          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          // Extract contributors with mocked dependencies
          const contributors = await extractContributors(filePath, config, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          // 验证返回的是数组
          if (!Array.isArray(contributors)) {
            return false
          }

          // 解析原始 git log 来计算预期的贡献者数量（考虑去重和过滤）
          const lines = gitLogOutput.trim().split('\n').filter(Boolean)
          const validEmails = new Set<string>()

          for (const line of lines) {
            const parts = line.split('|')
            if (parts.length === 3) {
              const [name, email, timestamp] = parts
              // 只计算有效的条目
              if (name && name.trim() && email && email.trim() && !isNaN(parseInt(timestamp))) {
                validEmails.add(email.toLowerCase().trim())
              }
            }
          }

          const expectedCount = config.maxCount
            ? Math.min(validEmails.size, config.maxCount)
            : validEmails.size

          // 验证贡献者数量符合预期
          if (contributors.length !== expectedCount) {
            return false
          }

          // 验证每个贡献者都有必需的字段
          for (const contributor of contributors) {
            if (!contributor.name || typeof contributor.name !== 'string' || contributor.name.length === 0) {
              return false
            }

            if (!contributor.email || typeof contributor.email !== 'string' || contributor.email.length === 0) {
              return false
            }

            // 验证头像 URL 格式
            if (contributor.avatar && !contributor.avatar.includes('gravatar.com')) {
              return false
            }

            // 验证提交次数
            if (contributor.commits !== undefined && contributor.commits <= 0) {
              return false
            }

            // 验证最后提交时间格式
            if (contributor.lastCommit) {
              try {
                new Date(contributor.lastCommit)
              } catch {
                return false
              }
            }
          }

          // 验证贡献者按提交次数排序（降序）
          for (let i = 0; i < contributors.length - 1; i++) {
            const current = contributors[i].commits || 0
            const next = contributors[i + 1].commits || 0
            if (current < next) {
              return false
            }
          }

          // 验证 maxCount 限制
          if (config.maxCount && contributors.length > config.maxCount) {
            return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：贡献者去重
   * Multiple commits from the same email SHALL result in a single contributor entry.
   */
  it('deduplicates contributors by email address', async () => {
    await fc.assert(
      fc.asyncProperty(
        contributorNameArb, // 名称已经保证有效
        emailArb,
        fc.integer({ min: 2, max: 10 }),
        async (name, email, commitCount) => {
          // 生成多个相同邮箱的提交
          const timestamps = Array.from({ length: commitCount }, (_, i) =>
            (1577836800 + i * 86400).toString()
          )
          const gitLogOutput = timestamps
            .map((ts) => `${name}|${email}|${ts}`)
            .join('\n') + '\n'

          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          const contributors = await extractContributors('test.md', {
            enabled: true
          }, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          // 应该只有一个贡献者
          if (contributors.length !== 1) {
            return false
          }

          // 验证提交次数正确累加
          if (contributors[0].commits !== commitCount) {
            return false
          }

          // 验证邮箱正确
          if (contributors[0].email !== email) {
            return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：最后提交时间
   * The lastCommit field SHALL contain the most recent commit timestamp.
   */
  it('tracks the most recent commit timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        contributorNameArb, // 名称已经保证有效
        emailArb,
        fc.array(unixTimestampArb, { minLength: 2, maxLength: 10 }),
        async (name, email, timestamps) => {
          // 打乱时间戳顺序
          const shuffled = [...timestamps].sort(() => Math.random() - 0.5)
          const gitLogOutput = shuffled
            .map((ts) => `${name}|${email}|${ts}`)
            .join('\n') + '\n'

          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          const contributors = await extractContributors('test.md', {
            enabled: true
          }, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          if (contributors.length !== 1) {
            return false
          }

          // 找出最新的时间戳
          const maxTimestamp = Math.max(...timestamps.map((ts) => parseInt(ts)))
          const expectedDate = new Date(maxTimestamp * 1000).toISOString()

          // 验证最后提交时间是最新的
          if (contributors[0].lastCommit !== expectedDate) {
            return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：贡献者排序
   * Contributors SHALL be sorted by commit count in descending order.
   */
  it('sorts contributors by commit count descending', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.tuple(contributorNameArb, emailArb, fc.integer({ min: 1, max: 20 })),
          { minLength: 2, maxLength: 5 }
        ).map((contributors) => {
          // Ensure unique emails by appending index
          return contributors.map(([name, email, commits], i) => [name, `${i}-${email}`, commits] as [string, string, number])
        }),
        async (contributorData) => {
          // 为每个贡献者生成对应数量的提交
          const gitLogLines: string[] = []
          for (const [name, email, commitCount] of contributorData) {
            for (let i = 0; i < commitCount; i++) {
              const timestamp = (1577836800 + i * 86400).toString()
              gitLogLines.push(`${name}|${email}|${timestamp}`)
            }
          }

          const gitLogOutput = gitLogLines.join('\n') + '\n'
          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          const contributors = await extractContributors('test.md', {
            enabled: true
          }, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          // 验证排序
          for (let i = 0; i < contributors.length - 1; i++) {
            const currentCommits = contributors[i].commits || 0
            const nextCommits = contributors[i + 1].commits || 0
            if (currentCommits < nextCommits) {
              return false
            }
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * 额外测试：maxCount 限制
   * When maxCount is specified, only the top N contributors SHALL be returned.
   */
  it('respects maxCount configuration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.tuple(contributorNameArb, emailArb),
          { minLength: 5, maxLength: 15 }
        ).map((contributors) => {
          // Ensure unique emails by appending index
          return contributors.map(([name, email], i) => [name, `${i}-${email}`] as [string, string])
        }),
        fc.integer({ min: 1, max: 5 }),
        async (contributorData, maxCount) => {
          // 为每个贡献者生成一个提交
          const gitLogOutput = contributorData
            .map(([name, email], i) => `${name}|${email}|${1577836800 + i}`)
            .join('\n') + '\n'

          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          const contributors = await extractContributors('test.md', {
            enabled: true,
            maxCount
          }, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          // 验证数量不超过 maxCount
          if (contributors.length > maxCount) {
            return false
          }

          // 验证返回的是前 N 个（按提交次数）
          if (contributors.length !== Math.min(maxCount, contributorData.length)) {
            return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：Gravatar 头像生成
   * Each contributor SHALL have a Gravatar avatar URL based on their email.
   */
  it('generates Gravatar avatar URLs', async () => {
    await fc.assert(
      fc.asyncProperty(
        contributorNameArb, // 名称已经保证有效
        emailArb,
        async (name, email) => {
          const gitLogOutput = `${name}|${email}|1577836800\n`
          const execSyncMock = createExecSyncMock(gitLogOutput)
          const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

          const contributors = await extractContributors('test.md', {
            enabled: true
          }, {
            execSync: execSyncMock,
            pathJoin: pathJoinMock
          })

          // Verify mock was called
          if (!execSyncMock.mock.calls.length) {
            return false
          }

          if (contributors.length !== 1) {
            return false
          }

          // 验证头像 URL 格式
          if (!contributors[0].avatar) {
            return false
          }
          if (!contributors[0].avatar.includes('gravatar.com/avatar/')) {
            return false
          }
          if (!contributors[0].avatar.includes('?d=identicon')) {
            return false
          }

          // 验证 URL 包含 MD5 哈希（32 个十六进制字符）
          const match = contributors[0].avatar.match(/avatar\/([a-f0-9]{32})/)
          if (!match) {
            return false
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：错误处理
   * When git command fails, the function SHALL return an empty array.
   */
  it('handles git command failures gracefully', async () => {
    // Mock execSync to throw an error
    const execSyncMock = vi.fn((_command: string, _options?: { cwd?: string; encoding?: string }) => {
      throw new Error('Git command failed')
    })
    const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

    const contributors = await extractContributors('nonexistent.md', {
      enabled: true
    }, {
      execSync: execSyncMock,
      pathJoin: pathJoinMock
    })

    // 应该返回空数组而不是抛出错误
    expect(Array.isArray(contributors)).toBe(true)
    expect(contributors.length).toBe(0)
  })

  /**
   * 额外测试：空 Git 历史
   * When a file has no git history, the function SHALL return an empty array.
   */
  it('handles files with no git history', async () => {
    // Mock execSync to return empty output
    const execSyncMock = createExecSyncMock('')
    const pathJoinMock = vi.fn((...args: string[]) => args.join('/'))

    const contributors = await extractContributors('new-file.md', {
      enabled: true
    }, {
      execSync: execSyncMock,
      pathJoin: pathJoinMock
    })

    expect(Array.isArray(contributors)).toBe(true)
    expect(contributors.length).toBe(0)
  })
})
