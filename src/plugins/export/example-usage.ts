/**
 * PDF Export Usage Examples
 * 
 * This file demonstrates various ways to use the PDF export functionality.
 */

import { exportToPDF, exportMultiplePDFs, validatePDFConfig } from './pdf'
import type { PDFConfig, PDFExportOptions } from './pdf'

// ============== Example 1: Basic Export ==============

async function basicExport() {
  await exportToPDF({
    url: 'http://localhost:5173/guide/getting-started',
    output: './output/getting-started.pdf'
  })
  console.log('✅ Basic export completed')
}

// ============== Example 2: Export with Custom Page Size ==============

async function customPageSize() {
  await exportToPDF({
    url: 'http://localhost:5173/guide/installation',
    output: './output/installation.pdf',
    pageSize: 'Letter' // or 'A4', 'Legal'
  })
  console.log('✅ Export with custom page size completed')
}

// ============== Example 3: Export with Custom Margins ==============

async function customMargins() {
  await exportToPDF({
    url: 'http://localhost:5173/api/reference',
    output: './output/api-reference.pdf',
    pageSize: 'A4',
    margin: {
      top: '2.5cm',
      right: '2cm',
      bottom: '2.5cm',
      left: '2cm'
    }
  })
  console.log('✅ Export with custom margins completed')
}

// ============== Example 4: Export with Table of Contents ==============

async function exportWithTOC() {
  await exportToPDF({
    url: 'http://localhost:5173/guide/complete-guide',
    output: './output/complete-guide.pdf',
    pageSize: 'A4',
    toc: true // Automatically generate table of contents
  })
  console.log('✅ Export with TOC completed')
}

// ============== Example 5: Export with Headers and Footers ==============

async function exportWithHeaderFooter() {
  await exportToPDF({
    url: 'http://localhost:5173/guide/advanced',
    output: './output/advanced-guide.pdf',
    pageSize: 'A4',
    headerFooter: {
      header: 'LDesign Documentation - Advanced Guide',
      footer: 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>'
    }
  })
  console.log('✅ Export with header/footer completed')
}

// ============== Example 6: Complete Configuration ==============

async function completeConfiguration() {
  const config: PDFExportOptions = {
    url: 'http://localhost:5173/guide/comprehensive',
    output: './output/comprehensive-guide.pdf',
    pageSize: 'A4',
    margin: {
      top: '2cm',
      right: '1.5cm',
      bottom: '2cm',
      left: '1.5cm'
    },
    toc: true,
    headerFooter: {
      header: 'LDesign Documentation',
      footer: '<span class="pageNumber"></span> / <span class="totalPages"></span>'
    },
    waitForNetwork: true,
    timeout: 60000 // 60 seconds
  }

  await exportToPDF(config)
  console.log('✅ Complete configuration export completed')
}

// ============== Example 7: Batch Export Multiple Pages ==============

async function batchExport() {
  const pages = [
    { url: 'http://localhost:5173/guide/intro', output: './output/intro.pdf' },
    { url: 'http://localhost:5173/guide/setup', output: './output/setup.pdf' },
    { url: 'http://localhost:5173/guide/usage', output: './output/usage.pdf' },
    { url: 'http://localhost:5173/api/reference', output: './output/api.pdf' }
  ]

  await exportMultiplePDFs(pages, {
    pageSize: 'A4',
    margin: {
      top: '1.5cm',
      bottom: '1.5cm'
    },
    toc: true
  })
  console.log('✅ Batch export completed')
}

// ============== Example 8: Export with Validation ==============

async function exportWithValidation() {
  const config: PDFConfig = {
    pageSize: 'A4',
    margin: {
      top: '2cm',
      right: '1.5cm',
      bottom: '2cm',
      left: '1.5cm'
    },
    toc: true
  }

  // Validate configuration before export
  if (!validatePDFConfig(config)) {
    console.error('❌ Invalid PDF configuration')
    return
  }

  await exportToPDF({
    url: 'http://localhost:5173/guide/validated',
    output: './output/validated.pdf',
    ...config
  })
  console.log('✅ Validated export completed')
}

// ============== Example 9: Export with Error Handling ==============

async function exportWithErrorHandling() {
  try {
    await exportToPDF({
      url: 'http://localhost:5173/guide/example',
      output: './output/example.pdf',
      pageSize: 'A4',
      timeout: 30000
    })
    console.log('✅ Export completed successfully')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Playwright is not installed')) {
        console.error('❌ Please install Playwright: npm install -D playwright')
      } else if (error.message.includes('timeout')) {
        console.error('❌ Export timed out. Try increasing the timeout value.')
      } else {
        console.error('❌ Export failed:', error.message)
      }
    }
  }
}

// ============== Example 10: Export Different Page Sizes ==============

async function exportDifferentSizes() {
  const baseUrl = 'http://localhost:5173/guide/sizing'

  // A4 (210mm × 297mm)
  await exportToPDF({
    url: baseUrl,
    output: './output/guide-a4.pdf',
    pageSize: 'A4'
  })

  // Letter (8.5in × 11in)
  await exportToPDF({
    url: baseUrl,
    output: './output/guide-letter.pdf',
    pageSize: 'Letter'
  })

  // Legal (8.5in × 14in)
  await exportToPDF({
    url: baseUrl,
    output: './output/guide-legal.pdf',
    pageSize: 'Legal'
  })

  console.log('✅ Exported in all page sizes')
}

// ============== Example 11: Export with Custom Timeout ==============

async function exportWithCustomTimeout() {
  // For pages with heavy content or slow loading
  await exportToPDF({
    url: 'http://localhost:5173/guide/heavy-content',
    output: './output/heavy-content.pdf',
    timeout: 120000, // 2 minutes
    waitForNetwork: true
  })
  console.log('✅ Export with custom timeout completed')
}

// ============== Example 12: Export Without Waiting for Network ==============

async function exportFast() {
  // Faster export, but may miss some dynamically loaded content
  await exportToPDF({
    url: 'http://localhost:5173/guide/static-content',
    output: './output/static-content.pdf',
    waitForNetwork: false
  })
  console.log('✅ Fast export completed')
}

// ============== Main Function ==============

async function main() {
  console.log('🚀 Starting PDF Export Examples\n')

  // Run examples (uncomment the ones you want to try)

  // await basicExport()
  // await customPageSize()
  // await customMargins()
  // await exportWithTOC()
  // await exportWithHeaderFooter()
  // await completeConfiguration()
  // await batchExport()
  // await exportWithValidation()
  // await exportWithErrorHandling()
  // await exportDifferentSizes()
  // await exportWithCustomTimeout()
  // await exportFast()

  console.log('\n✨ All examples completed!')
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export {
  basicExport,
  customPageSize,
  customMargins,
  exportWithTOC,
  exportWithHeaderFooter,
  completeConfiguration,
  batchExport,
  exportWithValidation,
  exportWithErrorHandling,
  exportDifferentSizes,
  exportWithCustomTimeout,
  exportFast
}
