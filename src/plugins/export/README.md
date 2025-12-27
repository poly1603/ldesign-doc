# Export Plugin

导出插件 - 支持打印优化和多格式导出功能。

## 功能特性

### ✅ 已实现

- **打印样式优化** - 自动注入打印专用 CSS，优化打印输出
  - 隐藏导航、侧边栏等非内容元素
  - 防止代码块、图片、表格在打印时分页
  - 优化颜色和布局以适应打印
  - 显示链接的完整 URL

- **PDF 导出** - 将文档导出为 PDF 格式
  - 支持多种页面大小（A4、Letter、Legal）
  - 可配置页边距
  - 自动生成目录
  - 自定义页眉页脚
  - 使用 Playwright 生成高质量 PDF

### 🚧 待实现

- **EPUB 导出** - 将文档导出为 EPUB 电子书格式
- **单页 HTML 导出** - 将整个文档合并为单个 HTML 文件

## 使用方法

### 基础用法

```typescript
import { defineConfig } from '@ldesign/doc'
import { exportPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    exportPlugin({
      // 启用打印样式优化
      enablePrintStyles: true,
      
      // 支持的导出格式
      formats: ['pdf', 'epub', 'html'],
      
      // 导出按钮位置
      buttonPosition: 'doc-bottom'
    })
  ]
})
```

### 配置选项

```typescript
interface ExportOptions {
  /** 支持的导出格式 */
  formats?: ('pdf' | 'epub' | 'html')[]
  
  /** 是否启用打印样式优化 */
  enablePrintStyles?: boolean
  
  /** 导出按钮位置 */
  buttonPosition?: 'nav' | 'doc-top' | 'doc-bottom'
  
  /** PDF 配置 */
  pdf?: {
    pageSize?: 'A4' | 'Letter' | 'Legal'
    margin?: {
      top?: string
      right?: string
      bottom?: string
      left?: string
    }
    toc?: boolean
    headerFooter?: {
      header?: string
      footer?: string
    }
  }
  
  /** EPUB 配置 */
  epub?: {
    title?: string
    author?: string
    cover?: string
    language?: string
  }
  
  /** 单页 HTML 配置 */
  html?: {
    inlineStyles?: boolean
    inlineImages?: boolean
  }
}
```

## 打印样式优化

插件会自动注入以下打印优化：

### 隐藏的元素

- 导航栏 (`.vp-nav`)
- 侧边栏 (`.vp-sidebar`)
- 本地导航 (`.vp-local-nav`)
- 返回顶部按钮 (`.back-to-top`)
- 文档底部导航 (`.vp-doc-footer-nav`)
- 相关页面推荐 (`.vp-related-pages`)
- 社交分享按钮 (`.vp-social-share`)

### 优化的元素

- **代码块** - 防止分页，保持完整性
- **图片** - 防止分页，自动调整大小
- **表格** - 防止分页，保持完整性
- **标题** - 防止标题后立即分页
- **链接** - 显示完整 URL

### 颜色优化

- 强制黑色文本 (`color: #000`)
- 强制白色背景 (`background: #fff`)
- 移除阴影和特效
- 优化代码块颜色以适应黑白打印

## API

### exportToPDF(options)

导出页面为 PDF 格式。

```typescript
import { exportToPDF } from '@ldesign/doc/plugins/export'

await exportToPDF({
  url: 'http://localhost:5173/guide/getting-started',
  output: './output/getting-started.pdf',
  pageSize: 'A4',
  margin: {
    top: '2cm',
    right: '1.5cm',
    bottom: '2cm',
    left: '1.5cm'
  },
  toc: true,
  headerFooter: {
    header: 'My Documentation',
    footer: '<span class="pageNumber"></span> / <span class="totalPages"></span>'
  }
})
```

