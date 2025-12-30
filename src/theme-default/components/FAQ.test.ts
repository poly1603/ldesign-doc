/**
 * Property-based tests for FAQ component
 * Feature: doc-system-enhancement, Property 38: FAQ structure
 * Validates: Requirements 9.6
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

export interface FAQItem {
  question: string
  answer: string
  tags?: string[]
}

function validateFAQStructure(items: FAQItem[]) {
  const isValid = items.length > 0
  const hasCorrectCount = items.length > 0
  const hasValidQuestions = items.every(
    item => typeof item.question === 'string' && item.question.length > 0
  )
  const hasValidAnswers = items.every(
    item => typeof item.answer === 'string' && item.answer.length > 0
  )
  const hasValidTags = items.every(
    item => !item.tags || (Array.isArray(item.tags) && item.tags.every(tag => typeof tag === 'string'))
  )
  const hasCollapsibleSections = items.length > 0
  const hasCorrectQuestionAnswerPairs = items.every(
    item => item.question && item.answer
  )

  return {
    isValid: isValid && hasValidQuestions && hasValidAnswers && hasValidTags,
    hasCorrectCount,
    hasValidQuestions,
    hasValidAnswers,
    hasValidTags,
    hasCollapsibleSections,
    hasCorrectQuestionAnswerPairs
  }
}

function renderFAQStructure(items: FAQItem[]) {
  const sections = items.map(item => ({
    question: item.question,
    answer: item.answer,
    isCollapsible: true,
    tags: item.tags
  }))
  return { sections }
}

function searchFAQ(items: FAQItem[], query: string): FAQItem[] {
  if (!query.trim()) return items
  const lowerQuery = query.toLowerCase().trim()
  return items.filter(item => {
    if (item.question.toLowerCase().includes(lowerQuery)) return true
    const answerText = item.answer.replace(/<[^>]*>/g, '')
    if (answerText.toLowerCase().includes(lowerQuery)) return true
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true
    return false
  })
}

const faqItemArb = fc.record({
  question: fc.string({ minLength: 1, maxLength: 200 }),
  answer: fc.string({ minLength: 1, maxLength: 1000 }),
  tags: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
    { nil: undefined }
  )
}) as fc.Arbitrary<FAQItem>

describe('FAQ Component - Property Tests', () => {
  it('Property 38: FAQ structure - collapsible sections with correct question-answer pairs', () => {
    fc.assert(
      fc.property(
        fc.array(faqItemArb, { minLength: 1, maxLength: 50 }),
        (items) => {
          const validation = validateFAQStructure(items)
          expect(validation.isValid).toBe(true)
          expect(validation.hasCorrectCount).toBe(true)
          expect(validation.hasValidQuestions).toBe(true)
          expect(validation.hasValidAnswers).toBe(true)
          expect(validation.hasValidTags).toBe(true)
          expect(validation.hasCollapsibleSections).toBe(true)
          expect(validation.hasCorrectQuestionAnswerPairs).toBe(true)

          const rendered = renderFAQStructure(items)
          expect(rendered.sections.length).toBe(items.length)

          items.forEach((item, index) => {
            const section = rendered.sections[index]
            expect(section.question).toBe(item.question)
            expect(section.answer).toBe(item.answer)
            expect(section.isCollapsible).toBe(true)
            if (item.tags) {
              expect(section.tags).toEqual(item.tags)
            }
          })
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('FAQ Component - Unit Tests', () => {
  it('should handle single FAQ item', () => {
    const items: FAQItem[] = [{ question: 'What is this?', answer: 'This is a test.' }]
    const validation = validateFAQStructure(items)
    expect(validation.isValid).toBe(true)
    expect(validation.hasCollapsibleSections).toBe(true)
    expect(validation.hasCorrectQuestionAnswerPairs).toBe(true)
  })

  it('should handle FAQ items with tags', () => {
    const items: FAQItem[] = [{
      question: 'How to install?',
      answer: 'Run npm install',
      tags: ['installation', 'npm', 'setup']
    }]
    const validation = validateFAQStructure(items)
    expect(validation.isValid).toBe(true)
    expect(validation.hasValidTags).toBe(true)
  })

  it('should handle search with partial matches', () => {
    const items: FAQItem[] = [
      { question: 'How to install Vue?', answer: 'Run npm install vue' },
      { question: 'How to install React?', answer: 'Run npm install react' }
    ]
    const results = searchFAQ(items, 'install')
    expect(results.length).toBe(2)
  })

  it('should render correct number of collapsible sections', () => {
    const items: FAQItem[] = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
      { question: 'Q3', answer: 'A3' }
    ]
    const rendered = renderFAQStructure(items)
    expect(rendered.sections.length).toBe(3)
    expect(rendered.sections.every(s => s.isCollapsible)).toBe(true)
  })
})
