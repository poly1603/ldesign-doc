/**
 * 安全插件客户端组件
 * 
 * 包含：
 * - LDocSecurityGuard: 路由守卫和访问控制
 * - LDocEncryptedContent: 加密内容解密组件
 */

import {
  defineComponent,
  h,
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  inject
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AuthUser, SecurityPluginOptions, PageAccessRule, EncryptedContent } from './index'
import { RBACUtils, EncryptionUtils, XSSUtils } from './index'

// ============== 安全守卫组件 ==============

export const LDocSecurityGuard = defineComponent({
  name: 'LDocSecurityGuard',
  props: {
    __securityConfig: { type: String, default: '{}' }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()

    // 解析静态配置
    const staticConfig = computed(() => {
      try {
        return JSON.parse(props.__securityConfig)
      } catch {
        return {}
      }
    })

    // 获取动态配置（从全局注入）
    const securityOptions = inject<SecurityPluginOptions | null>(
      Symbol.for('ldoc:security-options'),
      null
    )

    // 获取认证状态
    const authState = inject<{ isLoggedIn: boolean; user: AuthUser | null }>(
      Symbol.for('ldoc:auth-state'),
      { isLoggedIn: false, user: null }
    )

    // 访问被拒绝状态
    const accessDenied = ref(false)
    const deniedReason = ref('')

    /**
     * 检查路径是否匹配规则
     */
    const matchesPath = (path: string, pattern: string): boolean => {
      if (pattern.endsWith('*')) {
        return path.startsWith(pattern.slice(0, -1))
      }
      return path === pattern
    }

    /**
     * 检查用户是否有访问权限
     */
    const checkAccess = async (path: string): Promise<boolean> => {
      const rbacConfig = staticConfig.value.rbac
      if (!rbacConfig) return true

      // 查找匹配的规则
      const matchedRule = rbacConfig.pageRules.find((rule: any) =>
        matchesPath(path, rule.path)
      )

      if (!matchedRule) return true

      const user = authState.user

      // 如果有自定义验证函数
      if (matchedRule.hasValidate && securityOptions?.rbac) {
        const rule = securityOptions.rbac.pageRules.find(r => r.path === matchedRule.path)
        if (rule?.validate) {
          try {
            const result = await rule.validate(user)
            if (!result) {
              deniedReason.value = '自定义验证失败'
              return false
            }
          } catch (e) {
            console.error('[LDoc Security] Validation error:', e)
            deniedReason.value = '验证过程出错'
            return false
          }
        }
      }

      // 检查角色
      if (matchedRule.roles && matchedRule.roles.length > 0) {
        if (!user) {
          deniedReason.value = '需要登录'
          return false
        }

        const hasRole = RBACUtils.hasAnyRole(user, matchedRule.roles)
        if (!hasRole) {
          deniedReason.value = `需要以下角色之一: ${matchedRule.roles.join(', ')}`
          return false
        }
      }

      // 检查权限
      if (matchedRule.permissions && matchedRule.permissions.length > 0) {
        if (!user) {
          deniedReason.value = '需要登录'
          return false
        }

        const roles = rbacConfig.roles || []
        const hasPermission = matchedRule.permissions.some((perm: string) =>
          RBACUtils.hasPermission(user, perm, roles)
        )

        if (!hasPermission) {
          deniedReason.value = `需要以下权限之一: ${matchedRule.permissions.join(', ')}`
          return false
        }
      }

      return true
    }

    /**
     * 路由守卫
     */
    watch(
      () => route.path,
      async (newPath) => {
        const hasAccess = await checkAccess(newPath)

        if (!hasAccess) {
          accessDenied.value = true

          // 记录审计日志
          if (staticConfig.value.audit?.hasLogAccess && securityOptions?.audit?.logAccess) {
            securityOptions.audit.logAccess(authState.user, newPath, false)
          }

          // 调用未授权回调
          if (securityOptions?.rbac?.onUnauthorized) {
            securityOptions.rbac.onUnauthorized(newPath, authState.user)
          }
        } else {
          accessDenied.value = false
          deniedReason.value = ''

          // 记录审计日志
          if (staticConfig.value.audit?.hasLogAccess && securityOptions?.audit?.logAccess) {
            securityOptions.audit.logAccess(authState.user, newPath, true)
          }
        }
      },
      { immediate: true }
    )

    return {
      accessDenied,
      deniedReason
    }
  },
  render() {
    if (!this.accessDenied) {
      return null
    }

    // 显示访问被拒绝页面
    return h('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--ldoc-c-bg)',
        zIndex: 10000
      }
    }, [
      h('div', {
        style: {
          maxWidth: '500px',
          padding: '48px',
          textAlign: 'center'
        }
      }, [
        // 图标
        h('div', {
          style: {
            fontSize: '64px',
            marginBottom: '24px'
          }
        }, '🔒'),

        // 标题
        h('h1', {
          style: {
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--ldoc-c-text-1)',
            marginBottom: '16px'
          }
        }, '访问被拒绝'),

        // 原因
        h('p', {
          style: {
            fontSize: '16px',
            color: 'var(--ldoc-c-text-2)',
            marginBottom: '32px'
          }
        }, this.deniedReason || '您没有权限访问此页面'),

        // 返回按钮
        h('button', {
          onClick: () => {
            window.history.back()
          },
          style: {
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: 'var(--ldoc-c-brand)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }
        }, '返回')
      ])
    ])
  }
})

