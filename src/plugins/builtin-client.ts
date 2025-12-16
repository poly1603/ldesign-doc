/**
 * 内置插件客户端配置
 * 
 * 这个文件导出所有内置插件的客户端配置（slots、globalComponents 等）
 * 将被虚拟模块导入
 */
import { defineComponent, h, ref, onMounted, onUnmounted, computed, Teleport, watch, nextTick, inject, Transition } from 'vue'
import type { PluginSlots, PluginGlobalComponent } from '../shared/types'
import { useRoute } from 'vue-router'
import { siteDataSymbol } from '../client/composables'

// ============== 返回顶部按钮 ==============
// 注意：已禁用此组件，因为 Layout.vue 已经有 VPBackToTop 组件
// 避免页面上出现两个返回顶部按钮

const BackToTopButton = defineComponent({
  name: 'LDocBackToTop',
  setup() {
    // 返回空组件，避免重复
    return () => null
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
    content: { type: [String, Array], default: '' },
    contentEn: { type: String, default: '' },
    type: { type: String, default: 'info' },
    closable: { type: Boolean, default: true },
    storageKey: { type: String, default: '' }
  },
  setup(props) {
    const visible = ref(true)
    const route = useRoute()
    const siteData = inject(siteDataSymbol)
    const currentIndex = ref(0)

    // 标准化内容项接口
    interface AnnouncementItem {
      text: string
      link?: string
    }

    // 获取最终配置
    const config = computed(() => {
      // 1. 优先使用 props
      if (props.content || props.contentEn) return props

      // 2. 尝试从 themeConfig 获取
      const themeConfig = siteData?.value?.themeConfig || {}
      return (themeConfig as any).announcement || null
    })

    // 检测当前是否为英文环境
    const isEnglish = computed(() => {
      return route.path.startsWith('/en/')
    })

    // 获取当前展示的内容列表
    const contentList = computed<AnnouncementItem[]>(() => {
      if (!config.value) return []

      const rawContent = (isEnglish.value && config.value.contentEn)
        ? config.value.contentEn
        : config.value.content

      if (!rawContent) return []

      if (Array.isArray(rawContent)) {
        return rawContent.map(item => {
          if (typeof item === 'string') return { text: item }
          return item
        })
      }

      return [{ text: rawContent }]
    })

    // 定时滚动逻辑
    let timer: any

    const startTimer = () => {
      if (contentList.value.length <= 1) return
      clearInterval(timer)
      timer = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % contentList.value.length
      }, 3000)
    }

    const stopTimer = () => {
      clearInterval(timer)
    }

    watch(() => contentList.value.length, () => {
      currentIndex.value = 0
      startTimer()
    }, { immediate: true })

    onUnmounted(() => {
      stopTimer()
    })

    onMounted(() => {
      const storageKey = config.value?.storageKey
      if (storageKey) {
        const closed = localStorage.getItem(`ldoc-announcement-${storageKey}`)
        if (closed === 'true') visible.value = false
      }

      // 注入动画样式
      const styleId = 'ldoc-announcement-style'
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
          .ldoc-slide-up-enter-active,
          .ldoc-slide-up-leave-active {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ldoc-slide-up-enter-from {
            opacity: 0;
            transform: translateY(100%);
          }
          .ldoc-slide-up-leave-to {
            opacity: 0;
            transform: translateY(-100%);
          }
          .ldoc-announcement-content {
            position: relative;
            height: 24px;
            overflow: hidden;
            flex: 1;
            display: grid;
            place-items: center;
          }
          .ldoc-announcement-item {
            grid-area: 1 / 1;
            width: 100%;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .ldoc-announcement-link:hover {
            text-decoration: underline;
            opacity: 0.9;
          }
        `
        document.head.appendChild(style)
      }
    })

    const close = () => {
      visible.value = false
      const storageKey = config.value?.storageKey
      if (storageKey) {
        localStorage.setItem(`ldoc-announcement-${storageKey}`, 'true')
      }
    }

    const colors: Record<string, { bg: string; text: string }> = {
      info: { bg: 'var(--ldoc-c-brand-soft, #e0f2fe)', text: 'var(--ldoc-c-brand, #3b82f6)' },
      warning: { bg: '#fef3c7', text: '#d97706' },
      success: { bg: '#d1fae5', text: '#059669' },
      error: { bg: '#fee2e2', text: '#dc2626' }
    }

    return () => {
      if (!visible.value || contentList.value.length === 0) return null

      const currentConfig = config.value || {}
      const color = colors[currentConfig.type || 'info'] || colors.info
      const showClose = currentConfig.closable !== false

      const currentItem = contentList.value[currentIndex.value]

      return h('div', {
        class: 'ldoc-announcement-bar',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: color.bg,
          color: color.text,
          fontSize: '14px',
          fontWeight: '500',
          position: 'relative',
          minHeight: '44px',
          zIndex: 20
        },
        onMouseenter: stopTimer,
        onMouseleave: startTimer
      }, [
        // 内容区域容器
        h('div', { class: 'ldoc-announcement-content' }, [
          h(Transition, { name: 'ldoc-slide-up' }, {
            default: () => {
              if (!currentItem) return null

              const contentVNode = h('span', {
                innerHTML: currentItem.text
              })

              // 如果有链接，包裹 a 标签
              if (currentItem.link) {
                return h('a', {
                  key: currentIndex.value,
                  href: currentItem.link,
                  class: 'ldoc-announcement-item ldoc-announcement-link',
                  style: { color: 'inherit', textDecoration: 'none' }
                }, [contentVNode])
              }

              return h('div', {
                key: currentIndex.value,
                class: 'ldoc-announcement-item'
              }, [contentVNode])
            }
          })
        ]),

        // 关闭按钮
        showClose && h('button', {
          onClick: close,
          style: {
            position: 'absolute',
            right: '16px',
            padding: '4px',
            border: 'none',
            background: 'transparent',
            color: color.text,
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            opacity: 0.6,
            transition: 'opacity 0.2s',
            zIndex: 10
          },
          onMouseenter: (e: MouseEvent) => { (e.target as HTMLElement).style.opacity = '1' },
          onMouseleave: (e: MouseEvent) => { (e.target as HTMLElement).style.opacity = '0.6' }
        }, '×')
      ])
    }
  }
})

// ============== 页面数据注入 key ==============
// 使用 Symbol.for 确保与客户端 composables 共享同一个 symbol
const pageDataSymbol = Symbol.for('ldoc:pageData')

interface PageDataRef {
  value: {
    frontmatter?: Record<string, unknown>
    lastUpdated?: number
  }
}

// ============== 阅读时间组件 ==============

const ReadingTimeDisplay = defineComponent({
  name: 'LDocReadingTime',
  setup() {
    const pageData = inject<PageDataRef>(pageDataSymbol)
    const route = useRoute()

    const readingData = computed(() => {
      const fm = pageData?.value?.frontmatter
      return fm?.readingTime as { minutes: number; words: number } | undefined
    })

    // 监听路由变化以触发响应式更新
    watch(() => route.path, () => {
      // 触发重新计算
    })

    return () => {
      const data = readingData.value
      if (!data || !data.minutes) return null

      const minText = data.minutes === 1 ? '1 分钟' : `${data.minutes} 分钟`
      const wordsText = data.words ? ` · 约 ${data.words.toLocaleString()} 字` : ''

      return h('div', {
        class: 'ldoc-reading-time',
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: 'var(--ldoc-c-text-3, #6b7280)',
          marginBottom: '16px'
        }
      }, [
        h('svg', {
          viewBox: '0 0 24 24',
          width: '14',
          height: '14',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          style: { opacity: 0.7 }
        }, [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('path', { d: 'M12 6v6l4 2' })
        ]),
        h('span', {}, `阅读需 ${minText}${wordsText}`)
      ])
    }
  }
})

// ============== 最后更新时间组件 ==============

const LastUpdatedDisplay = defineComponent({
  name: 'LDocLastUpdated',
  setup() {
    const pageData = inject<PageDataRef>(pageDataSymbol)
    const route = useRoute()

    const lastUpdated = computed(() => {
      return pageData?.value?.lastUpdated
    })

    const formattedDate = computed(() => {
      const ts = lastUpdated.value
      if (!ts) return ''
      return new Date(ts).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })

    // 监听路由变化以触发响应式更新
    watch(() => route.path, () => {
      // 触发重新计算
    })

    return () => {
      if (!lastUpdated.value) return null

      return h('div', {
        class: 'ldoc-last-updated',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: 'var(--ldoc-c-text-3, #6b7280)',
          marginTop: '24px'
        }
      }, [
        h('svg', {
          viewBox: '0 0 24 24',
          width: '14',
          height: '14',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2',
          style: { opacity: 0.7 }
        }, [
          h('circle', { cx: '12', cy: '12', r: '10' }),
          h('path', { d: 'M12 6v6l4 2' })
        ]),
        h('span', {}, `最后更新于 ${formattedDate.value}`)
      ])
    }
  }
})

// ============== Demo 组件 ==============

import { DemoBox, Demo } from './demo/client'

// ============== Auth 组件 ==============

import { LDocAuthButton } from './auth/client'

// ============== 导出配置 ==============

export interface BuiltinPluginConfig {
  backToTop?: boolean
  lightbox?: boolean
  announcement?: {
    content: string | string[]
    contentEn?: string | string[]
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

  // 公告栏 - 始终添加，组件内部决定是否显示
  slots['layout-top'] = [
    { component: AnnouncementBar, props: config.announcement || {}, order: -100 }
  ]

  // KaTeX 数学公式渲染
  const bottomSlots = slots['layout-bottom'] || []
  slots['layout-bottom'] = [
    ...(Array.isArray(bottomSlots) ? bottomSlots : [bottomSlots]),
    // KaTeXRenderer 已移除
    { component: MermaidRenderer, props: {}, order: 301 },
    { component: TabsInitializer, props: {}, order: 302 }
  ]

  // 阅读时间（doc-top 位置）
  slots['doc-top'] = [
    { component: ReadingTimeDisplay, props: {}, order: 10 }
  ]

  // 最后更新时间（doc-bottom 位置）
  slots['doc-bottom'] = [
    { component: LastUpdatedDisplay, props: {}, order: 50 }
  ]

  return slots
}

export function getBuiltinComponents(): PluginGlobalComponent[] {
  return [
    { name: 'LDocBackToTop', component: BackToTopButton },
    { name: 'LDocLightbox', component: LightboxOverlay },
    { name: 'LDocAnnouncement', component: AnnouncementBar },
    { name: 'LDocReadingTime', component: ReadingTimeDisplay },
    { name: 'LDocLastUpdated', component: LastUpdatedDisplay },
    { name: 'LDocAuthButton', component: LDocAuthButton },
    { name: 'Demo', component: Demo },
    { name: 'DemoBox', component: DemoBox }
  ]
}

// 默认导出 - 启用所有内置功能
export default {
  slots: getBuiltinSlots({
    backToTop: true,
    lightbox: true
  }),
  globalComponents: getBuiltinComponents()
}
