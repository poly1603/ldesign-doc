/**
 * @ldesign/doc - Data Loader 类型定义
 * 
 * 用于构建时数据加载和处理
 */

/**
 * 内容数据项
 */
export interface ContentData {
  /** 页面 URL 路径 */
  url: string
  /** 原始 Markdown 源码 */
  src?: string
  /** 渲染后的 HTML */
  html?: string
  /** 摘要内容 */
  excerpt?: string
  /** Frontmatter 数据 */
  frontmatter: Record<string, unknown>
}

/**
 * 内容加载器选项
 */
export interface ContentLoaderOptions<T = ContentData[]> {
  /** 是否包含原始 Markdown 源码 */
  includeSrc?: boolean
  /** 是否包含渲染后的 HTML */
  render?: boolean
  /** 
   * 摘要提取
   * - true: 使用默认摘要提取（第一个 --- 之前的内容）
   * - false: 不提取摘要
   * - function: 自定义摘要提取函数
   */
  excerpt?: boolean | ((content: string, frontmatter: Record<string, unknown>) => string)
  /** 
   * 自定义数据转换函数
   * 可用于排序、过滤、映射等操作
   */
  transform?: (data: ContentData[]) => T
  /** 
   * glob 模式选项
   */
  globOptions?: {
    /** 忽略的模式 */
    ignore?: string[]
  }
}

/**
 * 内容加载器返回对象
 */
export interface ContentLoader<T = ContentData[]> {
  /** 
   * 监听文件变化（用于开发模式）
   * @param callback 变化回调函数
   * @returns 停止监听的函数
   */
  watch: (callback: (data: T) => void) => () => void
  /** 
   * 加载数据
   * @returns 处理后的数据
   */
  load: () => Promise<T>
}

/**
 * createContentLoader 函数类型
 */
export type CreateContentLoader = <T = ContentData[]>(
  pattern: string | string[],
  options?: ContentLoaderOptions<T>
) => ContentLoader<T>
