# PDF Export Feature

## Overview

The PDF export feature allows you to export documentation pages to PDF format using Playwright. This feature supports customizable page sizes, margins, headers, footers, and table of contents generation.

## Installation

First, install Playwright as a dev dependency:

```bash
npm install -D playwright
```

Or with pnpm:

```bash
pnpm add -D playwright
```

## Basic Usage

### Programmatic API

```typescript
import { exportToPDF } from '@ldesign/doc/plugins/export'

// Export a single page
await exportToPDF({
  url: 'http://localhost:5173/guide/getting-started',
  output: './output/getting-started.pdf'
})
```

### With Configuration

```typescript
await exportToPDF({
  url: 'http://localhost:5173/guide/getting-started',
  output: './output/getting-started.pdf',
  pageSize: 'A4',
  margin: {
    top: '2cm',
    right: '1.5cm',
    bottom: '2cm',
    left: '1.5cm'
  },
  toc: true,
  headerFooter: {
    header: 'My Documentation',
    footer: '<span class="pageNumber"></span> / <span class="totalPages"></span>'
  }
})
```

## Configuration Options

### Page Size

Supported page sizes:
- `'A4'` - 210mm × 297mm (default)
- `'Letter'` - 8.5in × 11in
- `'Legal'` - 8.5in × 14in

```typescript
{
  pageSize: 'A4'
}
```

### Margins

Margins can be specified using CSS units (cm, mm, in, px):

```typescript
{
  margin: {
    top: '2cm',
    right: '1.5cm',
    bottom: '2cm',
    left: '1.5cm'
  }
}
```

Default margins: `1cm` for all sides.

### Table of Contents

Enable automatic table of contents generation:

```typescript
{
  toc: true
}
```

When enabled, a table of contents will be generated from all headings (h1-h6) and inserted at the beginning of the PDF with a page break.

### Headers and Footers

Customize page headers and footers:

```typescript
{
  headerFooter: {
    header: 'My Documentation - Getting Started',
    footer: 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>'
  }
}
```

Available template variables:
- `<span class="pageNumber"></span>` - Current page number
- `<span class="totalPages"></span>` - Total number of pages

### Network and Timeout

Control page loading behavior:

```typescript
{
  waitForNetwork: true,  // Wait for network to be idle (default: true)
  timeout: 30000         // Timeout in milliseconds (default: 30000)
}
```

## Advanced Usage

### Export Multiple Pages

```typescript
import { exportMultiplePDFs } from '@ldesign/doc/plugins/export'

await exportMultiplePDFs([
  { url: 'http://localhost:5173/guide/intro', output: './output/intro.pdf' },
  { url: 'http://localhost:5173/guide/setup', output: './output/setup.pdf' },
  { url: 'http://localhost:5173/api/reference', output: './output/api.pdf' }
], {
  pageSize: 'A4',
  margin: { top: '1cm', bottom: '1cm' },
  toc: true
})
```

### CLI Usage

Use the export command from the CLI:

```bash
# Export a single page
ldoc export --format pdf --pages /guide/getting-started --output ./export

# Export multiple pages
ldoc export --format pdf --pages /guide/intro /guide/setup --output ./export

# With custom configuration
ldoc export --format pdf --pages /guide/intro --output ./export --pdf-size A4
```

## Configuration Validation

Validate your PDF configuration before export:

```typescript
import { validatePDFConfig } from '@ldesign/doc/plugins/export'

const config = {
  pageSize: 'A4',
  margin: {
    top: '2cm',
    bottom: '2cm'
  }
}

if (validatePDFConfig(config)) {
  console.log('Configuration is valid')
} else {
  console.error('Invalid configuration')
}
```

## Print Styles

The export plugin automatically includes print-optimized styles that:

- Hide navigation, sidebars, and interactive elements
- Prevent page breaks inside code blocks, images, and tables
- Optimize colors for black and white printing
- Display link URLs in print
- Ensure proper formatting for printed output

These styles are automatically applied when the export plugin is enabled with `enablePrintStyles: true`.

## Examples

### Complete Example

```typescript
import { exportToPDF } from '@ldesign/doc/plugins/export'

async function exportDocumentation() {
  try {
    await exportToPDF({
      url: 'http://localhost:5173/guide/complete-guide',
      output: './exports/complete-guide.pdf',
      pageSize: 'A4',
      margin: {
        top: '2.5cm',
        right: '2cm',
        bottom: '2.5cm',
        left: '2cm'
      },
      toc: true,
      headerFooter: {
        header: 'Complete Guide - LDesign Documentation',
        footer: 'Page <span class="pageNumber"></span>'
      },
      waitForNetwork: true,
      timeout: 60000
    })
    
    console.log('PDF exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
  }
}

exportDocumentation()
```

### Export with Custom Styling

```typescript
// First, ensure your documentation has print styles
import { exportPlugin } from '@ldesign/doc/plugins'

export default defineConfig({
  plugins: [
    exportPlugin({
      enablePrintStyles: true,
      formats: ['pdf']
    })
  ]
})

// Then export
await exportToPDF({
  url: 'http://localhost:5173/styled-page',
  output: './output/styled-page.pdf',
  pageSize: 'Letter',
  margin: { top: '1in', bottom: '1in' }
})
```

## Troubleshooting

### Playwright Not Installed

If you see the error "Playwright is not installed", install it:

```bash
npm install -D playwright
```

### Timeout Errors

If pages take too long to load, increase the timeout:

```typescript
{
  timeout: 60000  // 60 seconds
}
```

### Missing Content

If content is missing from the PDF:

1. Ensure `waitForNetwork: true` is set
2. Increase the timeout value
3. Check that the page loads correctly in a browser
4. Verify that print styles are not hiding important content

### Large PDFs

For very large documentation:

1. Export pages individually instead of all at once
2. Increase the timeout value
3. Consider splitting into multiple smaller PDFs

## Requirements

This feature validates:
- **Requirement 14.2**: PDF export of single pages or entire sections
- **Requirement 14.4**: Preservation of code highlighting and diagrams during export

## Property-Based Testing

The PDF export feature includes comprehensive property-based tests that verify:

- Valid page size configurations are accepted
- Invalid page sizes are rejected
- Margin formats with valid CSS units are accepted
- Invalid margin formats are rejected
- Decimal margin values are handled correctly
- Empty configurations are valid (all fields optional)
- Partial margin configurations are valid
- Complete valid configurations pass validation

All tests run with 100 iterations to ensure robustness across various input combinations.
