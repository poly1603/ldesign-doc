# 一键部署指南

LDoc 支持一键部署到多个免费静态托管平台。本文档详细介绍如何配置和使用部署功能。

## 支持的平台

| 平台 | 免费额度 | 特点 |
|------|---------|------|
| [Netlify](#netlify) | 100GB/月带宽，300分钟构建 | 最流行，支持表单、函数 |
| [Vercel](#vercel) | 100GB/月带宽，无限部署 | 前端首选，边缘函数 |
| [GitHub Pages](#github-pages) | 1GB存储，100GB/月带宽 | GitHub 集成，无需注册 |
| [Cloudflare Pages](#cloudflare-pages) | 无限带宽，500次构建/月 | 全球 CDN，速度快 |
| [Surge](#surge) | 无限项目，免费 SSL | 简单快速，命令行友好 |

## 快速开始

### 1. 配置部署平台

在 `doc.config.ts` 中添加部署配置：

```ts
import { defineConfig } from '@ldesign/doc'

export default defineConfig({
  title: 'My Docs',
  
  deploy: {
    platform: 'netlify', // 选择平台
    netlify: {
      // 平台特定配置
    }
  }
})
```

### 2. 设置环境变量

根据选择的平台，设置相应的环境变量（见下方各平台详细说明）。

### 3. 构建并部署

```bash
# 先构建
ldoc build

# 部署
ldoc deploy
```

---

## Netlify

### 获取 Token

1. 登录 [Netlify](https://app.netlify.com/)
2. 点击右上角头像 → **User settings**
3. 左侧菜单选择 **Applications**
4. 在 **Personal access tokens** 区域，点击 **New access token**
5. 输入 Token 名称（如 `ldoc-deploy`），点击 **Generate token**
6. **立即复制 Token**（只显示一次！）

![Netlify Token](https://docs.netlify.com/images/user-settings-access-tokens.png)

### 获取 Site ID（可选）

如果要部署到已有站点：

1. 进入你的站点 Dashboard
2. 点击 **Site configuration** → **General**
3. 在 **Site information** 中找到 **Site ID**

### 配置

```ts
// doc.config.ts
export default defineConfig({
  deploy: {
    platform: 'netlify',
    netlify: {
      siteId: 'your-site-id', // 可选，首次部署会自动创建新站点
      prod: true              // 是否部署到生产环境，默认 true
    }
  }
})
```

### 环境变量

```bash
# Windows PowerShell
$env:NETLIFY_AUTH_TOKEN = "your-token-here"

# Windows CMD
set NETLIFY_AUTH_TOKEN=your-token-here

# Linux/macOS
export NETLIFY_AUTH_TOKEN=your-token-here
```

或在项目根目录创建 `.env` 文件：

```env
NETLIFY_AUTH_TOKEN=your-token-here
```

---

## Vercel

### 获取 Token

1. 登录 [Vercel](https://vercel.com/)
2. 点击右上角头像 → **Settings**
3. 左侧菜单选择 **Tokens**
4. 点击 **Create** 按钮
5. 输入 Token 名称，选择 **Scope**（建议选择 Full Account）
6. 设置过期时间，点击 **Create Token**
7. **立即复制 Token**

### 配置

```ts
// doc.config.ts
export default defineConfig({
  deploy: {
    platform: 'vercel',
    vercel: {
      projectName: 'my-docs',  // 项目名称
      orgId: 'team_xxx',       // 可选，团队 ID
      prod: true               // 是否部署到生产环境
    }
  }
})
```

### 环境变量

```bash
# Windows PowerShell
$env:VERCEL_TOKEN = "your-token-here"

# Linux/macOS
export VERCEL_TOKEN=your-token-here
```

---

## GitHub Pages

GitHub Pages 不需要额外的 Token（使用本地 Git 凭据）。

### 前置要求

1. 确保项目已初始化 Git
2. 已配置 GitHub 远程仓库
3. 有仓库的推送权限

### 配置

```ts
// doc.config.ts
export default defineConfig({
  deploy: {
    platform: 'github-pages',
    githubPages: {
      repo: 'username/repo-name',  // GitHub 仓库
      branch: 'gh-pages',          // 部署分支，默认 gh-pages
      cname: 'docs.example.com'    // 可选，自定义域名
    }
  }
})
```

### 启用 GitHub Pages

部署后，需要在 GitHub 仓库设置中启用 Pages：

1. 进入仓库 → **Settings** → **Pages**
2. **Source** 选择 `Deploy from a branch`
3. **Branch** 选择 `gh-pages`，目录选择 `/ (root)`
4. 点击 **Save**

### 访问地址

- 默认：`https://username.github.io/repo-name/`
- 自定义域名：配置 CNAME 后使用你的域名

---

## Cloudflare Pages

### 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在右侧边栏可以看到 **Account ID**
3. 或进入任意域名 → **Overview** → 右侧找到 **Account ID**

### 获取 API Token

1. 进入 [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板（或自定义）
4. 确保权限包含：
   - **Account** → **Cloudflare Pages** → **Edit**
5. 点击 **Continue to summary** → **Create Token**
6. **立即复制 Token**

### 配置

```ts
// doc.config.ts
export default defineConfig({
  deploy: {
    platform: 'cloudflare',
    cloudflare: {
      projectName: 'my-docs'  // Pages 项目名称（会自动创建）
    }
  }
})
```

### 环境变量

```bash
# Windows PowerShell
$env:CLOUDFLARE_ACCOUNT_ID = "your-account-id"
$env:CLOUDFLARE_API_TOKEN = "your-api-token"

# Linux/macOS
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
```

---

## Surge

Surge 是最简单的部署方式，首次使用时会引导你创建账号。

### 首次使用

```bash
# 全局安装 surge
npm install -g surge

# 登录（首次会创建账号）
surge login
```

### 获取 Token（可选）

如果需要在 CI/CD 中使用：

```bash
surge token
```

### 配置

```ts
// doc.config.ts
export default defineConfig({
  deploy: {
    platform: 'surge',
    surge: {
      domain: 'my-docs.surge.sh'  // 必填，你的 surge 域名
    }
  }
})
```

### 环境变量（可选）

```bash
# 用于 CI/CD 环境
$env:SURGE_TOKEN = "your-token-here"
```

---

## CLI 命令参考

```bash
# 使用配置文件中的平台部署
ldoc deploy

# 指定平台（覆盖配置）
ldoc deploy --platform netlify
ldoc deploy --platform vercel
ldoc deploy --platform github-pages
ldoc deploy --platform cloudflare
ldoc deploy --platform surge

# 预览部署（不覆盖生产环境）
ldoc deploy --preview

# 指定项目目录
ldoc deploy ./my-docs
```

---

## CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Docs

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
          cache: 'pnpm'
          
      - run: pnpm install
      - run: pnpm ldoc build
      - run: pnpm ldoc deploy
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  image: node:18
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm ldoc build
    - pnpm ldoc deploy
  variables:
    NETLIFY_AUTH_TOKEN: $NETLIFY_AUTH_TOKEN
  only:
    - main
```

---

## 常见问题

### Q: 部署失败提示 "未配置 Token"

确保已正确设置环境变量。在 PowerShell 中临时设置：

```powershell
$env:NETLIFY_AUTH_TOKEN = "your-token"
ldoc deploy
```

### Q: 如何更新已部署的站点？

直接再次运行 `ldoc build && ldoc deploy`，会自动更新。

### Q: 如何删除部署的站点？

需要在对应平台的控制台中手动删除。

### Q: 支持自定义域名吗？

支持！各平台配置方式：

- **Netlify**: 在控制台 → Domain settings 中添加
- **Vercel**: 在控制台 → Domains 中添加
- **GitHub Pages**: 配置 `cname` 选项
- **Cloudflare**: 在 Pages 项目设置中添加
- **Surge**: 使用自定义域名作为 `domain`，如 `docs.example.com`

### Q: 部署后访问 404？

检查 `base` 配置是否正确：

```ts
export default defineConfig({
  base: '/repo-name/', // GitHub Pages 需要配置仓库名
})
```

---

## 安全建议

1. **不要将 Token 提交到代码仓库**
2. 使用环境变量或 CI/CD 的 Secrets 功能
3. 定期轮换 Token
4. 为不同项目使用不同的 Token
5. 设置 Token 最小权限原则
