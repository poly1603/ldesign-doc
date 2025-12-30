/**
 * 配置验证器
 * 
 * 提供运行时配置验证，生成友好的错误消息
 */

import type { UserConfig, BuildConfig, DeployConfig, ExtraDocsSource } from '../types'
import pc from 'picocolors'

// ============== 验证错误类型 ==============

/**
 * 配置验证错误
 */
export interface ConfigValidationError {
  /** 字段路径 */
  path: string
  /** 错误消息 */
  message: string
  /** 实际值 */
  value?: unknown
  /** 期望值描述 */
  expected?: string
  /** 修复建议 */
  suggestion?: string
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误列表 */
  errors: ConfigValidationError[]
  /** 警告列表 */
  warnings: ConfigValidationError[]
}

// ============== 验证工具函数 ==============

type ValidatorFn<T> = (value: T, path: string) => ConfigValidationError[]

/**
 * 验证字符串类型
 */
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 验证布尔类型
 */
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 验证数字类型
 */
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 验证数组类型
 */
function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 验证对象类型
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 创建类型验证器
 */
function createTypeValidator<T>(
  typeName: string,
  typeCheck: (value: unknown) => boolean
): ValidatorFn<unknown> {
  return (value, path) => {
    if (value !== undefined && !typeCheck(value)) {
      return [{
        path,
        message: `期望 ${typeName} 类型`,
        value,
        expected: typeName,
        suggestion: `将 ${path} 设置为 ${typeName} 类型的值`
      }]
    }
    return []
  }
}

/**
 * 创建枚举验证器
 */
function createEnumValidator<T extends string>(allowedValues: T[]): ValidatorFn<unknown> {
  return (value, path) => {
    if (value !== undefined && !allowedValues.includes(value as T)) {
      return [{
        path,
        message: `无效的值 "${value}"`,
        value,
        expected: allowedValues.map(v => `"${v}"`).join(' | '),
        suggestion: `有效值: ${allowedValues.join(', ')}`
      }]
    }
    return []
  }
}

/**
 * 创建路径验证器（检查路径格式）
 */
function createPathValidator(options: { mustStartWith?: string; mustEndWith?: string } = {}): ValidatorFn<unknown> {
  return (value, path) => {
    if (value === undefined) return []
    if (!isString(value)) {
      return [{
        path,
        message: '路径必须是字符串',
        value,
        expected: 'string'
      }]
    }

    const errors: ConfigValidationError[] = []

    if (options.mustStartWith && !value.startsWith(options.mustStartWith)) {
      errors.push({
        path,
        message: `路径必须以 "${options.mustStartWith}" 开头`,
        value,
        suggestion: `将路径改为 "${options.mustStartWith}${value}"`
      })
    }

    if (options.mustEndWith && !value.endsWith(options.mustEndWith)) {
      errors.push({
        path,
        message: `路径必须以 "${options.mustEndWith}" 结尾`,
        value,
        suggestion: `将路径改为 "${value}${options.mustEndWith}"`
      })
    }

    return errors
  }
}

// ============== 配置验证器 ==============

/**
 * 验证 ExtraDocsSource
 */
function validateExtraDocsSource(source: ExtraDocsSource, index: number): ConfigValidationError[] {
  const errors: ConfigValidationError[] = []
  const basePath = `extraDocs[${index}]`

  if (!source.dir || !isString(source.dir)) {
    errors.push({
      path: `${basePath}.dir`,
      message: 'dir 是必需的字符串字段',
      expected: 'string',
      suggestion: '指定文档源目录，如 "src/components"'
    })
  }

  if (source.prefix !== undefined && !isString(source.prefix)) {
    errors.push({
      path: `${basePath}.prefix`,
      message: 'prefix 必须是字符串',
      value: source.prefix,
      expected: 'string'
    })
  }

  if (source.pattern !== undefined && !isString(source.pattern)) {
    errors.push({
      path: `${basePath}.pattern`,
      message: 'pattern 必须是字符串（glob 模式）',
      value: source.pattern,
      expected: 'string',
      suggestion: '如 "**/*.md"'
    })
  }

  return errors
}

/**
 * 验证 BuildConfig
 */
