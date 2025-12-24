/**
 * Component Playground 插件
 *
 * 提供 ::: playground 容器与全局组件 <LDocPlayground />
 * 支持通过容器 info 传入属性，例如：
 * ::: playground LDocAuthButton title="演示" showCode props='{"loginText":"登录"}'
 * ... 这里的内容会作为默认插槽传入 ...
 * :::
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin, MarkdownRenderer } from '../../shared/types'
import type MarkdownIt from 'markdown-it'
import containerPlugin from 'markdown-it-container'

export interface ComponentPlaygroundOptions {
  // 预留扩展
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function parsePlaygroundParams(rawInfo: string): Record<string, unknown> {
  const info = rawInfo.trim()
  const params: Record<string, unknown> = {}

  // 若 info 以 { 开头，尝试当作 JSON 配置整体解析
  if (info.startsWith('{')) {
    try {
      Object.assign(params, JSON.parse(info))
      return params
    } catch {
      // ignore, fallback to attribute parsing
    }
  }

  // 提取第一个无键名的单词作为 componentName
  const firstWordMatch = info.match(/^[^\s]+/)
  if (firstWordMatch) {
    const first = firstWordMatch[0]
    if (!first.includes('=')) params.componentName = first
  }

  // 解析 key="value" 或 key='value'
  const attrRe = /(\w+)=("([^"]*)"|'([^']*)')/g
  let m: RegExpExecArray | null
  while ((m = attrRe.exec(info))) {
    const key = m[1]
    const val = m[3] ?? m[4] ?? ''
    params[key] = val
  }

  // 解析无值布尔 flag（如 showCode）
  ;['showCode', 'showToolbar'].forEach((k) => {
    if (new RegExp(`(?:^|\s)${k}(?:\s|$)`).test(info) && params[k] === undefined) {
      params[k] = true
    }
  })

  return params
}

function addPlaygroundContainer(md: MarkdownIt) {
  md.use(containerPlugin, 'playground', {
    validate: (params: string) => params.trim().startsWith('playground'),
    render: (tokens: any[], idx: number) => {
      const token = tokens[idx]

      if (token.nesting === 1) {
        const info = token.info.trim().slice('playground'.length).trim()
        const cfg = parsePlaygroundParams(info)

        // 兼容简写：props/controls/events/slots -> 对应 *Str
        if ((cfg as any).props && !(cfg as any).propsStr) (cfg as any).propsStr = (cfg as any).props
        if ((cfg as any).controls && !(cfg as any).controlsStr) (cfg as any).controlsStr = (cfg as any).controls
        if ((cfg as any).events && !(cfg as any).eventsStr) (cfg as any).eventsStr = (cfg as any).events
        if ((cfg as any).slots && !(cfg as any).slotsStr) (cfg as any).slotsStr = (cfg as any).slots

        const attrs: string[] = []
        const passKeys = [
          'componentName', 'title', 'panelWidth', 'playgroundHeight',
          'propsStr', 'controlsStr', 'eventsStr', 'slotsStr'
        ]
        for (const k of passKeys) {
          const v = (cfg as any)[k]
          if (v != null && v !== '') attrs.push(`${k}='${escapeAttr(String(v))}'`)
        }
        // booleans
        if ((cfg as any).showCode) attrs.push(':showCode="true"')
        if ((cfg as any).showToolbar === false) attrs.push(`:showToolbar="false"`)

        return `<LDocPlayground ${attrs.join(' ')}>` + '\n'
      }

      return `</LDocPlayground>\n`
    }
  })
}

export function componentPlaygroundPlugin(_options: ComponentPlaygroundOptions = {}): LDocPlugin {
  return definePlugin({
    name: 'ldoc:component-playground',
    extendMarkdown(md: MarkdownRenderer) {
      try {
        addPlaygroundContainer(md as unknown as MarkdownIt)
      } catch {
        // markdown-it-container 未安装，忽略容器支持
      }
    },
    // 在客户端注册全局组件，避免在 Node 端直接引入 .vue 文件
    clientConfigFile: `
import { LDocPlayground } from '@ldesign/doc/plugins/component-playground/client'

export const globalComponents = [
  { name: 'LDocPlayground', component: LDocPlayground }
]

export default { globalComponents }
`
  })
}

export default componentPlaygroundPlugin
