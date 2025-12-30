/**
 * @ldesign/doc - 认证系统类型定义
 * 
 * 定义认证配置、提供者、用户等相关类型
 */

// ============== 认证配置 ==============

/**
 * 认证配置
 * 
 * @example
 * ```ts
 * const authConfig: AuthConfig = {
 *   enabled: true,
 *   provider: myAuthProvider,
 *   protectedRoutes: ['/admin/*', '/private/*'],
 *   loginPage: '/login',
 *   redirectAfterLogin: '/'
 * }
 * ```
 */
export interface AuthConfig {
  /** 是否启用认证 */
  enabled?: boolean
  /** 认证提供者 */
  provider?: AuthProvider
  /** 保护的路由（支持通配符） */
  protectedRoutes?: string[]
  /** 登录页面路径 */
  loginPage?: string
  /** 认证后重定向路径 */
  redirectAfterLogin?: string
  /** 自定义认证逻辑 */
  customAuth?: CustomAuthHandler
}

// ============== 认证提供者 ==============

/**
 * 认证提供者接口
 * 实现此接口来创建自定义认证提供者
 * 
 * @example
 * ```ts
 * const myProvider: AuthProvider = {
 *   name: 'my-auth',
 *   async login(credentials) {
 *     const response = await fetch('/api/login', {
 *       method: 'POST',
 *       body: JSON.stringify(credentials)
 *     })
 *     return response.json()
 *   },
 *   async logout() {
 *     await fetch('/api/logout', { method: 'POST' })
 *   },
 *   async getUser() {
 *     const response = await fetch('/api/me')
 *     return response.json()
 *   },
 *   async isAuthenticated() {
 *     const user = await this.getUser()
 *     return !!user
 *   }
 * }
 * ```
 */
export interface AuthProvider {
  /** 提供者名称 */
  name: string
  /** 登录方法 */
  login: (credentials: AuthCredentials) => Promise<AuthResult>
  /** 登出方法 */
  logout: () => Promise<void>
  /** 获取当前用户 */
  getUser: () => Promise<AuthUser | null>
  /** 检查是否已认证 */
  isAuthenticated: () => Promise<boolean>
}

// ============== 认证凭据 ==============

/**
 * 认证凭据
 */
export interface AuthCredentials {
  /** 用户名 */
  username?: string
  /** 密码 */
  password?: string
  /** Token */
  token?: string
  /** 其他凭据字段 */
  [key: string]: unknown
}

// ============== 认证结果 ==============

/**
 * 认证结果
 */
export interface AuthResult {
  /** 是否成功 */
  success: boolean
  /** 用户信息（成功时） */
  user?: AuthUser
  /** Token（成功时） */
  token?: string
  /** 错误信息（失败时） */
  error?: string
}

// ============== 用户信息 ==============

/**
 * 用户信息
 */
export interface AuthUser {
  /** 用户 ID */
  id: string
  /** 用户名 */
  name: string
  /** 邮箱 */
  email?: string
  /** 头像 URL */
  avatar?: string
  /** 用户角色 */
  roles?: string[]
  /** 其他用户字段 */
  [key: string]: unknown
}

// ============== 自定义认证 ==============

/**
 * 自定义认证处理器
 */
export type CustomAuthHandler = (ctx: AuthContext) => Promise<boolean>

/**
 * 认证上下文
 */
export interface AuthContext {
  /** 当前路由 */
  route: string
  /** 当前用户 */
  user: AuthUser | null
  /** 认证凭据 */
  credentials?: AuthCredentials
}
