/**
 * 返回顶部插件 - 客户端配置
 */
import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'
import type { PluginSlots } from '../../shared/types'

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
          'stroke-width': '2.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          innerHTML: '<path d="M18 15l-6-6-6 6"/>'
        })
      ])
    ])
  }
})

// 导出插件客户端配置
export const slots: PluginSlots = {
  'layout-bottom': {
    component: BackToTopButton,
    props: {},
    order: 100
  }
}

export const globalComponents = [
  { name: 'LDocBackToTop', component: BackToTopButton }
]
