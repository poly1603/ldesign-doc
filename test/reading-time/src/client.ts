/**
 * 客户端代码
 * 此文件在浏览器端执行
 * 
 * 通过 Slot 系统自动在页面中显示阅读时间
 */

import { defineComponent, h, computed, type App } from 'vue'
import type { EnhanceAppContext, PluginSlots, PluginGlobalComponent } from '@ldesign/doc'
import { useData } from '@ldesign/doc/client'

/**
 * 阅读时间显示组件
 * 自动从页面 frontmatter 读取阅读时间数据
 */
export const ReadingTimeDisplay = defineComponent({
  name: 'ReadingTimeDisplay',
  props: {
    showWords: { type: Boolean, default: true },
    showIcon: { type: Boolean, default: true }
  },
  setup(props) {
    // 使用 useData 获取页面数据
    const { frontmatter } = useData()

    // 获取阅读时间（响应式）
    const readingTime = computed(() => {
      return (frontmatter.value as any)?.readingTime
    })

    return () => {
      const rt = readingTime.value

      if (!rt) {
        return null
      }

      const children = []

      // 时钟图标
      if (props.showIcon) {
        children.push(
          h('svg', {
            viewBox: '0 0 24 24',
            width: '14',
            height: '14',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            style: 'margin-right: 4px; opacity: 0.7; vertical-align: middle;'
          }, [
            h('circle', { cx: '12', cy: '12', r: '10' }),
            h('path', { d: 'M12 6v6l4 2' })
          ])
        )
      }

      // 阅读时间文本
      children.push(
        h('span', {}, rt.text)
      )

      // 字数
      if (props.showWords && rt.words) {
        children.push(
          h('span', { style: 'margin-left: 12px;' }, `约 ${rt.words} 字`)
        )
      }

      return h('div', {
        class: 'ldoc-reading-time',
        style: `
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          color: var(--ldoc-c-text-3, #6b7280);
          margin-bottom: 16px;
        `
      }, children)
    }
  }
})

/**
 * 手动使用的阅读时间组件
 * 需要传入 props
 */
export const ReadingTime = defineComponent({
  name: 'ReadingTime',
  props: {
    minutes: { type: Number, default: 0 },
    words: { type: Number, default: 0 },
    text: { type: String, default: '' },
    showWords: { type: Boolean, default: true }
  },
  setup(props) {
    return () => h('span', { class: 'reading-time' }, [
      props.showWords && props.words
        ? `${props.words} 字 · ${props.text}`
        : props.text
    ])
  }
})

/**
 * 插件 Slots 配置
 * 自动注入到 doc-top 位置
 */
export const slots: PluginSlots = {
  'doc-top': {
    component: ReadingTimeDisplay,
    props: { showWords: true, showIcon: true },
    order: 10 // 优先级较高，显示在前面
  }
}

/**
 * 全局组件
 */
export const globalComponents: PluginGlobalComponent[] = [
  { name: 'ReadingTime', component: ReadingTime },
  { name: 'ReadingTimeDisplay', component: ReadingTimeDisplay }
]

/**
 * 增强 Vue 应用
 */
export function enhanceApp({ app }: EnhanceAppContext) {
  const vueApp = app as App
  // 注册全局组件
  globalComponents.forEach(({ name, component }) => {
    vueApp.component(name, component as any)
  })
}

export default {
  enhanceApp,
  slots,
  globalComponents
}
