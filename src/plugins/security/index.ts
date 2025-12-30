/**
 * 安全插件 - 提供 RBAC、内容加密和 XSS 防护
 * 
 * 功能：
 * - RBAC (Role-Based Access Control) 访问控制
 * - 内容加密/解密
 * - XSS 防护
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'
import type { AuthUser } from '../../shared/types'

// Re-export AuthUser for external use
export type { AuthUser } from '../../shared/types'

// ============== RBAC 类型定义 ==============

/**
 * 角色定义
 */
export interface Role {
  /** 角色 ID */
  id: string
  /** 角色名称 */
  name: string
  /** 角色描述 */
  description?: string
  /** 权限列表 */
  permissions: string[]
  /** 继承的角色 */
  inherits?: string[]
}

/**
 * 权限定义
 */
export interface Permission {
  /** 权限 ID */
  id: string
  /** 权限名称 */
  name: string
  /** 权限描述 */
  description?: string
  /** 资源类型 */
  resource?: string
  /** 操作类型 */
  action?: string
}

/**
 * 页面访问规则
 */
export interface PageAccessRule {
  /** 页面路径模式（支持通配符） */
  path: string
  /** 需要的角色（满足任一即可） */
  roles?: string[]
  /** 需要的权限（满足任一即可） */
  permissions?: string[]
  /** 自定义验证函数 */
  validate?: (user: AuthUser | null) => boolean | Promise<boolean>
}

/**
 * RBAC 配置
 */
export interface RBACOptions {
  /** 角色定义 */
  roles: Role[]
  /** 权限定义（可选） */
  permissions?: Permission[]
  /** 页面访问规则 */
  pageRules: PageAccessRule[]
  /** 未授权时的回调 */
  onUnauthorized?: (path: string, user: AuthUser | null) => void
  /** 获取用户角色的函数 */
  getUserRoles?: (user: AuthUser) => string[] | Promise<string[]>
}

// ============== 内容加密类型定义 ==============

/**
 * 加密配置
 */
export interface EncryptionOptions {
  /** 是否启用加密 */
  enabled: boolean
  /** 加密算法 */
  algorithm?: 'AES-GCM' | 'AES-CBC'
  /** 密钥派生函数 */
  kdf?: 'PBKDF2' | 'scrypt'
  /** 加密内容的标记 */
  marker?: string
  /** 解密密码提示 */
  passwordPrompt?: string
  /** 密码验证函数 */
  validatePassword?: (password: string) => boolean | Promise<boolean>
}

/**
 * 加密内容元数据
 */
export interface EncryptedContent {
  /** 加密的数据 */
  data: string
  /** 初始化向量 */
  iv: string
  /** 盐值 */
  salt: string
  /** 算法 */
  algorithm: string
  /** 版本 */
  version: number
}

// ============== XSS 防护类型定义 ==============

/**
 * XSS 防护配置
 */
export interface XSSProtectionOptions {
  /** 是否启用 XSS 防护 */
  enabled: boolean
  /** 允许的 HTML 标签 */
  allowedTags?: string[]
  /** 允许的属性 */
  allowedAttributes?: Record<string, string[]>
  /** 允许的 URL 协议 */
  allowedProtocols?: string[]
  /** 是否允许 iframe */
  allowIframes?: boolean
  /** 自定义清理函数 */
  customSanitizer?: (html: string) => string
}

// ============== 安全插件配置 ==============

/**
 * 安全插件配置
 */
export interface SecurityPluginOptions {
  /** RBAC 配置 */
  rbac?: RBACOptions
  /** 加密配置 */
  encryption?: EncryptionOptions
  /** XSS 防护配置 */
  xss?: XSSProtectionOptions
  /** 审计日志配置 */
  audit?: {
    enabled: boolean
    logAccess?: (user: AuthUser | null, path: string, allowed: boolean) => void
    logDecryption?: (user: AuthUser | null, contentId: string) => void
  }
}

/**
 * 序列化配置为客户端可用的字符串
 */
