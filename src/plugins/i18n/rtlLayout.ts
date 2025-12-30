/**
 * RTL 布局支持模块
 * 
 * 检测 RTL 语言并应用相应的样式
 */

import type { SiteConfig } from '../../shared/types'

export interface RTLLayoutOptions {
  /** RTL 语言列表 */
  rtlLocales?: string[]
}

/**
 * 默认的 RTL 语言列表
 * 包括阿拉伯语、希伯来语、波斯语、乌尔都语等
 */
const DEFAULT_RTL_LOCALES = [
  'ar',      // 阿拉伯语
  'ar-AE',   // 阿拉伯语（阿联酋）
  'ar-SA',   // 阿拉伯语（沙特阿拉伯）
  'he',      // 希伯来语
  'he-IL',   // 希伯来语（以色列）
  'fa',      // 波斯语
  'fa-IR',   // 波斯语（伊朗）
  'ur',      // 乌尔都语
  'ur-PK',   // 乌尔都语（巴基斯坦）
  'yi',      // 意第绪语
  'ji'       // 意第绪语（旧代码）
]

class RTLLayoutSupport {
  private config: SiteConfig | null = null
  private options: RTLLayoutOptions | null = null
  private rtlLocales: Set<string> = new Set()

  /**
   * 初始化 RTL 布局支持
   */
  initialize(config: SiteConfig, options: RTLLayoutOptions): void {
    this.config = config
    this.options = options

    // 构建 RTL 语言集合
    const locales = options.rtlLocales || DEFAULT_RTL_LOCALES
    this.rtlLocales = new Set(locales.map(l => l.toLowerCase()))
  }

  /**
   * 检查语言是否为 RTL
   */
  isRTL(locale: string): boolean {
    if (!locale) return false

    const normalizedLocale = locale.toLowerCase()

    // 精确匹配
    if (this.rtlLocales.has(normalizedLocale)) {
      return true
    }

    // 匹配语言代码（忽略地区）
    const langCode = normalizedLocale.split('-')[0]
    return this.rtlLocales.has(langCode)
  }

