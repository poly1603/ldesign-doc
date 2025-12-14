# Frontmatter

Frontmatter is YAML metadata at the top of Markdown files that controls page behavior and layout.

## Basic Usage

```yaml
---
title: Page Title
description: Page description for SEO
---
```

## Page Options

### Title and Description

```yaml
---
title: Getting Started
description: Learn how to get started with LDoc
---
```

### Layout

```yaml
---
layout: doc      # Default documentation layout
layout: home     # Homepage layout
layout: page     # Simple page layout
---
```

### Sidebar

```yaml
---
sidebar: true    # Show sidebar (default)
sidebar: false   # Hide sidebar
---
```

### Outline

```yaml
---
outline: true           # Show outline
outline: false          # Hide outline
outline: [2, 3]         # Show h2-h3 only
outline: deep           # Show all levels
---
```

### Navigation

```yaml
---
prev: 
  text: Previous Page
  link: /guide/prev
next:
  text: Next Page
  link: /guide/next
---
```

## Homepage Configuration

```yaml
---
layout: home

hero:
  name: LDesign Doc
  text: Modern Documentation Framework
  tagline: Powered by Vite, supports Vue/React
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/your-repo

features:
  - icon: ⚡
    title: Vite Powered
    details: Lightning fast development with instant HMR
  - icon: 📝
    title: Markdown Enhanced
    details: Code highlighting, containers, math, and more
  - icon: 🎨
    title: Customizable
    details: Flexible theming with Vue/React components
---
```

## Meta Tags

```yaml
---
head:
  - - meta
    - name: keywords
      content: documentation, vue, vite
  - - meta
    - property: og:title
      content: My Page Title
---
```

## Edit Link

```yaml
---
editLink: true          # Show edit link
editLink: false         # Hide edit link
lastUpdated: true       # Show last updated time
---
```