function validateBuildConfig(build: BuildConfig): ConfigValidationError[] {
  const errors: ConfigValidationError[] = []

  if (build.outDir !== undefined) {
    errors.push(...createTypeValidator('string', isString)(build.outDir, 'build.outDir'))
  }

  if (build.assetsDir !== undefined) {
    errors.push(...createTypeValidator('string', isString)(build.assetsDir, 'build.assetsDir'))
  }

  if (build.minify !== undefined) {
    const validMinify = build.minify === true || build.minify === false ||
      build.minify === 'terser' || build.minify === 'esbuild'
    if (!validMinify) {
      errors.push({
        path: 'build.minify',
        message: '无效的 minify 值',
        value: build.minify,
        expected: 'boolean | "terser" | "esbuild"',
        suggestion: '设置为 true、false、"terser" 或 "esbuild"'
      })
    }
  }

  if (build.sourcemap !== undefined) {
    errors.push(...createTypeValidator('boolean', isBoolean)(build.sourcemap, 'build.sourcemap'))
  }

  if (build.ssr !== undefined) {
    errors.push(...createTypeValidator('boolean', isBoolean)(build.ssr, 'build.ssr'))
  }

  if (build.chunkSizeWarningLimit !== undefined) {
    errors.push(...createTypeValidator('number', isNumber)(build.chunkSizeWarningLimit, 'build.chunkSizeWarningLimit'))
  }

  return errors
}

/**
 * 验证 DeployConfig
 */
function validateDeployConfig(deploy: DeployConfig): ConfigValidationError[] {
  const errors: ConfigValidationError[] = []

  const validPlatforms = ['netlify', 'vercel', 'github-pages', 'cloudflare', 'surge']
  errors.push(...createEnumValidator(validPlatforms as DeployConfig['platform'][])(deploy.platform, 'deploy.platform'))

  if (deploy.platform === 'surge' && deploy.surge) {
    if (!deploy.surge.domain || !isString(deploy.surge.domain)) {
      errors.push({
        path: 'deploy.surge.domain',
        message: 'Surge 部署需要指定域名',
        expected: 'string',
        suggestion: '设置域名，如 "my-site.surge.sh"'
      })
    }
  }

  return errors
}

/**
 * 验证用户配置
 */
