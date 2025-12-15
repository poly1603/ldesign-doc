/**
 * 内置插件客户端配置
 * 
 * 这个文件导出所有内置插件的客户端配置（slots、globalComponents 等）
 * 将被虚拟模块导入
 */
import { defineComponent, h, ref, onMounted, onUnmounted, computed, Teleport, watch, nextTick } from 'vue'
import type { PluginSlots, PluginGlobalComponent } from '../shared/types'
import { useRoute } from 'vue-router'

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
          background: 'var(--ldoc-c-brand, #3b82f6)',
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

// ============== 图片灯箱（已禁用，使用 imageViewerPlugin 替代）==============
// 注意：内置灯箱已禁用以避免与 imageViewerPlugin 冲突
// 如需图片预览功能，请使用 imageViewerPlugin

const LightboxOverlay = defineComponent({
  name: 'LDocLightbox',
  setup() {
    // 返回空组件，避免与 imageViewerPlugin 冲突
    return () => null
  }
})

// ============== KaTeX 数学公式渲染 ==============

const KaTeXRenderer = defineComponent({
  name: 'LDocKaTeX',
  setup() {
    const route = useRoute()
    let katexLoaded = false

    const loadKaTeX = async () => {
      if (katexLoaded) return
      // 动态加载 KaTeX
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js'
      script.onload = () => {
        katexLoaded = true
        renderMath()
      }
      document.head.appendChild(script)
    }

    const renderMath = () => {
      if (typeof window === 'undefined' || !(window as any).katex) return

      const katex = (window as any).katex

      // 渲染块级公式 $$ ... $$
      document.querySelectorAll('.ldoc-content p, .ldoc-content div').forEach(el => {
        const text = el.textContent || ''
        if (text.includes('$$')) {
          const html = el.innerHTML
          const newHtml = html.replace(/\$\$([^$]+)\$\$/g, (_, formula) => {
            try {
              return `<div class="katex-block">${katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</div>`
            } catch { return _ }
          })
          if (newHtml !== html) el.innerHTML = newHtml
        }
      })

      // 渲染行内公式 $ ... $
      document.querySelectorAll('.ldoc-content p, .ldoc-content li, .ldoc-content td').forEach(el => {
        const text = el.textContent || ''
        if (text.includes('$') && !text.includes('$$')) {
          const html = el.innerHTML
          const newHtml = html.replace(/\$([^$\n]+)\$/g, (_, formula) => {
            try {
              return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
            } catch { return _ }
          })
          if (newHtml !== html) el.innerHTML = newHtml
        }
      })
    }

    onMounted(() => {
      loadKaTeX()
    })

    watch(() => route.path, () => {
      nextTick(() => {
        if (katexLoaded) renderMath()
        else loadKaTeX()
      })
    })

    return () => null
  }
})

// ============== Mermaid 流程图渲染 ==============

const MermaidRenderer = defineComponent({
  name: 'LDocMermaid',
  setup() {
    const route = useRoute()
    let mermaidLoaded = false

    const renderMermaid = async () => {
      if (typeof window === 'undefined' || !(window as any).mermaid) {
        // 如果页面上有 mermaid 代码块但库未加载，则尝试加载
        if (document.querySelector('.mermaid')) {
          console.log('[LDoc] Mermaid block found but lib not loaded, retrying...')
          setTimeout(() => mermaidLoaded ? renderMermaid() : loadMermaid(), 500)
        }
        return
      }

      try {
        const mermaid = (window as any).mermaid
        // 每次渲染重置主题
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          fontFamily: 'var(--ldoc-font-family-base)',
          securityLevel: 'loose',
        })

        const blocks = document.querySelectorAll('.mermaid')
        if (blocks.length > 0) {
          console.log(`[LDoc] Found ${blocks.length} mermaid blocks`)
        }

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i] as HTMLElement
          if (block.getAttribute('data-processed')) continue

          // 获取原始内容
          let code = block.textContent || ''

          // HTML 实体解码
          const textarea = document.createElement('textarea')
          textarea.innerHTML = code
          code = textarea.value.trim()

          if (!code) continue

          // 标记处理中
          block.setAttribute('data-processed', 'true')

          try {
            const id = `mermaid-svg-${Date.now()}-${i}`
            // 清空内容准备渲染
            block.innerHTML = ''
            const { svg } = await mermaid.render(id, code)
            block.innerHTML = svg
            block.classList.add('mermaid-rendered')
            // 增加一些样式
            block.style.display = 'flex'
            block.style.justifyContent = 'center'
            block.style.margin = '16px 0'
            block.style.background = 'var(--ldoc-c-bg-soft)'
            block.style.padding = '16px'
            block.style.borderRadius = '8px'
            block.style.overflowX = 'auto'
          } catch (e) {
            console.error('[LDoc] Mermaid rendering failed:', e)
            block.innerHTML = `<div style="color:var(--ldoc-c-red); background:var(--ldoc-c-red-soft); padding:16px; border-radius:8px; font-family:monospace; white-space:pre-wrap; font-size:13px;">Mermaid Error: ${(e as Error).message}</div>`
            block.style.display = 'block'
          }
        }
      } catch (err) {
        console.error('[LDoc] Mermaid initialization failed:', err)
      }
    }

    const loadMermaid = async () => {
      if (mermaidLoaded) return

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
      script.onload = () => {
        mermaidLoaded = true
        renderMermaid()
      }
      document.head.appendChild(script)
    }

    onMounted(() => {
      loadMermaid()
    })

    watch(() => route.path, () => {
      nextTick(() => {
        if (mermaidLoaded) renderMermaid()
        else loadMermaid()
      })
    })

    return () => null
  }
})

