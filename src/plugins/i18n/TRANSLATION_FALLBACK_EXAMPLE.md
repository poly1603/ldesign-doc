# Translation Fallback Example

This document demonstrates how the translation fallback feature works in @ldesign/doc.

## Scenario

You have a documentation site with:
- Default language: Chinese (zh-CN)
- Additional languages: English (en), Japanese (ja)

Some pages are not yet translated to all languages.

## Configuration

```typescript
// ldoc.config.ts
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
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      link: '/ja/'
    }
  },
  plugins: [
    i18nPlugin({
      fallback: {
        enabled: true,
        fallbackLocale: 'zh-CN',
        showMissingNotice: true
      }
    })
  ]
})
```

## Directory Structure

```
docs/
├── guide/
│   ├── intro.md              # Chinese (source)
│   └── advanced.md           # Chinese (source)
├── en/
│   └── guide/
│       └── intro.md          # English translation (exists)
│       # advanced.md is missing!
└── ja/
    └── guide/
        # Both files are missing!
```

## Behavior

### Case 1: Translation Exists
When a user visits `/en/guide/intro.html`:
- The English translation is loaded
- No fallback notice is shown
- Content is in English

### Case 2: Translation Missing
When a user visits `/en/guide/advanced.html`:
- The Chinese source content is loaded (fallback)
- A warning notice is shown at the top:

```markdown
:::warning Translation Missing
This page is not yet translated. You are viewing the content in the default language.
:::

[Chinese content here...]
```

### Case 3: All Translations Missing
When a user visits `/ja/guide/intro.html`:
- The Chinese source content is loaded (fallback)
- A warning notice is shown in Japanese:

```markdown
:::warning 翻訳が不足しています
このページはまだ翻訳されていません。デフォルト言語のコンテンツを表示しています。
:::

[Chinese content here...]
```

## Customizing the Notice

You can customize the notice text:

```typescript
i18nPlugin({
  fallback: {
    enabled: true,
    fallbackLocale: 'zh-CN',
    showMissingNotice: true,
    missingNoticeText: '此页面的翻译正在进行中，请稍后再来查看。'
  }
})
```

## Disabling the Notice

If you don't want to show the notice:

```typescript
i18nPlugin({
  fallback: {
    enabled: true,
    fallbackLocale: 'zh-CN',
    showMissingNotice: false  // No notice will be shown
  }
})
```

## Programmatic Usage

You can also use the translation fallback API programmatically:

```typescript
import { translationFallback } from '@ldesign/doc/plugins/i18n'

// Initialize
translationFallback.initialize(config, {
  fallbackLocale: 'zh-CN',
  showMissingNotice: true
})

// Resolve content for a missing translation
const result = await translationFallback.resolveFallbackContent(
  'guide/advanced.md',
  'en'
)

console.log(result.isFallback)      // true
console.log(result.sourceLocale)    // 'zh-CN'
console.log(result.targetLocale)    // 'en'
console.log(result.content)         // Content with notice

// Check if a page is using fallback
const isFallback = translationFallback.isFallbackPage('guide/advanced.md', 'en')
console.log(isFallback)  // true
```

## Frontmatter Integration

The fallback status is automatically added to page frontmatter:

```typescript
// In your Vue component or theme
import { usePageData } from '@ldesign/doc/client'

const pageData = usePageData()

if (pageData.value.frontmatter._translationFallback?.isFallback) {
  console.log('This page is using fallback content')
  console.log('Source locale:', pageData.value.frontmatter._translationFallback.sourceLocale)
}
```

## Supported Languages for Notices

The plugin provides built-in notice text for:
- English (en)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- Japanese (ja)
- Korean (ko)
- Spanish (es)
- French (fr)
- German (de)
- Russian (ru)
- Arabic (ar)

For other languages, it falls back to English.

## Performance

- Fallback content is cached after first load
- Cache is cleared on config changes
- File system reads are minimized through caching

## Best Practices

1. **Organize translations**: Keep the same directory structure for all languages
2. **Monitor status**: Use the translation status tracker to identify missing translations
3. **Prioritize**: Translate high-traffic pages first
4. **Test**: Verify fallback behavior in development mode
5. **Clear cache**: Clear cache when updating source files during development

## Related Features

- **Translation Status Tracking**: Automatically tracks which translations are missing or outdated
- **RTL Layout Support**: Automatically adjusts layout for right-to-left languages
- **Multi-language Navigation**: Seamlessly switch between available languages

## Validation

The implementation includes comprehensive property-based tests that verify:
- Fallback content is served when translation is missing
- Original translation is used when available
- Notices are shown/hidden based on configuration
- Caching works correctly
- Different locales get appropriate notice text
- Empty content is handled gracefully
