# 代码复制插件

为代码块添加复制按钮。

## 安装

```ts
import { copyCodePlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    copyCodePlugin()
  ]
})
```

## 配置选项

```ts
copyCodePlugin({
  // 按钮文本
  buttonText: '复制',
  
  // 复制成功文本
  successText: '已复制!',
  
  // 成功显示时长 (ms)
  successDuration: 2000,
  
  // 代码块选择器
  selector: 'pre[class*="language-"]',
  
  // 显示语言标签
  showLanguage: true,
  
  // 排除的语言
  excludeLanguages: []
})
```

## 配置详解

### buttonText

- **类型**: `string`
- **默认值**: `'复制'`

复制按钮的文本。

### successText

- **类型**: `string`
- **默认值**: `'已复制!'`

复制成功后的提示文本。

### successDuration

- **类型**: `number`
- **默认值**: `2000`

成功提示的显示时长，单位毫秒。

### selector

- **类型**: `string`
- **默认值**: `'pre[class*="language-"]'`

代码块的 CSS 选择器。

### showLanguage

- **类型**: `boolean`
- **默认值**: `true`

是否在代码块右上角显示语言标签。

### excludeLanguages

- **类型**: `string[]`
- **默认值**: `[]`

排除的语言，这些语言的代码块不会显示复制按钮。

```ts
excludeLanguages: ['text', 'diff']
```

## 功能特点

### 自动检测

- 自动识别所有代码块
- 支持语法高亮的代码
- 支持行号显示的代码

### 复制反馈

- 点击后按钮文字变为成功提示
- 自动恢复原始文本
- 复制失败时显示错误提示

### 语言标签

显示代码块的语言：

```ts
// 显示 "TypeScript" 标签
const foo = 'bar'
```

## 自定义样式

```css
/* 复制按钮 */
.ldoc-copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: var(--ldoc-c-bg-soft);
  border: 1px solid var(--ldoc-c-divider);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

/* 悬停时显示 */
pre:hover .ldoc-copy-button {
  opacity: 1;
}

/* 复制成功状态 */
.ldoc-copy-button.copied {
  background: var(--ldoc-c-green-soft);
  color: var(--ldoc-c-green);
}

/* 语言标签 */
.ldoc-code-language {
  position: absolute;
  top: 8px;
  right: 60px;
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}
```

## 与代码组配合

代码组中的每个代码块都会有独立的复制按钮：

::: code-group

```bash [npm]
npm install @ldesign/doc
```

```bash [pnpm]
pnpm add @ldesign/doc
```

:::
