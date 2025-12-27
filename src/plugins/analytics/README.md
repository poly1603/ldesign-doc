# Analytics Plugin

文档分析插件，支持多平台分析、文档健康检查和搜索追踪。

## 功能特性

- ✅ 多平台分析脚本注入（Google Analytics、Plausible、Umami）
- ✅ 文档健康检查（断链检测、过期内容检测）
- ✅ 搜索查询追踪和内容缺口识别
- ✅ 自动生成健康报告和搜索分析报告

## 安装

```bash
npm install @ldesign/doc
```

## 基本用法

```typescript
import { defineConfig } from '@ldesign/doc'
import { analyticsPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    analyticsPlugin({
      provider: 'google',
      google: {
        measurementId: 'G-XXXXXXXXXX'
      },
      healthCheck: {
        enabled: true,
        checkBrokenLinks: true,
        checkOutdated: {
          enabled: true,
          maxAgeDays: 365
        }
      },
      searchTracking: {
        enabled: true,
        minResultsThreshold: 3
      }
    })
  ]
})
```

## 配置选项

### AnalyticsOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `provider` | `'google' \| 'plausible' \| 'umami' \| 'custom'` | - | 分析提供商 |
| `google` | `GoogleAnalyticsConfig` | - | Google Analytics 配置 |
| `plausible` | `PlausibleConfig` | - | Plausible 配置 |
| `umami` | `UmamiConfig` | - | Umami 配置 |
| `custom` | `CustomAnalyticsConfig` | - | 自定义分析配置 |
| `healthCheck` | `HealthCheckConfig` | `{ enabled: false }` | 文档健康检查配置 |
| `searchTracking` | `SearchTrackingConfig` | `{ enabled: false }` | 搜索追踪配置 |
| `enableInDev` | `boolean` | `false` | 是否在开发模式下启用 |

### GoogleAnalyticsConfig

```typescript
{
  measurementId: string          // 测量 ID (G-XXXXXXXXXX)
  enhancedMeasurement?: boolean  // 是否启用增强测量
  customDimensions?: Record<string, string>  // 自定义维度
}
```

### PlausibleConfig

```typescript
{
  domain: string                 // 域名
  apiHost?: string              // API 主机地址
  trackOutboundLinks?: boolean  // 是否追踪出站链接
}
```

### UmamiConfig

```typescript
{
  websiteId: string  // 网站 ID
  src: string        // 脚本源地址
  dataDomain?: string  // 数据域名
}
```

### HealthCheckConfig

```typescript
{
  enabled: boolean                // 是否启用
  checkBrokenLinks?: boolean      // 是否检查断链
  checkOutdated?: {
    enabled: boolean              // 是否检查过期内容
    maxAgeDays?: number          // 最大过期天数
  }
  reportPath?: string             // 报告输出路径
}
```

### SearchTrackingConfig

```typescript
{
  enabled: boolean                // 是否启用
  storage?: 'local' | 'api'      // 存储方式
  endpoint?: string               // API 端点
  minResultsThreshold?: number   // 最小结果数阈值
}
```

## 使用示例

### Google Analytics

```typescript
analyticsPlugin({
  provider: 'google',
  google: {
    measurementId: 'G-XXXXXXXXXX',
    enhancedMeasurement: true,
    customDimensions: {
      version: '1.0.0',
      environment: 'production'
    }
  }
})
```

### Plausible

```typescript
analyticsPlugin({
  provider: 'plausible',
  plausible: {
    domain: 'docs.example.com',
    apiHost: 'https://plausible.io',
    trackOutboundLinks: true
  }
})
```

### Umami

```typescript
analyticsPlugin({
  provider: 'umami',
  umami: {
    websiteId: '12345678-1234-1234-1234-123456789012',
    src: 'https://analytics.example.com/script.js',
    dataDomain: 'docs.example.com'
  }
})
```

### 自定义分析

```typescript
analyticsPlugin({
  provider: 'custom',
  custom: {
    script: `
      <script>
        // 自定义分析脚本
        (function() {
          // 初始化代码
        })();
      </script>
    `,
    trackPageView: (path) => {
      // 自定义页面浏览追踪
      console.log('Page view:', path)
    }
  }
})
```

