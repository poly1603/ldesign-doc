/**
 * 公告栏插件
 */
import { definePlugin } from '../../plugin/definePlugin'
import { defineComponent, h, ref, onMounted, watch, Transition } from 'vue'
import type { LDocPlugin } from '../../shared/types'

export interface AnnouncementPluginOptions {
  /** 公告内容（支持 HTML） */
  content: string
  /** 公告类型 */
  type?: 'info' | 'warning' | 'success' | 'error'
  /** 是否可关闭 */
  closable?: boolean
  /** 关闭后的存储 key（用于记住关闭状态） */
  storageKey?: string
  /** 公告链接 */
  link?: string
  /** 链接文本 */
  linkText?: string
  /** 背景色（不设置则跟随主题色） */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 是否跟随主题色 */
  followTheme?: boolean
}

const typeColors = {
  info: { bg: 'var(--ldoc-c-brand-soft, var(--vp-c-brand-soft, #e0f2fe))', text: 'var(--ldoc-c-brand, var(--vp-c-brand, #3b82f6))' },
  warning: { bg: '#fef3c7', text: '#d97706' },
  success: { bg: '#d1fae5', text: '#059669' },
  error: { bg: '#fee2e2', text: '#dc2626' }
}

/**
 * 公告栏组件
 */
const AnnouncementBar = defineComponent({
  name: 'LDocAnnouncement',
  props: {
    content: { type: String, required: true },
    type: { type: String, default: 'info' },
    closable: { type: Boolean, default: true },
    storageKey: { type: String, default: '' },
    link: { type: String, default: '' },
    linkText: { type: String, default: '了解更多' },
    backgroundColor: { type: String, default: '' },
    textColor: { type: String, default: '' }
  },
  setup(props) {
    const visible = ref(true)
    const closing = ref(false)
    const announcementRef = ref<HTMLElement | null>(null)

    // 更新 CSS 变量来控制 header 位置
    const updateAnnouncementHeight = (height: number) => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--ldoc-announcement-height', `${height}px`)
      }
    }

    onMounted(() => {
      if (props.storageKey) {
        const closed = localStorage.getItem(`ldoc-announcement-${props.storageKey}`)
        if (closed === 'true') {
          visible.value = false
          updateAnnouncementHeight(0)
          return
        }
      }
      // 初始化时更新高度
      setTimeout(() => {
        if (announcementRef.value) {
          updateAnnouncementHeight(announcementRef.value.offsetHeight)
        }
      }, 0)
    })

    const close = () => {
      closing.value = true
      if (props.storageKey) {
        localStorage.setItem(`ldoc-announcement-${props.storageKey}`, 'true')
      }

      // 动画结束后隐藏
      setTimeout(() => {
        visible.value = false
        updateAnnouncementHeight(0)
      }, 300)
    }

    return () => {
      if (!visible.value) return null

      const colors = typeColors[props.type as keyof typeof typeColors] || typeColors.info
      const bgColor = props.backgroundColor || colors.bg
      const txtColor = props.textColor || colors.text

      return h('div', {
        ref: announcementRef,
        class: ['ldoc-announcement', { 'ldoc-announcement-closing': closing.value }],
        style: {
          position: 'relative',
          zIndex: '200',
          backgroundColor: bgColor,
          color: txtColor,
          fontSize: '14px',
          fontWeight: '500',
          borderBottom: closing.value ? 'none' : '1px solid rgba(0,0,0,0.05)',
          display: 'grid',
          gridTemplateRows: closing.value ? '0fr' : '1fr',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: closing.value ? '0' : '1',
        }
      }, [
        h('div', {
          style: {
            overflow: 'hidden',
            minHeight: '0',
          }
        }, [
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '10px 16px',
            }
          }, [
            h('span', {
              innerHTML: props.content
            }),
            props.link && h('a', {
              href: props.link,
              target: props.link.startsWith('http') ? '_blank' : '_self',
              style: {
                color: txtColor,
                textDecoration: 'underline',
                fontWeight: '600'
              }
            }, props.linkText),
            props.closable && h('button', {
              onClick: close,
              style: {
                marginLeft: '8px',
                padding: '4px',
                border: 'none',
                background: 'transparent',
                color: txtColor,
                cursor: 'pointer',
                opacity: '0.7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s',
                borderRadius: '4px'
              },
              onMouseenter: (e: MouseEvent) => { (e.target as HTMLElement).style.opacity = '1' },
              onMouseleave: (e: MouseEvent) => { (e.target as HTMLElement).style.opacity = '0.7' }
            }, [
              h('svg', {
                width: 16,
                height: 16,
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': 2,
                innerHTML: '<path d="M18 6L6 18M6 6l12 12"/>'
              })
            ])
          ])
        ])
      ])
    }
  }
})

export function announcementPlugin(options: AnnouncementPluginOptions): LDocPlugin {
  const {
    content,
    type = 'info',
    closable = true,
    storageKey = '',
    link = '',
    linkText = '了解更多',
    backgroundColor = '',
    textColor = ''
  } = options

  return definePlugin({
    name: 'ldoc-plugin-announcement',

    slots: {
      'layout-top': {
        component: AnnouncementBar,
        props: { content, type, closable, storageKey, link, linkText, backgroundColor, textColor } as Record<string, unknown>,
        order: -100 // 显示在最顶部
      }
    },

    globalComponents: [
      { name: 'LDocAnnouncement', component: AnnouncementBar }
    ]
  })
}

export default announcementPlugin
