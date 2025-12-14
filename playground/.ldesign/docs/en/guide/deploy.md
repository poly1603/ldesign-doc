# Deployment

Learn how to build and deploy your LDoc documentation site.

## Build for Production

```bash
pnpm build
```

This generates static files in the `dist` directory (or your configured `outDir`).

## Preview Build

```bash
pnpm preview
```

Preview the production build locally before deploying.

## Deployment Platforms

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings:
   - Build command: `pnpm build`
   - Publish directory: `dist`

Or use `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = "dist"
```

### Vercel

1. Import your repository to Vercel
2. Framework preset: Other
3. Build command: `pnpm build`
4. Output directory: `dist`

### GitHub Pages

1. Configure base URL:

```ts
// doc.config.ts
export default defineConfig({
  base: '/your-repo-name/'
})
```

2. Add GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: dist
```

### Cloudflare Pages

1. Connect your repository
2. Build command: `pnpm build`
3. Build output directory: `dist`

### Surge

```bash
pnpm build
npx surge dist your-domain.surge.sh
```

## Custom Domain

Configure your custom domain with your hosting provider, then update your base URL if needed:

```ts
export default defineConfig({
  base: '/'  // Use root for custom domains
})
```

## Environment Variables

Set environment variables for build:

```bash
LDOC_BASE=/docs/ pnpm build
```
