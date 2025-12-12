# ldoc-theme-clean

LDoc theme - clean

## Installation

```bash
pnpm add ldoc-theme-clean
```

## Usage

### 基础用法

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  theme: 'ldoc-theme-clean'
})
```

### 带选项

```ts
// .ldesign/doc.config.ts
import { defineConfig } from '@ldesign/doc'
import { createCleanTheme } from 'ldoc-theme-clean'

export default defineConfig({
  theme: createCleanTheme({
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
ldoc-theme-clean/
├── src/
│   ├── index.ts          # 主题入口
│   ├── Layout.vue        # 主布局组件
│   ├── NotFound.vue      # 404 页面
│   ├── components/       # 组件目录
│   ├── composables/      # 组合式函数
│   └── styles/
│       └── index.css     # 主题样式
├── package.json
├── README.md
├── DEVELOPMENT.md  # 开发指南
└── .gitignore
```

## License

MIT
