/**
 * 客户端内置组件
 */

import { defineComponent, h, ref, onMounted, watch, shallowRef, type PropType, type Component } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 内容渲染组件 - 动态加载并渲染当前路由对应的 markdown 组件
 */
export const Content = defineComponent({
  name: 'Content',
  props: {
    as: {
      type: String as PropType<string>,
      default: 'div'
    }
  },
  setup(props) {
    const route = useRoute()
    const PageComponent = shallowRef<Component | null>(null)

    // 加载当前路由的组件
    const loadComponent = async () => {
      const matched = route.matched[0]
      if (!matched) {
        PageComponent.value = null
        return
      }

      const componentDef = matched.components?.default
      if (!componentDef) {
        PageComponent.value = null
        return
      }

      // 如果是异步组件（函数），则调用它
      if (typeof componentDef === 'function') {
        try {
          const resolved = await (componentDef as () => Promise<{ default?: Component } | Component>)()
          PageComponent.value = (resolved as { default?: Component }).default || (resolved as Component)
        } catch (e) {
          console.error('Failed to load page component:', e)
          PageComponent.value = null
        }
      } else {
        // 同步组件
        PageComponent.value = componentDef as Component
      }
    }

    // 初始加载
    onMounted(loadComponent)

    // 监听路由变化
    watch(() => route.path, loadComponent)

    return () => {
      if (PageComponent.value) {
        return h(props.as, { class: 'ldoc-content' }, [
          h(PageComponent.value)
        ])
      }
      return h(props.as, { class: 'ldoc-content ldoc-loading' })
    }
  }
})

/**
 * 客户端渲染组件 (仅在客户端渲染)
 */
export const ClientOnly = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    const show = ref(false)

    onMounted(() => {
      show.value = true
    })

    return () => show.value ? slots.default?.() : null
  }
})

/**
 * 外部链接组件
 */
export const OutboundLink = defineComponent({
  name: 'OutboundLink',
  props: {
    href: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => h(
      'a',
      {
        href: props.href,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'outbound-link'
      },
      [
        slots.default?.(),
        h('span', { class: 'outbound-icon', innerHTML: '↗' })
      ]
    )
  }
})

/**
 * 代码组组件
 */
export const CodeGroup = defineComponent({
  name: 'CodeGroup',
  setup(_, { slots }) {
    const activeTab = ref(0)

    return () => {
      const children = slots.default?.() || []
      const tabs = children.map((child, index) => {
        const label = (child.props as Record<string, unknown>)?.label || `Tab ${index + 1}`
        return h(
          'button',
          {
            class: ['code-group-tab', { active: activeTab.value === index }],
            onClick: () => { activeTab.value = index }
          },
          String(label)
        )
      })

      return h('div', { class: 'code-group' }, [
        h('div', { class: 'code-group-tabs' }, tabs),
        h('div', { class: 'code-group-content' }, children[activeTab.value])
      ])
    }
  }
})

/**
 * 代码块组件
 */
export const CodeBlock = defineComponent({
  name: 'CodeBlock',
  props: {
    label: String,
    language: String
  },
  setup(props, { slots }) {
    return () => h(
      'div',
      { class: 'code-block', 'data-language': props.language },
      slots.default?.()
    )
  }
})

/**
 * 演示组件 (Vue)
 */
export const Demo = defineComponent({
  name: 'Demo',
  props: {
    info: String
  },
  setup(props, { slots }) {
    const showCode = ref(false)

    return () => h('div', { class: 'demo-container' }, [
      // 演示区域
      h('div', { class: 'demo-preview' }, slots.default?.()),

      // 操作栏
      h('div', { class: 'demo-actions' }, [
        h('button', {
          class: 'demo-toggle-code',
          onClick: () => { showCode.value = !showCode.value }
        }, showCode.value ? '隐藏代码' : '显示代码')
      ]),

      // 代码区域
      showCode.value ? h('div', { class: 'demo-code' }, slots.code?.()) : null
    ])
  }
})

/**
 * 演示组件 (React)
 */
export const ReactDemo = defineComponent({
  name: 'ReactDemo',
  props: {
    info: String
  },
  setup(props, { slots }) {
    const showCode = ref(false)
    const container = ref<HTMLElement | null>(null)

    onMounted(async () => {
      // 动态加载 React 和 ReactDOM
      if (container.value && slots.component) {
        try {
          const [React, ReactDOM] = await Promise.all([
            import('react'),
            import('react-dom/client')
          ])

          // 渲染 React 组件
          // const root = ReactDOM.createRoot(container.value)
          // root.render(slots.component())
        } catch {
          console.warn('React not available for demo rendering')
        }
      }
    })

    return () => h('div', { class: 'demo-container react-demo' }, [
      h('div', { ref: container, class: 'demo-preview' }),
      h('div', { class: 'demo-actions' }, [
        h('button', {
          class: 'demo-toggle-code',
          onClick: () => { showCode.value = !showCode.value }
        }, showCode.value ? '隐藏代码' : '显示代码')
      ]),
      showCode.value ? h('div', { class: 'demo-code' }, slots.code?.()) : null
    ])
  }
})

// Re-export PluginSlot component
export { default as PluginSlot } from './components/PluginSlot.vue'