// ============== Tabs 切换组件 ==============

const TabsInitializer = defineComponent({
  name: 'LDocTabs',
  setup() {
    const route = useRoute()

    const initTabs = () => {
      document.querySelectorAll('.tabs-container').forEach(container => {
        if (container.classList.contains('tabs-initialized')) return
        container.classList.add('tabs-initialized')

        const tabs = container.querySelectorAll('.tab-item')
        if (tabs.length === 0) return

        // 创建标签头
        const header = document.createElement('div')
        header.className = 'tabs-header'
        header.style.cssText = 'display: flex; gap: 0; border-bottom: 1px solid var(--ldoc-c-divider, #e5e7eb); margin-bottom: 16px;'

        tabs.forEach((tab, index) => {
          const label = tab.getAttribute('data-label') || `Tab ${index + 1}`
          const btn = document.createElement('button')
          btn.className = 'tab-button' + (index === 0 ? ' active' : '')
          btn.textContent = label
          btn.style.cssText = 'padding: 10px 20px; border: none; background: transparent; cursor: pointer; font-size: 14px; color: var(--ldoc-c-text-2); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s;'

          if (index === 0) {
            btn.style.color = 'var(--ldoc-c-brand, #3b82f6)'
            btn.style.borderBottomColor = 'var(--ldoc-c-brand, #3b82f6)'
          }

          btn.onclick = () => {
            // 更新按钮状态
            header.querySelectorAll('.tab-button').forEach(b => {
              (b as HTMLElement).style.color = 'var(--ldoc-c-text-2)'
                ; (b as HTMLElement).style.borderBottomColor = 'transparent'
              b.classList.remove('active')
            })
            btn.style.color = 'var(--ldoc-c-brand, #3b82f6)'
            btn.style.borderBottomColor = 'var(--ldoc-c-brand, #3b82f6)'
            btn.classList.add('active')

            // 更新内容显示
            tabs.forEach((t, i) => {
              (t as HTMLElement).style.display = i === index ? 'block' : 'none'
            })
          }

          header.appendChild(btn)

            // 初始化显示状态
            ; (tab as HTMLElement).style.display = index === 0 ? 'block' : 'none'
        })

        container.insertBefore(header, container.firstChild)
      })
    }

    onMounted(() => {
      nextTick(initTabs)
    })

    watch(() => route.path, () => {
      nextTick(initTabs)
    })

    return () => null
  }
})

// ============== 公告栏 ==============

const AnnouncementBar = defineComponent({
  name: 'LDocAnnouncement',
  props: {
    content: { type: String, default: '' },
    contentEn: { type: String, default: '' },
    type: { type: String, default: 'info' },
    closable: { type: Boolean, default: true },
    storageKey: { type: String, default: '' }
  },
  setup(props) {
    const visible = ref(true)
    const route = useRoute()

    // 检测当前是否为英文环境
    const isEnglish = computed(() => {
      return route.path.startsWith('/en/')
    })

    // 根据语言环境选择内容
    const displayContent = computed(() => {
      if (isEnglish.value && props.contentEn) {
        return props.contentEn
      }
      return props.content
    })

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
      info: { bg: 'var(--ldoc-c-brand-soft, #e0f2fe)', text: 'var(--ldoc-c-brand, #3b82f6)' },
      warning: { bg: '#fef3c7', text: '#d97706' },
      success: { bg: '#d1fae5', text: '#059669' },
      error: { bg: '#fee2e2', text: '#dc2626' }
    }

    return () => {
      if (!visible.value || !displayContent.value) return null

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
        h('span', { innerHTML: displayContent.value }),
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
    contentEn?: string
    type?: 'info' | 'warning' | 'success' | 'error'
    closable?: boolean
    storageKey?: string
  }
}

export function getBuiltinSlots(config: BuiltinPluginConfig = {}): PluginSlots {
  const slots: PluginSlots = {}

  // 返回顶部按钮
  if (config.backToTop !== false) {
    slots['layout-bottom'] = [
      { component: BackToTopButton, props: {}, order: 100 }
    ]
  }

  // 图片灯箱（已禁用）
  if (config.lightbox !== false) {
    const existing = slots['layout-bottom'] || []
    slots['layout-bottom'] = [
      ...(Array.isArray(existing) ? existing : [existing]),
      { component: LightboxOverlay, props: {}, order: 200 }
    ]
  }

  // 公告栏
  if (config.announcement) {
    slots['layout-top'] = [
      { component: AnnouncementBar, props: config.announcement, order: -100 }
    ]
  }

  // KaTeX 数学公式渲染
  const bottomSlots = slots['layout-bottom'] || []
  slots['layout-bottom'] = [
    ...(Array.isArray(bottomSlots) ? bottomSlots : [bottomSlots]),
    // KaTeXRenderer 已移除
    { component: MermaidRenderer, props: {}, order: 301 },
    { component: TabsInitializer, props: {}, order: 302 }
  ]

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
      contentEn: '🎉 <strong>LDoc 1.0</strong> is released! A brand new documentation experience, try it now!',
      type: 'info',
      closable: true,
      storageKey: 'ldoc-v1.0'
    }
  }),
  globalComponents: getBuiltinComponents()
}
