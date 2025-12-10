/**
 * 认证插件 - 支持自定义登录功能
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, AuthProvider, AuthUser, AuthCredentials, AuthResult } from '../../shared/types'

export interface AuthPluginOptions {
  /** 认证提供者 */
  provider?: AuthProvider
  /** 保护的路由模式 */
  protectedRoutes?: string[]
  /** 登录页面路径 */
  loginPage?: string
  /** 登录成功后重定向路径 */
  redirectAfterLogin?: string
  /** 存储键名 */
  storageKey?: string
}

/**
 * 默认的本地存储认证提供者
 */
export function createLocalStorageAuthProvider(storageKey = 'ldoc-auth'): AuthProvider {
  return {
    name: 'localStorage',

    async login(credentials: AuthCredentials): Promise<AuthResult> {
      // 简单的本地验证（实际使用时应该连接后端）
      const { username, password } = credentials

      if (!username || !password) {
        return { success: false, error: '请输入用户名和密码' }
      }

      // 模拟验证
      const user: AuthUser = {
        id: '1',
        name: username as string,
        email: `${username}@example.com`
      }

      const token = btoa(JSON.stringify({ user, timestamp: Date.now() }))
      localStorage.setItem(storageKey, token)

      return { success: true, user, token }
    },

    async logout(): Promise<void> {
      localStorage.removeItem(storageKey)
    },

    async getUser(): Promise<AuthUser | null> {
      const token = localStorage.getItem(storageKey)
      if (!token) return null

      try {
        const { user } = JSON.parse(atob(token))
        return user
      } catch {
        return null
      }
    },

    async isAuthenticated(): Promise<boolean> {
      const user = await this.getUser()
      return !!user
    }
  }
}

/**
 * 认证插件
 */
export function authPlugin(options: AuthPluginOptions = {}): LDocPlugin {
  const {
    provider = createLocalStorageAuthProvider(),
    protectedRoutes = [],
    loginPage = '/login',
    redirectAfterLogin = '/'
  } = options

  return definePlugin({
    name: 'ldoc:auth',

    config(config) {
      return {
        ...config,
        auth: {
          enabled: true,
          provider,
          protectedRoutes,
          loginPage,
          redirectAfterLogin
        }
      }
    },

    // 可以在客户端配置文件中添加路由守卫
    clientConfigFile: `
// Auth client config
export default {
  enhance({ router }) {
    router.beforeEach(async (to, from, next) => {
      const protectedRoutes = ${JSON.stringify(protectedRoutes)}
      const loginPage = '${loginPage}'
      
      // 检查是否需要认证
      const needsAuth = protectedRoutes.some(pattern => {
        if (pattern.endsWith('*')) {
          return to.path.startsWith(pattern.slice(0, -1))
        }
        return to.path === pattern
      })
      
      if (needsAuth) {
        // 这里应该调用认证检查
        const isAuthenticated = false // TODO: 实际认证检查
        
        if (!isAuthenticated && to.path !== loginPage) {
          next({ path: loginPage, query: { redirect: to.fullPath } })
          return
        }
      }
      
      next()
    })
  }
}
`
  })
}

/**
 * 创建自定义认证提供者
 */
export function defineAuthProvider(provider: AuthProvider): AuthProvider {
  return provider
}

export default authPlugin