export function validateUserConfig(config: UserConfig): ConfigValidationResult {
  const errors: ConfigValidationError[] = []
  const warnings: ConfigValidationError[] = []

  // 验证基础字符串字段
  const stringFields: (keyof UserConfig)[] = ['srcDir', 'outDir', 'title', 'description', 'lang']
  for (const field of stringFields) {
    if (config[field] !== undefined) {
      errors.push(...createTypeValidator('string', isString)(config[field], field))
    }
  }

  // 验证 base 路径
  if (config.base !== undefined) {
    errors.push(...createPathValidator({ mustStartWith: '/' })(config.base, 'base'))
  }

  // 验证 framework
  if (config.framework !== undefined) {
    errors.push(...createEnumValidator(['vue', 'react', 'auto'])(config.framework, 'framework'))
  }

  // 验证 extraDocs
  if (config.extraDocs !== undefined) {
    if (!isArray(config.extraDocs)) {
      errors.push({
        path: 'extraDocs',
        message: 'extraDocs 必须是数组',
        value: config.extraDocs,
        expected: 'ExtraDocsSource[]'
      })
    } else {
      config.extraDocs.forEach((source, index) => {
        errors.push(...validateExtraDocsSource(source, index))
      })
    }
  }

  // 验证 head
  if (config.head !== undefined) {
    if (!isArray(config.head)) {
      errors.push({
        path: 'head',
        message: 'head 必须是数组',
        value: config.head,
        expected: 'HeadConfig[]',
        suggestion: '如 [["meta", { name: "author", content: "LDesign" }]]'
      })
    }
  }

  // 验证 plugins
  if (config.plugins !== undefined) {
    if (!isArray(config.plugins)) {
      errors.push({
        path: 'plugins',
        message: 'plugins 必须是数组',
        value: config.plugins,
        expected: 'LDocPlugin[]'
      })
    } else {
      config.plugins.forEach((plugin, index) => {
        if (!isObject(plugin)) {
          errors.push({
            path: `plugins[${index}]`,
            message: '插件必须是对象',
            value: plugin,
            expected: 'LDocPlugin'
          })
        } else if (!plugin.name || !isString(plugin.name)) {
          errors.push({
            path: `plugins[${index}].name`,
            message: '插件必须有 name 字段',
            expected: 'string',
            suggestion: '每个插件都需要唯一的名称'
          })
        }
      })
    }
  }

  // 验证 build
  if (config.build !== undefined) {
    if (!isObject(config.build)) {
      errors.push({
        path: 'build',
        message: 'build 必须是对象',
        value: config.build,
        expected: 'BuildConfig'
      })
    } else {
      errors.push(...validateBuildConfig(config.build))
    }
  }

  // 验证 deploy
  if (config.deploy !== undefined) {
    if (!isObject(config.deploy)) {
      errors.push({
        path: 'deploy',
        message: 'deploy 必须是对象',
        value: config.deploy,
        expected: 'DeployConfig'
      })
    } else {
      errors.push(...validateDeployConfig(config.deploy))
    }
  }

  // 验证 themeConfig
  if (config.themeConfig !== undefined && !isObject(config.themeConfig)) {
    errors.push({
      path: 'themeConfig',
      message: 'themeConfig 必须是对象',
      value: config.themeConfig,
      expected: 'ThemeConfig'
    })
  }

  // 验证 locales
  if (config.locales !== undefined && !isObject(config.locales)) {
    errors.push({
      path: 'locales',
      message: 'locales 必须是对象',
      value: config.locales,
      expected: 'Record<string, LocaleConfig>'
    })
  }

  // 验证 markdown
  if (config.markdown !== undefined && !isObject(config.markdown)) {
    errors.push({
      path: 'markdown',
      message: 'markdown 必须是对象',
      value: config.markdown,
      expected: 'MarkdownOptions'
    })
  }

  // 生成警告
  if (!config.title) {
    warnings.push({
      path: 'title',
      message: '建议设置站点标题',
      suggestion: '设置 title 字段以显示在浏览器标签页'
    })
  }

  if (!config.description) {
    warnings.push({
      path: 'description',
      message: '建议设置站点描述',
      suggestion: '设置 description 字段以优化 SEO'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// ============== 错误格式化 ==============

/**
 * 格式化验证错误为可读字符串
 */
export function formatValidationErrors(result: ConfigValidationResult): string {
  const lines: string[] = []

  if (result.errors.length > 0) {
    lines.push(pc.red(pc.bold('配置错误:')))
    lines.push('')

    for (const error of result.errors) {
      lines.push(pc.red(`  ✗ ${error.path}`))
      lines.push(pc.gray(`    ${error.message}`))
      if (error.expected) {
        lines.push(pc.gray(`    期望: ${error.expected}`))
      }
      if (error.value !== undefined) {
        lines.push(pc.gray(`    实际: ${JSON.stringify(error.value)}`))
      }
      if (error.suggestion) {
        lines.push(pc.cyan(`    建议: ${error.suggestion}`))
      }
      lines.push('')
    }
  }

  if (result.warnings.length > 0) {
    lines.push(pc.yellow(pc.bold('配置警告:')))
    lines.push('')

    for (const warning of result.warnings) {
      lines.push(pc.yellow(`  ⚠ ${warning.path}`))
      lines.push(pc.gray(`    ${warning.message}`))
      if (warning.suggestion) {
        lines.push(pc.cyan(`    建议: ${warning.suggestion}`))
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * 验证配置并在出错时抛出异常
 */
export function assertValidConfig(config: UserConfig): void {
  const result = validateUserConfig(config)

  if (!result.valid) {
    const message = formatValidationErrors(result)
    throw new Error(`配置验证失败:\n\n${message}`)
  }

  // 打印警告但不中断
  if (result.warnings.length > 0) {
    console.warn(formatValidationErrors({ valid: true, errors: [], warnings: result.warnings }))
  }
}

/**
 * 配置验证错误类
 */
export class ConfigValidationException extends Error {
  constructor(
    public readonly errors: ConfigValidationError[],
    public readonly warnings: ConfigValidationError[]
  ) {
    super(`配置验证失败: ${errors.length} 个错误`)
    this.name = 'ConfigValidationException'
  }
}
