# Build Report Example

## Sample Output

Here's what you'll see when running `ldoc build`:

```
  🔨 Building for production...
  ─────────────────────────────────────────────

  → Scanning pages (25 found)
  → Extending page data (8 plugins)
  → Reading time data (25 pages)
  → Building client bundle
  → Generating static pages...
  → Copying public assets

📊 Build Report
──────────────────────────────────────────────────

📄 Pages
  Total: 25
  By Language:
    en: 20
    zh: 5
  By Category:
    guide: 15
    api: 8
    uncategorized: 2

📦 Assets
  Total Files: 48
  Total Size: 2.45 MB
  By Type:
    .js: 15 files, 1.65 MB
    .css: 6 files, 485.23 KB
    .html: 25 files, 298.45 KB
    .png: 2 files, 45.67 KB
  Largest Files:
    assets/main.a1b2c3d4.js: 892.34 KB
    assets/vendor.e5f6g7h8.js: 678.90 KB
    assets/theme.i9j0k1l2.js: 123.45 KB
    assets/index.m3n4o5p6.css: 234.56 KB
    assets/theme.q7r8s9t0.css: 156.78 KB

⚠️  Warnings
  ⚠ Large bundle detected: assets/main.a1b2c3d4.js (892.34 KB)
  ⚠ Total JavaScript size is 1.65 MB. Consider code splitting.

💡 Suggestions
  • 2 pages are missing meta descriptions
    → Add "description" field to frontmatter for better SEO
  • Image lazy loading is not enabled
    → Enable markdown.image.lazyLoading in config for better performance
  • CSS size is 485.23 KB
    → Consider removing unused CSS or splitting styles

──────────────────────────────────────────────────
  Build completed in 5.42s

  Report saved to dist/build-report.json

  ┌─────────────────────────────────────────┐
  │                                         │
  │  ✓ Build completed!                     │
  │                                         │
  │  ⏱ Time:    5420ms                      │
  │  📁 Output:  dist                        │
  │                                         │
  └─────────────────────────────────────────┘

  Run ldoc preview to preview the build
```

## Interpreting the Report

### Page Statistics

The **Pages** section shows:
- **Total**: Total number of documentation pages built
- **By Language**: Distribution across different languages (useful for i18n sites)
- **By Category**: How pages are organized by category

**Action**: If you see many "uncategorized" pages, consider adding `category` to frontmatter.

### Asset Analysis

The **Assets** section provides:
- **Total Files**: Number of generated files
- **Total Size**: Combined size of all assets
- **By Type**: Breakdown by file extension
- **Largest Files**: Top files by size

**Action**: Focus optimization efforts on the largest files first.

### Warnings

Warnings indicate potential issues:

1. **Large bundle detected**: Individual files exceeding the size limit
   - **Fix**: Enable code splitting, lazy loading, or tree shaking
   
2. **Total JavaScript size is large**: Combined JS exceeds 1MB
   - **Fix**: Split code into smaller chunks, remove unused dependencies

### Suggestions

Suggestions are optimization opportunities:

1. **Missing meta descriptions**
   - **Impact**: SEO ranking
   - **Fix**: Add `description` field to page frontmatter
   
2. **Image lazy loading not enabled**
   - **Impact**: Initial page load performance
   - **Fix**: Enable in config:
     ```ts
     export default defineConfig({
       markdown: {
         image: {
           lazyLoading: true
         }
       }
     })
     ```

3. **Minification disabled**
   - **Impact**: Bundle size
   - **Fix**: Enable in config:
     ```ts
     export default defineConfig({
       build: {
         minify: true
       }
     })
     ```

4. **Large CSS size**
   - **Impact**: Render blocking
   - **Fix**: Use PurgeCSS, split critical CSS, or use CSS-in-JS

## Using the JSON Report

The report is saved to `{outDir}/build-report.json` for programmatic access:

```typescript
import { readFileSync } from 'fs'
import { join } from 'path'

// Read the report
const reportPath = join(process.cwd(), 'dist/build-report.json')
const report = JSON.parse(readFileSync(reportPath, 'utf-8'))

// Check if build meets criteria
if (report.assets.totalSize > 5 * 1024 * 1024) {
  console.error('Build size exceeds 5MB!')
  process.exit(1)
}

// Check for critical warnings
const criticalWarnings = report.warnings.filter(w => w.severity === 'error')
if (criticalWarnings.length > 0) {
  console.error('Build has critical warnings!')
  process.exit(1)
}

console.log(`✓ Build passed all checks`)
console.log(`  Pages: ${report.pages.total}`)
console.log(`  Size: ${(report.assets.totalSize / 1024 / 1024).toFixed(2)} MB`)
console.log(`  Duration: ${(report.duration / 1000).toFixed(2)}s`)
```

## CI/CD Integration

Use the build report in your CI/CD pipeline:

```yaml
# .github/workflows/build.yml
name: Build Documentation

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build documentation
        run: npm run docs:build
      
      - name: Check build report
        run: |
          node -e "
            const report = require('./dist/build-report.json');
            const sizeMB = report.assets.totalSize / 1024 / 1024;
            console.log(\`Build size: \${sizeMB.toFixed(2)} MB\`);
            if (sizeMB > 10) {
              console.error('Build size exceeds 10MB limit!');
              process.exit(1);
            }
            if (report.warnings.some(w => w.severity === 'error')) {
              console.error('Build has critical warnings!');
              process.exit(1);
            }
          "
      
      - name: Upload build report
        uses: actions/upload-artifact@v3
        with:
          name: build-report
          path: dist/build-report.json
```

## Customization

You can extend the build report by modifying `src/node/buildReport.ts`:

### Add Custom Warnings

```typescript
// In generateWarnings()
if (someCondition) {
  warnings.push({
    type: 'custom-warning',
    message: 'Your custom warning message',
    severity: 'warning'
  })
}
```

### Add Custom Suggestions

```typescript
// In generateSuggestions()
if (someCondition) {
  suggestions.push({
    type: 'optimization',
    message: 'Your suggestion',
    action: 'How to fix it'
  })
}
```

### Add Custom Metrics

```typescript
// Extend BuildReport interface
export interface BuildReport {
  // ... existing fields
  customMetrics?: {
    lighthouse?: number
    accessibility?: number
  }
}
```

## Best Practices

1. **Review reports regularly**: Check after each build to catch regressions early
2. **Set size budgets**: Use the JSON report in CI to enforce size limits
3. **Address warnings**: Don't ignore warnings - they indicate real issues
4. **Follow suggestions**: Suggestions are based on best practices
5. **Track trends**: Compare reports over time to measure improvements

## Troubleshooting

### Report shows 0 assets

**Cause**: Build output directory doesn't exist or is empty
**Fix**: Ensure build completes successfully before report generation

### Missing page statistics

**Cause**: Pages array is empty
**Fix**: Check that pages are being scanned correctly

### Incorrect file sizes

**Cause**: Files are being modified after report generation
**Fix**: Ensure report runs after all build steps complete

## Related Documentation

- [Build Configuration](./BUILD_CONFIGURATION.md)
- [Performance Optimization](./PERFORMANCE.md)
- [CI/CD Integration](./CI_CD.md)
