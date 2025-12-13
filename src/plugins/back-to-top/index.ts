/**
 * 返回顶部插件
 */
import { definePlugin } from '../../plugin/definePlugin'
import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'
import type { LDocPlugin } from '../../shared/types'

export interface BackToTopPluginOptions {
  /** 显示按钮的滚动阈值（像素），默认 300 */
  threshold?: number
  /** 按钮位置，默认 'right' */
  position?: 'left' | 'right'
  /** 按钮底部偏移（像素），默认 40 */
  bottom?: number
  /** 按钮侧边偏移（像素），默认 40 */
  side?: number
}

/**
 * 返回顶部按钮组件
 */
const BackToTopButton = defineComponent({
  name: 'LDocBackToTop',
  props: {
    threshold: { type: Number, default: 300 },
    position: { type: String, default: 'right' },
    bottom: { type: Number, default: 40 },
    side: { type: Number, default: 40 }
  },
  setup(props) {
    const visible = ref(false)

    const checkScroll = () => {
      visible.value = window.scrollY > props.threshold
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
        bottom: `${props.bottom}px`,
        [props.position as string]: `${props.side}px`,
        zIndex: 100,
        opacity: visible.value ? 1 : 0,
        visibility: visible.value ? 'visible' : 'hidden',
        transform: visible.value ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s ease'
      }
    }, [
      h('button', {
        class: 'ldoc-back-to-top-btn',
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s ease'
        },
        onMouseenter: (e: MouseEvent) => {
          (e.target as HTMLElement).style.transform = 'scale(1.1)'
        },
        onMouseleave: (e: MouseEvent) => {
          (e.target as HTMLElement).style.transform = 'scale(1)'
        }
      }, [
        h('svg', {
          width: 20,
          height: 20,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2.5,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          innerHTML: '<path d="M18 15l-6-6-6 6"/>'
        })
      ])
    ])
  }
})

export function backToTopPlugin(options: BackToTopPluginOptions = {}): LDocPlugin {
  const {
    threshold = 300,
    position = 'right',
    bottom = 40,
    side = 40
  } = options

  return definePlugin({
    name: 'ldoc-plugin-back-to-top',

    slots: {
      'layout-bottom': {
        component: BackToTopButton,
        props: { threshold, position, bottom, side },
        order: 100
      }
    },

    globalComponents: [
      { name: 'LDocBackToTop', component: BackToTopButton }
    ]
  })
}

export default backToTopPlugin
