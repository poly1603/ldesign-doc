/**
 * 认证插件客户端组件
 * 
 * 包含：
 * - LDocAuthButton: 导航栏登录按钮/用户信息
 * - LDocLoginPanel: 登录弹窗面板
 */

import {
  defineComponent,
  h,
  ref,
  reactive,
  computed,
  onMounted,
  onUnmounted,
  watch,
  Teleport,
  Transition,
  inject,
  provide
} from 'vue'
import LDocModal from '../../client/components/LDocModal.vue'
import { useRoute } from 'vue-router'
import type { AuthUser, LoginFormData, AuthPluginOptions, LoginResult, GetUserResult } from './index'

// ============== 全局状态 ==============

// 认证状态 Symbol
const authStateSymbol = Symbol.for('ldoc:auth-state')

// 认证配置 Symbol
const authOptionsSymbol = Symbol.for('ldoc:auth-options')

interface AuthState {
  isLoggedIn: boolean
  user: AuthUser | null
  loading: boolean
  panelVisible: boolean
}

// ============== 登录面板组件 ==============

const LoginPanel = defineComponent({
  name: 'LDocLoginPanel',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '用户登录' },
    hasCaptcha: { type: Boolean, default: false }
  },
  emits: ['close', 'login', 'form-change', 'refresh-captcha'],
  setup(props, { emit }) {
    const formData = reactive<LoginFormData>({
      username: '',
      password: '',
      captcha: ''
    })

    const captchaUrl = ref('')
    const loading = ref(false)
    const error = ref('')
    const passwordVisible = ref(false)

    // 表单字段变化处理
    const handleFieldChange = (field: keyof LoginFormData, value: string) => {
      formData[field] = value
      emit('form-change', field, value, { ...formData })
    }

    // 提交登录
    const handleSubmit = async () => {
      error.value = ''

      if (!formData.username.trim()) {
        error.value = '请输入用户名'
        return
      }
      if (!formData.password) {
        error.value = '请输入密码'
        return
      }
      if (props.hasCaptcha && !formData.captcha.trim()) {
        error.value = '请输入验证码'
        return
      }

      loading.value = true
      emit('login', { ...formData })
    }

    // 刷新验证码
    const refreshCaptcha = () => {
      emit('refresh-captcha')
    }

    // 关闭面板
    const handleClose = () => {
      emit('close')
    }

    // 键盘事件
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'Enter') {
        handleSubmit()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeydown)
    })

    // 暴露方法供父组件调用
    const setLoading = (val: boolean) => { loading.value = val }
    const setError = (msg: string) => { error.value = msg }
    const setCaptchaUrl = (url: string) => { captchaUrl.value = url }
    const resetForm = () => {
      formData.username = ''
      formData.password = ''
      formData.captcha = ''
      error.value = ''
    }

    return {
      formData,
      captchaUrl,
      loading,
      error,
      passwordVisible,
      handleFieldChange,
      handleSubmit,
      refreshCaptcha,
      handleClose,
      setLoading,
      setError,
      setCaptchaUrl,
      resetForm
    }
  },
  render() {
    const inputStyle = {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid var(--ldoc-c-divider, #e5e7eb)',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: 'var(--ldoc-c-bg, #fff)',
      color: 'var(--ldoc-c-text-1, #1f2937)'
    }

    const labelStyle = {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: '500',
      color: 'var(--ldoc-c-text-2, #4b5563)'
    }

    return h(LDocModal, {
      modelValue: this.visible,
      namespace: 'login',
      zIndex: 9999,
      maskClosable: true,
      closeOnEsc: true,
      onClose: this.handleClose,
      'onUpdate:modelValue': (v: boolean) => { if (!v) this.handleClose() }
    }, {
      default: () => h('div', {
        class: 'ldoc-login-panel',
        style: {
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--ldoc-c-bg, #fff)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }, [
        // 头部
        h('div', {
          style: {
            padding: '24px 24px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }, [
          h('h2', {
            style: {
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--ldoc-c-text-1, #1f2937)'
            }
          }, this.title),
          h('button', {
            onClick: this.handleClose,
            style: {
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--ldoc-c-text-3, #9ca3af)',
              fontSize: '20px',
              lineHeight: 1,
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }
          }, '×')
        ]),

        // 表单
        h('div', {
          style: { padding: '24px' }
        }, [
          // 错误提示
          this.error && h('div', {
            style: {
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: 'var(--ldoc-c-red-soft, #fee2e2)',
              color: 'var(--ldoc-c-red, #dc2626)',
              borderRadius: '8px',
              fontSize: '14px'
            }
          }, this.error),

          // 用户名
          h('div', { style: { marginBottom: '16px' } }, [
            h('label', { style: labelStyle }, '用户名'),
            h('input', {
              type: 'text',
              placeholder: '请输入用户名',
              value: this.formData.username,
              onInput: (e: Event) => this.handleFieldChange('username', (e.target as HTMLInputElement).value),
              style: inputStyle,
              autocomplete: 'username'
            })
          ]),

          // 密码
          h('div', { style: { marginBottom: '16px' } }, [
            h('label', { style: labelStyle }, '密码'),
            h('div', { style: { position: 'relative' } }, [
              h('input', {
                type: this.passwordVisible ? 'text' : 'password',
                placeholder: '请输入密码',
                value: this.formData.password,
                onInput: (e: Event) => this.handleFieldChange('password', (e.target as HTMLInputElement).value),
                style: { ...inputStyle, paddingRight: '44px' },
                autocomplete: 'current-password'
              }),
              h('button', {
                type: 'button',
                onClick: () => { this.passwordVisible = !this.passwordVisible },
                style: {
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--ldoc-c-text-3, #9ca3af)',
                  fontSize: '14px'
                }
              }, this.passwordVisible ? '🙈' : '👁')
            ])
          ]),

          // 验证码
          this.hasCaptcha && h('div', { style: { marginBottom: '16px' } }, [
            h('label', { style: labelStyle }, '验证码'),
            h('div', { style: { display: 'flex', gap: '12px' } }, [
              h('input', {
                type: 'text',
                placeholder: '请输入验证码',
                value: this.formData.captcha,
                onInput: (e: Event) => this.handleFieldChange('captcha', (e.target as HTMLInputElement).value),
                style: { ...inputStyle, flex: 1 },
                autocomplete: 'off'
              }),
              h('div', {
                style: {
                  width: '120px',
                  height: '48px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: 'var(--ldoc-c-bg-soft, #f3f4f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                onClick: this.refreshCaptcha,
                title: '点击刷新验证码'
              }, [
                this.captchaUrl
                  ? h('img', {
                    src: this.captchaUrl,
                    alt: '验证码',
                    style: { width: '100%', height: '100%', objectFit: 'cover' }
                  })
                  : h('span', {
                    style: { fontSize: '12px', color: 'var(--ldoc-c-text-3)' }
                  }, '点击获取')
              ])
            ])
          ]),

          // 登录按钮
          h('button', {
            onClick: this.handleSubmit,
            disabled: this.loading,
            style: {
              width: '100%',
              padding: '14px',
              marginTop: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: this.loading ? 'var(--ldoc-c-brand-soft)' : 'var(--ldoc-c-brand, #3b82f6)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '500',
              cursor: this.loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              transform: 'scale(1)'
            },
            onMousedown: (e: MouseEvent) => {
              if (!this.loading) (e.target as HTMLElement).style.transform = 'scale(0.98)'
            },
            onMouseup: (e: MouseEvent) => {
              (e.target as HTMLElement).style.transform = 'scale(1)'
            }
          }, this.loading ? '登录中...' : '登录')
        ])
      ])
    })
  }
})

// ============== 用户菜单组件 ==============

const UserMenu = defineComponent({
  name: 'LDocUserMenu',
  props: {
    user: { type: Object as () => AuthUser, required: true },
    menuItems: { type: Array as () => Array<{ text: string; textEn?: string; icon?: string }>, default: () => [] },
    isEnglish: { type: Boolean, default: false }
  },
  emits: ['logout', 'menu-click'],
  setup(props, { emit }) {
    const visible = ref(false)
    const menuRef = ref<HTMLElement | null>(null)

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
        visible.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return { visible, menuRef }
  },
  render() {
    const { user, menuItems, isEnglish } = this

    return h('div', {
      ref: 'menuRef',
      style: { position: 'relative' }
    }, [
      // 用户头像/名称
      h('button', {
        onClick: () => { this.visible = !this.visible },
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          border: 'none',
          borderRadius: '20px',
          backgroundColor: 'var(--ldoc-c-bg-soft, #f3f4f6)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }
      }, [
        // 头像
        user.avatar
          ? h('img', {
            src: user.avatar,
            alt: user.name,
            style: {
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              objectFit: 'cover'
            }
          })
          : h('div', {
            style: {
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--ldoc-c-brand, #3b82f6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500'
            }
          }, user.name.charAt(0).toUpperCase()),
        // 名称
        h('span', {
          style: {
            fontSize: '14px',
            color: 'var(--ldoc-c-text-1, #1f2937)',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }
        }, user.name),
        // 下拉箭头
        h('svg', {
          viewBox: '0 0 24 24',
          width: '16',
          height: '16',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          style: {
            color: 'var(--ldoc-c-text-3)',
            transition: 'transform 0.2s',
            transform: this.visible ? 'rotate(180deg)' : 'rotate(0)'
          }
        }, [
          h('path', { d: 'M6 9l6 6 6-6' })
        ])
      ]),

      // 下拉菜单
      this.visible && h('div', {
        style: {
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          minWidth: '160px',
          backgroundColor: 'var(--ldoc-c-bg, #fff)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          zIndex: 1000
        }
      }, [
        // 用户信息
        h('div', {
          style: {
            padding: '12px 16px',
            borderBottom: '1px solid var(--ldoc-c-divider, #e5e7eb)'
          }
        }, [
          h('div', {
            style: {
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--ldoc-c-text-1)'
            }
          }, user.name),
          user.email && h('div', {
            style: {
              fontSize: '12px',
              color: 'var(--ldoc-c-text-3)',
              marginTop: '2px'
            }
          }, user.email)
        ]),

        // 菜单项
        ...menuItems.map((item, index) => h('button', {
          key: index,
          onClick: () => {
            this.visible = false
            this.$emit('menu-click', index)
          },
          style: {
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--ldoc-c-text-1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          },
          onMouseenter: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = 'var(--ldoc-c-bg-soft)'
          },
          onMouseleave: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent'
          }
        }, [
          item.icon && h('span', {}, item.icon),
          isEnglish && item.textEn ? item.textEn : item.text
        ])),

        // 退出登录
        h('button', {
          onClick: () => {
            this.visible = false
            this.$emit('logout')
          },
          style: {
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            borderTop: menuItems.length > 0 ? '1px solid var(--ldoc-c-divider)' : 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--ldoc-c-red, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          },
          onMouseenter: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = 'var(--ldoc-c-red-soft)'
          },
          onMouseleave: (e: MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent'
          }
        }, [
          h('span', {}, '🚪'),
          isEnglish ? 'Logout' : '退出登录'
        ])
      ])
    ])
  }
})

