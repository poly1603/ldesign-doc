/**
 * Example configuration demonstrating build hooks usage
 * 
 * This example shows how to use pre-build and post-build hooks
 * to customize the build process.
 */

import { defineConfig } from '@ldesign/doc'
import { writeFileSync, rmSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { resolve, join } from 'path'

export default defineConfig({
  title: 'My Documentation',
  description: 'Documentation with custom build hooks',

  build: {
    // Build hooks configuration
    hooks: {
      // Pre-build hooks - executed before build starts
      preBuild: [
        // Hook 1: Clean old build artifacts
        async (config) => {
          console.log('🧹 Cleaning old build artifacts...')
          const oldDist = resolve(config.root, 'old-dist')
          if (existsSync(oldDist)) {
            rmSync(oldDist, { recursive: true, force: true })
            console.log('  ✓ Removed old-dist directory')
          }
        },

        // Hook 2: Prepare build environment
        async (config) => {
          console.log('🔧 Preparing build environment...')
          const tempDir = resolve(config.root, '.build-temp')
          mkdirSync(tempDir, { recursive: true })
          console.log('  ✓ Created temporary build directory')
        },

        // Hook 3: Log build configuration
        async (config) => {
          console.log('📋 Build Configuration:')
          console.log(`  - Title: ${config.title}`)
          console.log(`  - Output: ${config.outDir}`)
          console.log(`  - Base URL: ${config.base}`)
          console.log(`  - Minify: ${config.build.minify}`)
        }
      ],

      // Post-build hooks - executed after build completes
      postBuild: [
        // Hook 1: Generate build metadata
        async (config) => {
          console.log('📊 Generating build metadata...')

          const metadata = {
            buildTime: new Date().toISOString(),
            version: '1.0.0',
            site: {
              title: config.title,
              description: config.description,
              base: config.base
            },
            build: {
              outDir: config.outDir,
              minify: config.build.minify,
              ssr: config.build.ssr
            }
          }

          const metadataPath = resolve(config.outDir, 'build-metadata.json')
          writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
          console.log(`  ✓ Saved metadata to ${metadataPath}`)
        },

        // Hook 2: Copy additional assets
        async (config) => {
          console.log('📦 Copying additional assets...')

          const assetsDir = resolve(config.root, 'extra-assets')
          if (existsSync(assetsDir)) {
            const targetDir = join(config.outDir, 'assets')
            mkdirSync(targetDir, { recursive: true })

            // Example: Copy a logo file
            const logoSrc = join(assetsDir, 'logo.svg')
            if (existsSync(logoSrc)) {
              copyFileSync(logoSrc, join(targetDir, 'logo.svg'))
              console.log('  ✓ Copied logo.svg')
            }
          }
        },

        // Hook 3: Generate sitemap
        async (config) => {
          console.log('🗺️  Generating sitemap...')

          // Simple sitemap generation
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.base}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`

          const sitemapPath = resolve(config.outDir, 'sitemap.xml')
          writeFileSync(sitemapPath, sitemap)
          console.log(`  ✓ Generated sitemap at ${sitemapPath}`)
        },

        // Hook 4: Send build notification (example)
        async (config) => {
          console.log('📢 Build completed successfully!')
          console.log(`  - Output directory: ${config.outDir}`)
          console.log(`  - Site title: ${config.title}`)

          // In a real scenario, you might send a webhook notification:
          // await fetch('https://hooks.slack.com/...', {
          //   method: 'POST',
          //   body: JSON.stringify({
          //     text: `✅ Documentation build completed for ${config.title}`
          //   })
          // })
        }
      ]
    }
  }
})
