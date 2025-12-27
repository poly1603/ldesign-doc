/**
 * 版本管理插件 - 支持多版本文档管理
 * 
 * 功能：
 * - 版本选择器（导航栏或侧边栏）
 * - 版本别名解析（latest、stable、next 等）
 * - 废弃版本警告
 * - 多版本构建支持
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, SiteConfig } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * 版本配置项
 */
export interface VersionItem {
  /** 版本号 */
  version: string
  /** 显示标签（可选，默认使用 version） */
  label?: string
  /** 文档路径前缀 */
  path: string
  /** 是否为预发布版本 */
  prerelease?: boolean
  /** 发布日期 */
  releaseDate?: string
  /** 是否已废弃 */
  deprecated?: boolean
}

/**
 * 版本配置
 */
export interface VersionConfig {
  /** 版本列表 */
  versions: VersionItem[]
  /** 当前版本 */
  current: string
  /** 版本别名映射（如 latest -> 1.0.0） */
  aliases?: Record<string, string>
  /** 版本选择器位置 */
  selectorPosition?: 'nav' | 'sidebar'
  /** 废弃版本警告配置 */
  deprecation?: {
    /** 废弃的版本列表 */
    versions: string[]
    /** 警告消息 */
    message?: string
    /** 推荐的版本 */
    recommendedVersion?: string
  }
}

/**
 * 版本插件选项
 */
export interface VersionPluginOptions extends VersionConfig {
  /** 版本切换时的回调 */
  onVersionChange?: (from: string, to: string) => void
  /** 版本清单文件名 */
  manifestFileName?: string
}

/**
 * 版本清单（构建时生成）
 */
export interface VersionManifest {
  /** 当前版本 */
  current: string
  /** 版本列表 */
  versions: {
    version: string
    label: string
    path: string
    releaseDate?: string
    deprecated?: boolean
  }[]
  /** 别名映射 */
  aliases: Record<string, string>
  /** 生成时间 */
  generatedAt: string
}

// ============== 辅助函数 ==============

/**
 * 解析版本别名
 * @param alias 别名（如 'latest'）
 * @param aliases 别名映射
 * @returns 实际版本号
 */
export function resolveVersionAlias(
  alias: string,
  aliases: Record<string, string>
): string {
  return aliases[alias] || alias
}

/**
 * 检查版本是否已废弃
 * @param version 版本号
 * @param deprecatedVersions 废弃版本列表
 * @returns 是否已废弃
 */
export function isVersionDeprecated(
  version: string,
  deprecatedVersions: string[]
): boolean {
  return deprecatedVersions.includes(version)
}

/**
 * 生成版本清单
 * @param config 版本配置
 * @returns 版本清单对象
 */
export function generateVersionManifest(
  config: VersionConfig
): VersionManifest {
  return {
    current: config.current,
    versions: config.versions.map(v => ({
      version: v.version,
      label: v.label || v.version,
      path: v.path,
      releaseDate: v.releaseDate,
      deprecated: v.deprecated
    })),
    aliases: config.aliases || {},
    generatedAt: new Date().toISOString()
  }
}

/**
 * 序列化配置为客户端可用的字符串
 */
function serializeConfig(options: VersionPluginOptions): string {
  const staticConfig = {
    versions: options.versions.map(v => ({
      version: v.version,
      label: v.label || v.version,
      path: v.path,
      prerelease: v.prerelease,
      releaseDate: v.releaseDate,
      deprecated: v.deprecated
    })),
    current: options.current,
    aliases: options.aliases || {},
    selectorPosition: options.selectorPosition || 'nav',
    deprecation: options.deprecation,
    hasOnVersionChange: !!options.onVersionChange
  }
  return JSON.stringify(staticConfig)
}

// ============== 插件实现 ==============

/**
 * 版本管理插件
 * 
 * @example
 * ```ts
 * import { versionPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     versionPlugin({
 *       versions: [
 *         { version: '2.0.0', path: '/v2/', label: 'v2.x' },
 *         { version: '1.0.0', path: '/v1/', label: 'v1.x', deprecated: true }
 *       ],
 *       current: '2.0.0',
 *       aliases: {
 *         latest: '2.0.0',
 *         stable: '2.0.0',
 *         legacy: '1.0.0'
 *       },
 *       deprecation: {
 *         versions: ['1.0.0'],
 *         message: 'This version is deprecated. Please upgrade to v2.x',
 *         recommendedVersion: '2.0.0'
 *       },
 *       onVersionChange: (from, to) => {
 *         console.log(`Version changed from ${from} to ${to}`)
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function versionPlugin(options: VersionPluginOptions): LDocPlugin {
  const configStr = serializeConfig(options)
  const manifestFileName = options.manifestFileName || 'version-manifest.json'

  let siteConfig: SiteConfig

  return definePlugin({
    name: 'ldoc:version',
    enforce: 'pre',

    config(config) {
      return {
        ...config,
        // 将版本配置存储到全局，供客户端组件使用
        _versionPluginOptions: options
      }
    },

    configResolved(config) {
      siteConfig = config
    },

    // 注入版本选择器组件和废弃警告
    slots: {
      // 根据配置决定注入位置
      ...(options.selectorPosition === 'sidebar'
        ? {
          'sidebar-top': {
            component: 'LDocVersionSelector',
            props: { __versionConfig: configStr },
            order: 0
          }
        }
        : {
          'nav-bar-content-before': {
            component: 'LDocVersionSelector',
            props: { __versionConfig: configStr },
            order: 50
          }
        }),
      // 注入废弃版本警告到文档顶部
      'doc-before': {
        component: 'LDocDeprecationBanner',
        props: {
          currentVersion: options.current,
          deprecation: options.deprecation,
          versions: options.versions,
          dismissible: true
        },
        order: 0
      }
    },

    // 在客户端注册版本组件，供插槽渲染
    clientConfigFile: `
import { globalComponents } from '@ldesign/doc/plugins/version/client'

export { globalComponents }
export default { globalComponents }
`,

    // 构建时生成版本清单文件
    async buildEnd(config) {
      const fs = await import('fs/promises')
      const path = await import('path')

      const manifest = generateVersionManifest(options)
      const manifestPath = path.join(config.outDir, manifestFileName)

      await fs.writeFile(
        manifestPath,
        JSON.stringify(manifest, null, 2),
        'utf-8'
      )

      console.log(`✓ Version manifest generated: ${manifestFileName}`)
    },

    // 扩展页面数据，添加版本信息
    async extendPageData(pageData, ctx) {
      // 检查当前页面是否属于废弃版本
      const deprecatedVersions = options.deprecation?.versions || []
      const currentVersion = options.current

      if (isVersionDeprecated(currentVersion, deprecatedVersions)) {
        // 添加废弃标记到页面数据
        pageData.frontmatter = {
          ...pageData.frontmatter,
          _deprecated: true,
          _deprecationMessage: options.deprecation?.message,
          _recommendedVersion: options.deprecation?.recommendedVersion
        }
      }

      // 添加版本信息到页面数据
      pageData.frontmatter = {
        ...pageData.frontmatter,
        _version: currentVersion,
        _versionLabel: options.versions.find(v => v.version === currentVersion)?.label
      }
    }
  })
}

/**
 * 创建版本配置辅助函数
 */
export function defineVersionConfig(config: VersionConfig): VersionConfig {
  return config
}

export default versionPlugin
