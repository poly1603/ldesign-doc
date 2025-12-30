# Build Hooks Usage Guide

Build hooks allow you to execute custom logic at different stages of the build process. This is useful for tasks like:

- Preparing build environment
- Cleaning up old files
- Copying additional assets
- Generating metadata files
- Sending build notifications
- Running post-processing scripts

## Configuration

Build hooks are configured in your `ldoc.config.ts` file under the `build.hooks` property:

```typescript
import { defineConfig } from '@ldesign/doc'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  title: 'My Documentation',
  description: 'My awesome documentation site',
  
  build: {
    hooks: {
      // Pre-build hooks run before the build starts
      preBuild: async (config) => {
        console.log('🚀 Starting build...')
        console.log(`Building site: ${config.title}`)
      },
      
      // Post-build hooks run after the build completes
      postBuild: async (config) => {
        console.log('✅ Build complete!')
        
        // Example: Generate a build metadata file
        const metadata = {
          buildTime: new Date().toISOString(),
          title: config.title,
          outDir: config.outDir
        }
        
        writeFileSync(
          resolve(config.outDir, 'build-meta.json'),
          JSON.stringify(metadata, null, 2)
        )
      }
    }
  }
})
```

## Hook Types

### Pre-Build Hooks

Pre-build hooks are executed **before** the build process starts. They are useful for:

- Setting up the build environment
- Cleaning temporary files
- Validating configuration
- Preparing assets

```typescript
build: {
  hooks: {
    preBuild: async (config) => {
      // Your pre-build logic here
      console.log('Preparing build environment...')
    }
  }
}
```

### Post-Build Hooks

Post-build hooks are executed **after** the build process completes successfully. They are useful for:

- Post-processing generated files
- Copying additional assets
- Generating sitemaps or RSS feeds
- Sending notifications
- Uploading to CDN

```typescript
build: {
  hooks: {
    postBuild: async (config) => {
      // Your post-build logic here
      console.log('Post-processing build output...')
    }
  }
}
```

## Multiple Hooks

You can provide an array of hooks if you need to execute multiple operations:

```typescript
build: {
  hooks: {
    preBuild: [
      async (config) => {
        console.log('Hook 1: Cleaning temp files...')
      },
      async (config) => {
        console.log('Hook 2: Validating config...')
      },
      async (config) => {
        console.log('Hook 3: Preparing assets...')
      }
    ],
    
    postBuild: [
      async (config) => {
        console.log('Hook 1: Generating sitemap...')
      },
      async (config) => {
        console.log('Hook 2: Optimizing images...')
      }
    ]
  }
}
```

Hooks in an array are executed **sequentially** in the order they are defined.

## Hook Function Signature

Each hook function receives the `SiteConfig` object as its parameter:

```typescript
type BuildHookFunction = (config: SiteConfig) => void | Promise<void>
```

The `SiteConfig` object contains all the resolved configuration, including:

- `config.root` - Project root directory
- `config.srcDir` - Source documentation directory
- `config.outDir` - Build output directory
- `config.title` - Site title
- `config.description` - Site description
- `config.base` - Base URL
- And many more...

## Practical Examples

### Example 1: Clean Old Build Files

```typescript
import { rmSync, existsSync } from 'fs'

build: {
  hooks: {
    preBuild: async (config) => {
      const oldBuildDir = resolve(config.root, 'old-dist')
      if (existsSync(oldBuildDir)) {
        rmSync(oldBuildDir, { recursive: true, force: true })
        console.log('✨ Cleaned old build files')
      }
    }
  }
}
```

### Example 2: Copy Additional Assets

```typescript
import { copyFileSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'

build: {
  hooks: {
    postBuild: async (config) => {
      const assetsDir = resolve(config.root, 'extra-assets')
      const targetDir = join(config.outDir, 'assets')
      
      mkdirSync(targetDir, { recursive: true })
      
      // Copy files
      copyFileSync(
        join(assetsDir, 'logo.svg'),
        join(targetDir, 'logo.svg')
      )
      
      console.log('📦 Copied additional assets')
    }
  }
}
```

