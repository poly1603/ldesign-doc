/**
 * 内置插件客户端配置
 * 
 * 这个文件导出所有内置插件的客户端配置（slots、globalComponents 等）
 * 将被虚拟模块导入
 */
import { defineComponent, h, ref, onMounted, onUnmounted, computed, Teleport } from 'vue'
import type { PluginSlots, PluginGlobalComponent } from '../shared/types'

// ============== 返回顶部按钮 ==============

const BackToTopButton = defineComponent({
  name: 'LDocBackToTop',
  setup() {
    const visible = ref(false)
    const threshold = 300

    const checkScroll = () => {
      visible.value = window.scrollY > threshold
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    onMounted(() => {
      window.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', checkScroll)
    })

    return () => h('div', {
      class: 'ldoc-back-to-top',
      style: {
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        zIndex: 100,
        opacity: visible.value ? 1 : 0,
        visibility: visible.value ? 'visible' : 'hidden',
        transform: visible.value ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s ease'
      }
    }, [
      h('button', {
        title: '返回顶部',
        onClick: scrollToTop,
        style: {
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--vp-c-brand, #3b82f6)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }, [
        h('svg', {
          width: 20,
          height: 20,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2.5',
          innerHTML: '<path d="M18 15l-6-6-6 6"/>'
        })
      ])
    ])
  }
})

// ============== 图片灯箱 ==============

const LightboxOverlay = defineComponent({
  name: 'LDocLightbox',
  setup() {
    const visible = ref(false)
    const imageSrc = ref('')
    const scale = ref(1)

    const open = (src: string) => {
      imageSrc.value = src
      scale.value = 1
      visible.value = true
      document.body.style.overflow = 'hidden'
    }

    const close = () => {
      visible.value = false
      document.body.style.overflow = ''
    }

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.ldoc-content')) {
        open((target as HTMLImageElement).src)
      }
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    onMounted(() => {
      document.addEventListener('click', handleImageClick)
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleImageClick)
      document.removeEventListener('keydown', handleKeydown)
    })

    return () => {
      if (!visible.value) return null

      return h(Teleport, { to: 'body' }, [
        h('div', {
          onClick: close,
          style: {
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }
        }, [
          h('img', {
            src: imageSrc.value,
            onClick: (e: Event) => e.stopPropagation(),
            style: {
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              transform: `scale(${scale.value})`,
              cursor: 'default'
            }
          }),
          h('button', {
            onClick: close,
            style: {
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              borderRadius: '50%',
              cursor: 'pointer'
            }
          }, '✕')
        ])
      ])
    }
  }
})

// ============== 公告栏 ==============

const AnnouncementBar = defineComponent({
  name: 'LDocAnnouncement',
  props: {
    content: { type: String, default: '' },
    type: { type: String, default: 'info' },
    closable: { type: Boolean, default: true },
    storageKey: { type: String, default: '' }
  },
  setup(props) {
    const visible = ref(true)

    onMounted(() => {
      if (props.storageKey) {
        const closed = localStorage.getItem(`ldoc-announcement-${props.storageKey}`)
        if (closed === 'true') visible.value = false
      }
    })

    const close = () => {
      visible.value = false
      if (props.storageKey) {
        localStorage.setItem(`ldoc-announcement-${props.storageKey}`, 'true')
      }
    }

    const colors: Record<string, { bg: string; text: string }> = {
      info: { bg: 'var(--vp-c-brand-soft, #e0f2fe)', text: 'var(--vp-c-brand, #3b82f6)' },
      warning: { bg: '#fef3c7', text: '#d97706' },
      success: { bg: '#d1fae5', text: '#059669' },
      error: { bg: '#fee2e2', text: '#dc2626' }
    }

    return () => {
      if (!visible.value || !props.content) return null

      const color = colors[props.type] || colors.info

      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: color.bg,
          color: color.text,
          fontSize: '14px',
          fontWeight: '500'
        }
      }, [
        h('span', { innerHTML: props.content }),
        props.closable && h('button', {
          onClick: close,
          style: {
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: color.text,
            cursor: 'pointer'
          }
        }, '✕')
      ])
    }
  }
})

// ============== Demo 组件 ==============

import { DemoBox, Demo } from './demo/client'

// ============== 导出配置 ==============

export interface BuiltinPluginConfig {
  backToTop?: boolean
  lightbox?: boolean
  announcement?: {
    content: string
    type?: 'info' | 'warning' | 'success' | 'error'
    closable?: boolean
    storageKey?: string
  }
}

export function getBuiltinSlots(config: BuiltinPluginConfig = {}): PluginSlots {
  const slots: PluginSlots = {}

  if (config.backToTop !== false) {
    slots['layout-bottom'] = [
      { component: BackToTopButton, props: {}, order: 100 }
    ]
  }

  if (config.lightbox !== false) {
    const existing = slots['layout-bottom'] || []
    slots['layout-bottom'] = [
      ...(Array.isArray(existing) ? existing : [existing]),
      { component: LightboxOverlay, props: {}, order: 200 }
    ]
  }

  if (config.announcement) {
    slots['layout-top'] = [
      { component: AnnouncementBar, props: config.announcement, order: -100 }
    ]
  }

  return slots
}

export function getBuiltinComponents(): PluginGlobalComponent[] {
  return [
    { name: 'LDocBackToTop', component: BackToTopButton },
    { name: 'LDocLightbox', component: LightboxOverlay },
    { name: 'LDocAnnouncement', component: AnnouncementBar },
    { name: 'Demo', component: Demo },
    { name: 'DemoBox', component: DemoBox }
  ]
}

// 默认导出 - 启用所有内置功能
export default {
  slots: getBuiltinSlots({
    backToTop: true,
    lightbox: true,
    announcement: {
      content: '🎉 <strong>LDoc 1.0</strong> 正式发布！全新的文档体验，欢迎体验！',
      type: 'info',
      closable: true,
      storageKey: 'ldoc-v1.0'
    }
  }),
  globalComponents: getBuiltinComponents()
}
