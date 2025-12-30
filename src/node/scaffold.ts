/**
 * Page scaffolding functionality
 * Implements: Requirements 12.1
 */

import { resolve, dirname, basename, extname } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import prompts from 'prompts'
import pc from 'picocolors'
import * as logger from './logger'

export interface ScaffoldOptions {
  /** Page path relative to docs root */
  path: string
  /** Template to use */
  template?: 'default' | 'api' | 'guide' | 'tutorial' | 'minimal'
  /** Page title */
  title?: string
  /** Page description */
  description?: string
  /** Tags for the page */
  tags?: string[]
  /** Skip prompts and use defaults */
  skipPrompts?: boolean
}

export interface PageTemplate {
  name: string
  description: string
  content: (options: ScaffoldOptions) => string
}

/**
 * Available page templates
 */
export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  default: {
    name: 'Default',
    description: 'Standard documentation page with common sections',
    content: (options) => `---
title: ${options.title || 'Page Title'}
description: ${options.description || 'Page description'}
${options.tags && options.tags.length > 0 ? `tags:\n${options.tags.map(t => `  - ${t}`).join('\n')}` : ''}
---

# ${options.title || 'Page Title'}

${options.description || 'Brief introduction to this page.'}

## Overview

Provide an overview of the topic.

## Getting Started

Step-by-step guide to get started.

## Examples

### Basic Example

\`\`\`typescript
// Example code here
\`\`\`

## API Reference

Document the API if applicable.

## Best Practices

Share best practices and recommendations.

## Troubleshooting

Common issues and solutions.

## See Also

- [Related Page 1](#)
- [Related Page 2](#)
`
  },

  api: {
    name: 'API Documentation',
    description: 'Template for API reference documentation',
    content: (options) => `---
title: ${options.title || 'API Reference'}
description: ${options.description || 'API documentation'}
${options.tags && options.tags.length > 0 ? `tags:\n${options.tags.map(t => `  - ${t}`).join('\n')}` : ''}
---

# ${options.title || 'API Reference'}

${options.description || 'Complete API reference documentation.'}

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

\`\`\`typescript
import { Component } from 'package-name'

// Basic usage
const instance = new Component()
\`\`\`

## API

### Class: \`ClassName\`

Brief description of the class.

#### Constructor

\`\`\`typescript
new ClassName(options?: Options)
\`\`\`

**Parameters:**

- \`options\` (optional): Configuration options
  - \`option1\`: Description
  - \`option2\`: Description

#### Methods

##### \`methodName(param: Type): ReturnType\`

Description of what the method does.

**Parameters:**

- \`param\`: Parameter description

**Returns:**

- \`ReturnType\`: Return value description

**Example:**

\`\`\`typescript
const result = instance.methodName(value)
\`\`\`

### Interface: \`InterfaceName\`

\`\`\`typescript
interface InterfaceName {
  property1: string
  property2: number
  property3?: boolean
}
\`\`\`

**Properties:**

- \`property1\`: Description
- \`property2\`: Description
- \`property3\` (optional): Description

## Type Definitions

### \`TypeName\`

\`\`\`typescript
type TypeName = string | number
\`\`\`

Description of the type.

## Examples

### Complete Example

\`\`\`typescript
// Full working example
\`\`\`

## See Also

- [Related API](#)
- [Guide](#)
`
  },

  guide: {
    name: 'Guide',
    description: 'Step-by-step guide or tutorial',
    content: (options) => `---
title: ${options.title || 'Guide Title'}
description: ${options.description || 'Step-by-step guide'}
${options.tags && options.tags.length > 0 ? `tags:\n${options.tags.map(t => `  - ${t}`).join('\n')}` : ''}
---

# ${options.title || 'Guide Title'}

${options.description || 'Learn how to accomplish a specific task.'}

## Prerequisites

Before you begin, make sure you have:

- Prerequisite 1
- Prerequisite 2
- Prerequisite 3

## Step 1: First Step

Description of the first step.

\`\`\`bash
# Command or code example
\`\`\`

## Step 2: Second Step

Description of the second step.

\`\`\`typescript
// Code example
\`\`\`

## Step 3: Third Step

Description of the third step.

## Verification

How to verify that everything is working correctly.

## Next Steps

- [Advanced Topic](#)
- [Related Guide](#)

## Troubleshooting

### Issue 1

**Problem:** Description of the problem.

**Solution:** How to solve it.

### Issue 2

**Problem:** Description of the problem.

**Solution:** How to solve it.
`
  },

  tutorial: {
    name: 'Tutorial',
    description: 'Interactive learning tutorial',
    content: (options) => `---
title: ${options.title || 'Tutorial Title'}
description: ${options.description || 'Interactive tutorial'}
${options.tags && options.tags.length > 0 ? `tags:\n${options.tags.map(t => `  - ${t}`).join('\n')}` : ''}
---

# ${options.title || 'Tutorial Title'}

${options.description || 'Learn by doing with this hands-on tutorial.'}

## What You'll Learn

By the end of this tutorial, you will be able to:

- Learning objective 1
- Learning objective 2
- Learning objective 3

## What You'll Build

Brief description of what will be built in this tutorial.

## Prerequisites

- Required knowledge or tools
- Estimated time: XX minutes

## Part 1: Setup

### 1.1 Initial Setup

Instructions for setting up the environment.

\`\`\`bash
# Setup commands
\`\`\`

### 1.2 Project Structure

Explain the project structure.

## Part 2: Core Implementation

### 2.1 First Feature

Implement the first feature.

\`\`\`typescript
// Code implementation
\`\`\`

::: tip
Helpful tip or best practice.
:::

### 2.2 Second Feature

Implement the second feature.

\`\`\`typescript
// Code implementation
\`\`\`

## Part 3: Testing

### 3.1 Write Tests

Add tests for your implementation.

\`\`\`typescript
// Test code
\`\`\`

### 3.2 Run Tests

\`\`\`bash
npm test
\`\`\`

## Part 4: Deployment

Deploy your application.

## Summary

Recap what was learned and built.

## Next Steps

- [Advanced Tutorial](#)
- [Related Topics](#)

## Complete Code

Link to the complete code repository or provide the full code.
`
  },

  minimal: {
    name: 'Minimal',
    description: 'Minimal page with just title and content',
    content: (options) => `---
title: ${options.title || 'Page Title'}
${options.description ? `description: ${options.description}` : ''}
${options.tags && options.tags.length > 0 ? `tags:\n${options.tags.map(t => `  - ${t}`).join('\n')}` : ''}
---

# ${options.title || 'Page Title'}

Start writing your content here.
`
  }
}

