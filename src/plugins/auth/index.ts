/**
 * 认证插件 - 支持自定义登录功能
 * 
 * 功能：
 * - Header 右侧登录按钮（未登录显示"登录"，已登录显示用户信息）
 * - 登录弹窗面板（用户名、密码、图片验证码、登录按钮）
 * - 支持配置：打开面板事件、获取验证码、表单变化监听、登录按钮点击
 * - 插件加载时自动获取用户信息
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, AuthUser } from '../../shared/types'

// 重新导出 AuthUser 类型
export type { AuthUser } from '../../shared/types'

// ============== 类型定义 ==============

/**
 * 登录表单数据
 */
export interface LoginFormData {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 验证码 */
  captcha: string
}

/**
 * 登录结果
 */
export interface LoginResult {
  /** 是否成功 */
  success: boolean
  /** 用户信息（成功时返回） */
  user?: AuthUser
  /** 错误信息（失败时返回） */
  error?: string
}

/**
 * 获取用户信息结果
 */
export interface GetUserResult {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 用户信息（已登录时返回） */
  user?: AuthUser
}

/**
 * 验证码配置
 */
export type CaptchaSource =
  | string  // 静态图片 URL
  | (() => string)  // 同步函数返回 URL
  | (() => Promise<string>)  // 异步函数返回 URL

/**
 * 认证插件配置
 */
export interface AuthPluginOptions {
  /**
   * 登录按钮文本
   * @default '登录'
   */
  loginText?: string

  /**
   * 登录按钮文本（英文）
   * @default 'Login'
   */
  loginTextEn?: string

  /**
   * 登录面板标题
   * @default '用户登录'
   */
  panelTitle?: string

  /**
   * 登录面板标题（英文）
   * @default 'User Login'
   */
  panelTitleEn?: string

  /**
   * 存储键名（用于本地缓存用户信息）
   * @default 'ldoc-auth-user'
   */
  storageKey?: string

  /**
   * 获取验证码图片
   * 支持：
   * - 字符串：静态图片 URL
   * - 同步函数：返回图片 URL
   * - 异步函数：返回 Promise<string>
   */
  getCaptcha?: CaptchaSource

  /**
   * 登录面板打开时的回调
   * 可用于获取 session、初始化验证码等
   */
  onPanelOpen?: () => void | Promise<void>

  /**
   * 登录面板关闭时的回调
   */
  onPanelClose?: () => void

  /**
   * 表单数据变化时的回调
   * @param field 变化的字段名
   * @param value 新值
   * @param formData 完整表单数据
   */
  onFormChange?: (field: keyof LoginFormData, value: string, formData: LoginFormData) => void

  /**
   * 点击登录按钮时的回调
   * 用户需要在此回调中调用自己的登录接口
   * 返回 LoginResult 表示登录结果
   * @param formData 表单数据
   * @returns 登录结果
   */
  onLogin: (formData: LoginFormData) => Promise<LoginResult>

  /**
   * 插件加载时获取用户信息
   * 用于检查用户是否已登录
   * @returns 用户信息结果
   */
  onGetUser: () => Promise<GetUserResult>

  /**
   * 退出登录回调
   */
  onLogout?: () => void | Promise<void>

  /**
   * 用户头像点击回调（已登录状态）
   */
  onUserClick?: (user: AuthUser) => void

  /**
   * 用户菜单项
   */
  userMenuItems?: Array<{
    text: string
    textEn?: string
    icon?: string
    onClick: (user: AuthUser) => void
  }>

  /**
   * 保护的路由模式（需要登录才能访问）
   * 支持通配符，如 '/admin/*'
   */
  protectedRoutes?: string[]

  /**
   * 未登录访问保护路由时的回调
   * 默认会弹出登录面板
   */
  onProtectedRouteAccess?: (path: string) => void
}

/**
 * 序列化配置为客户端可用的字符串
 */
