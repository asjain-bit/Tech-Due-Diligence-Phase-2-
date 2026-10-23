import type { QuestionnaireQuestion } from '@/types/partnership.types'

const SAMPLE_ANSWERS = [
  'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics. Today we rely on manual early-warning scores reviewed once a shift.',
  'Time to first antibiotic dose. The baseline is 3.4 hours today, and a reduction of 30 minutes would matter to us.',
  'Yes. We would sponsor a pilot in two ICUs with our Head of Critical Care as the named sponsor, and can commit about one day a week from the clinical team.',
  'It needs integration with the EMR and local data hosting. We expect IT to need around six weeks to prepare.',
  'Within 12 months we would expect fewer ICU transfers and clear evidence we can use to scale to other sites.',
]

/** Realistic placeholder answers, used to fill the whole questionnaire when a field is clicked */
export const sampleAnswersFor = (questions: QuestionnaireQuestion[]): Record<string, string> =>
  Object.fromEntries(questions.map((q, i) => [q.id, SAMPLE_ANSWERS[i % SAMPLE_ANSWERS.length]]))