// ============== 加密内容组件 ==============

export const LDocEncryptedContent = defineComponent({
  name: 'LDocEncryptedContent',
  props: {
    /** 加密的内容 */
    encrypted: { type: Object as () => EncryptedContent, required: true },
    /** 内容 ID（用于审计） */
    contentId: { type: String, default: '' }
  },
  setup(props) {
    const decrypted = ref<string | null>(null)
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    // 获取安全配置
    const securityOptions = inject<SecurityPluginOptions | null>(
      Symbol.for('ldoc:security-options'),
      null
    )

    // 获取认证状态
    const authState = inject<{ user: AuthUser | null }>(
      Symbol.for('ldoc:auth-state'),
      { user: null }
    )

    const encryptionConfig = computed(() => securityOptions?.encryption)

    /**
     * 解密内容
     */
    const decrypt = async () => {
      if (!password.value) {
        error.value = '请输入密码'
        return
      }

      loading.value = true
      error.value = ''

      try {
        // 验证密码（如果配置了验证函数）
        if (encryptionConfig.value?.validatePassword) {
          const isValid = await encryptionConfig.value.validatePassword(password.value)
          if (!isValid) {
            error.value = '密码不正确'
            loading.value = false
            return
          }
        }

        // 解密
        const content = await EncryptionUtils.decrypt(props.encrypted, password.value)
        decrypted.value = content

        // 记录审计日志
        if (securityOptions?.audit?.enabled && securityOptions.audit.logDecryption) {
          securityOptions.audit.logDecryption(authState.user, props.contentId)
        }
      } catch (e) {
        console.error('[LDoc Security] Decryption error:', e)
        error.value = '解密失败，请检查密码是否正确'
      } finally {
        loading.value = false
      }
    }

    return {
      decrypted,
      password,
      error,
      loading,
      encryptionConfig,
      decrypt
    }
  },
  render() {
    // 已解密，显示内容
    if (this.decrypted) {
      return h('div', {
        class: 'ldoc-encrypted-content-decrypted',
        innerHTML: this.decrypted
      })
    }

    // 未解密，显示密码输入框
    return h('div', {
      class: 'ldoc-encrypted-content',
      style: {
        padding: '24px',
        border: '2px dashed var(--ldoc-c-divider)',
        borderRadius: '12px',
        backgroundColor: 'var(--ldoc-c-bg-soft)',
        margin: '16px 0'
      }
    }, [
      // 图标和提示
      h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }
      }, [
        h('span', { style: { fontSize: '24px' } }, '🔒'),
        h('span', {
          style: {
            fontSize: '16px',
            fontWeight: '500',
            color: 'var(--ldoc-c-text-1)'
          }
        }, this.encryptionConfig?.passwordPrompt || '此内容已加密')
      ]),

      // 错误提示
      this.error && h('div', {
        style: {
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: 'var(--ldoc-c-red-soft)',
          color: 'var(--ldoc-c-red)',
          borderRadius: '8px',
          fontSize: '14px'
        }
      }, this.error),

      // 密码输入
      h('div', {
        style: {
          display: 'flex',
          gap: '12px'
        }
      }, [
        h('input', {
          type: 'password',
          placeholder: '请输入解密密码',
          value: this.password,
          onInput: (e: Event) => {
            this.password = (e.target as HTMLInputElement).value
          },
          onKeydown: (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              this.decrypt()
            }
          },
          style: {
            flex: 1,
            padding: '12px 16px',
            border: '1px solid var(--ldoc-c-divider)',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'var(--ldoc-c-bg)',
            color: 'var(--ldoc-c-text-1)'
          }
        }),
        h('button', {
          onClick: this.decrypt,
          disabled: this.loading,
          style: {
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: this.loading
              ? 'var(--ldoc-c-brand-soft)'
              : 'var(--ldoc-c-brand)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: this.loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }
        }, this.loading ? '解密中...' : '解密')
      ])
    ])
  }
})

// ============== XSS 防护组件 ==============

export const LDocSafeHtml = defineComponent({
  name: 'LDocSafeHtml',
  props: {
    /** HTML 内容 */
    html: { type: String, required: true },
    /** 是否启用清理 */
    sanitize: { type: Boolean, default: true }
  },
  setup(props) {
    // 获取安全配置
    const securityOptions = inject<SecurityPluginOptions | null>(
      Symbol.for('ldoc:security-options'),
      null
    )

    const xssConfig = computed(() => securityOptions?.xss)

    const safeHtml = computed(() => {
      if (!props.sanitize || !xssConfig.value?.enabled) {
        return props.html
      }

      return XSSUtils.sanitizeHtml(props.html, xssConfig.value)
    })

    return {
      safeHtml
    }
  },
  render() {
    return h('div', {
      innerHTML: this.safeHtml
    })
  }
})

// ============== 导出 ==============

export default LDocSecurityGuard