// ============== 主认证按钮组件 ==============

export const LDocAuthButton = defineComponent({
  name: 'LDocAuthButton',
  props: {
    __authConfig: { type: String, default: '{}' }
  },
  setup(props) {
    const route = useRoute()

    // 解析静态配置
    const staticConfig = computed(() => {
      try {
        return JSON.parse(props.__authConfig)
      } catch {
        return {}
      }
    })

    // 获取动态配置（从全局注入）
    const authOptions = inject<AuthPluginOptions | null>(authOptionsSymbol, null)

    // 认证状态
    const state = reactive<AuthState>({
      isLoggedIn: false,
      user: null,
      loading: true,
      panelVisible: false
    })

    // 登录面板引用
    const loginPanelRef = ref<InstanceType<typeof LoginPanel> | null>(null)

    // 是否英文环境
    const isEnglish = computed(() => route.path.startsWith('/en/'))

    // 显示文本
    const loginText = computed(() => {
      return isEnglish.value
        ? (staticConfig.value.loginTextEn || 'Login')
        : (staticConfig.value.loginText || '登录')
    })

    const panelTitle = computed(() => {
      return isEnglish.value
        ? (staticConfig.value.panelTitleEn || 'User Login')
        : (staticConfig.value.panelTitle || '用户登录')
    })

    // 初始化：获取用户信息
    const initAuth = async () => {
      state.loading = true
      try {
        if (authOptions?.onGetUser) {
          const result = await authOptions.onGetUser()
          state.isLoggedIn = result.isLoggedIn
          state.user = result.user || null
        }
      } catch (e) {
        console.error('[LDoc Auth] Failed to get user:', e)
        state.isLoggedIn = false
        state.user = null
      } finally {
        state.loading = false
      }
    }

    // 打开登录面板
    const openPanel = async () => {
      state.panelVisible = true

      // 调用 onPanelOpen 回调
      if (authOptions?.onPanelOpen) {
        try {
          await authOptions.onPanelOpen()
        } catch (e) {
          console.error('[LDoc Auth] onPanelOpen error:', e)
        }
      }

      // 获取验证码
      if (authOptions?.getCaptcha) {
        await refreshCaptcha()
      }
    }

    // 关闭登录面板
    const closePanel = () => {
      state.panelVisible = false
      loginPanelRef.value?.resetForm()

      if (authOptions?.onPanelClose) {
        authOptions.onPanelClose()
      }
    }

    // 刷新验证码
    const refreshCaptcha = async () => {
      if (!authOptions?.getCaptcha) return

      try {
        let url: string
        const captchaSource = authOptions.getCaptcha

        if (typeof captchaSource === 'string') {
          url = captchaSource
        } else {
          const result = captchaSource()
          url = result instanceof Promise ? await result : result
        }

        loginPanelRef.value?.setCaptchaUrl(url)
      } catch (e) {
        console.error('[LDoc Auth] Failed to get captcha:', e)
      }
    }

    // 表单变化处理
    const handleFormChange = (field: keyof LoginFormData, value: string, formData: LoginFormData) => {
      if (authOptions?.onFormChange) {
        authOptions.onFormChange(field, value, formData)
      }
    }

    // 登录处理
    const handleLogin = async (formData: LoginFormData) => {
      if (!authOptions?.onLogin) {
        loginPanelRef.value?.setError('登录功能未配置')
        loginPanelRef.value?.setLoading(false)
        return
      }

      loginPanelRef.value?.setLoading(true)
      loginPanelRef.value?.setError('')

      try {
        const result = await authOptions.onLogin(formData)

        if (result.success && result.user) {
          state.isLoggedIn = true
          state.user = result.user
          closePanel()
        } else {
          loginPanelRef.value?.setError(result.error || '登录失败')
          // 刷新验证码
          if (authOptions.getCaptcha) {
            await refreshCaptcha()
          }
        }
      } catch (e) {
        loginPanelRef.value?.setError('登录请求失败，请稍后重试')
        console.error('[LDoc Auth] Login error:', e)
      } finally {
        loginPanelRef.value?.setLoading(false)
      }
    }

    // 退出登录
    const handleLogout = async () => {
      if (authOptions?.onLogout) {
        try {
          await authOptions.onLogout()
        } catch (e) {
          console.error('[LDoc Auth] Logout error:', e)
        }
      }

      state.isLoggedIn = false
      state.user = null
    }

    // 菜单项点击
    const handleMenuClick = (index: number) => {
      const menuItems = authOptions?.userMenuItems
      if (menuItems && menuItems[index] && state.user) {
        menuItems[index].onClick(state.user)
      }
    }

    // 用户点击
    const handleUserClick = () => {
      if (authOptions?.onUserClick && state.user) {
        authOptions.onUserClick(state.user)
      }
    }

    // 路由守卫：检查保护路由
    watch(() => route.path, (newPath) => {
      const protectedRoutes = staticConfig.value.protectedRoutes || []

      const needsAuth = protectedRoutes.some((pattern: string) => {
        if (pattern.endsWith('*')) {
          return newPath.startsWith(pattern.slice(0, -1))
        }
        return newPath === pattern
      })

      if (needsAuth && !state.isLoggedIn && !state.loading) {
        if (authOptions?.onProtectedRouteAccess) {
          authOptions.onProtectedRouteAccess(newPath)
        } else {
          // 默认弹出登录面板
          openPanel()
        }
      }
    }, { immediate: true })

    // 初始化
    onMounted(() => {
      initAuth()

      // 注入样式
      const styleId = 'ldoc-auth-style'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
          .ldoc-fade-enter-active,
          .ldoc-fade-leave-active {
            transition: opacity var(--ldoc-login-enter-duration, 0.2s) var(--ldoc-login-ease, ease);
          }
          .ldoc-fade-enter-from,
          .ldoc-fade-leave-to {
            opacity: 0;
          }
          .ldoc-scale-enter-active,
          .ldoc-scale-leave-active {
            transition: all var(--ldoc-login-enter-duration, 0.25s) var(--ldoc-login-ease, cubic-bezier(0.4, 0, 0.2, 1));
          }
          .ldoc-scale-enter-from,
          .ldoc-scale-leave-to {
            opacity: 0;
            transform: var(--ldoc-login-transform-from, scale(0.95));
          }
          .ldoc-login-panel input:focus {
            border-color: var(--ldoc-c-brand, #3b82f6) !important;
            box-shadow: 0 0 0 3px var(--ldoc-c-brand-soft, rgba(59, 130, 246, 0.1)) !important;
          }
        `
        document.head.appendChild(style)
      }
    })

    // 提供状态给子组件
    provide(authStateSymbol, state)

    return {
      state,
      staticConfig,
      isEnglish,
      loginText,
      panelTitle,
      loginPanelRef,
      openPanel,
      closePanel,
      handleFormChange,
      handleLogin,
      handleLogout,
      handleMenuClick,
      handleUserClick,
      refreshCaptcha
    }
  },
  render() {
    const { state, staticConfig, isEnglish, loginText, panelTitle } = this

    // 加载中
    if (state.loading) {
      return h('div', {
        style: {
          width: '80px',
          height: '32px',
          borderRadius: '16px',
          backgroundColor: 'var(--ldoc-c-bg-soft)',
          animation: 'pulse 1.5s infinite'
        }
      })
    }

    // 已登录：显示用户菜单
    if (state.isLoggedIn && state.user) {
      return h(UserMenu, {
        user: state.user,
        menuItems: staticConfig.userMenuItems || [],
        isEnglish,
        onLogout: this.handleLogout,
        onMenuClick: this.handleMenuClick
      })
    }

    // 未登录：显示登录按钮
    return h('div', {}, [
      h('button', {
        onClick: this.openPanel,
        style: {
          padding: '8px 20px',
          border: 'none',
          borderRadius: '20px',
          backgroundColor: 'var(--ldoc-c-brand, #3b82f6)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.1s'
        },
        onMouseenter: (e: MouseEvent) => {
          (e.target as HTMLElement).style.backgroundColor = 'var(--ldoc-c-brand-dark, #2563eb)'
        },
        onMouseleave: (e: MouseEvent) => {
          (e.target as HTMLElement).style.backgroundColor = 'var(--ldoc-c-brand, #3b82f6)'
        }
      }, loginText),

      // 登录面板
      h(LoginPanel, {
        ref: 'loginPanelRef',
        visible: state.panelVisible,
        title: panelTitle,
        hasCaptcha: staticConfig.hasCaptcha,
        onClose: this.closePanel,
        onLogin: this.handleLogin,
        onFormChange: this.handleFormChange,
        onRefreshCaptcha: this.refreshCaptcha
      })
    ])
  }
})

// ============== 导出 ==============

export { LoginPanel, UserMenu }

export default LDocAuthButton
