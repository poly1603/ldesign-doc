---
layout: home
title: LDoc Modern Documentation Framework
hero:
  name: LDesign Doc
  text: Modern Documentation Framework
  tagline: Powered by Vite, supports Vue/React, out of the box
  canvas:
    type: particles
    speed: 1
    density: 1
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/polyester-design/ldesign

features:
  - icon: zap
    title: Vite Powered
    details: Enjoy ultra-fast development with instant HMR, 10x productivity boost
  - icon: file-text
    title: Enhanced Markdown
    details: Code highlighting, containers, math formulas, Mermaid diagrams, Emoji and more
  - icon: palette
    title: Highly Customizable
    details: Flexible theming, Vue/React components, custom layouts and styles
  - icon: plug
    title: Plugin Ecosystem
    details: 10+ built-in plugins including comments, search, reading time, image viewer
  - icon: search
    title: Full-text Search
    details: Built-in search plugin with keyboard shortcuts, instant results
  - icon: code
    title: Code Demo
    details: Live preview Vue/React components, side-by-side code and output
---

## Why LDoc?

LDoc is a modern static documentation generator, designed for technical docs, component libraries, and API documentation.

<div class="stats-section">
  <div class="stat-item">
    <div class="stat-value">10+</div>
    <div class="stat-label">Built-in Plugins</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">< 1s</div>
    <div class="stat-label">HMR Speed</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">100%</div>
    <div class="stat-label">TypeScript</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">MIT</div>
    <div class="stat-label">License</div>
  </div>
</div>

## Comparison

<div class="comparison-table">
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>LDoc</th>
        <th>VitePress</th>
        <th>Docusaurus</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Build Tool</td>
        <td class="highlight">Vite ⚡</td>
        <td>Vite</td>
        <td>Webpack</td>
      </tr>
      <tr>
        <td>Framework</td>
        <td class="highlight">Vue + React</td>
        <td>Vue</td>
        <td>React</td>
      </tr>
      <tr>
        <td>Component Demo</td>
        <td class="highlight">✅ Built-in</td>
        <td>Plugin</td>
        <td>Plugin</td>
      </tr>
      <tr>
        <td>Comments</td>
        <td class="highlight">✅ 5+ Providers</td>
        <td>Plugin</td>
        <td>Plugin</td>
      </tr>
    </tbody>
  </table>
</div>

## Quick Start

```bash
# Create project
pnpm create ldoc my-docs

# Install dependencies
cd my-docs && pnpm install

# Start dev server
pnpm dev
```

## Community

<div class="community-section">
  <div class="community-card">
    <div class="community-icon">💬</div>
    <h3>GitHub Discussions</h3>
    <p>Ask questions, share ideas</p>
    <a href="https://github.com" class="community-link">Join →</a>
  </div>
  <div class="community-card">
    <div class="community-icon">🐛</div>
    <h3>Issue Tracker</h3>
    <p>Found a bug? Report it</p>
    <a href="https://github.com" class="community-link">Report →</a>
  </div>
  <div class="community-card">
    <div class="community-icon">🤝</div>
    <h3>Contributing</h3>
    <p>Submit PRs, help develop</p>
    <a href="https://github.com" class="community-link">Contribute →</a>
  </div>
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
@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  .community-section {
    grid-template-columns: 1fr;
  }
}
</style>
