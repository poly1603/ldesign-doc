import { defineComponent, h, ref, onMounted, onUnmounted } from 'vue'

// Minimal search button component to satisfy PluginSlot and open a search modal/event
export const LDocSearch = defineComponent({
  name: 'LDocSearch',
  props: {
    placeholder: { type: String, default: '搜索文档…' },
    hotkeys: { type: Array as () => string[], default: () => ['/', 'Ctrl+K', 'Meta+K'] },
    maxResults: { type: Number, default: 10 },
    highlightColor: { type: String, default: 'var(--ldoc-c-brand-1)' }
  },
  setup(props) {
    const open = () => {
      window.dispatchEvent(new CustomEvent('ldoc:search-open'))
    }

    const handler = (e: KeyboardEvent) => {
      const key = e.key
      const ctrl = e.ctrlKey
      const meta = e.metaKey
      for (const hotkey of props.hotkeys) {
        if (hotkey === key || (hotkey === 'Ctrl+K' && ctrl && key.toLowerCase() === 'k') || (hotkey === 'Meta+K' && meta && key.toLowerCase() === 'k')) {
          e.preventDefault()
          open()
          return
        }
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', handler)
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', handler)
    })

    return () => h('button', {
      type: 'button',
      class: 'ldoc-search-button',
      onClick: open,
      title: props.placeholder,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--ldoc-c-divider, #e5e7eb)',
        background: 'var(--ldoc-c-bg-soft, #f9fafb)',
        color: 'var(--ldoc-c-text-2, #6b7280)',
        cursor: 'pointer',
        fontSize: '13px'
      }
    }, [
      h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('circle', { cx: 11, cy: 11, r: 8 }),
        h('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
      ]),
      h('span', {}, props.placeholder)
    ])
  }
})

export const globalComponents = [
  { name: 'LDocSearch', component: LDocSearch }
]

export default { globalComponents }