### 文档健康检查

```typescript
analyticsPlugin({
  provider: 'google',
  google: { measurementId: 'G-XXXXXXXXXX' },
  healthCheck: {
    enabled: true,
    checkBrokenLinks: true,
    checkOutdated: {
      enabled: true,
      maxAgeDays: 180  // 6 个月
    },
    reportPath: 'health-report.json'
  }
})
```

构建后会在输出目录生成 `health-report.json`：

```json
{
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "totalPages": 100,
  "brokenLinks": [
    {
      "sourcePage": "guide/getting-started.md",
      "brokenUrl": "api/nonexistent.md",
      "linkText": "API Reference",
      "line": 42
    }
  ],
  "outdatedContent": [
    {
      "page": "guide/old-feature.md",
      "lastUpdated": "2023-01-01T00:00:00.000Z",
      "daysOld": 365,
      "title": "Old Feature Guide"
    }
  ],
  "healthScore": 85
}
```

### 搜索查询追踪

```typescript
analyticsPlugin({
  provider: 'google',
  google: { measurementId: 'G-XXXXXXXXXX' },
  searchTracking: {
    enabled: true,
    storage: 'local',  // 或 'api'
    minResultsThreshold: 3
  }
})
```

搜索查询会被记录到 localStorage，可以通过浏览器控制台查看：

```javascript
// 获取搜索日志
const logs = JSON.parse(localStorage.getItem('ldoc-search-logs'))

// 分析搜索日志
import { analyzeSearchLogs } from '@ldesign/doc/plugins/analytics/searchTracking'
const stats = analyzeSearchLogs(logs)
console.log(stats)
```

## API 参考

### 脚本注入

```typescript
import {
  generateGoogleAnalyticsScript,
  generatePlausibleScript,
  generateUmamiScript
} from '@ldesign/doc/plugins/analytics/scriptInjection'

const script = generateGoogleAnalyticsScript({
  measurementId: 'G-XXXXXXXXXX'
})
```

### 健康检查

```typescript
import { performHealthCheck } from '@ldesign/doc/plugins/analytics/healthCheck'

const report = await performHealthCheck(pages, {
  checkBrokenLinks: true,
  checkOutdated: true,
  maxAgeDays: 365
})
```

### 搜索追踪

```typescript
import {
  logSearchQuery,
  analyzeSearchLogs,
  generateSearchReport
} from '@ldesign/doc/plugins/analytics/searchTracking'

// 记录搜索查询
await logSearchQuery('vue components', 15, {
  storage: 'local',
  minResultsThreshold: 3
})

// 分析日志
const stats = analyzeSearchLogs(logs)

// 生成报告
const report = generateSearchReport(stats)
```

## 最佳实践

### 1. 生产环境启用，开发环境禁用

```typescript
analyticsPlugin({
  provider: 'google',
  google: { measurementId: 'G-XXXXXXXXXX' },
  enableInDev: false  // 默认值，开发时不注入脚本
})
```

### 2. 定期检查文档健康

在 CI/CD 流程中添加健康检查：

```bash
# 构建文档
npm run build

# 检查健康报告
node scripts/check-health.js
```

```javascript
// scripts/check-health.js
const fs = require('fs')
const report = JSON.parse(fs.readFileSync('dist/health-report.json', 'utf-8'))

if (report.healthScore < 80) {
  console.error(`Health score too low: ${report.healthScore}`)
  process.exit(1)
}

if (report.brokenLinks.length > 0) {
  console.error(`Found ${report.brokenLinks.length} broken links`)
  process.exit(1)
}
```

### 3. 分析搜索缺口

定期导出和分析搜索日志：

```javascript
import { exportSearchLogs, analyzeSearchLogs } from '@ldesign/doc/plugins/analytics/searchTracking'

// 导出日志
const logsJson = exportSearchLogs()
fs.writeFileSync('search-logs.json', logsJson)

// 分析内容缺口
const logs = JSON.parse(logsJson)
const stats = analyzeSearchLogs(logs)

console.log('Content Gaps:', stats.gapQueries)
// 根据缺口创建新文档
```

## 许可证

MIT
