/**
 * 反馈插件 - 支持文档反馈收集和贡献者信息显示
 * 
 * 功能：
 * - "是否有帮助" 反馈组件
 * - 评分系统
 * - 反馈表单
 * - 内联建议
 * - 贡献者信息显示
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, SiteConfig, PageData } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * "是否有帮助" 配置
 */
export interface HelpfulConfig {
  /** 问题文本 */
  question?: string
  /** "是" 按钮文本 */
  yesText?: string
  /** "否" 按钮文本 */
  noText?: string
  /** 后续反馈配置 */
  followUp?: {
    /** 是否启用 */
    enabled: boolean
    /** 输入框占位符 */
    placeholder?: string
  }
}

/**
 * 评分配置
 */
export interface RatingConfig {
  /** 最大星级数 */
  maxStars?: number
  /** 星级标签 */
  labels?: string[]
}

/**
 * 表单字段
 */
export interface FormField {
  /** 字段名称 */
  name: string
  /** 字段类型 */
  type: 'text' | 'textarea' | 'select' | 'email'
  /** 字段标签 */
  label: string
  /** 是否必填 */
  required?: boolean
  /** 选项（用于 select 类型） */
  options?: string[]
}

/**
 * 反馈表单配置
 */
export interface FormConfig {
  /** 表单字段 */
  fields: FormField[]
  /** 提交按钮文本 */
  submitText?: string
}

/**
 * 内联建议配置
 */
export interface InlineConfig {
  /** 是否启用 */
  enabled: boolean
  /** 按钮文本 */
  buttonText?: string
}

/**
 * 反馈存储配置
 */
export interface FeedbackStorageConfig {
  /** 存储类型 */
  type: 'api' | 'github' | 'local'
  /** API 端点（当 type 为 'api' 时） */
  endpoint?: string
  /** GitHub 仓库（当 type 为 'github' 时，格式：owner/repo） */
  githubRepo?: string
  /** GitHub Token（可选，用于私有仓库） */
  githubToken?: string
}

/**
 * 贡献者配置
 */
export interface ContributorConfig {
  /** 是否启用 */
  enabled: boolean
  /** 显示模式 */
  mode?: 'avatars' | 'list' | 'detailed'
  /** 最大显示数量 */
  maxCount?: number
  /** 是否显示贡献统计 */
  showStats?: boolean
  /** Git 仓库路径（默认为当前目录） */
  repoPath?: string
}

/**
 * 反馈插件选项
 */
export interface FeedbackOptions {
  /** 反馈类型 */
  type: 'helpful' | 'rating' | 'form' | 'inline'

  /** "是否有帮助" 配置 */
  helpful?: HelpfulConfig

  /** 评分配置 */
  rating?: RatingConfig

  /** 反馈表单配置 */
  form?: FormConfig

  /** 内联建议配置 */
  inline?: InlineConfig

  /** 反馈存储配置 */
  storage: FeedbackStorageConfig

  /** 显示位置 */
  position?: 'doc-bottom' | 'doc-footer' | 'floating'

  /** 贡献者配置 */
  contributors?: ContributorConfig

  /** 是否在开发模式下启用 */
  enableInDev?: boolean
}

/**
 * 反馈数据
 */
export interface FeedbackData {
  /** 页面路径 */
  page: string
  /** 反馈类型 */
  type: 'helpful' | 'rating' | 'form' | 'inline'
  /** 是否有帮助（helpful 类型） */
  isHelpful?: boolean
  /** 评分（rating 类型） */
  rating?: number
  /** 表单数据（form 类型） */
  formData?: Record<string, unknown>
  /** 建议文本（inline 类型） */
  suggestion?: string
  /** 时间戳 */
  timestamp: string
  /** 用户代理 */
  userAgent?: string
}

/**
 * 贡献者信息
 */
export interface Contributor {
  /** 用户名 */
  name: string
  /** 邮箱 */
  email: string
  /** 头像 URL */
  avatar?: string
  /** 贡献次数 */
  commits?: number
  /** 最后贡献时间 */
  lastCommit?: string
}

// ============== 辅助函数 ==============

/**
 * 验证反馈配置
 */
export function validateFeedbackConfig(options: FeedbackOptions): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 验证存储配置
  if (options.storage.type === 'api' && !options.storage.endpoint) {
    errors.push('API storage requires endpoint')
  }

  if (options.storage.type === 'github' && !options.storage.githubRepo) {
    errors.push('GitHub storage requires githubRepo')
  }

  // 验证表单配置
  if (options.type === 'form' && (!options.form || options.form.fields.length === 0)) {
    errors.push('Form type requires at least one field')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 过滤对象中的 undefined 值
 */
function filterUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) {
    return obj.filter(item => item !== undefined).map(item => filterUndefined(item)) as unknown as T
  }
  if (typeof obj !== 'object') {
    return obj
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      // 递归处理嵌套对象
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = filterUndefined(value)
      } else if (Array.isArray(value)) {
        result[key] = value.filter(item => item !== undefined).map(item => filterUndefined(item))
      } else {
        result[key] = value
      }
    }
  }
  return result as unknown as T
}

