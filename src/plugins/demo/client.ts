/**
 * Demo 插件客户端 - 负责渲染组件演示
 */
import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  shallowRef,
  computed,
  nextTick
} from 'vue'
import type { PluginSlots, PluginGlobalComponent } from '../../shared/types'

/**
 * Demo 展示组件
 * 
 * 用于渲染代码演示，支持 Vue SFC
 */
export const DemoBox = defineComponent({
  name: 'DemoBox',
  props: {
    /** 组件源代码 */
    code: { type: String, default: '' },
    /** 组件文件路径 */
    src: { type: String, default: '' },
    /** 标题 */
    title: { type: String, default: '示例' },
    /** 描述 */
    description: { type: String, default: '' },
    /** 语言类型 */
    language: { type: String, default: 'vue' },
    /** 是否默认展开代码 */
    expanded: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    const codeExpanded = ref(props.expanded)
    const copySuccess = ref(false)

    const toggleCode = () => {
      codeExpanded.value = !codeExpanded.value
    }

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(props.code)
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    }

    // 高亮代码
    const highlightedCode = computed(() => {
      // 简单的语法高亮（实际应使用 shiki）
      return props.code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    })

    return () => h('div', {
      class: 'ldoc-demo-box',
      style: {
        border: '1px solid var(--vp-c-divider, #e5e7eb)',
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden'
      }
    }, [
      // 标题
      props.title && h('div', {
        class: 'ldoc-demo-box-title',
        style: {
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--vp-c-text-1, #1f2937)',
          borderBottom: '1px solid var(--vp-c-divider, #e5e7eb)',
          background: 'var(--vp-c-bg-soft, #f9fafb)'
        }
      }, props.title),

      // 描述
      props.description && h('div', {
        class: 'ldoc-demo-box-desc',
        style: {
          padding: '12px 16px',
          fontSize: '14px',
          color: 'var(--vp-c-text-2, #6b7280)',
          borderBottom: '1px solid var(--vp-c-divider, #e5e7eb)'
        }
      }, props.description),

      // 预览区域
      h('div', {
        class: 'ldoc-demo-box-preview',
        style: {
          padding: '24px',
          minHeight: '60px'
        }
      }, [
        // 默认插槽 - 放置实际组件
        slots.default?.() || h('div', {
          style: { color: 'var(--vp-c-text-3, #9ca3af)', fontSize: '14px' }
        }, '组件预览区')
      ]),

      // 操作按钮
      h('div', {
        class: 'ldoc-demo-box-actions',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '8px 16px',
          borderTop: '1px solid var(--vp-c-divider, #e5e7eb)',
          background: 'var(--vp-c-bg-soft, #f9fafb)'
        }
      }, [
        // 复制按钮
        h('button', {
          class: 'ldoc-demo-action',
          title: copySuccess.value ? '已复制！' : '复制代码',
          onClick: copyCode,
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            color: copySuccess.value ? 'var(--vp-c-green, #10b981)' : 'var(--vp-c-text-2, #6b7280)',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'color 0.2s'
          }
        }, [
          h('svg', {
            width: 16,
            height: 16,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': 2,
            innerHTML: copySuccess.value
              ? '<polyline points="20 6 9 17 4 12"></polyline>'
              : '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>'
          })
        ]),

        // 展开/收起代码按钮
        h('button', {
          class: 'ldoc-demo-action',
          title: codeExpanded.value ? '收起代码' : '展开代码',
          onClick: toggleCode,
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            color: codeExpanded.value ? 'var(--vp-c-brand, #3b82f6)' : 'var(--vp-c-text-2, #6b7280)',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'color 0.2s'
          }
        }, [
          h('svg', {
            width: 16,
            height: 16,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': 2,
            innerHTML: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>'
          })
        ])
      ]),

      // 代码区域（可折叠）
      codeExpanded.value && h('div', {
        class: 'ldoc-demo-box-code',
        style: {
          borderTop: '1px solid var(--vp-c-divider, #e5e7eb)',
          background: 'var(--vp-code-block-bg, #1e1e1e)',
          overflow: 'auto',
          maxHeight: '400px'
        }
      }, [
        h('pre', {
          style: {
            margin: 0,
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            overflow: 'auto'
          }
        }, [
          h('code', {
            class: `language-${props.language}`,
            style: {
              color: 'var(--vp-code-block-color, #d4d4d4)',
              fontFamily: 'var(--vp-font-family-mono, monospace)'
            },
            innerHTML: highlightedCode.value
          })
        ])
      ])
    ])
  }
})

/**
 * Demo 容器组件
 * 
 * 用于包装外部导入的组件
 */
export const Demo = defineComponent({
  name: 'Demo',
  props: {
    src: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => h(DemoBox, {
      title: props.title || '组件演示',
      description: props.description,
      code: '// 从文件导入的组件',
      language: props.src.endsWith('.vue') ? 'vue' : 'tsx'
    }, {
      default: () => slots.default?.()
    })
  }
})

// 初始化 - 处理页面上的 demo 代码块
function initDemoBlocks() {
  if (typeof document === 'undefined') return

  const demoBlocks = document.querySelectorAll('.ldoc-demo')

  demoBlocks.forEach(block => {
    const previewEl = block.querySelector('.ldoc-demo-preview') as HTMLElement
    const codeEl = block.querySelector('.ldoc-demo-code') as HTMLElement
    const toggleBtn = block.querySelector('.ldoc-demo-toggle') as HTMLElement
    const copyBtn = block.querySelector('.ldoc-demo-copy') as HTMLElement

    if (!previewEl) return

    // 获取代码
    const encodedCode = previewEl.dataset.demoCode
    if (!encodedCode) return

    const code = decodeURIComponent(encodedCode)
    const language = block.getAttribute('data-language') || 'vue'

    // 切换代码显示
    if (toggleBtn && codeEl) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = codeEl.style.display === 'none'
        codeEl.style.display = isHidden ? 'block' : 'none'
        toggleBtn.title = isHidden ? '收起代码' : '展开代码'
      })
    }

    // 复制代码
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code)
          copyBtn.title = '已复制！'
          setTimeout(() => {
            copyBtn.title = '复制代码'
          }, 2000)
        } catch (err) {
          console.error('复制失败:', err)
        }
      })
    }

    // 清除加载提示
    const loadingEl = previewEl.querySelector('.ldoc-demo-loading')
    if (loadingEl) {
      loadingEl.textContent = '预览区域 (需要客户端渲染支持)'
    }
  })
}

// 导出插件配置
export const slots: PluginSlots = {}

export const globalComponents: PluginGlobalComponent[] = [
  { name: 'Demo', component: Demo },
  { name: 'DemoBox', component: DemoBox }
]

// 页面加载后初始化
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDemoBlocks)
  } else {
    initDemoBlocks()
  }

  // 路由变化时重新初始化
  const observer = new MutationObserver(() => {
    initDemoBlocks()
  })

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true })
  }
}

export default {
  slots,
  globalComponents
}
