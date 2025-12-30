# Build Report Implementation

## Overview

Task 25.5 implements a comprehensive build report system that provides detailed statistics, warnings, and suggestions after each documentation build.

## Features Implemented

### 1. Page Statistics
- **Total page count**: Shows the total number of pages built
- **By language**: Breaks down pages by language (from frontmatter `lang` field)
- **By category**: Groups pages by category (from frontmatter `category` field)

### 2. Asset Analysis
- **Total files**: Count of all generated assets
- **Total size**: Combined size of all assets
- **By type**: Breakdown of assets by file extension (.js, .css, .html, etc.)
- **Largest files**: Lists the top 10 largest files to identify optimization opportunities

### 3. Build Warnings
The system automatically detects and reports:
- **Large bundles**: Files exceeding the configured `chunkSizeWarningLimit`
- **Large JavaScript total**: When total JS size exceeds 1MB
- Warnings include file paths and sizes for easy identification

### 4. Build Suggestions
Intelligent suggestions based on configuration and build output:
- **SEO**: Missing meta descriptions in pages
- **Performance**: Image lazy loading not enabled
- **Optimization**: Too many small files, minification disabled
- **CSS size**: Large CSS bundles that could be optimized

Each suggestion includes an actionable recommendation.

## Usage

The build report is automatically generated and displayed at the end of every build:

```bash
ldoc build
```

### Output Example

```
📊 Build Report
──────────────────────────────────────────────────

📄 Pages
  Total: 25
  By Language:
    en: 20
    zh: 5
  By Category:
    guide: 15
    api: 10

📦 Assets
  Total Files: 45
  Total Size: 2.34 MB
  By Type:
    .js: 12 files, 1.50 MB
    .css: 5 files, 450.00 KB
    .html: 25 files, 350.00 KB
  Largest Files:
    assets/main.abc123.js: 850.00 KB
    assets/vendor.def456.js: 650.00 KB

⚠️  Warnings
  ⚠ Large bundle detected: assets/main.abc123.js (850.00 KB)

💡 Suggestions
  • 5 pages are missing meta descriptions
    → Add "description" field to frontmatter for better SEO
  • Image lazy loading is not enabled
    → Enable markdown.image.lazyLoading in config for better performance

──────────────────────────────────────────────────
  Build completed in 5.23s
```

### Report File

A JSON report is also saved to `{outDir}/build-report.json` for programmatic access:

```json
{
  "pages": {
    "total": 25,
    "byLanguage": { "en": 20, "zh": 5 },
    "byCategory": { "guide": 15, "api": 10 }
  },
  "assets": {
    "total": 45,
    "totalSize": 2453504,
    "byType": {
      ".js": { "count": 12, "size": 1572864 },
      ".css": { "count": 5, "size": 460800 }
    },
    "largest": [...]
  },
  "warnings": [...],
  "suggestions": [...],
  "duration": 5230
}
```

## API

### `generateBuildReport(config, pages, duration)`

Generates a complete build report.

**Parameters:**
- `config: SiteConfig` - The site configuration
- `pages: PageData[]` - Array of all pages
- `duration: number` - Build duration in milliseconds

**Returns:** `BuildReport` object

### `printBuildReport(report)`

Prints a formatted build report to the console.

**Parameters:**
- `report: BuildReport` - The report to print

### `saveBuildReport(report, outDir)`

Saves the build report as a JSON file.

**Parameters:**
- `report: BuildReport` - The report to save
- `outDir: string` - Output directory path

## Types

```typescript
interface BuildReport {
  pages: {
    total: number
    byLanguage: Record<string, number>
    byCategory: Record<string, number>
  }
  assets: {
    total: number
    totalSize: number
    byType: Record<string, { count: number; size: number }>
    largest: Array<{ file: string; size: number }>
  }
  warnings: BuildWarning[]
  suggestions: BuildSuggestion[]
  duration: number
}

interface BuildWarning {
  type: 'large-bundle' | 'missing-meta' | 'broken-link' | 'deprecated-api'
  message: string
  file?: string
  severity: 'warning' | 'error'
}

interface BuildSuggestion {
  type: 'optimization' | 'seo' | 'accessibility' | 'performance'
  message: string
  action?: string
}
```

## Integration

The build report is automatically integrated into the build process in `src/node/build.ts`:

1. After the build completes, `generateBuildReport()` is called
2. The report is printed to the console with `printBuildReport()`
3. The report is saved to disk with `saveBuildReport()`

## Testing

Comprehensive unit tests are provided in `src/node/buildReport.test.ts`:

- Page statistics calculation
- Asset analysis
- Warning generation
- Suggestion generation
- Edge cases (empty directories, missing frontmatter, etc.)

Run tests:
```bash
npm test -- buildReport.test.ts
```

## Future Enhancements

Potential improvements for future versions:

1. **Trend Analysis**: Compare with previous builds to show improvements/regressions
2. **Custom Thresholds**: Allow users to configure warning thresholds
3. **More Warnings**: Add checks for broken links, missing images, etc.
4. **Performance Metrics**: Include Lighthouse scores or Core Web Vitals
5. **Export Formats**: Support HTML or Markdown report formats
6. **CI Integration**: Fail builds based on configurable criteria

## Requirements Validation

This implementation satisfies **Requirement 12.4**:

> WHEN building, THE Doc_System SHALL provide detailed build reports with warnings

✅ Outputs page count and bundle sizes
✅ Lists warnings for large bundles and configuration issues
✅ Provides actionable suggestions for optimization
✅ Saves report to JSON file for programmatic access
