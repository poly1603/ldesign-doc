# RTL 布局支持示例

## 概述

RTL（Right-to-Left）布局支持允许文档系统正确显示从右到左书写的语言，如阿拉伯语、希伯来语、波斯语等。

## 支持的 RTL 语言

默认支持以下 RTL 语言：

- **阿拉伯语** (ar, ar-AE, ar-SA, 等)
- **希伯来语** (he, he-IL)
- **波斯语** (fa, fa-IR)
- **乌尔都语** (ur, ur-PK)
- **意第绪语** (yi, ji)

## 配置示例

### 基础配置

```typescript
import { defineConfig } from '@ldesign/doc'
import { i18nPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    i18nPlugin({
      rtl: {
        enabled: true  // 启用 RTL 支持
      }
    })
  ],
  locales: {
    root: {
      lang: 'en-US',
      label: 'English'
    },
    ar: {
      lang: 'ar-SA',
      label: 'العربية',
      dir: 'rtl'  // 可选：显式指定文本方向
    }
  }
})
```

### 自定义 RTL 语言列表

```typescript
export default defineConfig({
  plugins: [
    i18nPlugin({
      rtl: {
        enabled: true,
        rtlLocales: [
          'ar',      // 阿拉伯语
          'ar-SA',   // 阿拉伯语（沙特）
          'he',      // 希伯来语
          'fa',      // 波斯语
          'ur',      // 乌尔都语
          'custom'   // 自定义语言代码
        ]
      }
    })
  ]
})
```

## 样式调整说明

### 自动应用的调整

当检测到 RTL 语言时，系统会自动应用以下调整：

#### 1. 基础布局
```css
html[lang="ar"] {
  direction: rtl;
}

html[lang="ar"] body {
  text-align: right;
}
```

#### 2. 导航栏
- 导航项从右到左排列
- 间距调整为右侧
- Logo 位置调整

#### 3. 侧边栏
- 从左侧移动到右侧
- 边框从右侧移动到左侧
- 内边距方向调整

#### 4. 内容区域
- 边距从左侧调整到右侧
- 文本对齐方式调整

#### 5. 代码块
```css
/* 代码块保持 LTR 方向 */
html[lang="ar"] .code-block {
  direction: ltr;
  text-align: left;
}
```

**重要**：代码块始终保持从左到右的方向，因为代码通常是用 LTR 语言编写的。

## 视觉对比

### LTR 布局（英语）
```
┌─────────────────────────────────────┐
│ Logo    Nav1  Nav2  Nav3    Search  │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │  Content                     │
│ bar  │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### RTL 布局（阿拉伯语）
```
┌─────────────────────────────────────┐
│  Search    Nav3  Nav2  Nav1    Logo │
├──────────────────────────────┬──────┤
│                              │      │
│                     Content  │ Side │
│                              │ bar  │
│                              │      │
└──────────────────────────────┴──────┘
```

## API 使用示例

### 检查语言是否为 RTL

```typescript
import { rtlLayoutSupport } from '@ldesign/doc/plugins/i18n'

// 初始化
rtlLayoutSupport.initialize(config, {
  rtlLocales: ['ar', 'he', 'fa']
})

// 检查语言
console.log(rtlLayoutSupport.isRTL('ar'))      // true
console.log(rtlLayoutSupport.isRTL('ar-SA'))   // true
console.log(rtlLayoutSupport.isRTL('en'))      // false
console.log(rtlLayoutSupport.isRTL('zh-CN'))   // false
```

### 获取文本方向

```typescript
const direction = rtlLayoutSupport.getTextDirection('ar')
console.log(direction)  // 'rtl'

const direction2 = rtlLayoutSupport.getTextDirection('en')
console.log(direction2)  // 'ltr'
```

### 生成 dir 属性

```typescript
const dirAttr = rtlLayoutSupport.addDirAttribute('ar')
console.log(dirAttr)  // 'dir="rtl"'

// 在 HTML 中使用
const html = `<html ${rtlLayoutSupport.addDirAttribute(locale)}>`
```

### 生成 RTL 样式

```typescript
const styles = rtlLayoutSupport.generateStyles('ar')
if (styles) {
  // 注入样式到页面
  document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`)
}
```

## 最佳实践

### 1. 内容编写

在编写 RTL 语言内容时：

```markdown
---
lang: ar-SA
dir: rtl
---

# عنوان المستند

هذا نص عربي يتم عرضه من اليمين إلى اليسار.

## مثال على الكود

\`\`\`javascript
// 代码块保持 LTR 方向
function hello() {
  console.log('Hello, World!')
}
\`\`\`
```

### 2. 混合内容

当页面包含 RTL 和 LTR 内容时：

```html
<!-- RTL 段落 -->
<p dir="rtl">هذا نص عربي</p>

<!-- LTR 段落 -->
<p dir="ltr">This is English text</p>

<!-- 代码块始终是 LTR -->
<pre><code>const x = 1;</code></pre>
```

### 3. 自定义样式

如果需要额外的 RTL 调整：

```css
/* 在自定义主题中 */
html[dir="rtl"] .custom-component {
  margin-right: 1rem;
  margin-left: 0;
  text-align: right;
}

html[dir="rtl"] .custom-component .icon {
  transform: scaleX(-1);  /* 翻转图标 */
}
```

## 测试

### 手动测试

1. 配置多语言支持，包括至少一个 RTL 语言
2. 切换到 RTL 语言
3. 验证以下元素：
   - 导航栏布局
   - 侧边栏位置
   - 内容对齐
   - 代码块方向（应保持 LTR）
   - 搜索框位置
   - 面包屑方向

### 自动化测试

运行属性测试：

```bash
npm test -- src/plugins/i18n/rtlLayout.test.ts --run
```

所有测试应该通过，验证：
- RTL 语言检测
- 样式生成
- 文本方向
- dir 属性生成
- 自定义语言列表支持

## 浏览器兼容性

RTL 布局支持在所有现代浏览器中工作：

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 常见问题

### Q: 为什么代码块不是 RTL？

A: 代码块保持 LTR 方向是有意为之的，因为大多数编程语言都是从左到右书写的。这确保代码的可读性。

### Q: 如何添加新的 RTL 语言？

A: 在插件配置中添加到 `rtlLocales` 数组：

```typescript
i18nPlugin({
  rtl: {
    enabled: true,
    rtlLocales: ['ar', 'he', 'fa', 'ur', 'my-custom-rtl-lang']
  }
})
```

### Q: 可以为特定组件禁用 RTL 吗？

A: 可以，使用 `dir="ltr"` 属性：

```html
<div dir="ltr">
  <!-- 这个区域将保持 LTR，即使在 RTL 页面中 -->
</div>
```

### Q: RTL 样式会影响性能吗？

A: 不会。RTL 样式只在检测到 RTL 语言时才会生成和注入，对 LTR 语言没有任何影响。

## 相关资源

- [W3C: Structural markup and right-to-left text in HTML](https://www.w3.org/International/questions/qa-html-dir)
- [MDN: CSS direction property](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
- [RTL Styling 101](https://rtlstyling.com/)

## 总结

RTL 布局支持为文档系统提供了完整的从右到左语言支持，包括：

- ✅ 自动语言检测
- ✅ 全面的样式调整
- ✅ 代码块特殊处理
- ✅ 灵活的配置选项
- ✅ 完整的测试覆盖

这使得文档系统能够为全球用户提供本地化的阅读体验。