function serializeConfig(options: SecurityPluginOptions): string {
  const staticConfig = {
    rbac: options.rbac ? {
      roles: options.rbac.roles,
      permissions: options.rbac.permissions || [],
      pageRules: options.rbac.pageRules.map(rule => ({
        path: rule.path,
        roles: rule.roles,
        permissions: rule.permissions,
        hasValidate: !!rule.validate
      })),
      hasGetUserRoles: !!options.rbac.getUserRoles,
      hasOnUnauthorized: !!options.rbac.onUnauthorized
    } : null,
    encryption: options.encryption ? {
      enabled: options.encryption.enabled,
      algorithm: options.encryption.algorithm || 'AES-GCM',
      kdf: options.encryption.kdf || 'PBKDF2',
      marker: options.encryption.marker || '🔒',
      passwordPrompt: options.encryption.passwordPrompt || '请输入解密密码',
      hasValidatePassword: !!options.encryption.validatePassword
    } : null,
    xss: options.xss ? {
      enabled: options.xss.enabled,
      allowedTags: options.xss.allowedTags || [],
      allowedAttributes: options.xss.allowedAttributes || {},
      allowedProtocols: options.xss.allowedProtocols || ['http', 'https', 'mailto'],
      allowIframes: options.xss.allowIframes || false,
      hasCustomSanitizer: !!options.xss.customSanitizer
    } : null,
    audit: options.audit ? {
      enabled: options.audit.enabled,
      hasLogAccess: !!options.audit.logAccess,
      hasLogDecryption: !!options.audit.logDecryption
    } : null
  }
  return JSON.stringify(staticConfig)
}

/**
 * 安全插件
 * 
 * @example
 * ```ts
 * import { securityPlugin } from '@ldesign/doc/plugins/security'
 * 
 * export default defineConfig({
 *   plugins: [
 *     securityPlugin({
 *       rbac: {
 *         roles: [
 *           {
 *             id: 'admin',
 *             name: '管理员',
 *             permissions: ['*']
 *           },
 *           {
 *             id: 'user',
 *             name: '普通用户',
 *             permissions: ['read']
 *           }
 *         ],
 *         pageRules: [
 *           {
 *             path: '/admin/*',
 *             roles: ['admin']
 *           },
 *           {
 *             path: '/docs/*',
 *             roles: ['admin', 'user']
 *           }
 *         ]
 *       },
 *       xss: {
 *         enabled: true,
 *         allowedTags: ['p', 'a', 'strong', 'em', 'code', 'pre']
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function securityPlugin(options: SecurityPluginOptions): LDocPlugin {
  const configStr = serializeConfig(options)

  return definePlugin({
    name: 'ldoc:security',

    config(config) {
      return {
        ...config,
        // 将安全配置存储到全局，供客户端组件使用
        _securityPluginOptions: options
      }
    },

    // 扩展页面数据，添加访问控制信息
    extendPageData(pageData, ctx) {
      if (!options.rbac) return

      // 检查当前页面是否有访问规则
      const matchedRule = options.rbac.pageRules.find(rule => {
        const pattern = rule.path
        const path = pageData.relativePath

        if (pattern.endsWith('*')) {
          return path.startsWith(pattern.slice(0, -1))
        }
        return path === pattern || `/${path}` === pattern
      })

      if (matchedRule) {
        // 添加访问控制元数据
        pageData.frontmatter = pageData.frontmatter || {}
        pageData.frontmatter._accessControl = {
          roles: matchedRule.roles,
          permissions: matchedRule.permissions,
          hasValidate: !!matchedRule.validate
        }
      }
    },

    // 注入客户端组件
    slots: {
      'layout-top': [
        {
          component: 'LDocSecurityGuard',
          props: { __securityConfig: configStr },
          order: -100 // 最先执行
        }
      ]
    }
  })
}

/**
 * RBAC 工具函数
 */
