# 国际化增强插件 (i18nPlugin)

提供翻译状态追踪、翻译回退和 RTL 布局支持功能。

## 功能特性

### 1. 翻译状态追踪

- 比较源文件和翻译文件的修改时间
- 自动检测过期的翻译
- 生成详细的翻译状态报告
- 支持按语言统计翻译完成度

### 2. 翻译回退

- 当翻译缺失时自动显示源语言内容
- 添加翻译缺失提示（支持多语言）
- 缓存回退内容以提高性能
- 在页面数据中标记回退状态

### 3. RTL 布局支持

- 自动检测 RTL 语言（阿拉伯语、希伯来语等）
- 应用完整的 RTL 样式调整
- 支持自定义 RTL 语言列表
- 保持代码块的 LTR 方向

## 使用方法

### 基础配置

```typescript
import { defineConfig } from '@ldesign/doc'
import { i18nPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  lang: 'zh-CN',
  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/'
    },
    ar: {
      label: 'العربية',
      lang: 'ar-SA',
      link: '/ar/'
    }
  },
  plugins: [
    i18nPlugin({
      // 翻译状态追踪
      statusTracking: {
        enabled: true,
        sourceLocale: 'zh-CN',
        reportPath: '.ldesign/translation-report.json'
      },
      // 翻译回退
      fallback: {
        enabled: true,
        fallbackLocale: 'zh-CN',
        showMissingNotice: true
      },
      // RTL 布局支持
      rtl: {
        enabled: true,
        rtlLocales: ['ar', 'ar-SA', 'he', 'fa']
      }
    })
  ]
})
```

### 翻译状态追踪

插件会在构建时自动扫描所有文件，比较源文件和翻译文件的修改时间：

- **up-to-date**: 翻译是最新的
- **outdated**: 源文件已更新，翻译需要更新
- **missing**: 翻译文件不存在

生成的报告示例：

```json
{
  "generatedAt": 1703001234567,
  "sourceLocale": "zh-CN",
  "translations": [
    {
      "filePath": "guide/intro.md",
      "sourceFilePath": "/path/to/guide/intro.md",
      "translationFilePath": "/path/to/en/guide/intro.md",
      "status": "up-to-date",
      "sourceModifiedTime": 1703000000000,
      "translationModifiedTime": 1703001000000,
      "locale": "en"
    }
  ],
  "summary": {
    "total": 100,
    "upToDate": 80,
    "outdated": 15,
    "missing": 5,
    "byLocale": {
      "en": {
        "total": 50,
        "upToDate": 45,
        "outdated": 3,
        "missing": 2
      }
    }
  }
}
```

### 翻译回退

当用户访问不存在的翻译页面时，插件会自动显示源语言内容，并在页面顶部添加提示：

```markdown
:::warning Translation Missing
This page is not yet translated. You are viewing the content in the default language.
:::

[原始内容...]
```

提示文本支持多种语言，会根据目标语言自动选择。

### RTL 布局支持

对于 RTL 语言（如阿拉伯语、希伯来语），插件会自动：

1. 设置 `direction: rtl`
2. 调整导航栏、侧边栏、内容区域的布局
3. 翻转箭头和图标方向
4. 保持代码块的 LTR 方向
5. 调整列表、引用块、表格等元素

## API

### TranslationStatusTracker

```typescript
import { translationStatusTracker } from '@ldesign/doc/plugins/i18n'

// 获取指定文件的翻译状态
const status = translationStatusTracker.getStatus('guide/intro.md', 'en')

// 获取所有翻译状态
const allStatuses = translationStatusTracker.getAllStatuses()

// 标记过期的翻译
await translationStatusTracker.markOutdatedTranslations('/path/to/source.md')

// 生成报告
const report = await translationStatusTracker.generateReport(config)
```

### TranslationFallback

```typescript
import { translationFallback } from '@ldesign/doc/plugins/i18n'

// 解析回退内容
const content = await translationFallback.resolveFallbackContent(
  'guide/intro.md',
  'en'
)

// 检查是否使用了回退
const isFallback = translationFallback.isFallbackPage('guide/intro.md', 'en')

// 清除缓存
translationFallback.clearCache()
```

### RTLLayoutSupport

```typescript
import { rtlLayoutSupport } from '@ldesign/doc/plugins/i18n'

// 检查语言是否为 RTL
const isRTL = rtlLayoutSupport.isRTL('ar-SA') // true

// 获取文本方向
const dir = rtlLayoutSupport.getTextDirection('ar-SA') // 'rtl'

// 生成 RTL 样式
const styles = rtlLayoutSupport.generateStyles('ar-SA')

// 获取所有 RTL 语言
const rtlLocales = rtlLayoutSupport.getRTLLocales()
```

## 配置选项

### I18nPluginOptions

```typescript
interface I18nPluginOptions {
  statusTracking?: {
    enabled?: boolean          // 是否启用，默认 true
    sourceLocale?: string      // 源语言，默认为站点 lang
    reportPath?: string        // 报告输出路径
  }
  
  fallback?: {
    enabled?: boolean          // 是否启用，默认 true
    fallbackLocale?: string    // 回退语言，默认为源语言
    showMissingNotice?: boolean // 是否显示提示，默认 true
    missingNoticeText?: string  // 自定义提示文本
  }
  
  rtl?: {
    enabled?: boolean          // 是否启用，默认 true
    rtlLocales?: string[]      // RTL 语言列表
  }
}
```

## 最佳实践

### 1. 组织翻译文件

推荐的目录结构：

```
docs/
├── guide/
│   ├── intro.md          # 源语言（中文）
│   └── getting-started.md
├── en/                   # 英文翻译
│   └── guide/
│       ├── intro.md
│       └── getting-started.md
└── ar/                   # 阿拉伯语翻译
    └── guide/
        ├── intro.md
        └── getting-started.md
```

### 2. 监控翻译状态

定期检查翻译状态报告，及时更新过期的翻译：

```bash
# 构建后查看报告
cat .ldesign/translation-report.json | jq '.summary'
```

### 3. 自定义提示文本

为不同语言提供更友好的提示：

```typescript
i18nPlugin({
  fallback: {
    missingNoticeText: '抱歉，此页面的英文翻译正在进行中。'
  }
})
```

### 4. 测试 RTL 布局

在开发时测试 RTL 布局：

```typescript
// 临时切换到 RTL 语言
document.documentElement.setAttribute('dir', 'rtl')
document.documentElement.setAttribute('lang', 'ar-SA')
```

## 注意事项

1. **文件路径**: 翻译文件必须与源文件保持相同的相对路径
2. **修改时间**: 基于文件系统的修改时间，确保文件系统支持
3. **缓存**: 翻译回退内容会被缓存，开发时可能需要清除缓存
4. **RTL 样式**: 某些自定义组件可能需要额外的 RTL 样式调整
5. **代码块**: 代码块始终保持 LTR 方向，即使在 RTL 页面中

## 相关需求

- Requirements 13.1: 翻译状态追踪
- Requirements 13.2: 过期翻译检测
- Requirements 13.3: 翻译回退
- Requirements 13.5: RTL 布局支持
