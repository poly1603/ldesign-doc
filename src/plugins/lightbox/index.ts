/**
 * 图片灯箱插件 - 点击图片放大预览
 */
import { definePlugin } from '../../plugin/definePlugin'
import { defineComponent, h, ref, onMounted, onUnmounted, Teleport } from 'vue'
import type { LDocPlugin } from '../../shared/types'

export interface LightboxPluginOptions {
  /** 是否启用缩放 */
  zoom?: boolean
  /** 背景色 */
  background?: string
  /** 选择器 */
  selector?: string
}

/**
 * 灯箱组件
 */
const LightboxOverlay = defineComponent({
  name: 'LDocLightbox',
  setup() {
    const visible = ref(false)
    const imageSrc = ref('')
    const imageAlt = ref('')
    const scale = ref(1)

    const open = (src: string, alt: string) => {
      imageSrc.value = src
      imageAlt.value = alt
      scale.value = 1
      visible.value = true
      document.body.style.overflow = 'hidden'
    }

    const close = () => {
      visible.value = false
      document.body.style.overflow = ''
    }

    const zoomIn = () => {
      scale.value = Math.min(scale.value + 0.25, 3)
    }

    const zoomOut = () => {
      scale.value = Math.max(scale.value - 0.25, 0.5)
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
    }

    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.ldoc-content')) {
        const img = target as HTMLImageElement
        open(img.src, img.alt)
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleImageClick)
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleImageClick)
      document.removeEventListener('keydown', handleKeydown)
    })

    // 暴露方法给外部使用
    const instance = { open, close }
    if (typeof window !== 'undefined') {
      (window as any).__LDOC_LIGHTBOX__ = instance
    }

    return () => {
      if (!visible.value) return null

      return h(Teleport, { to: 'body' }, [
        h('div', {
          class: 'ldoc-lightbox-overlay',
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
          // 关闭按钮
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, [
            h('svg', {
              width: 24,
              height: 24,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2,
              innerHTML: '<path d="M18 6L6 18M6 6l12 12"/>'
            })
          ]),
          // 缩放控制
          h('div', {
            style: {
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '20px'
            },
            onClick: (e: Event) => e.stopPropagation()
          }, [
            h('button', {
              onClick: zoomOut,
              style: {
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }
            }, '−'),
            h('span', {
              style: {
                color: 'white',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center'
              }
            }, `${Math.round(scale.value * 100)}%`),
            h('button', {
              onClick: zoomIn,
              style: {
                width: '32px',
                height: '32px',
                border: 'none',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }
            }, '+')
          ]),
          // 图片
          h('img', {
            src: imageSrc.value,
            alt: imageAlt.value,
            onClick: (e: Event) => e.stopPropagation(),
            style: {
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              transform: `scale(${scale.value})`,
              transition: 'transform 0.2s ease',
              cursor: 'default'
            }
          })
        ])
      ])
    }
  }
})

export function lightboxPlugin(options: LightboxPluginOptions = {}): LDocPlugin {
  return definePlugin({
    name: 'ldoc-plugin-lightbox',

    slots: {
      'layout-bottom': {
        component: LightboxOverlay,
        props: {} as Record<string, unknown>,
        order: 200
      }
    },

    globalComponents: [
      { name: 'LDocLightbox', component: LightboxOverlay }
    ]
  })
}

export default lightboxPlugin