/**
 * 存储反馈数据
 */
export async function storeFeedback(
  data: FeedbackData,
  storage: FeedbackStorageConfig
): Promise<void> {
  // 过滤掉 undefined 值，避免 JSON 序列化问题
  const cleanData = filterUndefined(data)

  switch (storage.type) {
    case 'local':
      // 存储到 localStorage
      // 在测试环境中，window 可能未定义，但 localStorage 可能被 mock
      if (typeof localStorage !== 'undefined') {
        const key = 'ldoc-feedback'
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        existing.push(cleanData)
        // 保留最近 100 条
        if (existing.length > 100) existing.shift()
        localStorage.setItem(key, JSON.stringify(existing))
      }
      break

    case 'api':
      // 发送到 API 端点
      if (storage.endpoint) {
        await fetch(storage.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData)
        })
      }
      break

    case 'github':
      // 创建 GitHub Issue
      if (storage.githubRepo) {
        const [owner, repo] = storage.githubRepo.split('/')
        const title = `Feedback: ${cleanData.page}`
        const body = `
**Page:** ${cleanData.page}
**Type:** ${cleanData.type}
**Timestamp:** ${cleanData.timestamp}

${cleanData.isHelpful !== undefined ? `**Helpful:** ${cleanData.isHelpful ? 'Yes' : 'No'}` : ''}
${cleanData.rating !== undefined ? `**Rating:** ${cleanData.rating} stars` : ''}
${cleanData.suggestion ? `**Suggestion:** ${cleanData.suggestion}` : ''}
${cleanData.formData ? `**Form Data:**\n\`\`\`json\n${JSON.stringify(cleanData.formData, null, 2)}\n\`\`\`` : ''}
`

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        }

        if (storage.githubToken) {
          headers['Authorization'] = `token ${storage.githubToken}`
        }

        await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ title, body, labels: ['feedback'] })
        })
      }
      break
  }
}

/**
 * 从 Git 历史提取贡献者
 * 
 * @param filePath - 文件路径
 * @param config - 贡献者配置
 * @param deps - 依赖注入（用于测试）
 */
export async function extractContributors(
  filePath: string,
  config: ContributorConfig,
  deps?: {
    execSync?: (command: string, options?: { cwd?: string; encoding?: string }) => string
    pathJoin?: (...paths: string[]) => string
  }
): Promise<Contributor[]> {
  try {
    // 使用注入的依赖或默认导入
    const execSync = deps?.execSync || (await import('child_process')).execSync
    const pathJoin = deps?.pathJoin || (await import('path')).join

    const repoPath = config.repoPath || process.cwd()
    const fullPath = pathJoin(repoPath, filePath)

    // 获取文件的 Git 提交历史
    const gitLog = execSync(
      `git log --follow --format="%an|%ae|%at" -- "${fullPath}"`,
      { cwd: repoPath, encoding: 'utf-8' }
    )

    const gitLogStr = typeof gitLog === 'string' ? gitLog : gitLog.toString()
    const lines = gitLogStr.trim().split('\n').filter(Boolean)
    const contributorMap = new Map<string, Contributor>()

    for (const line of lines) {
      const parts = line.split('|')
      if (parts.length !== 3) continue // 跳过格式不正确的行

      const [name, email, timestamp] = parts

      // 验证数据有效性
      if (!name || !name.trim() || !email || !email.trim()) continue
      if (isNaN(parseInt(timestamp))) continue

      const key = email.toLowerCase().trim()
      const timestampNum = parseInt(timestamp)

      if (!contributorMap.has(key)) {
        // 计算 MD5 哈希用于 Gravatar
        const emailHash = md5Sync(email.trim())

        contributorMap.set(key, {
          name: name.trim(),
          email: email.trim(),
          avatar: `https://www.gravatar.com/avatar/${emailHash}?d=identicon`,
          commits: 0,
          lastCommit: new Date(timestampNum * 1000).toISOString()
        })
      }

      const contributor = contributorMap.get(key)!
      contributor.commits = (contributor.commits || 0) + 1

      // 更新最后提交时间（取最新的）
      const currentTime = new Date(timestampNum * 1000).toISOString()
      if (!contributor.lastCommit || currentTime > contributor.lastCommit) {
        contributor.lastCommit = currentTime
      }
    }

    // 按贡献次数排序
    const contributors = Array.from(contributorMap.values())
      .sort((a, b) => (b.commits || 0) - (a.commits || 0))

    // 限制数量
    if (config.maxCount) {
      return contributors.slice(0, config.maxCount)
    }

    return contributors
  } catch (error) {
    console.warn(`Failed to extract contributors for ${filePath}:`, error)
    return []
  }
}

/**
 * 计算 MD5 哈希（用于 Gravatar）
 */
