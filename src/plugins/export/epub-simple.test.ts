/**
 * Simple EPUB Test
 */

import { describe, it, expect } from 'vitest'
import { validateEPUBConfig } from './epub'

describe('EPUB Export - Simple Test', () => {
  it('should validate correct config', () => {
    const config = {
      title: 'Test',
      author: 'Author',
      language: 'en'
    }
    expect(validateEPUBConfig(config)).toBe(true)
  })
})
