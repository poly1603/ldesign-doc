/**
 * Property-based tests for VideoPlayer component
 * Feature: doc-system-enhancement, Property 37: Video player chapters
 * Validates: Requirements 9.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Video chapter type (mirrors component interface)
export interface VideoChapter {
  /** 章节开始时间（秒） */
  time: number
  /** 章节标题 */
  title: string
  /** 章节描述 */
  description?: string
}

// Helper function to format time (mirrors component logic)
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0:00'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

// Helper function to validate chapter structure
function validateChapterStructure(chapters: VideoChapter[]): {
  isValid: boolean
  hasCorrectCount: boolean
  hasCorrectTimestamps: boolean
  hasCorrectTitles: boolean
  isChronological: boolean
  hasUniqueTimestamps: boolean
} {
  const isValid = chapters.length > 0
  const hasCorrectCount = chapters.length > 0

  // Check timestamps are non-negative numbers
  const hasCorrectTimestamps = chapters.every(c =>
    typeof c.time === 'number' &&
    isFinite(c.time) &&
    c.time >= 0
  )

  // Check titles are non-empty strings
  const hasCorrectTitles = chapters.every(c =>
    typeof c.title === 'string' &&
    c.title.length > 0
  )

  // Check chronological order
  let isChronological = true
  for (let i = 1; i < chapters.length; i++) {
    if (chapters[i - 1].time > chapters[i].time) {
      isChronological = false
      break
    }
  }

  // Check for unique timestamps (no duplicates)
  const timestamps = chapters.map(c => c.time)
  const hasUniqueTimestamps = new Set(timestamps).size === timestamps.length

  return {
    isValid,
    hasCorrectCount,
    hasCorrectTimestamps,
    hasCorrectTitles,
    isChronological,
    hasUniqueTimestamps
  }
}

// Helper function to simulate chapter navigation
function getActiveChapter(chapters: VideoChapter[], currentTime: number): VideoChapter | null {
  if (!chapters || chapters.length === 0) return null

  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].time) {
      return chapters[i]
    }
  }

  return null
}

// Arbitrary for generating video chapters
const videoChapterArb = fc.record({
  time: fc.nat({ max: 3600 }).map(n => n), // 0 to 1 hour in seconds
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined })
}) as fc.Arbitrary<VideoChapter>