function md5Sync(text: string): string {
  try {
    // 尝试使用 Node.js 内置的 crypto 模块
    const crypto = require('crypto')
    return crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex')
  } catch (error) {
    // 如果 crypto 不可用（不应该发生在 Node.js 环境中），返回一个基于文本的简单哈希
    // 这主要是为了测试环境的兼容性
    let hash = 0
    const str = text.toLowerCase().trim()
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    // 转换为 32 位十六进制字符串并填充到 32 个字符
    return Math.abs(hash).toString(16).padStart(32, '0')
  }
}

// ============== 插件实现 ==============

/**
 * 反馈插件
 * 
 * @example
 * ```ts
 * import { feedbackPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     feedbackPlugin({
 *       type: 'helpful',
 *       helpful: {
 *         question: 'Was this page helpful?',
 *         yesText: 'Yes',
 *         noText: 'No',
 *         followUp: {
 *           enabled: true,
 *           placeholder: 'Tell us more...'
 *         }
 *       },
 *       storage: {
 *         type: 'github',
 *         githubRepo: 'owner/repo'
 *       },
 *       position: 'doc-bottom',
 *       contributors: {
 *         enabled: true,
 *         mode: 'avatars',
 *         maxCount: 5
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function feedbackPlugin(options: FeedbackOptions): LDocPlugin {
  // 验证配置
  const validation = validateFeedbackConfig(options)
  if (!validation.valid) {
    throw new Error(`[Feedback Plugin] Configuration errors: ${validation.errors.join(', ')}`)
  }

  const {
    type,
    helpful,
    rating,
    form,
    inline,
    storage,
    position = 'doc-bottom',
    contributors,
    enableInDev = false
  } = options

  let siteConfig: SiteConfig
  const pageContributors = new Map<string, Contributor[]>()

  return definePlugin({
    name: 'ldoc:feedback',
    enforce: 'post',

    configResolved(config) {
      siteConfig = config
    },

    // 扩展页面数据，添加贡献者信息
    async extendPageData(pageData: PageData) {
      if (contributors?.enabled) {
        try {
          const contributorList = await extractContributors(
            pageData.filePath,
            contributors
          )
          pageContributors.set(pageData.relativePath, contributorList)

          // 将贡献者信息添加到页面数据
          pageData.frontmatter = pageData.frontmatter || {}
          pageData.frontmatter.contributors = contributorList
        } catch (error) {
          console.warn(`Failed to extract contributors for ${pageData.relativePath}:`, error)
        }
      }
    },

    // 注入反馈组件
    slots: {
      [position]: {
        component: type === 'helpful' ? 'LDocHelpfulWidget' : 'LDocFeedbackWidget',
        props: {
          type,
          helpful,
          rating,
          form,
          inline,
          storage,
          contributors: contributors?.enabled ? {
            mode: contributors.mode || 'avatars',
            showStats: contributors.showStats ?? false
          } : undefined
        },
        order: 50
      }
    },

    // 注入客户端脚本
    headScripts: [
      // 反馈处理脚本
      `
<script>
  // 反馈数据处理
  window.__LDOC_FEEDBACK__ = {
    storage: ${JSON.stringify(storage)},
    
    async submit(data) {
      const feedbackData = {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      try {
        ${storage.type === 'local' ? `
        const key = 'ldoc-feedback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(feedbackData);
        if (existing.length > 100) existing.shift();
        localStorage.setItem(key, JSON.stringify(existing));
        ` : ''}

        ${storage.type === 'api' ? `
        await fetch('${storage.endpoint}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData)
        });
        ` : ''}

        ${storage.type === 'github' ? `
        const [owner, repo] = '${storage.githubRepo}'.split('/');
        const title = \`Feedback: \${data.page}\`;
        const body = \`
**Page:** \${data.page}
**Type:** \${data.type}
**Timestamp:** \${feedbackData.timestamp}

\${data.isHelpful !== undefined ? \`**Helpful:** \${data.isHelpful ? 'Yes' : 'No'}\` : ''}
\${data.rating !== undefined ? \`**Rating:** \${data.rating} stars\` : ''}
\${data.suggestion ? \`**Suggestion:** \${data.suggestion}\` : ''}
\${data.formData ? \`**Form Data:**\\n\\\`\\\`\\\`json\\n\${JSON.stringify(data.formData, null, 2)}\\n\\\`\\\`\\\`\` : ''}
\`;

        const headers = { 'Content-Type': 'application/json' };
        ${storage.githubToken ? `headers['Authorization'] = 'token ${storage.githubToken}';` : ''}

        await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/issues\`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ title, body, labels: ['feedback'] })
        });
        ` : ''}

        return { success: true };
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        return { success: false, error };
      }
    }
  };
</script>
`
    ],

    // 在客户端注册反馈组件
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/feedback/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

/**
 * 创建反馈配置辅助函数
 */
export function defineFeedbackConfig(config: FeedbackOptions): FeedbackOptions {
  return config
}

export default feedbackPlugin
