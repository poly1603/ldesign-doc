# 导出插件

`exportPlugin` 提供打印样式优化，并可注入导出按钮（PDF / EPUB / HTML）。

## 安装

```ts
import { exportPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    exportPlugin({
      formats: ['pdf'],
      enablePrintStyles: true,
      buttonPosition: 'doc-bottom'
    })
  ]
})
```

## 配置选项

- **`formats`**: `('pdf' | 'epub' | 'html')[]`

  启用哪些导出格式。

- **`pdf`**: `PDFConfig`

  PDF 导出配置（页边距、页眉页脚、TOC 等）。

- **`epub`**: `EPUBConfig`

  EPUB 元信息（标题/作者/语言等）。

- **`html`**: `HTMLConfig`

  单页 HTML 导出配置。

- **`buttonPosition`**: `'nav' | 'doc-top' | 'doc-bottom'`

  导出按钮注入位置。

- **`enablePrintStyles`**: `boolean`

  是否注入打印优化样式。

## 注意

PDF 导出依赖 Playwright（运行时动态导入）；EPUB 导出依赖 `epub-gen-memory`。Playground 默认只展示 PDF 按钮。
