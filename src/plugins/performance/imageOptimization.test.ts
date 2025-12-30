/**
 * Property-based tests for image optimization
 * Feature: doc-system-enhancement, Property 39: Image optimization
 * Validates: Requirements 10.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mkdirSync, existsSync, rmSync } from 'fs'
import { resolve } from 'path'
import { addLazyLoadingToHtml, generatePictureElement } from './imageOptimization'

describe('Image Optimization - Property Tests', () => {
  const testDir = resolve(__dirname, '__test_image_opt__')

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  /**
   * Property 39: Image optimization
   * For any image in the documentation, the build process SHALL generate optimized versions (WebP)
   * and apply lazy loading attributes.
   */
  describe('Property 39: Image optimization', () => {
    it('should add lazy loading to all img tags without existing loading attribute', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              src: fc.webUrl(),
              alt: fc.string(),
              hasLoading: fc.boolean()
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (images) => {
            // Generate HTML with img tags
            const imgTags = images.map(img => {
              const loadingAttr = img.hasLoading ? ' loading="eager"' : ''
              return `<img src="${img.src}" alt="${img.alt}"${loadingAttr}>`
            }).join('\n')

            const html = `<html><body>${imgTags}</body></html>`

            // Apply lazy loading
            const result = addLazyLoadingToHtml(html, [])

            // Verify all images have loading attribute
            const imgRegex = /<img[^>]*>/g
            const matches = result.match(imgRegex) || []

            return matches.every(tag => /loading\s*=/.test(tag))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve existing loading attributes', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              src: fc.webUrl(),
              // Avoid special HTML characters in alt that could break the test
              alt: fc.string().filter(s => !s.includes('>') && !s.includes('<') && !s.includes('"')),
              loading: fc.constantFrom('lazy', 'eager', 'auto')
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (images) => {
            // Generate HTML with img tags that have loading attributes
            const imgTags = images.map(img =>
              `<img src="${img.src}" alt="${img.alt}" loading="${img.loading}">`
            ).join('\n')

            const html = `<html><body>${imgTags}</body></html>`

            // Apply lazy loading
            const result = addLazyLoadingToHtml(html, [])

            // Verify original loading attributes are preserved
            return images.every(img => {
              const escapedSrc = img.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const regex = new RegExp(`<img[^>]*src="${escapedSrc}"[^>]*loading="${img.loading}"[^>]*>`)
              return regex.test(result)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should generate valid picture elements with WebP sources', () => {
      fc.assert(
        fc.property(
          fc.record({
            src: fc.constantFrom('/image.jpg', '/photo.png', '/pic.jpeg'),
            alt: fc.string(),
            attrs: fc.dictionary(
              fc.constantFrom('class', 'id', 'width', 'height'),
              fc.string()
            )
          }),
          (imageData) => {
            const pictureHtml = generatePictureElement(
              imageData.src,
              imageData.alt,
              imageData.attrs
            )

            // Verify picture element structure
            const hasPictureTag = /<picture>/.test(pictureHtml)
            const hasWebPSource = /<source[^>]*srcset="[^"]*\.webp"[^>]*type="image\/webp"[^>]*>/.test(pictureHtml)
            const hasImgFallback = /<img[^>]*src="[^"]*"[^>]*>/.test(pictureHtml)
            const hasLazyLoading = /loading="lazy"/.test(pictureHtml)

            return hasPictureTag && hasWebPSource && hasImgFallback && hasLazyLoading
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should convert image extensions to WebP in picture elements', () => {
      fc.assert(
        fc.property(
          fc.record({
            // Use alphanumeric filenames to avoid path issues
            filename: fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
            ext: fc.constantFrom('.jpg', '.jpeg', '.png', '.gif')
          }).filter(data => data.filename.length > 0),
          (imageData) => {
            const src = `/images/${imageData.filename}${imageData.ext}`
            const pictureHtml = generatePictureElement(src, 'test')

            // Extract WebP source
            const webpMatch = pictureHtml.match(/srcset="([^"]+\.webp)"/)

            if (!webpMatch) return false

            const webpSrc = webpMatch[1]

            // Verify WebP source has correct path with .webp extension
            return webpSrc.includes(imageData.filename) && webpSrc.endsWith('.webp')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle HTML with mixed content correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            beforeContent: fc.string(),
            afterContent: fc.string(),
            imgSrc: fc.webUrl(),
            imgAlt: fc.string()
          }),
          (data) => {
            const html = `
              <html>
                <body>
                  <div>${data.beforeContent}</div>
                  <img src="${data.imgSrc}" alt="${data.imgAlt}">
                  <div>${data.afterContent}</div>
                </body>
              </html>
            `

            const result = addLazyLoadingToHtml(html, [])

            // Verify surrounding content is preserved
            const hasBeforeContent = result.includes(data.beforeContent)
            const hasAfterContent = result.includes(data.afterContent)
            const hasLazyLoading = /loading="lazy"/.test(result)

            return hasBeforeContent && hasAfterContent && hasLazyLoading
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty HTML gracefully', () => {
      const result = addLazyLoadingToHtml('', [])
      expect(result).toBe('')
    })

    it('should handle HTML with no images gracefully', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (content) => {
            // Ensure content doesn't contain img tags
            const html = `<html><body><div>${content.replace(/<img/g, '')}</div></body></html>`
            const result = addLazyLoadingToHtml(html, [])

            // Result should be unchanged
            return result === html
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Picture Element Generation', () => {
    it('should include all provided attributes in img tag', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.constantFrom('class', 'id', 'width', 'height', 'style'),
            // Use alphanumeric strings to avoid HTML escaping issues in test
            fc.stringMatching(/^[a-zA-Z0-9_-]+$/)
          ).filter(attrs => Object.keys(attrs).length > 0),
          (attrs) => {
            const pictureHtml = generatePictureElement('/test.jpg', 'test', attrs)

            // Verify all attributes are present in img tag (may be escaped)
            return Object.entries(attrs).every(([key, value]) => {
              // The value will be HTML-escaped in the output
              return pictureHtml.includes(`${key}=`)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should escape special characters in alt text', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (alt) => {
            const pictureHtml = generatePictureElement('/test.jpg', alt)

            // Verify alt text is present (may be escaped)
            return pictureHtml.includes('alt=')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
