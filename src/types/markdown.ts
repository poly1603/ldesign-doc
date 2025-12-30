/**
 * @ldesign/doc - Markdown 类型定义
 * 
 * 定义 Markdown 渲染器、选项、转换器等相关类型
 */

// ============== Markdown 选项 ==============

/**
 * Markdown 渲染选项
 * 
 * @example
 * ```ts
 * const markdownOptions: MarkdownOptions = {
 *   lineNumbers: true,
 *   theme: {
 *     light: 'github-light',
 *     dark: 'github-dark'
 *   },
 *   anchor: {
 *     permalink: true,
 *     permalinkBefore: true
 *   }
 * }
 * ```
 */
export interface MarkdownOptions {
  /** 是否显示行号 */
  lineNumbers?: boolean
  /** 是否添加代码块包装器 */
  preWrapper?: boolean

  // ========== 代码高亮 ==========
  
  /** 代码高亮主题 */
  theme?: string | { light: string; dark: string }
  /** 支持的语言列表 */
  languages?: string[]

  // ========== 扩展插件 ==========
  
  /** 锚点配置 */
  anchor?: AnchorOptions
  /** 目录配置 */
  toc?: TocOptions
  /** 容器配置 */
  container?: ContainerOptions

  /** 自定义扩展 */
  config?: (md: MarkdownRenderer) => void

  // ========== 代码块配置 ==========
  
  /** 代码转换器 */
  codeTransformers?: CodeTransformer[]
  /** 组件演示配置 */
  demo?: DemoOptions
  /** Playground 配置 */
  playground?: PlaygroundOptions
  /** 代码折叠配置 */
  codeCollapse?: CodeCollapseOptions
}

/**
 * 代码折叠选项
 */
export interface CodeCollapseOptions {
  /** 是否启用代码折叠 */
  enabled?: boolean
  /** 触发折叠的最小行数 */
  threshold?: number
  /** 展开按钮文本 */
  expandText?: string
  /** 收起按钮文本 */
  collapseText?: string
}

/**
 * Playground 选项
 */
export interface PlaygroundOptions {
  /** 是否启用 playground 链接 */
  enabled?: boolean
  /** Playground URL 模板，{code} 会被替换为编码后的代码 */
  url?: string
  /** 按钮文本 */
  buttonText?: string
  /** 支持的语言列表 */
  languages?: string[]
}

/**
 * 锚点选项
 */
export interface AnchorOptions {
  /** 是否启用永久链接 */
  permalink?: boolean
  /** 永久链接是否在标题前 */
  permalinkBefore?: boolean
  /** 永久链接符号 */
  permalinkSymbol?: string
}

/**
 * 目录选项
 */
export interface TocOptions {
  /** 包含的标题级别 */
  includeLevel?: number[]
  /** 容器 CSS 类名 */
  containerClass?: string
}

/**
 * 容器选项
 */
export interface ContainerOptions {
  /** 提示容器标签 */
  tipLabel?: string
  /** 警告容器标签 */
  warningLabel?: string
  /** 危险容器标签 */
  dangerLabel?: string
  /** 信息容器标签 */
  infoLabel?: string
  /** 详情容器标签 */
  detailsLabel?: string
}

// ============== 代码转换器 ==============

/**
 * 代码转换器
 */
export interface CodeTransformer {
  /** 转换器名称 */
  name: string
  /** 预处理（在高亮前） */
  preprocess?: (code: string, options: unknown) => string
  /** 后处理（在高亮后） */
  postprocess?: (code: string, options: unknown) => string
}

// ============== 演示选项 ==============

/**
 * 演示选项
 */
export interface DemoOptions {
  /** Vue 组件演示 */
  vue?: boolean
  /** React 组件演示 */
  react?: boolean
  /** 自定义演示容器 */
  customContainers?: DemoContainer[]
}

/**
 * 演示容器
 */
export interface DemoContainer {
  /** 容器名称 */
  name: string
  /** 渲染函数 */
  render: (code: string, lang: string) => string
}

// ============== Markdown 渲染器 ==============

/**
 * Markdown 渲染器
 * 基于 markdown-it
 */
export interface MarkdownRenderer {
  /** 渲染 Markdown 为 HTML */
  render: (src: string, env?: Record<string, unknown>) => string
  /** 使用插件 */
  use: (plugin: unknown, ...options: unknown[]) => MarkdownRenderer
  /** markdown-it 实例方法 */
  [key: string]: unknown
}