/**
 * Scaffold a new documentation page
 */
export async function scaffoldPage(
  root: string,
  options: ScaffoldOptions
): Promise<{ success: boolean; filePath: string }> {
  const docsDir = resolve(root, 'docs')

  // Ensure docs directory exists
  if (!existsSync(docsDir)) {
    throw new Error(`Documentation directory not found: ${docsDir}`)
  }

  // Normalize path and ensure .md extension
  let pagePath = options.path
  if (!pagePath.endsWith('.md')) {
    pagePath += '.md'
  }

  const fullPath = resolve(docsDir, pagePath)

  // Check if file already exists
  if (existsSync(fullPath)) {
    throw new Error(`File already exists: ${pagePath}`)
  }

  // Ensure parent directory exists
  const parentDir = dirname(fullPath)
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true })
  }

  // Get template
  const template = PAGE_TEMPLATES[options.template || 'default']
  if (!template) {
    throw new Error(`Unknown template: ${options.template}`)
  }

  // Generate content
  const content = template.content(options)

  // Write file
  writeFileSync(fullPath, content, 'utf-8')

  return {
    success: true,
    filePath: fullPath
  }
}

/**
 * Interactive page scaffolding with prompts
 */
export async function scaffoldPageInteractive(
  root: string,
  initialPath?: string
): Promise<{ success: boolean; filePath?: string }> {
  console.log()
  console.log(pc.cyan('📝 Create a new documentation page'))
  console.log()

  // Prompt for page details
  const response = await prompts([
    {
      type: 'text',
      name: 'path',
      message: 'Page path (relative to docs/):',
      initial: initialPath || 'new-page.md',
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Path is required'
        }
        const docsDir = resolve(root, 'docs')
        let pagePath = value
        if (!pagePath.endsWith('.md')) {
          pagePath += '.md'
        }
        const fullPath = resolve(docsDir, pagePath)
        if (existsSync(fullPath)) {
          return `File already exists: ${value}`
        }
        return true
      }
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: Object.entries(PAGE_TEMPLATES).map(([key, template]) => ({
        title: template.name,
        description: template.description,
        value: key
      })),
      initial: 0
    },
    {
      type: 'text',
      name: 'title',
      message: 'Page title:',
      initial: (prev: string, values: any) => {
        // Generate title from path
        const pathWithoutExt = values.path.replace(/\.md$/, '')
        const fileName = basename(pathWithoutExt)
        return fileName
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    },
    {
      type: 'text',
      name: 'description',
      message: 'Page description (optional):',
      initial: ''
    },
    {
      type: 'list',
      name: 'tags',
      message: 'Tags (comma-separated, optional):',
      initial: '',
      separator: ','
    }
  ])

  // Check if user cancelled
  if (!response.path) {
    console.log(pc.yellow('\n✖ Cancelled'))
    return { success: false }
  }

  // Parse tags
  const tags = response.tags
    ? response.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)
    : []

  // Scaffold the page
  try {
    const result = await scaffoldPage(root, {
      path: response.path,
      template: response.template,
      title: response.title,
      description: response.description,
      tags
    })

    console.log()
    console.log(pc.green('✔ Page created successfully!'))
    console.log()
    console.log(pc.gray(`  File: ${result.filePath}`))
    console.log()
    console.log(pc.cyan('Next steps:'))
    console.log(pc.gray(`  1. Edit the page: ${result.filePath}`))
    console.log(pc.gray(`  2. Start dev server: ldoc dev`))
    console.log()

    return {
      success: true,
      filePath: result.filePath
    }
  } catch (error) {
    console.log()
    console.log(pc.red('✖ Failed to create page'))
    console.log(pc.gray(`  ${error instanceof Error ? error.message : String(error)}`))
    console.log()
    return { success: false }
  }
}

/**
 * List available templates
 */
export function listTemplates(): void {
  console.log()
  console.log(pc.cyan('Available templates:'))
  console.log()

  for (const [key, template] of Object.entries(PAGE_TEMPLATES)) {
    console.log(pc.bold(`  ${template.name}`))
    console.log(pc.gray(`    ${template.description}`))
    console.log(pc.gray(`    Usage: ldoc new page --template ${key}`))
    console.log()
  }
}
