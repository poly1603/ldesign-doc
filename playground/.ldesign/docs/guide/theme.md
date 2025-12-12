# 主题定制

LDoc 提供了强大的主题系统，支持简单的样式覆盖到完整的自定义主题开发。

## 使用社区主题

```bash
# 安装主题
pnpm add ldoc-theme-xxx
```

```ts
// doc.config.ts
import { defineConfig } from '@ldesign/doc'
import theme from 'ldoc-theme-xxx'

export default defineConfig({
  theme
})
```

## 样式覆盖

### CSS 变量

最简单的定制方式是覆盖 CSS 变量：

```css
/* .ldesign/styles/custom.css */
:root {
  --ldoc-c-brand-1: #5468ff;
  --ldoc-c-brand-2: #747bff;
  --ldoc-c-brand-3: #3451b2;
  
  --ldoc-c-bg: #ffffff;
  --ldoc-c-bg-soft: #f6f6f7;
  --ldoc-c-bg-mute: #e3e3e5;
}

.dark {
  --ldoc-c-bg: #1a1a1a;
  --ldoc-c-bg-soft: #242424;
  --ldoc-c-bg-mute: #2f2f2f;
}
```

### 配置自定义样式

```ts
export default defineConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    }
  }
})
```

## 开发自定义主题

如果需要完全自定义的主题，请参阅 [主题开发指南](/plugins/theme-dev)。
