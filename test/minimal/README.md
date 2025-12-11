# ldoc-theme-minimal

LDoc theme - minimal

## Installation

```bash
pnpm add ldoc-theme-minimal
```

## Usage

### 基础用法

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  theme: 'ldoc-theme-minimal'
})
```

### 带选项

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import { createMinimalTheme } from 'ldoc-theme-minimal'

export default defineConfig({
  theme: createMinimalTheme({
    primaryColor: '#10b981'
  })
})
```

## Customization

### CSS 变量

```css
:root {
  --theme-primary: #3b82f6;
  --theme-bg: #ffffff;
  --theme-text: #1f2937;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build
```

## Theme Structure

```
ldoc-theme-minimal/
├── src/
│   ├── index.ts          # 主题入口
│   ├── Layout.vue        # 主布局组件
│   ├── NotFound.vue      # 404 页面
│   ├── components/       # 组件目录
│   ├── composables/      # 组合式函数
│   └── styles/
│       └── index.css     # 主题样式
├── package.json
└── README.md
```

## License

MIT
