/**
 * 阅读时间插件 - 计算并显示文档阅读时间
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData, PluginPageContext } from '../../shared/types'
import { defineComponent, h, computed } from 'vue'

export interface ReadingTimePluginOptions {
  /** 每分钟阅读字数 */
  wordsPerMinute?: number
  /** 是否显示字数统计 */
  showWords?: boolean
  /** 显示位置 */
  position?: 'doc-top' | 'doc-bottom'
  /** 排除的页面 */
  exclude?: string[]
  /** 自定义文本模板 */
  template?: (minutes: number, words: number) => string
}

// 扩展 PageData 类型
interface PageDataWithReadingTime extends PageData {
  readingTime?: {
    minutes: number
    words: number
    text: string
  }
}

/**
 * 计算阅读时间
 */
function calculateReadingTime(content: string, wordsPerMinute: number) {
  // 移除 HTML 标签
  const text = content.replace(/<[^>]*>/g, '')

  // 统计中文字符
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length

  // 统计英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length

  // 总字数（中文按字符计算，英文按单词计算）
  const totalWords = chineseChars + englishWords

  // 计算分钟数
  const minutes = Math.ceil(totalWords / wordsPerMinute)

  return {
    minutes: Math.max(1, minutes),
    words: totalWords
  }
}

/**
 * 阅读时间显示组件
 */
const ReadingTimeDisplay = defineComponent({
  name: 'LDocReadingTime',
  props: {
    minutes: { type: Number, default: 0 },
    words: { type: Number, default: 0 },
    showWords: { type: Boolean, default: true }
  },
  setup(props) {
    const text = computed(() => {
      const minText = props.minutes === 1 ? '1 分钟' : `${props.minutes} 分钟`
      return `阅读需 ${minText}`
    })

    return () => {
      if (!props.minutes) return null

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
        // 时钟图标
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
        h('span', {}, text.value),
        props.showWords && props.words > 0 && h('span', {
          style: { marginLeft: '4px' }
        }, `· 约 ${props.words.toLocaleString()} 字`)
      ])
    }
  }
})

/**
 * 阅读时间插件
 */
export function readingTimePlugin(options: ReadingTimePluginOptions = {}): LDocPlugin {
  const {
    wordsPerMinute = 200,
    showWords = true,
    position = 'doc-top',
    exclude = ['/'],
    template
  } = options

  return definePlugin({
    name: 'ldoc:reading-time',

    // 计算阅读时间并添加到页面数据
    async extendPageData(pageData: PageData, ctx: PluginPageContext) {
      // 检查是否排除
      if (exclude.some(p => pageData.relativePath === p || pageData.relativePath.startsWith(p + '/'))) {
        return
      }

      const { minutes, words } = calculateReadingTime(ctx.content, wordsPerMinute)

      const text = template
        ? template(minutes, words)
        : `阅读需 ${minutes} 分钟`

        // 将阅读时间添加到 frontmatter
        ; (pageData as PageDataWithReadingTime).readingTime = {
          minutes,
          words,
          text
        }

      // 也添加到 frontmatter 以便主题访问
      pageData.frontmatter.readingTime = {
        minutes,
        words,
        text
      }
    },

    // 注入组件
    slots: (ctx) => {
      const path = ctx.route.path

      // 检查是否排除
      if (exclude.some(p => path === p || path.startsWith(p + '/'))) {
        return {}
      }

      const pageData = ctx.data.getPageData()
      const readingTime = (pageData.frontmatter as any)?.readingTime

      if (!readingTime) {
        return {}
      }

      return {
        [position]: {
          component: ReadingTimeDisplay,
          props: {
            minutes: readingTime.minutes,
            words: readingTime.words,
            showWords
          },
          order: 10
        }
      }
    },

    globalComponents: [
      { name: 'LDocReadingTime', component: ReadingTimeDisplay }
    ]
  })
}

export default readingTimePlugin