export const RBACUtils = {
  /**
   * 检查用户是否有指定角色
   */
  hasRole(user: AuthUser | null, role: string): boolean {
    if (!user || !user.roles) return false
    return user.roles.includes(role)
  },

  /**
   * 检查用户是否有任一角色
   */
  hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
    if (!user || !user.roles) return false
    return roles.some(role => user.roles!.includes(role))
  },

  /**
   * 检查用户是否有所有角色
   */
  hasAllRoles(user: AuthUser | null, roles: string[]): boolean {
    if (!user || !user.roles) return false
    return roles.every(role => user.roles!.includes(role))
  },

  /**
   * 获取角色的所有权限（包括继承）
   */
  getRolePermissions(roleId: string, roles: Role[], visited = new Set<string>()): string[] {
    const role = roles.find(r => r.id === roleId)
    if (!role) return []

    // 防止循环继承
    if (visited.has(roleId)) return []
    visited.add(roleId)

    const permissions = new Set(role.permissions)

    // 递归获取继承的权限
    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedPerms = this.getRolePermissions(inheritedRoleId, roles, visited)
        inheritedPerms.forEach(p => permissions.add(p))
      }
    }

    return Array.from(permissions)
  },

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(user: AuthUser | null, permission: string, roles: Role[]): boolean {
    if (!user || !user.roles) return false

    // 获取用户所有角色的权限
    const userPermissions = new Set<string>()
    for (const roleId of user.roles) {
      const rolePerms = this.getRolePermissions(roleId, roles)
      rolePerms.forEach(p => userPermissions.add(p))
    }

    // 检查是否有通配符权限
    if (userPermissions.has('*')) return true

    // 检查具体权限
    return userPermissions.has(permission)
  }
}

/**
 * 加密工具函数
 */
export const EncryptionUtils = {
  /**
   * 生成随机盐值
   */
  generateSalt(length = 16): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length))
  },

  /**
   * 生成随机 IV
   */
  generateIV(length = 12): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length))
  },

  /**
   * 派生密钥
   */
  async deriveKey(
    password: string,
    salt: Uint8Array,
    algorithm: 'PBKDF2' | 'scrypt' = 'PBKDF2'
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    if (algorithm === 'PBKDF2') {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      )

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt as BufferSource,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
    }

    throw new Error(`Unsupported KDF algorithm: ${algorithm}`)
  },

  /**
   * 加密内容
   */
  async encrypt(
    content: string,
    password: string,
    algorithm: 'AES-GCM' | 'AES-CBC' = 'AES-GCM'
  ): Promise<EncryptedContent> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)

    const salt = this.generateSalt()
    const iv = this.generateIV()
    const key = await this.deriveKey(password, salt)

    const encrypted = await crypto.subtle.encrypt(
      { name: algorithm, iv: iv as BufferSource },
      key,
      data
    )

    return {
      data: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt),
      algorithm,
      version: 1
    }
  },

  /**
   * 解密内容
   */
  async decrypt(
    encrypted: EncryptedContent,
    password: string
  ): Promise<string> {
    const salt = this.base64ToArrayBuffer(encrypted.salt)
    const iv = this.base64ToArrayBuffer(encrypted.iv)
    const data = this.base64ToArrayBuffer(encrypted.data)

    const key = await this.deriveKey(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: encrypted.algorithm, iv: iv as BufferSource },
      key,
      data as BufferSource
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  },

  /**
   * ArrayBuffer 转 Base64
   */
  arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  },

  /**
   * Base64 转 ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }
}

/**
 * XSS 防护工具函数
 */
export const XSSUtils = {
  /**
   * 基础 HTML 转义
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
    return text.replace(/[&<>"'/]/g, char => map[char])
  },

  /**
   * 简单的 HTML 清理（不依赖 DOMPurify）
   */
  sanitizeHtml(html: string, options: XSSProtectionOptions): string {
    if (options.customSanitizer) {
      return options.customSanitizer(html)
    }

    // 移除所有脚本标签
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

    // 移除事件处理器
    html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    html = html.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

    // 移除 javascript: 协议
    html = html.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    html = html.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"')

    // 如果不允许 iframe，移除它们
    if (!options.allowIframes) {
      html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    }

    return html
  },

  /**
   * 验证 URL 是否安全
   */
  isSafeUrl(url: string, allowedProtocols: string[] = ['http', 'https', 'mailto']): boolean {
    try {
      // 在浏览器环境中使用 window.location.href，在 Node 环境中使用默认值
      const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/'
      const parsed = new URL(url, base)
      return allowedProtocols.includes(parsed.protocol.replace(':', ''))
    } catch {
      // 相对 URL
      return !url.startsWith('javascript:') && !url.startsWith('data:')
    }
  }
}

export default securityPlugin