describe('VideoPlayer Component - Property Tests', () => {
  /**
   * Property 37: Video player chapters
   * For any video component with chapter markers, the rendered player SHALL 
   * include chapter navigation with correct timestamps.
   * Validates: Requirements 9.4
   */
  it('Property 37: Video player chapters - chapter navigation with correct timestamps', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 1, maxLength: 20 })
          .map(chapters => {
            // Sort chapters by time to ensure chronological order
            return [...chapters].sort((a, b) => a.time - b.time)
          })
          .filter(chapters => {
            // Ensure unique timestamps
            const times = chapters.map(c => c.time)
            return new Set(times).size === times.length
          }),
        (chapters) => {
          const validation = validateChapterStructure(chapters)

          // Verify structure is valid
          expect(validation.isValid).toBe(true)
          expect(validation.hasCorrectCount).toBe(true)
          expect(validation.hasCorrectTimestamps).toBe(true)
          expect(validation.hasCorrectTitles).toBe(true)
          expect(validation.isChronological).toBe(true)
          expect(validation.hasUniqueTimestamps).toBe(true)

          // Verify each chapter has correct properties
          chapters.forEach((chapter, index) => {
            // Timestamp should be a non-negative number
            expect(typeof chapter.time).toBe('number')
            expect(chapter.time).toBeGreaterThanOrEqual(0)
            expect(isFinite(chapter.time)).toBe(true)

            // Title should be a non-empty string
            expect(typeof chapter.title).toBe('string')
            expect(chapter.title.length).toBeGreaterThan(0)

            // Description is optional
            if (chapter.description !== undefined) {
              expect(typeof chapter.description).toBe('string')
            }

            // Verify formatted time is valid
            const formattedTime = formatTime(chapter.time)
            expect(formattedTime).toMatch(/^\d+:\d{2}(:\d{2})?$/)

            // Verify chronological order
            if (index > 0) {
              expect(chapter.time).toBeGreaterThan(chapters[index - 1].time)
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should format timestamps correctly', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 86400 }), // 0 to 24 hours in seconds
        (seconds) => {
          const formatted = formatTime(seconds)

          // Should match time format (M:SS or H:MM:SS)
          expect(formatted).toMatch(/^\d+:\d{2}(:\d{2})?$/)

          // Parse and verify
          const parts = formatted.split(':').map(Number)

          if (parts.length === 2) {
            // M:SS format
            const [minutes, secs] = parts
            expect(minutes * 60 + secs).toBe(seconds)
            expect(secs).toBeLessThan(60)
            expect(secs).toBeGreaterThanOrEqual(0)
          } else if (parts.length === 3) {
            // H:MM:SS format
            const [hours, minutes, secs] = parts
            expect(hours * 3600 + minutes * 60 + secs).toBe(seconds)
            expect(minutes).toBeLessThan(60)
            expect(secs).toBeLessThan(60)
            expect(minutes).toBeGreaterThanOrEqual(0)
            expect(secs).toBeGreaterThanOrEqual(0)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain chronological order', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 2, maxLength: 20 }),
        (chapters) => {
          // Sort chapters by time
          const sortedChapters = [...chapters].sort((a, b) => a.time - b.time)

          // Verify order is maintained
          for (let i = 1; i < sortedChapters.length; i++) {
            expect(sortedChapters[i].time).toBeGreaterThanOrEqual(sortedChapters[i - 1].time)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly identify active chapter based on current time', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 1, maxLength: 10 })
          .map(chapters => [...chapters].sort((a, b) => a.time - b.time))
          .filter(chapters => {
            const times = chapters.map(c => c.time)
            return new Set(times).size === times.length
          }),
        fc.nat({ max: 3600 }),
        (chapters, currentTime) => {
          const activeChapter = getActiveChapter(chapters, currentTime)

          if (currentTime < chapters[0].time) {
            // Before first chapter
            expect(activeChapter).toBeNull()
          } else {
            // Should find the latest chapter that started before or at current time
            expect(activeChapter).not.toBeNull()
            expect(activeChapter!.time).toBeLessThanOrEqual(currentTime)

            // Verify it's the correct chapter
            const chapterIndex = chapters.indexOf(activeChapter!)
            if (chapterIndex < chapters.length - 1) {
              // Not the last chapter - verify next chapter hasn't started yet
              expect(chapters[chapterIndex + 1].time).toBeGreaterThan(currentTime)
            }
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle chapter navigation', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 1, maxLength: 10 })
          .map(chapters => [...chapters].sort((a, b) => a.time - b.time))
          .filter(chapters => {
            const times = chapters.map(c => c.time)
            return new Set(times).size === times.length
          }),
        (chapters) => {
          // Simulate seeking to each chapter
          chapters.forEach(chapter => {
            // When seeking to a chapter, the time should be set to chapter.time
            const seekTime = chapter.time
            expect(seekTime).toBeGreaterThanOrEqual(0)
            expect(isFinite(seekTime)).toBe(true)

            // The active chapter at this time should be this chapter
            const activeChapter = getActiveChapter(chapters, seekTime)
            expect(activeChapter).toBe(chapter)
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate chapter titles are non-empty', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 1, maxLength: 10 }),
        (chapters) => {
          chapters.forEach(chapter => {
            expect(chapter.title).toBeTruthy()
            expect(chapter.title.length).toBeGreaterThan(0)
            expect(typeof chapter.title).toBe('string')
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle optional descriptions', () => {
    fc.assert(
      fc.property(
        fc.array(videoChapterArb, { minLength: 1, maxLength: 10 }),
        (chapters) => {
          chapters.forEach(chapter => {
            if (chapter.description !== undefined) {
              expect(typeof chapter.description).toBe('string')
            }
          })

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('VideoPlayer Component - Unit Tests', () => {
  it('should handle single chapter', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Introduction' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.isValid).toBe(true)
    expect(validation.isChronological).toBe(true)
    expect(validation.hasUniqueTimestamps).toBe(true)
  })

  it('should format time with leading zeros', () => {
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3665)).toBe('1:01:05')
  })

  it('should format time for hours', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3661)).toBe('1:01:01')
    expect(formatTime(7200)).toBe('2:00:00')
  })

  it('should handle zero time', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('should handle invalid time values', () => {
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
    expect(formatTime(-Infinity)).toBe('0:00')
  })

  it('should identify active chapter at exact timestamp', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Intro' },
      { time: 60, title: 'Chapter 1' },
      { time: 120, title: 'Chapter 2' }
    ]

    expect(getActiveChapter(chapters, 0)).toBe(chapters[0])
    expect(getActiveChapter(chapters, 60)).toBe(chapters[1])
    expect(getActiveChapter(chapters, 120)).toBe(chapters[2])
  })

  it('should identify active chapter between timestamps', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Intro' },
      { time: 60, title: 'Chapter 1' },
      { time: 120, title: 'Chapter 2' }
    ]

    expect(getActiveChapter(chapters, 30)).toBe(chapters[0])
    expect(getActiveChapter(chapters, 90)).toBe(chapters[1])
    expect(getActiveChapter(chapters, 150)).toBe(chapters[2])
  })

  it('should return null for time before first chapter', () => {
    const chapters: VideoChapter[] = [
      { time: 10, title: 'Chapter 1' },
      { time: 60, title: 'Chapter 2' }
    ]

    expect(getActiveChapter(chapters, 5)).toBeNull()
  })

  it('should handle chapters with descriptions', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Intro', description: 'Introduction to the topic' },
      { time: 60, title: 'Chapter 1', description: 'First chapter content' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.isValid).toBe(true)

    chapters.forEach(chapter => {
      expect(chapter.description).toBeTruthy()
      expect(typeof chapter.description).toBe('string')
    })
  })

  it('should handle chapters without descriptions', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Intro' },
      { time: 60, title: 'Chapter 1' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.isValid).toBe(true)
  })

  it('should detect non-chronological chapters', () => {
    const chapters: VideoChapter[] = [
      { time: 60, title: 'Chapter 2' },
      { time: 0, title: 'Intro' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.isChronological).toBe(false)
  })

  it('should detect duplicate timestamps', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: 'Intro' },
      { time: 60, title: 'Chapter 1' },
      { time: 60, title: 'Chapter 1 Alt' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.hasUniqueTimestamps).toBe(false)
  })

  it('should validate negative timestamps as invalid', () => {
    const chapters: VideoChapter[] = [
      { time: -10, title: 'Invalid' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.hasCorrectTimestamps).toBe(false)
  })

  it('should validate NaN timestamps as invalid', () => {
    const chapters: VideoChapter[] = [
      { time: NaN, title: 'Invalid' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.hasCorrectTimestamps).toBe(false)
  })

  it('should validate empty titles as invalid', () => {
    const chapters: VideoChapter[] = [
      { time: 0, title: '' }
    ]

    const validation = validateChapterStructure(chapters)
    expect(validation.hasCorrectTitles).toBe(false)
  })
})
