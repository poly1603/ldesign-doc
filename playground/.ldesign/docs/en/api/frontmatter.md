# Frontmatter API

Page-level configuration using YAML frontmatter.

## title

- Type: `string`

Page title, used in browser tab and as h1 if not present.

```yaml
---
title: Getting Started
---
```

## description

- Type: `string`

Page description for SEO.

```yaml
---
description: Learn how to get started with LDoc
---
```

## layout

- Type: `'doc' | 'home' | 'page' | false`
- Default: `'doc'`

Page layout type.

```yaml
---
layout: home
---
```

## sidebar

- Type: `boolean`
- Default: `true`

Whether to show the sidebar.

```yaml
---
sidebar: false
---
```

## outline

- Type: `boolean | number | [number, number] | 'deep'`
- Default: `true`

Table of contents configuration.

```yaml
---
outline: [2, 3]
---
```

## prev / next

- Type: `string | { text: string; link: string } | false`

Previous/next page navigation.

```yaml
---
prev:
  text: Introduction
  link: /guide/
next: false
---
```

## editLink

- Type: `boolean`
- Default: `true`

Whether to show the edit link.

```yaml
---
editLink: false
---
```

## lastUpdated

- Type: `boolean | Date`
- Default: `true`

Whether to show last updated time.

```yaml
---
lastUpdated: false
---
```

## head

- Type: `HeadConfig[]`

Additional head tags for this page.

```yaml
---
head:
  - - meta
    - name: og:title
      content: Custom Title
---
```

## hero (Home Layout)

Hero section configuration for home layout.

```yaml
---
layout: home
hero:
  name: My Project
  text: A great project
  tagline: Built with LDoc
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
---
```

## features (Home Layout)

Features grid for home layout.

```yaml
---
layout: home
features:
  - icon: ⚡
    title: Fast
    details: Lightning fast builds
  - icon: 📝
    title: Markdown
    details: Write in Markdown
---
```

## pageClass

- Type: `string`

Custom class for the page.

```yaml
---
pageClass: custom-page
---
```
