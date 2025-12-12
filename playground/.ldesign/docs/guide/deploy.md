# 部署

本章介绍如何将文档站点部署到各种平台。

## 构建

```bash
pnpm build
```

构建产物输出到 `dist` 目录，可部署到任何静态托管服务。

## GitHub Pages

### 手动部署

1. 设置 `base` 为仓库名：

```ts
// doc.config.ts
export default defineConfig({
  base: '/my-repo/'
})
```

2. 构建并推送到 `gh-pages` 分支：

```bash
pnpm build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:user/repo.git main:gh-pages
```

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
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

## Vercel

1. 导入 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置输出目录：`dist`
4. 部署

或使用 CLI：

```bash
npm i -g vercel
vercel
```

## Netlify

1. 导入 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置发布目录：`dist`
4. 部署

### netlify.toml

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Cloudflare Pages

1. 连接 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置输出目录：`dist`
4. 部署

## 服务器部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## 自定义域名

### GitHub Pages

1. 在 `public` 目录创建 `CNAME` 文件：

```
docs.example.com
```

2. 配置 DNS 指向 GitHub Pages

### Vercel / Netlify

在平台设置中添加自定义域名并配置 DNS。

## SEO 优化

```ts
// doc.config.ts
export default defineConfig({
  head: [
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'My Docs' }],
    ['meta', { property: 'og:description', content: 'Documentation site' }],
    ['meta', { property: 'og:image', content: 'https://example.com/og-image.png' }]
  ]
})
```