### Example 3: Generate Build Report

```typescript
import { writeFileSync } from 'fs'
import { resolve } from 'path'

build: {
  hooks: {
    postBuild: async (config) => {
      const report = {
        buildTime: new Date().toISOString(),
        site: {
          title: config.title,
          description: config.description,
          base: config.base
        },
        output: {
          directory: config.outDir,
          ssr: config.build.ssr,
          minify: config.build.minify
        }
      }
      
      writeFileSync(
        resolve(config.outDir, 'build-report.json'),
        JSON.stringify(report, null, 2)
      )
      
      console.log('📊 Generated build report')
    }
  }
}
```

### Example 4: Send Build Notification

```typescript
build: {
  hooks: {
    postBuild: async (config) => {
      // Send notification to Slack, Discord, etc.
      await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `✅ Documentation build completed for ${config.title}`
        })
      })
      
      console.log('📢 Sent build notification')
    }
  }
}
```

### Example 5: Generate Sitemap

```typescript
import { writeFileSync, readdirSync, statSync } from 'fs'
import { resolve, join, relative } from 'path'

build: {
  hooks: {
    postBuild: async (config) => {
      const pages: string[] = []
      
      // Recursively find all HTML files
      function findHtmlFiles(dir: string) {
        const files = readdirSync(dir)
        for (const file of files) {
          const fullPath = join(dir, file)
          if (statSync(fullPath).isDirectory()) {
            findHtmlFiles(fullPath)
          } else if (file.endsWith('.html')) {
            const relativePath = relative(config.outDir, fullPath)
            pages.push(relativePath.replace(/\\/g, '/'))
          }
        }
      }
      
      findHtmlFiles(config.outDir)
      
      // Generate sitemap XML
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${config.base}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`).join('\n')}
</urlset>`
      
      writeFileSync(
        resolve(config.outDir, 'sitemap.xml'),
        sitemap
      )
      
      console.log(`🗺️  Generated sitemap with ${pages.length} pages`)
    }
  }
}
```

## Error Handling

If a hook throws an error, the build process will fail and the error will be logged:

```typescript
build: {
  hooks: {
    preBuild: async (config) => {
      try {
        // Your logic here
        await someRiskyOperation()
      } catch (error) {
        console.error('Pre-build hook failed:', error)
        throw error // Re-throw to fail the build
      }
    }
  }
}
```

## Best Practices

1. **Keep hooks focused**: Each hook should do one thing well
2. **Use async/await**: For better error handling and readability
3. **Log progress**: Help users understand what's happening
4. **Handle errors gracefully**: Provide clear error messages
5. **Test your hooks**: Ensure they work in different scenarios
6. **Document your hooks**: Explain what each hook does and why

## Execution Order

The complete build lifecycle with hooks:

1. **Pre-build hooks** (`build.hooks.preBuild`)
2. Plugin `buildStart` hooks
3. Page scanning and data collection
4. Vite build process
5. SSR build (if enabled)
6. Static page generation
7. Asset copying
8. Plugin `buildEnd` hooks
9. User `buildEnd` callback
10. **Post-build hooks** (`build.hooks.postBuild`)
11. Build report generation

## TypeScript Support

Build hooks have full TypeScript support:

```typescript
import type { BuildHookFunction, SiteConfig } from '@ldesign/doc'

const myPreBuildHook: BuildHookFunction = async (config: SiteConfig) => {
  // TypeScript will provide autocomplete for config properties
  console.log(config.title)
  console.log(config.outDir)
}

export default defineConfig({
  build: {
    hooks: {
      preBuild: myPreBuildHook
    }
  }
})
```

## Related

- [Build Configuration](./build-config.md)
- [Plugin System](./plugin-system.md)
- [Configuration Reference](./config-reference.md)
