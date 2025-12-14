---
layout: home
title: LDoc 现代化文档框架
hero:
  name: LDesign Doc
  text: 现代化文档生成框架
  tagline: 基于 Vite，支持 Vue/React，开箱即用
  canvas:
    type: particles
    speed: 1
    density: 1
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/polyester-design/ldesign

features:
  - icon: zap
    title: Vite 驱动
    details: 享受 Vite 带来的极速开发体验，毫秒级热更新，开发效率提升 10 倍
  - icon: file-text
    title: Markdown 增强
    details: 代码高亮、容器语法、数学公式、Mermaid 图表、Emoji 表情等丰富扩展
  - icon: palette
    title: 高度可定制
    details: 灵活的主题系统，支持 Vue/React 组件，自定义布局和样式
  - icon: plug
    title: 插件生态
    details: 评论系统、搜索、阅读时间、图片预览等 10+ 内置插件
  - icon: search
    title: 全文搜索
    details: 内置搜索插件，支持快捷键唤起，毫秒级响应
  - icon: code
    title: 代码演示
    details: 支持 Vue/React 组件实时预览，代码与效果并排展示
  - icon: globe
    title: 多语言支持
    details: 内置国际化支持，轻松构建多语言文档站点
  - icon: smartphone
    title: 响应式设计
    details: 移动端友好，任何设备上都有出色的阅读体验
  - icon: terminal
    title: CLI 工具
    details: 一键创建项目，快速启动开发，支持模板定制
  - icon: sparkles
    title: 主题切换动画
    details: 多种主题切换动画效果，圆形扩散、淡入淡出、翻转等
  - icon: cpu
    title: TypeScript 优先
    details: 完整的类型定义，智能代码补全，开发体验极佳
  - icon: box
    title: 组件库文档
    details: 专为组件库设计，支持 Props 表格、Slots、Events 文档生成
---

## 为什么选择 LDoc？

LDoc 是一个现代化的静态文档生成框架，专为构建技术文档、组件库文档、API 文档等场景设计。

<div class="stats-section">
  <div class="stat-item">
    <div class="stat-value">10+</div>
    <div class="stat-label">内置插件</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">< 1s</div>
    <div class="stat-label">热更新速度</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">100%</div>
    <div class="stat-label">TypeScript</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">MIT</div>
    <div class="stat-label">开源协议</div>
  </div>
</div>

## 快速上手

只需三步，即可创建你的第一个文档站点：

::: code-group

```bash [pnpm]
# 1. 创建项目
pnpm create ldoc my-docs

# 2. 安装依赖
cd my-docs && pnpm install

# 3. 启动开发
pnpm dev
```

```bash [npm]
# 1. 创建项目
npm create ldoc my-docs

# 2. 安装依赖
cd my-docs && npm install

# 3. 启动开发
npm run dev
```

```bash [yarn]
# 1. 创建项目
yarn create ldoc my-docs

# 2. 安装依赖
cd my-docs && yarn

# 3. 启动开发
yarn dev
```

:::

## 与其他工具对比

<div class="comparison-table">
  <table>
    <thead>
      <tr>
        <th>特性</th>
        <th>LDoc</th>
        <th>VitePress</th>
        <th>Docusaurus</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>构建工具</td>
        <td class="highlight">Vite ⚡</td>
        <td>Vite</td>
        <td>Webpack</td>
      </tr>
      <tr>
        <td>框架支持</td>
        <td class="highlight">Vue + React</td>
        <td>Vue</td>
        <td>React</td>
      </tr>
      <tr>
        <td>组件演示</td>
        <td class="highlight">✅ 内置</td>
        <td>需插件</td>
        <td>需插件</td>
      </tr>
      <tr>
        <td>主题切换动画</td>
        <td class="highlight">✅ 多种效果</td>
        <td>基础</td>
        <td>基础</td>
      </tr>
      <tr>
        <td>评论系统</td>
        <td class="highlight">✅ 5+ 服务</td>
        <td>需插件</td>
        <td>需插件</td>
      </tr>
      <tr>
        <td>Admin 管理后台</td>
        <td class="highlight">✅ 内置</td>
        <td>❌</td>
        <td>❌</td>
      </tr>
    </tbody>
  </table>
</div>

## 三步上手

<div class="steps-section">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>创建项目</h4>
      <code>pnpm create ldoc my-docs</code>
    </div>
  </div>
  <div class="step-arrow">→</div>
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>安装依赖</h4>
      <code>cd my-docs && pnpm install</code>
    </div>
  </div>
  <div class="step-arrow">→</div>
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>启动开发</h4>
      <code>pnpm dev</code>
    </div>
  </div>
