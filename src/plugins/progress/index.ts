/**
 * 阅读进度条插件
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'
import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'

export interface ProgressPluginOptions {
  /** 进度条颜色 */
  color?: string
  /** 进度条高度 */
  height?: number
  /** 进度条位置 */
  position?: 'top' | 'bottom'
  /** 是否显示百分比 */
  showPercentage?: boolean
  /** 排除的页面 */
  exclude?: string[]
}

/**
 * 阅读进度条组件
 */
const ReadingProgress = defineComponent({
  name: 'LDocProgress',
  props: {
    color: { type: String, default: 'var(--ldoc-c-brand-1, #3b82f6)' },
    height: { type: Number, default: 3 },
    position: { type: String, default: 'top' },
    showPercentage: { type: Boolean, default: false }
  },
  setup(props) {
    const progress = ref(0)
    let ticking = false

    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      progress.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress)
        ticking = true
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', onScroll, { passive: true })
      updateProgress()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', onScroll)
    })

    return () => h('div', {
      class: 'ldoc-progress',
      style: {
        position: 'fixed',
        left: 0,
        right: 0,
        zIndex: 1000,
        [props.position]: 0,
        height: `${props.height}px`,
        backgroundColor: 'var(--ldoc-c-divider, #e5e7eb)'
      }
    }, [
      h('div', {
        class: 'ldoc-progress__bar',
        style: {
          width: `${progress.value}%`,
          height: '100%',
          backgroundColor: props.color,
          transition: 'width 0.1s ease-out'
        }
      }),
      props.showPercentage && h('span', {
        class: 'ldoc-progress__text',
        style: {
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          color: 'var(--ldoc-c-text-3, #9ca3af)'
        }
      }, `${Math.round(progress.value)}%`)
    ])
  }
})

/**
 * 阅读进度条插件
 */
export function progressPlugin(options: ProgressPluginOptions = {}): LDocPlugin {
  const {
    color = 'var(--ldoc-c-brand-1, #3b82f6)',
    height = 3,
    position = 'top',
    showPercentage = false,
    exclude = ['/']
  } = options

  return definePlugin({
    name: 'ldoc:progress',

    slots: (ctx) => {
      const path = ctx.route.path

      // 检查是否排除
      if (exclude.some(p => path === p || path.startsWith(p + '/'))) {
        return {}
      }

      return {
        'layout-top': {
          component: ReadingProgress,
          props: { color, height, position, showPercentage },
          order: 0
        }
      }
    },

    globalComponents: [
      { name: 'LDocProgress', component: ReadingProgress }
    ]
  })
}

export default progressPlugin