function serializeConfig(options: AuthPluginOptions): string {
  // 只序列化非函数配置
  const staticConfig = {
    loginText: options.loginText || '登录',
    loginTextEn: options.loginTextEn || 'Login',
    panelTitle: options.panelTitle || '用户登录',
    panelTitleEn: options.panelTitleEn || 'User Login',
    storageKey: options.storageKey || 'ldoc-auth-user',
    protectedRoutes: options.protectedRoutes || [],
    // 标记哪些回调函数存在
    hasCaptcha: !!options.getCaptcha,
    hasOnPanelOpen: !!options.onPanelOpen,
    hasOnPanelClose: !!options.onPanelClose,
    hasOnFormChange: !!options.onFormChange,
    hasOnLogout: !!options.onLogout,
    hasOnUserClick: !!options.onUserClick,
    hasOnProtectedRouteAccess: !!options.onProtectedRouteAccess,
    userMenuItems: options.userMenuItems?.map(item => ({
      text: item.text,
      textEn: item.textEn,
      icon: item.icon
    })) || []
  }
  return JSON.stringify(staticConfig)
}

/**
 * 认证插件
 * 
 * @example
 * ```ts
 * import { authPlugin } from '@ldesign/doc/plugins'
 * 
 * export default defineConfig({
 *   plugins: [
 *     authPlugin({
 *       getCaptcha: async () => {
 *         const res = await fetch('/api/captcha')
 *         const data = await res.json()
 *         return data.imageUrl
 *       },
 *       onPanelOpen: async () => {
 *         // 获取 session 等初始化操作
 *         await fetch('/api/session')
 *       },
 *       onLogin: async (formData) => {
 *         const res = await fetch('/api/login', {
 *           method: 'POST',
 *           body: JSON.stringify(formData)
 *         })
 *         const data = await res.json()
 *         if (data.success) {
 *           return { success: true, user: data.user }
 *         }
 *         return { success: false, error: data.message }
 *       },
 *       onGetUser: async () => {
 *         const res = await fetch('/api/user')
 *         const data = await res.json()
 *         if (data.user) {
 *           return { isLoggedIn: true, user: data.user }
 *         }
 *         return { isLoggedIn: false }
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function authPlugin(options: AuthPluginOptions): LDocPlugin {
  const configStr = serializeConfig(options)

  return definePlugin({
    name: 'ldoc:auth',

    config(config) {
      return {
        ...config,
        // 将认证配置存储到全局，供客户端组件使用
        _authPluginOptions: options
      }
    },

    // 注入到 nav-bar-content-after 插槽
    slots: {
      'nav-bar-content-after': [
        {
          component: 'LDocAuthButton',
          props: { __authConfig: configStr },
          order: 100
        }
      ]
    }
  })
}

/**
 * 创建本地存储认证提供者（用于演示）
 */
export function createLocalStorageAuthProvider(storageKey = 'ldoc-auth'): {
  onLogin: AuthPluginOptions['onLogin']
  onGetUser: AuthPluginOptions['onGetUser']
  onLogout: AuthPluginOptions['onLogout']
} {
  return {
    async onLogin(formData) {
      const { username, password } = formData

      if (!username || !password) {
        return { success: false, error: '请输入用户名和密码' }
      }

      // 模拟验证（实际使用时应该连接后端）
      const user: AuthUser = {
        id: '1',
        name: username,
        email: `${username}@example.com`
      }

      const token = btoa(JSON.stringify({ user, timestamp: Date.now() }))
      localStorage.setItem(storageKey, token)

      return { success: true, user }
    },

    async onGetUser() {
      const token = localStorage.getItem(storageKey)
      if (!token) return { isLoggedIn: false }

      try {
        const { user } = JSON.parse(atob(token))
        return { isLoggedIn: true, user }
      } catch {
        return { isLoggedIn: false }
      }
    },

    async onLogout() {
      localStorage.removeItem(storageKey)
    }
  }
}

/**
 * 创建自定义认证配置
 */
export function defineAuthProvider(options: AuthPluginOptions): AuthPluginOptions {
  return options
}

export default authPlugin