</div>

## 开发路线图

<div class="roadmap-section">
  <div class="roadmap-item done">
    <div class="roadmap-dot"></div>
    <div class="roadmap-content">
      <span class="roadmap-version">v1.0</span>
      <span class="roadmap-title">核心功能</span>
      <span class="roadmap-status">✅ 已完成</span>
    </div>
  </div>
  <div class="roadmap-item done">
    <div class="roadmap-dot"></div>
    <div class="roadmap-content">
      <span class="roadmap-version">v1.1</span>
      <span class="roadmap-title">插件系统</span>
      <span class="roadmap-status">✅ 已完成</span>
    </div>
  </div>
  <div class="roadmap-item current">
    <div class="roadmap-dot"></div>
    <div class="roadmap-content">
      <span class="roadmap-version">v1.2</span>
      <span class="roadmap-title">多语言支持</span>
      <span class="roadmap-status">🚧 进行中</span>
    </div>
  </div>
  <div class="roadmap-item">
    <div class="roadmap-dot"></div>
    <div class="roadmap-content">
      <span class="roadmap-version">v1.3</span>
      <span class="roadmap-title">SSR 优化</span>
      <span class="roadmap-status">📋 计划中</span>
    </div>
  </div>
  <div class="roadmap-item">
    <div class="roadmap-dot"></div>
    <div class="roadmap-content">
      <span class="roadmap-version">v2.0</span>
      <span class="roadmap-title">AI 文档助手</span>
      <span class="roadmap-status">💡 规划中</span>
    </div>
  </div>
</div>

## 用户评价

<div class="testimonials-section">
  <div class="testimonial">
    <p class="testimonial-text">"LDoc 的热更新速度令人惊艳，开发体验比之前用的工具好太多了！"</p>
    <div class="testimonial-author">
      <span class="author-name">张三</span>
      <span class="author-title">前端工程师 @ 某大厂</span>
    </div>
  </div>
  <div class="testimonial">
    <p class="testimonial-text">"插件系统设计得很优雅，我们团队基于它开发了定制化的文档系统。"</p>
    <div class="testimonial-author">
      <span class="author-name">李四</span>
      <span class="author-title">技术负责人 @ 开源项目</span>
    </div>
  </div>
</div>

## 谁在使用？

<div class="users-section">
  <div class="user-logos">
    <span class="user-logo">🏢 企业A</span>
    <span class="user-logo">🏢 企业B</span>
    <span class="user-logo">🏢 企业C</span>
    <span class="user-logo">🏢 企业D</span>
  </div>
  <p class="users-cta">你的项目也在使用 LDoc？<a href="https://github.com">告诉我们</a></p>
</div>

## 社区与支持

<div class="community-section">
  <div class="community-card">
    <div class="community-icon">💬</div>
    <h3>GitHub Discussions</h3>
    <p>提问、分享想法、参与讨论</p>
    <a href="https://github.com" class="community-link">加入讨论 →</a>
  </div>
  <div class="community-card">
    <div class="community-icon">🐛</div>
    <h3>问题反馈</h3>
    <p>发现 Bug？提交 Issue</p>
    <a href="https://github.com" class="community-link">报告问题 →</a>
  </div>
  <div class="community-card">
    <div class="community-icon">🤝</div>
    <h3>贡献代码</h3>
    <p>欢迎提交 PR 参与开发</p>
    <a href="https://github.com" class="community-link">开始贡献 →</a>
  </div>
</div>

## 赞助商

感谢所有赞助商的支持！

<div class="sponsors">
  <p>成为赞助商，支持项目持续发展</p>
  <a href="https://github.com/sponsors" class="sponsor-btn">💖 成为赞助商</a>
</div>