  /**
   * 生成 RTL 样式
   */
  generateStyles(locale: string): string | null {
    if (!this.isRTL(locale)) {
      return null
    }

    return `
/* RTL Layout Styles */
html[lang="${locale}"],
html[dir="rtl"] {
  direction: rtl;
}

html[lang="${locale}"] body,
html[dir="rtl"] body {
  text-align: right;
}

/* 导航栏 RTL 调整 */
html[lang="${locale}"] .nav,
html[dir="rtl"] .nav {
  flex-direction: row-reverse;
}

html[lang="${locale}"] .nav-item,
html[dir="rtl"] .nav-item {
  margin-left: 0;
  margin-right: 1.5rem;
}

html[lang="${locale}"] .nav-item:last-child,
html[dir="rtl"] .nav-item:last-child {
  margin-right: 0;
}

/* 侧边栏 RTL 调整 */
html[lang="${locale}"] .sidebar,
html[dir="rtl"] .sidebar {
  left: auto;
  right: 0;
  border-left: 1px solid var(--vp-c-divider);
  border-right: none;
}

html[lang="${locale}"] .sidebar-item,
html[dir="rtl"] .sidebar-item {
  padding-left: 0;
  padding-right: 1rem;
}

html[lang="${locale}"] .sidebar-item.has-children,
html[dir="rtl"] .sidebar-item.has-children {
  padding-right: 2rem;
}

html[lang="${locale}"] .sidebar-item .icon,
html[dir="rtl"] .sidebar-item .icon {
  margin-left: 0.5rem;
  margin-right: 0;
}

/* 内容区域 RTL 调整 */
html[lang="${locale}"] .content,
html[dir="rtl"] .content {
  margin-left: 0;
  margin-right: var(--vp-sidebar-width);
}

html[lang="${locale}"] .content.no-sidebar,
html[dir="rtl"] .content.no-sidebar {
  margin-right: 0;
}

/* 大纲 RTL 调整 */
html[lang="${locale}"] .aside,
html[dir="rtl"] .aside {
  left: 0;
  right: auto;
}

html[lang="${locale}"] .outline-link,
html[dir="rtl"] .outline-link {
  padding-left: 0;
  padding-right: 1rem;
  border-left: none;
  border-right: 2px solid transparent;
}

html[lang="${locale}"] .outline-link.active,
html[dir="rtl"] .outline-link.active {
  border-right-color: var(--vp-c-brand);
}

html[lang="${locale}"] .outline-link.nested,
html[dir="rtl"] .outline-link.nested {
  padding-right: 2rem;
}

/* 代码块 RTL 调整 */
html[lang="${locale}"] .code-block,
html[dir="rtl"] .code-block {
  direction: ltr;
  text-align: left;
}

html[lang="${locale}"] .code-block .copy-button,
html[dir="rtl"] .code-block .copy-button {
  left: 0.5rem;
  right: auto;
}

/* 面包屑 RTL 调整 */
html[lang="${locale}"] .breadcrumb,
html[dir="rtl"] .breadcrumb {
  flex-direction: row-reverse;
}

html[lang="${locale}"] .breadcrumb-separator,
html[dir="rtl"] .breadcrumb-separator {
  transform: scaleX(-1);
}

/* 搜索框 RTL 调整 */
html[lang="${locale}"] .search-box,
html[dir="rtl"] .search-box {
  text-align: right;
}

html[lang="${locale}"] .search-icon,
html[dir="rtl"] .search-icon {
  left: auto;
  right: 0.75rem;
}

html[lang="${locale}"] .search-input,
html[dir="rtl"] .search-input {
  padding-left: 1rem;
  padding-right: 2.5rem;
}

/* 上下页导航 RTL 调整 */
html[lang="${locale}"] .doc-footer,
html[dir="rtl"] .doc-footer {
  flex-direction: row-reverse;
}

html[lang="${locale}"] .prev-link,
html[dir="rtl"] .prev-link {
  text-align: right;
}

html[lang="${locale}"] .next-link,
html[dir="rtl"] .next-link {
  text-align: left;
}

html[lang="${locale}"] .prev-link .arrow,
html[dir="rtl"] .prev-link .arrow {
  transform: scaleX(-1);
}

html[lang="${locale}"] .next-link .arrow,
html[dir="rtl"] .next-link .arrow {
  transform: scaleX(-1);
}

/* 列表 RTL 调整 */
html[lang="${locale}"] ul,
html[lang="${locale}"] ol,
html[dir="rtl"] ul,
html[dir="rtl"] ol {
  padding-left: 0;
  padding-right: 1.5rem;
}

/* 引用块 RTL 调整 */
html[lang="${locale}"] blockquote,
html[dir="rtl"] blockquote {
  border-left: none;
  border-right: 4px solid var(--vp-c-divider);
  padding-left: 0;
  padding-right: 1rem;
}

/* 表格 RTL 调整 */
html[lang="${locale}"] table,
html[dir="rtl"] table {
  direction: rtl;
}

/* 图片说明 RTL 调整 */
html[lang="${locale}"] figcaption,
html[dir="rtl"] figcaption {
  text-align: right;
}

/* 徽章 RTL 调整 */
html[lang="${locale}"] .badge,
html[dir="rtl"] .badge {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* 提示容器 RTL 调整 */
html[lang="${locale}"] .custom-block,
html[dir="rtl"] .custom-block {
  text-align: right;
}

html[lang="${locale}"] .custom-block .custom-block-title,
html[dir="rtl"] .custom-block .custom-block-title {
  text-align: right;
}

/* 标签 RTL 调整 */
html[lang="${locale}"] .tag,
html[dir="rtl"] .tag {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* 页脚 RTL 调整 */
html[lang="${locale}"] .footer,
html[dir="rtl"] .footer {
  text-align: right;
}

/* 社交链接 RTL 调整 */
html[lang="${locale}"] .social-links,
html[dir="rtl"] .social-links {
  flex-direction: row-reverse;
}

html[lang="${locale}"] .social-link,
html[dir="rtl"] .social-link {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* 语言切换器 RTL 调整 */
html[lang="${locale}"] .lang-selector,
html[dir="rtl"] .lang-selector {
  text-align: right;
}

/* 主题切换器 RTL 调整 */
html[lang="${locale}"] .theme-toggle,
html[dir="rtl"] .theme-toggle {
  margin-left: 0;
  margin-right: 1rem;
}
`
  }

  /**
   * 获取语言的文本方向
   */
  getTextDirection(locale: string): 'ltr' | 'rtl' {
    return this.isRTL(locale) ? 'rtl' : 'ltr'
  }

  /**
   * 为 HTML 元素添加 dir 属性
   */
  addDirAttribute(locale: string): string {
    return this.isRTL(locale) ? 'dir="rtl"' : 'dir="ltr"'
  }

  /**
   * 获取所有 RTL 语言列表
   */
  getRTLLocales(): string[] {
    return Array.from(this.rtlLocales)
  }
}

// 导出单例实例
export const rtlLayoutSupport = new RTLLayoutSupport()
