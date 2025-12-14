# Getting Started

This guide will help you quickly set up your first LDoc documentation site.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) version 18 or higher
- [pnpm](https://pnpm.io/) (recommended) or npm/yarn

## Installation

### Create a New Project

```bash
# Create project directory
mkdir my-docs
cd my-docs

# Initialize package.json
pnpm init
```

### Install LDoc

```bash
pnpm add @ldesign/doc -D
```

### Initialize Documentation

```bash
npx ldoc init
```

This will create the following structure:

```
my-docs/
├── .ldesign/
│   ├── docs/
│   │   └── index.md
│   └── doc.config.ts
└── package.json
```

## Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:8878` to see your documentation site.

## Project Structure

```
.ldesign/
├── docs/              # Documentation files
│   ├── index.md       # Homepage
│   ├── guide/         # Guide section
│   └── api/           # API reference
├── public/            # Static assets
└── doc.config.ts      # Configuration file
```

## Next Steps

- [Configuration](/en/guide/configuration) - Learn about configuration options
- [Markdown Extensions](/en/guide/markdown) - Explore markdown features
- [Theme Customization](/en/guide/theme) - Customize your site's appearance