<style>
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin: 32px 0;
  padding: 32px;
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  border-radius: 12px;
}
.dark .stats-section {
  background: var(--ldoc-c-bg-soft, #242424);
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--ldoc-c-brand, #3b82f6);
}
.stat-label {
  font-size: 14px;
  color: var(--ldoc-c-text-2, #666);
  margin-top: 4px;
}
.users-section {
  text-align: center;
  padding: 32px;
  margin: 32px 0;
}
.user-logos {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.user-logo {
  font-size: 24px;
  opacity: 0.7;
}
.users-cta {
  color: var(--ldoc-c-text-2);
  font-size: 14px;
}
.users-cta a {
  color: var(--ldoc-c-brand);
}
.community-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin: 32px 0;
}
.community-card {
  padding: 24px;
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  border-radius: 12px;
  text-align: center;
}
.dark .community-card {
  background: var(--ldoc-c-bg-soft, #242424);
}
.community-icon {
  font-size: 32px;
  margin-bottom: 12px;
}
.community-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}
.community-card p {
  margin: 0 0 16px;
  color: var(--ldoc-c-text-2);
  font-size: 14px;
}
.community-link {
  color: var(--ldoc-c-brand);
  font-size: 14px;
}
.sponsors {
  text-align: center;
  padding: 48px;
  margin-top: 48px;
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  border-radius: 12px;
}
.dark .sponsors {
  background: var(--ldoc-c-bg-soft, #242424);
}
.sponsor-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  background: var(--ldoc-c-brand);
  color: white;
  border-radius: 8px;
  font-weight: 500;
}
@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .community-section {
    grid-template-columns: 1fr;
  }
}

/* 对比表格 */
.comparison-table {
  margin: 32px 0;
  overflow-x: auto;
}
.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.comparison-table th,
.comparison-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--ldoc-c-divider, #e5e7eb);
}
.comparison-table th {
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  font-weight: 600;
}
.dark .comparison-table th {
  background: var(--ldoc-c-bg-soft, #242424);
}
.comparison-table td.highlight {
  color: var(--ldoc-c-brand, #3b82f6);
  font-weight: 600;
}

/* 三步上手 */
.steps-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
  padding: 32px;
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  border-radius: 12px;
  flex-wrap: wrap;
}
.dark .steps-section {
  background: var(--ldoc-c-bg-soft, #242424);
}
.step {
  display: flex;
  align-items: center;
  gap: 12px;
}
.step-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldoc-c-brand, #3b82f6);
  color: white;
  font-weight: 700;
  font-size: 18px;
  border-radius: 50%;
}
.step-content h4 {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}
.step-content code {
  font-size: 12px;
  padding: 2px 6px;
  background: var(--ldoc-c-bg, #fff);
  border-radius: 4px;
  color: var(--ldoc-c-text-2);
}
.dark .step-content code {
  background: var(--ldoc-c-bg, #1a1a1a);
}
.step-arrow {
  font-size: 24px;
  color: var(--ldoc-c-text-3);
}
@media (max-width: 768px) {
  .steps-section {
    flex-direction: column;
  }
  .step-arrow {
    transform: rotate(90deg);
  }
}

/* 路线图 */
.roadmap-section {
  position: relative;
  margin: 32px 0;
  padding-left: 24px;
}
.roadmap-section::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--ldoc-c-divider, #e5e7eb);
}
.roadmap-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 0;
}
.roadmap-dot {
  position: absolute;
  left: -24px;
  width: 16px;
  height: 16px;
  background: var(--ldoc-c-bg, #fff);
  border: 3px solid var(--ldoc-c-divider, #e5e7eb);
  border-radius: 50%;
}
.dark .roadmap-dot {
  background: var(--ldoc-c-bg, #1a1a1a);
}
.roadmap-item.done .roadmap-dot {
  background: var(--ldoc-c-brand, #3b82f6);
  border-color: var(--ldoc-c-brand, #3b82f6);
}
.roadmap-item.current .roadmap-dot {
  border-color: var(--ldoc-c-brand, #3b82f6);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
}
.roadmap-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.roadmap-version {
  font-weight: 700;
  color: var(--ldoc-c-brand, #3b82f6);
  min-width: 48px;
}
.roadmap-title {
  font-weight: 500;
}
.roadmap-status {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}

/* 用户评价 */
.testimonials-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin: 32px 0;
}
@media (max-width: 768px) {
  .testimonials-section {
    grid-template-columns: 1fr;
  }
}
.testimonial {
  padding: 24px;
  background: var(--ldoc-c-bg-soft, #f6f6f7);
  border-radius: 12px;
  border-left: 4px solid var(--ldoc-c-brand, #3b82f6);
}
.dark .testimonial {
  background: var(--ldoc-c-bg-soft, #242424);
}
.testimonial-text {
  margin: 0 0 16px;
  font-style: italic;
  color: var(--ldoc-c-text-1);
  line-height: 1.6;
}
.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.author-name {
  font-weight: 600;
  font-size: 14px;
}
.author-title {
  font-size: 12px;
  color: var(--ldoc-c-text-3);
}
</style>
