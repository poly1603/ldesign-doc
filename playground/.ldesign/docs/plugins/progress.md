# 进度条插件

阅读进度条插件，显示当前页面的阅读进度。

## 安装

```ts
import { progressPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    progressPlugin()
  ]
})
```

## 配置选项

```ts
progressPlugin({
  // 进度条颜色
  color: 'var(--ldoc-c-brand-1)',
  
  // 进度条高度 (px)
  height: 3,
  
  // 位置
  position: 'top',
  
  // 显示百分比
  showPercentage: false,
  
  // 排除的页面
  exclude: ['/']
})
```

## 配置详解

### color

- **类型**: `string`
- **默认值**: `'var(--ldoc-c-brand-1)'`

进度条颜色，支持 CSS 颜色值或 CSS 变量。

```ts
// 使用主题色
color: 'var(--ldoc-c-brand-1)'

// 使用固定颜色
color: '#3b82f6'

// 使用渐变
color: 'linear-gradient(to right, #3b82f6, #8b5cf6)'
```

### height

- **类型**: `number`
- **默认值**: `3`

进度条高度，单位像素。

### position

- **类型**: `'top' | 'bottom'`
- **默认值**: `'top'`

进度条位置：
- `'top'` - 页面顶部
- `'bottom'` - 页面底部

### showPercentage

- **类型**: `boolean`
- **默认值**: `false`

是否在进度条旁显示百分比数字。

### exclude

- **类型**: `string[]`
- **默认值**: `['/']`

排除的页面路径。默认排除首页。

```ts
exclude: [
  '/',
  '/changelog',
  '/about'
]
```

## 页面禁用

在 frontmatter 中禁用特定页面：

```yaml
---
progress: false
---
```

## 自定义样式

```css
/* 进度条容器 */
.ldoc-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* 进度条 */
.ldoc-progress-bar-inner {
  height: 3px;
  background: var(--ldoc-c-brand-1);
  transition: width 0.1s ease;
}

/* 百分比文字 */
.ldoc-progress-percentage {
  position: fixed;
  top: 8px;
  right: 16px;
  font-size: 12px;
  color: var(--ldoc-c-text-2);
}
```

## 与导航栏配合

如果使用固定导航栏，进度条会自动显示在导航栏下方：

```css
.ldoc-progress-bar {
  top: var(--ldoc-nav-height, 64px);
}
```
