# Performance Plugin

性能优化插件，提供图片优化、代码分割、预加载提示等功能。

## Features

### 1. 图片自动优化
- 使用 sharp 进行图片处理
- 自动生成 WebP 格式
- 添加 lazy loading 属性
- 支持排除特定图片

### 2. 代码分割优化
- 智能分块策略
- 提取公共依赖
- 优化加载性能

### 3. 预加载提示
- 分析导航链接
- 添加 preload/prefetch 标签
- 提升页面加载速度

## Installation

```bash
npm install sharp
```

## Usage

```typescript
import { defineConfig } from '@ldesign/doc'
import { performancePlugin } from '@ldesign/doc/plugins/performance'

export default defineConfig({
  plugins: [
    performancePlugin({
      imageOptimization: {
        enabled: true,
        webp: true,
        webpQuality: 80,
        lazyLoading: true,
        exclude: [/logo\.png$/]
      },
      codeSplitting: {
        enabled: true,
        minChunks: 2,
        maxParallelRequests: 30
      },
      preloadHints: {
        enabled: true,
        strategy: 'prefetch',
        maxLinks: 5
      }
    })
  ]
})
```

## Options

### ImageOptimizationOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | 是否启用图片优化 |
| `webp` | `boolean` | `true` | 是否生成 WebP 格式 |
| `webpQuality` | `number` | `80` | WebP 质量 (0-100) |
| `lazyLoading` | `boolean` | `true` | 是否添加 lazy loading |
| `exclude` | `RegExp[]` | `[]` | 排除的图片路径模式 |

### CodeSplittingOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | 是否启用代码分割 |
| `minChunks` | `number` | `2` | 公共依赖提取阈值 |
| `maxParallelRequests` | `number` | `30` | 最大并行请求数 |

### PreloadHintsOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | 是否启用预加载提示 |
| `strategy` | `'prefetch' \| 'preload' \| 'both'` | `'prefetch'` | 预加载策略 |
| `maxLinks` | `number` | `5` | 最大预加载链接数 |

## How It Works

### Image Optimization

1. 扫描源目录中的所有图片文件
2. 使用 sharp 生成优化后的 WebP 版本
3. 在 HTML 生成阶段添加 lazy loading 属性
4. 可选生成 `<picture>` 元素以支持多格式

### Code Splitting

1. 配置 Vite/Rollup 的分块策略
2. 将 Vue、React、Markdown 等大型依赖分离
3. 提取公共模块到独立 chunk
4. 优化并行加载性能

### Preload Hints

1. 扫描构建产物中的 HTML 文件
2. 提取导航链接和侧边栏链接
3. 生成 preload/prefetch 标签
4. 插入到 HTML 的 head 中

## Performance Impact

启用所有优化后，预期性能提升：

- **首次加载时间**: 减少 20-30%
- **后续导航**: 减少 40-50%
- **Lighthouse 性能分数**: 提升 10-15 分

## Requirements

- Node.js >= 16
- sharp >= 0.32.0 (可选，用于图片优化)

## License

MIT
