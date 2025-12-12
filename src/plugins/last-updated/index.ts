/**
 * 最后更新时间插件 - 显示文档的最后更新时间
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, PageData, PluginPageContext } from '../../shared/types'
import { defineComponent, h, computed } from 'vue'
import { statSync } from 'fs'

export interface LastUpdatedPluginOptions {
  /** 日期格式化选项 */
  formatOptions?: Intl.DateTimeFormatOptions
  /** 前缀文本 */
  prefix?: string
  /** 显示位置 */
  position?: 'doc-top' | 'doc-bottom' | 'doc-footer-before'
  /** 排除的页面 */
  exclude?: string[]
  /** 使用 Git 提交时间 */
  useGitTime?: boolean
}

/**
 * 最后更新时间组件
 */
const LastUpdated = defineComponent({
  name: 'LDocLastUpdated',
  props: {
    timestamp: { type: Number, default: 0 },
    prefix: { type: String, default: '最后更新于' },
    formatOptions: {
      type: Object as () => Intl.DateTimeFormatOptions,
      default: () => ({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  setup(props) {
    const formattedDate = computed(() => {
      if (!props.timestamp) return ''
      const date = new Date(props.timestamp)
      return date.toLocaleDateString('zh-CN', props.formatOptions)
    })

    return () => {
      if (!props.timestamp) return null

      return h('div', {
        class: 'ldoc-last-updated',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: 'var(--ldoc-c-text-3, #6b7280)',
          marginTop: '16px'
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
        h('span', {}, `${props.prefix} ${formattedDate.value}`)
      ])
    }
  }
})

/**
 * 最后更新时间插件
 */
export function lastUpdatedPlugin(options: LastUpdatedPluginOptions = {}): LDocPlugin {
  const {
    formatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    prefix = '最后更新于',
    position = 'doc-bottom',
    exclude = ['/'],
    useGitTime = false
  } = options

  return definePlugin({
    name: 'ldoc:last-updated',

    // 扩展页面数据，添加最后更新时间
    async extendPageData(pageData: PageData, ctx: PluginPageContext) {
      // 检查是否排除
      if (exclude.some(p => pageData.relativePath === p || pageData.relativePath.startsWith(p + '/'))) {
        return
      }

      try {
        if (useGitTime) {
          // 使用 Git 最后提交时间
          const { execSync } = await import('child_process')
          const gitTime = execSync(
            `git log -1 --format="%at" "${ctx.filePath}"`,
            { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }
          ).trim()

          if (gitTime) {
            pageData.lastUpdated = parseInt(gitTime) * 1000
          }
        } else {
          // 使用文件修改时间
          const stats = statSync(ctx.filePath)
          pageData.lastUpdated = stats.mtimeMs
        }
      } catch (e) {
        // Git 命令可能失败，忽略错误
        console.warn('[ldoc:last-updated] Failed to get last updated time:', e)
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

      return {
        [position]: {
          component: LastUpdated,
          props: {
            timestamp: pageData.lastUpdated,
            prefix,
            formatOptions
          },
          order: 50
        }
      }
    },

    globalComponents: [
      { name: 'LDocLastUpdated', component: LastUpdated }
    ]
  })
}

export default lastUpdatedPlugin
