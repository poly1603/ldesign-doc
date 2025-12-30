# Documentation Linter Implementation

## Overview

Implemented a comprehensive documentation linter that checks for broken links, spelling errors, and style issues in Markdown documentation.

## Features

### 1. Broken Link Detection
- Detects internal links that point to non-existent pages
- Handles various link formats (.md, .html, directory links with index.md)
- Supports anchor links and query parameters
- Reports line numbers for easy fixing

### 2. Spelling Check
- Uses a built-in dictionary of common technical terms
- Supports custom dictionaries for project-specific terms
- Skips code blocks to avoid false positives
- Provides suggestions for misspelled words using Levenshtein distance
- Reports line and column numbers

### 3. Style Checks
- **Line Length**: Detects lines exceeding maximum length (default: 120 characters)
- **Heading Hierarchy**: Ensures headings don't skip levels (e.g., H1 → H3)
- **Code Block Language**: Warns about code blocks without language identifiers
- **List Indentation**: Checks for consistent list indentation

## Usage

### CLI Command

```bash
# Check all documentation
ldoc lint

# With custom options
ldoc lint --max-line-length 100 --dictionary "myterm,anotherterm" --output report.md

# Skip specific checks
ldoc lint --no-spelling --no-style
```

### Programmatic API

```typescript
import { lintDocumentation, generateLintSummary } from '@ldesign/doc/node'

const pages = await scanPages(config)
const report = await lintDocumentation(pages, {
  checkBrokenLinks: true,
  checkSpelling: true,
  checkStyle: true,
  customDictionary: ['myterm', 'anotherterm'],
  styleRules: {
    maxLineLength: 120,
    checkHeadingHierarchy: true,
    checkCodeBlockLanguage: true,
    checkListIndentation: true
  }
})

const summary = generateLintSummary(report)
console.log(summary)
```

## Implementation Details

### Files Created
- `libraries/doc/src/node/linter.ts` - Main linter implementation
- `libraries/doc/src/node/linter.test.ts` - Property-based tests
- Updated `libraries/doc/src/node/cli.ts` - Added lint command
- Updated `libraries/doc/src/node/index.ts` - Exported linter functions

### Property-Based Testing
All functionality is validated using property-based tests with fast-check:
- 100 iterations per property
- Tests cover edge cases automatically
- Validates correctness across random inputs

### Key Functions

#### `lintDocumentation(pages, options)`
Main entry point that runs all checks and returns a comprehensive report.

#### `extractLinks(content)`
Extracts all Markdown links from content with line numbers.

#### `isInternalLink(url)`
Determines if a URL is an internal link (not external, anchor, or mailto).

#### `isValidInternalLink(url, validPaths)`
Validates internal links against available pages, handling various formats.

#### `checkSpellingInContent(content, customDictionary)`
Checks for spelling errors, skipping code blocks and technical terms.

#### `checkStyleInContent(content, rules)`
Checks for style issues based on configured rules.

#### `generateLintSummary(report)`
Generates a human-readable Markdown summary of the lint report.

## Exit Codes
- `0`: No issues found
- `1`: Issues found or lint failed

## Future Enhancements
- Integration with CI/CD pipelines
- Auto-fix capabilities for common issues
- Custom rule plugins
- Performance optimizations for large documentation sets