参数：
- `url` - 要导出的页面 URL
- `output` - 输出文件路径
- `pageSize` - 页面大小（'A4' | 'Letter' | 'Legal'）
- `margin` - 页边距配置
- `toc` - 是否生成目录
- `headerFooter` - 页眉页脚配置
- `waitForNetwork` - 是否等待网络空闲（默认 true）
- `timeout` - 超时时间（毫秒，默认 30000）

详细文档请参考：[PDF_EXPORT.md](./PDF_EXPORT.md)

### exportMultiplePDFs(pages, baseOptions)

批量导出多个页面为 PDF。

```typescript
import { exportMultiplePDFs } from '@ldesign/doc/plugins/export'

await exportMultiplePDFs([
  { url: 'http://localhost:5173/guide/intro', output: './output/intro.pdf' },
  { url: 'http://localhost:5173/guide/setup', output: './output/setup.pdf' }
], {
  pageSize: 'A4',
  margin: { top: '1cm', bottom: '1cm' }
})
```

### validatePDFConfig(config)

验证 PDF 配置是否有效。

```typescript
import { validatePDFConfig } from '@ldesign/doc/plugins/export'

const isValid = validatePDFConfig({
  pageSize: 'A4',
  margin: { top: '2cm' }
})
```

### generatePrintStyles()

生成打印优化样式字符串。

```typescript
import { generatePrintStyles } from '@ldesign/doc/plugins/export'

const styles = generatePrintStyles()
// 返回包含 @media print 规则的 CSS 字符串
```

### hasPrintStyles(html)

检查 HTML 字符串是否包含打印样式。

```typescript
import { hasPrintStyles } from '@ldesign/doc/plugins/export'

const html = '<style>@media print { ... }</style>'
const result = hasPrintStyles(html) // true
```

## 测试

插件包含完整的属性测试套件，验证以下属性：

### 打印样式测试

- **Property 55: Print stylesheet inclusion** - 所有页面都包含打印样式
- 打印样式包含必要的优化规则
- 交互元素在打印时被隐藏
- 内容元素防止分页
- 打印样式检测准确性
- 样式生成的幂等性
- 禁用时不注入样式

### PDF 导出测试

- **Property 56: PDF export completeness** - PDF 导出包含所有内容并保留格式
- 有效页面大小配置验证
- 无效页面大小拒绝
- 页边距格式验证
- 配置默认值处理
- 导出选项结构验证

运行测试：

```bash
# 测试打印样式
npm test -- src/plugins/export/printStyles.test.ts

# 测试 PDF 导出
npm test -- src/plugins/export/pdf.test.ts

# 测试所有导出功能
npm test -- src/plugins/export/
```

## 示例

### 仅启用打印优化

```typescript
exportPlugin({
  enablePrintStyles: true,
  formats: [] // 不显示导出按钮
})
```

### 完整配置

```typescript
exportPlugin({
  enablePrintStyles: true,
  formats: ['pdf', 'epub', 'html'],
  buttonPosition: 'doc-bottom',
  pdf: {
    pageSize: 'A4',
    margin: {
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm'
    },
    toc: true
  },
  epub: {
    title: 'My Documentation',
    author: 'Author Name',
    language: 'zh-CN'
  },
  html: {
    inlineStyles: true,
    inlineImages: true
  }
})
```

## 浏览器打印

用户可以使用浏览器的打印功能（Ctrl+P 或 Cmd+P）来打印文档，插件会自动应用优化样式。

## 相关需求

- **Requirement 14.1**: 支持优化的打印样式表
- **Requirement 14.2**: 支持 PDF 导出单页或整个章节
- **Requirement 14.4**: 导出时保留代码高亮和图表
- **Property 55**: 打印样式表包含验证
- **Property 56**: PDF 导出完整性验证

## 下一步

- [x] 实现 PDF 导出功能
- [ ] 实现 EPUB 导出功能
- [ ] 实现单页 HTML 导出功能
- [ ] 添加导出按钮 UI 组件
- [ ] 集成 CLI 导出命令
