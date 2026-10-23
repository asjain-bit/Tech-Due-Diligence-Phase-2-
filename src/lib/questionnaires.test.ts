import { describe, it, expect } from 'vitest'
import {
  cloneQuestions,
  DEFAULT_QUESTIONNAIRE_ID,
  getQuestionnaire,
  newQuestionId,
  QUESTIONNAIRE_LIBRARY,
} from '@/types/questionnaires'

describe('questionnaire library', () => {
  it('offers several questionnaires, each with complete questions', () => {
    expect(QUESTIONNAIRE_LIBRARY.length).toBeGreaterThanOrEqual(3)
    QUESTIONNAIRE_LIBRARY.forEach((q) => {
      expect(q.questions.length).toBeGreaterThan(0)
      q.questions.forEach((question) => {
        expect(question.text.length).toBeGreaterThan(5)
        expect(question.cue.length).toBeGreaterThan(5)
      })
    })
  })

  it('includes the technical questionnaire, every question mandatory, with no research or attachment flags', () => {
    const technical = getQuestionnaire('technical')
    expect(technical.name).toBe('Technical Questionnaire')
    technical.questions.forEach((q) => {
      expect(q.mandatory).toBe(true)
      expect(q).not.toHaveProperty('researchNeeded')
      expect(q).not.toHaveProperty('attachmentRequired')
    })
  })

  it('falls back to the default questionnaire for an unknown id', () => {
    expect(getQuestionnaire('nope').id).toBe(DEFAULT_QUESTIONNAIRE_ID)
  })

  it('clones questions so edits never change the library', () => {
    const source = getQuestionnaire('technical').questions
    const copy = cloneQuestions(source)
    copy[0].text = 'Changed'
    expect(source[0].text).not.toBe('Changed')
  })

  it('creates unique ids for new questions', () => {
    expect(newQuestionId()).not.toBe(newQuestionId())
  })
})
