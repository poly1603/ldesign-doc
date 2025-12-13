/**
 * 大纲/目录插件 - 悬浮 TOC
 */
import { definePlugin } from '../../plugin/definePlugin'
import { defineComponent, h, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { LDocPlugin, Header } from '../../shared/types'

export interface OutlinePluginOptions {
  /** 最小标题级别 */
  minLevel?: number
  /** 最大标题级别 */
  maxLevel?: number
  /** 标题 */
  title?: string
  /** 位置 */
  position?: 'left' | 'right'
}

/**
 * 大纲组件
 */
const OutlinePanel = defineComponent({
  name: 'LDocOutline',
  props: {
    minLevel: { type: Number, default: 2 },
    maxLevel: { type: Number, default: 3 },
    title: { type: String, default: '本页目录' },
    position: { type: String, default: 'right' }
  },
  setup(props) {
    const headers = ref<Header[]>([])
    const activeId = ref('')
    const route = useRoute()

    const filteredHeaders = computed(() => {
      return headers.value.filter(h => h.level >= props.minLevel && h.level <= props.maxLevel)
    })

    const collectHeaders = () => {
      const headings = document.querySelectorAll('.ldoc-content h2, .ldoc-content h3, .ldoc-content h4, .ldoc-content h5, .ldoc-content h6')
      headers.value = Array.from(headings).map(el => ({
        level: parseInt(el.tagName[1]),
        title: el.textContent || '',
        slug: el.id || ''
      }))
    }

    const updateActiveHeader = () => {
      const headings = document.querySelectorAll('.ldoc-content h2, .ldoc-content h3, .ldoc-content h4, .ldoc-content h5, .ldoc-content h6')
      let current = ''

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          current = heading.id
        }
      }

      activeId.value = current
    }

    const scrollToAnchor = (id: string) => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    onMounted(() => {
      collectHeaders()
      window.addEventListener('scroll', updateActiveHeader, { passive: true })
      updateActiveHeader()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', updateActiveHeader)
    })

    watch(() => route.path, () => {
      setTimeout(collectHeaders, 100)
    })

    return () => {
      if (filteredHeaders.value.length === 0) return null

      return h('div', {
        class: 'ldoc-outline',
        style: {
          position: 'fixed',
          top: '100px',
          [props.position as string]: '20px',
          width: '200px',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: 'var(--vp-c-bg-soft, #f9fafb)',
          borderRadius: '8px',
          fontSize: '13px',
          zIndex: 50
        }
      }, [
        h('div', {
          style: {
            fontWeight: '600',
            marginBottom: '12px',
            color: 'var(--vp-c-text-1, #1f2937)'
          }
        }, props.title),
        h('nav', {
          class: 'ldoc-outline-nav'
        }, filteredHeaders.value.map(header =>
          h('a', {
            key: header.slug,
            href: `#${header.slug}`,
            onClick: (e: MouseEvent) => {
              e.preventDefault()
              scrollToAnchor(header.slug)
            },
            style: {
              display: 'block',
              padding: '4px 0',
              color: activeId.value === header.slug
                ? 'var(--vp-c-brand, #3b82f6)'
                : 'var(--vp-c-text-2, #6b7280)',
              textDecoration: 'none',
              fontSize: '13px',
              lineHeight: '1.5',
              transition: 'color 0.2s',
              borderLeft: activeId.value === header.slug
                ? '2px solid var(--vp-c-brand, #3b82f6)'
                : '2px solid transparent',
              marginLeft: '-8px',
              paddingLeft: `${(header.level - props.minLevel) * 12 + 8}px`
            }
          }, header.title)
        ))
      ])
    }
  }
})

export function outlinePlugin(options: OutlinePluginOptions = {}): LDocPlugin {
  const {
    minLevel = 2,
    maxLevel = 3,
    title = '本页目录',
    position = 'right'
  } = options

  return definePlugin({
    name: 'ldoc-plugin-outline',

    slots: {
      'layout-bottom': {
        component: OutlinePanel,
        props: { minLevel, maxLevel, title, position } as Record<string, unknown>,
        order: 0
      }
    },

    globalComponents: [
      { name: 'LDocOutline', component: OutlinePanel }
    ]
  })
}

export default outlinePlugin
