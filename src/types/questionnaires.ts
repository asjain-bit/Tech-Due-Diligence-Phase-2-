import type { QuestionnaireQuestion } from './partnership.types'

export interface QuestionnaireTemplate {
  id: string
  name: string
  questions: QuestionnaireQuestion[]
}

export const QUESTIONNAIRE_LIBRARY: QuestionnaireTemplate[] = [
  {
    id: 'internal-evaluation',
    name: 'Internal Evaluation Questionnaire',
    questions: [
      {
        id: 'q1',
        text: 'Is this a real problem for you today, and what do you do about it now?',
        cue: 'Describe the current clinical or operational problem and existing workarounds.',
        researchNeeded: false,
        attachmentRequired: false,
      },
      {
        id: 'q2',
        text: 'Which KPI would move, what is the baseline today, and what change would matter?',
        cue: 'Name the KPI, today’s baseline and the change that would matter.',
        researchNeeded: false,
        attachmentRequired: false,
      },
      {
        id: 'q3',
        text: 'Would you sponsor a pilot, who would the named sponsor be, and what capacity can you commit?',
        cue: 'Say yes or no, name the sponsor and the capacity you can commit.',
        researchNeeded: false,
        attachmentRequired: false,
      },
      {
        id: 'q4',
        text: 'Is there a budget line, or would it need central funding?',
        cue: 'State whether an existing budget line covers it.',
        researchNeeded: false,
        attachmentRequired: false,
      },
      {
        id: 'q5',
        text: 'What would make you say no?',
        cue: 'Identify dealbreakers, clinical blockers, integration risks or IT hurdles.',
        researchNeeded: false,
        attachmentRequired: false,
      },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Questionnaire',
    questions: [
      {
        id: 'tq1',
        text: 'Describe the primary clinical or operational use cases supported by your solution.',
        cue: 'Specify whether workflows are clinical, decision-support, operational, or administrative. State whether outputs influence patient care directly or indirectly.',
        researchNeeded: true,
        attachmentRequired: true,
      },
      {
        id: 'tq2',
        text: 'Has your organization performed a patient safety or clinical risk assessment for this product?',
        cue: 'Provide documentation or summary of hazard analysis, risk register, or failure-mode analysis related to patient harm.',
        researchNeeded: false,
        attachmentRequired: true,
      },
      {
        id: 'tq3',
        text: 'Describe how customer data is encrypted in transit and at rest across cloud tenants.',
        cue: 'Specify encryption standards, key management, and tenant isolation controls.',
        researchNeeded: false,
        attachmentRequired: false,
      },
    ],
  },
  {
    id: 'clinical-safety',
    name: 'Clinical and Safety Questionnaire',
    questions: [
      {
        id: 'cq1',
        text: 'Which clinical teams would use this solution, and how would it fit their daily workflow?',
        cue: 'Name the teams and describe the steps where the solution is used.',
        researchNeeded: false,
        attachmentRequired: false,
      },
      {
        id: 'cq2',
        text: 'What clinical risks do you see, and how would they be monitored?',
        cue: 'List the risks, who owns them and how an incident would be escalated.',
        researchNeeded: true,
        attachmentRequired: false,
      },
    ],
  },
]

export const DEFAULT_QUESTIONNAIRE_ID = 'internal-evaluation'

export const getQuestionnaire = (id: string) =>
  QUESTIONNAIRE_LIBRARY.find((q) => q.id === id) ?? QUESTIONNAIRE_LIBRARY[0]

/** Copies a template's questions so edits never change the library */
export const cloneQuestions = (questions: QuestionnaireQuestion[]): QuestionnaireQuestion[] =>
  questions.map((q) => ({ ...q }))

let questionCounter = 0
export const newQuestionId = () => `custom-${Date.now()}-${(questionCounter += 1)}`
