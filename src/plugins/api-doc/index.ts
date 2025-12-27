/**
 * API 文档生成插件 - 从 TypeScript 源代码自动生成 API 文档
 * 
 * 功能：
 * - TypeScript 类型提取（类型、函数、类、接口）
 * - JSDoc/TSDoc 注释解析
 * - 模块层级导航生成
 * - 类型引用链接
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, SiteConfig } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * API 分组配置
 */
export interface ApiGroup {
  /** 分组名称 */
  name: string
  /** 文件匹配模式（glob） */
  pattern: string
  /** 分组标题 */
  title: string
  /** 分组描述 */
  description?: string
}

/**
 * API 文档插件选项
 */
export interface ApiDocOptions {
  /** TypeScript 源文件路径（glob 模式） */
  include: string[]
  /** 排除路径（glob 模式） */
  exclude?: string[]
  /** 输出目录（相对于 docs 目录） */
  outDir?: string
  /** TSDoc 配置 */
  tsdoc?: {
    /** 是否解析 @example 标签 */
    parseExamples?: boolean
    /** 自定义标签 */
    customTags?: string[]
  }
  /** 文档模板 */
  template?: 'default' | 'minimal' | 'detailed'
  /** 分组配置 */
  groups?: ApiGroup[]
  /** 是否生成类型链接 */
  typeLinks?: boolean
  /** 是否在开发模式下监听源文件变化 */
  watch?: boolean
}

/**
 * API 模块
 */
export interface ApiModule {
  /** 模块名称 */
  name: string
  /** 模块路径 */
  path: string
  /** 模块描述 */
  description?: string
  /** 导出项 */
  exports: ApiExport[]
  /** 子模块 */
  children?: ApiModule[]
}

/**
 * API 导出项
 */
export interface ApiExport {
  /** 导出名称 */
  name: string
  /** 导出类型 */
  kind: 'function' | 'class' | 'interface' | 'type' | 'const' | 'enum' | 'variable'
  /** 类型签名 */
  signature?: string
  /** 描述 */
  description?: string
  /** 参数（函数/方法） */
  params?: ApiParam[]
  /** 返回值（函数/方法） */
  returns?: ApiReturn
  /** 示例代码 */
  examples?: string[]
  /** JSDoc 标签 */
  tags?: Record<string, string>
  /** 类型参数（泛型） */
  typeParameters?: ApiTypeParameter[]
  /** 成员（类/接口） */
  members?: ApiMember[]
  /** 源文件位置 */
  source?: {
    file: string
    line: number
  }
}

/**
 * API 参数
 */
export interface ApiParam {
  /** 参数名 */
  name: string
  /** 参数类型 */
  type: string
  /** 参数描述 */
  description?: string
  /** 是否可选 */
  optional?: boolean
  /** 默认值 */
  default?: string
}

/**
 * API 返回值
 */
export interface ApiReturn {
  /** 返回类型 */
  type: string
  /** 返回描述 */
  description?: string
}

/**
 * API 类型参数
 */
export interface ApiTypeParameter {
  /** 类型参数名 */
  name: string
  /** 约束 */
  constraint?: string
  /** 默认值 */
  default?: string
  /** 描述 */
  description?: string
}

/**
 * API 成员（类/接口的属性或方法）
 */
export interface ApiMember {
  /** 成员名 */
  name: string
  /** 成员类型 */
  kind: 'property' | 'method' | 'accessor'
  /** 类型签名 */
  signature?: string
  /** 描述 */
  description?: string
  /** 是否可选 */
  optional?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 参数（方法） */
  params?: ApiParam[]
  /** 返回值（方法） */
  returns?: ApiReturn
}

/**
 * API 文档生成结果
 */
export interface ApiDocResult {
  /** 所有模块 */
  modules: ApiModule[]
  /** 所有类型 */
  types: ApiExport[]
  /** 所有函数 */
  functions: ApiExport[]
  /** 所有类 */
  classes: ApiExport[]
}

// ============== 辅助函数 ==============

/**
 * 规范化输出目录
 */
function normalizeOutDir(outDir: string | undefined): string {
  return outDir || 'api'
}

/**
 * 规范化模板类型
 */
function normalizeTemplate(template: string | undefined): 'default' | 'minimal' | 'detailed' {
  if (template === 'minimal' || template === 'detailed') {
    return template
  }
  return 'default'
}

/**
 * 序列化配置为客户端可用的字符串
 */
function serializeConfig(options: ApiDocOptions): string {
  const staticConfig = {
    outDir: normalizeOutDir(options.outDir),
    template: normalizeTemplate(options.template),
    typeLinks: options.typeLinks !== false,
    groups: options.groups || []
  }
  return JSON.stringify(staticConfig)
}

// ============== 插件实现 ==============

/**
 * API 文档生成插件
 * 
 * @example
 * ```ts
 * import { apiDocPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     apiDocPlugin({
 *       include: ['src/**\/*.ts'],
 *       exclude: ['**\/*.test.ts', '**\/*.spec.ts'],
 *       outDir: 'api',
 *       tsdoc: {
 *         parseExamples: true,
 *         customTags: ['internal', 'beta']
 *       },
 *       template: 'detailed',
 *       groups: [
 *         {
 *           name: 'core',
 *           pattern: 'src/core/**\/*.ts',
 *           title: 'Core API',
 *           description: 'Core functionality'
 *         },
 *         {
 *           name: 'utils',
 *           pattern: 'src/utils/**\/*.ts',
 *           title: 'Utilities',
 *           description: 'Utility functions'
 *         }
 *       ],
 *       typeLinks: true,
 *       watch: true
 *     })
 *   ]
 * })
 * ```
 */
export function apiDocPlugin(options: ApiDocOptions): LDocPlugin {
  const configStr = serializeConfig(options)
  let siteConfig: SiteConfig

  return definePlugin({
    name: 'ldoc:api-doc',
    enforce: 'pre',

    config(config) {
      return {
        ...config,
        // 将 API 文档配置存储到全局
        _apiDocPluginOptions: options
      }
    },

    configResolved(config) {
      siteConfig = config
    },

    // 构建开始时生成 API 文档
    async buildStart(config) {
      console.log('🔍 Extracting API documentation from TypeScript sources...')

      // 这里将在后续任务中实现实际的提取逻辑
      // 现在只是占位符
      const result: ApiDocResult = {
        modules: [],
        types: [],
        functions: [],
        classes: []
      }

      console.log(`✓ API documentation extracted: ${result.modules.length} modules`)
    },

    // 在开发模式下监听源文件变化
    async handleHotUpdate(ctx) {
      if (options.watch !== false) {
        const { file } = ctx

        // 检查是否是 TypeScript 源文件
        const isIncluded = options.include.some(pattern => {
          // 简单的 glob 匹配检查
          return file.includes(pattern.replace('**/', '').replace('*.ts', ''))
        })

        if (isIncluded) {
          console.log(`🔄 API source file changed: ${file}`)
          // 这里将在后续任务中实现重新生成逻辑
        }
      }
    },

    // 注入 API 文档导航组件
    slots: {
      'sidebar-nav-after': {
        component: 'LDocApiDocNav',
        props: { __apiDocConfig: configStr },
        order: 100
      }
    },

    // 在客户端注册 API 文档组件
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/api-doc/client'

export { globalComponents }
export default { globalComponents }
`
  })
}

/**
 * 创建 API 文档配置辅助函数
 */
export function defineApiDocConfig(config: ApiDocOptions): ApiDocOptions {
  return config
}

export default apiDocPlugin

