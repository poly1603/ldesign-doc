/**
 * Property-based tests for page scaffolding
 * Feature: doc-system-enhancement, Property 47: Scaffold file generation
 * Validates: Requirements 12.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import {
  scaffoldPage,
  PAGE_TEMPLATES,
  type ScaffoldOptions
} from './scaffold'

// Test directory
const TEST_ROOT = resolve(__dirname, '../../test-temp/scaffold')

// Arbitraries for generating test data
const templateArb = fc.constantFrom(
  'default',
  'api',
  'guide',
  'tutorial',
  'minimal'
) as fc.Arbitrary<'default' | 'api' | 'guide' | 'tutorial' | 'minimal'>

const pagePathArb = fc
  .tuple(
    fc.array(
      fc.stringMatching(/^[a-z0-9-]+$/),
      { minLength: 0, maxLength: 3 }
    ),
    fc.stringMatching(/^[a-z0-9-]+$/),
    fc.integer({ min: 0, max: 999999 }) // Add unique number
  )
  .map(([dirs, file, num]) => {
    // Add timestamp to ensure uniqueness across iterations
    const uniqueFile = `${file}-${num}-${Date.now()}`
    const path = dirs.length > 0 ? `${dirs.join('/')}/${uniqueFile}` : uniqueFile
    return path.endsWith('.md') ? path : `${path}.md`
  })

const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)

const descriptionArb = fc.string({ minLength: 0, maxLength: 200 })

const tagArb = fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0)

const tagsArrayArb = fc.array(tagArb, { minLength: 0, maxLength: 5 })

const scaffoldOptionsArb = fc.record({
  path: pagePathArb,
  template: fc.option(templateArb, { nil: undefined }),
  title: fc.option(titleArb, { nil: undefined }),
  description: fc.option(descriptionArb, { nil: undefined }),
  tags: fc.option(tagsArrayArb, { nil: undefined })
}) as fc.Arbitrary<ScaffoldOptions>

describe('Page Scaffolding - Property Tests', () => {
  beforeEach(() => {
    // Create test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
    mkdirSync(TEST_ROOT, { recursive: true })
    mkdirSync(join(TEST_ROOT, 'docs'), { recursive: true })
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_ROOT)) {
      rmSync(TEST_ROOT, { recursive: true, force: true })
    }
  })

  /**
   * Property 47: Scaffold file generation
   * For any scaffold command with a template, the generated files SHALL match the
   * template structure with placeholders replaced.
   */
  it('should generate files matching template structure with placeholders replaced', async () => {
    // Test with various combinations
    const testCases = [
      { path: 'test1.md', title: 'Test 1', template: 'default' as const },
      { path: 'test2.md', title: 'Test 2', template: 'api' as const },
      { path: 'test3.md', title: 'Test 3', template: 'guide' as const, description: 'A guide' },
      { path: 'test4.md', title: 'Test 4', template: 'tutorial' as const, tags: ['tag1', 'tag2'] },
      { path: 'test5.md', title: 'Test 5', template: 'minimal' as const },
      { path: 'dir/test6.md', title: 'Test 6', description: 'With description' },
      { path: 'deep/nested/test7.md', title: 'Test 7', tags: ['a', 'b', 'c'] }
    ]

    for (const options of testCases) {
      const result = await scaffoldPage(TEST_ROOT, options)

      // File should be created
      expect(result.success).toBe(true)
      expect(existsSync(result.filePath)).toBe(true)

      // Read generated content
      const content = readFileSync(result.filePath, 'utf-8')

      // Should contain frontmatter
      expect(content).toMatch(/^---\n/)
      expect(content).toMatch(/\n---\n/)

      // Should contain title
      expect(content).toContain(`title: ${options.title}`)
      expect(content).toContain(`# ${options.title}`)

      // Should contain description if provided
      if (options.description) {
        expect(content).toContain(`description: ${options.description}`)
      }

      // Should contain tags if provided
      if (options.tags && options.tags.length > 0) {
        expect(content).toContain('tags:')
        for (const tag of options.tags) {
          expect(content).toContain(`- ${tag}`)
        }
      }
    }
  })

  it('should create parent directories if they do not exist', async () => {
    const path = 'deep/nested/dir/page.md'
    const result = await scaffoldPage(TEST_ROOT, { path, title: 'Test' })

    expect(result.success).toBe(true)
    expect(existsSync(result.filePath)).toBe(true)
  })

  it('should automatically add .md extension if not present', async () => {
    const result = await scaffoldPage(TEST_ROOT, {
      path: 'test-page',
      title: 'Test'
    })

    expect(result.filePath).toMatch(/\.md$/)
    expect(existsSync(result.filePath)).toBe(true)
  })

  it('should throw error if file already exists', async () => {
    const path = 'existing-page.md'
    await scaffoldPage(TEST_ROOT, { path, title: 'Test' })

    await expect(
      scaffoldPage(TEST_ROOT, { path, title: 'Test' })
    ).rejects.toThrow(/already exists/)
  })

  it('should use default template if template not specified', async () => {
    const result = await scaffoldPage(TEST_ROOT, {
      path: 'default-template.md',
      title: 'Test'
    })

    const content = readFileSync(result.filePath, 'utf-8')
    expect(content).toContain('## Overview')
    expect(content).toContain('## Getting Started')
  })

  it('should generate content specific to selected template', async () => {
    const templates: Array<'default' | 'api' | 'guide' | 'tutorial' | 'minimal'> = [
      'default',
      'api',
      'guide',
      'tutorial',
      'minimal'
    ]

    for (const template of templates) {
      const path = `template-test-${template}.md`
      const result = await scaffoldPage(TEST_ROOT, {
        path,
        title: 'Test',
        template
      })

      const content = readFileSync(result.filePath, 'utf-8')

      // Check template-specific content
      switch (template) {
        case 'api':
          expect(content).toContain('## API')
          expect(content).toContain('## Installation')
          break
        case 'guide':
          expect(content).toContain('## Prerequisites')
          expect(content).toContain('## Step 1:')
          break
        case 'tutorial':
          expect(content).toContain("## What You'll Learn")
          expect(content).toContain('## Part 1:')
          break
        case 'minimal':
          expect(content.split('\n').length).toBeLessThan(20)
          break
        case 'default':
          expect(content).toContain('## Overview')
          break
      }
    }
  })

  it('should handle special characters in title correctly', async () => {
    const title = 'Test & Title <with> "Special" Characters'
    const result = await scaffoldPage(TEST_ROOT, {
      path: 'special-chars.md',
      title
    })

    const content = readFileSync(result.filePath, 'utf-8')
    expect(content).toContain(`title: ${title}`)
    expect(content).toContain(`# ${title}`)
  })

  it('should preserve all provided tags in frontmatter', async () => {
    const tags = ['tag1', 'tag2', 'tag3']
    const result = await scaffoldPage(TEST_ROOT, {
      path: 'with-tags.md',
      title: 'Test',
      tags
    })

    const content = readFileSync(result.filePath, 'utf-8')
    expect(content).toContain('tags:')
    for (const tag of tags) {
      expect(content).toContain(`- ${tag}`)
    }
  })

  it('should generate valid markdown structure', async () => {
    const testCases = [
      { path: 'valid1.md', title: 'Valid 1' },
      { path: 'valid2.md', title: 'Valid 2', description: 'Description' },
      { path: 'valid3.md', title: 'Valid 3', tags: ['tag1'] }
    ]

    for (const options of testCases) {
      const result = await scaffoldPage(TEST_ROOT, options)
      const content = readFileSync(result.filePath, 'utf-8')

      // Should have valid frontmatter
      const frontmatterMatches = content.match(/^---\n[\s\S]*?\n---\n/)
      expect(frontmatterMatches).toBeTruthy()

      // Should have at least one heading
      expect(content).toMatch(/^#+ /m)

      // Frontmatter should be at the start
      expect(content.indexOf('---')).toBe(0)
    }
  })

  it('should throw error for invalid template name', async () => {
    await expect(
      scaffoldPage(TEST_ROOT, {
        path: 'invalid-template.md',
        title: 'Test',
        template: 'invalid' as any
      })
    ).rejects.toThrow(/Unknown template/)
  })

  it('should return correct file path in result', async () => {
    const result = await scaffoldPage(TEST_ROOT, {
      path: 'test-path.md',
      title: 'Test'
    })

    expect(result.filePath).toBeTruthy()
    expect(result.filePath).toContain(TEST_ROOT)
    expect(result.filePath).toContain('docs')
    expect(result.filePath).toMatch(/\.md$/)
    expect(existsSync(result.filePath)).toBe(true)
  })

  it('should throw error if docs directory does not exist', async () => {
    const invalidRoot = resolve(TEST_ROOT, 'invalid-root')
    mkdirSync(invalidRoot, { recursive: true })

    await expect(
      scaffoldPage(invalidRoot, { path: 'test.md', title: 'Test' })
    ).rejects.toThrow(/Documentation directory not found/)
  })
})
