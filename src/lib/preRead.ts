import type { PartnershipRequest } from '@/types/partnership.types'

export type PreReadSectionId =
  'roadmap' | 'position' | 'backlog' | 'architecture' | 'ownership' | 'sovereignty'

export interface PreReadDocument {
  name: string
  /** Where the file came from */
  source: 'Vendor' | 'M42' | 'Added by you'
}

export interface PreReadSection {
  id: PreReadSectionId
  title: string
  /** Short answer shown as a chip, e.g. "Partner" */
  verdict: string
  /** Tone of the verdict chip */
  tone: 'positive' | 'caution' | 'neutral'
  summary: string
  /** Supporting points */
  points: string[]
  documents?: PreReadDocument[]
}

export const KNOWLEDGE_BASE_ACCEPT = '.ppt,.pptx,.doc,.docx,.xls,.xlsx'

const EXTENSIONS = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx']

export const isSupportedKnowledgeFile = (name: string) =>
  EXTENSIONS.includes(name.split('.').pop()?.toLowerCase() ?? '')

const slug = (text: string) => text.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')

/**
 * The strategy pre-read for a case. Prototype stand-in for the generated summary: the content
 * is derived from the case and the knowledge base files, and is the same every time.
 */
export const buildPreRead = (
  request: PartnershipRequest,
  uploaded: string[] = []
): PreReadSection[] => {
  const company = request.companyName
  const focus = request.focusArea || 'the stated focus area'
  const roadmapDocs: PreReadDocument[] = [
    { name: `${slug(company)}_Pitch_Deck.pptx`, source: 'Vendor' },
    { name: `${slug(company)}_Solution_Brief.docx`, source: 'Vendor' },
    { name: 'M42_Roadmap_Register.xlsx', source: 'M42' },
    { name: 'News_Trends_Agent_KB_Extract.docx', source: 'M42' },
    ...uploaded.map((name) => ({ name, source: 'Added by you' as const })),
  ]

  return [
    {
      id: 'roadmap',
      title: 'Roadmap overlap',
      verdict: 'Partial overlap',
      tone: 'caution',
      summary: `${company} covers part of what the roadmap already plans for ${focus}, and adds capability the roadmap does not.`,
      points: [
        'The news trends agent and knowledge base already track this market, so signals from both were checked.',
        'One roadmap item for 2027 overlaps with the core of the proposal; the rest is new scope.',
        'The documents below were used to compare the proposal with the roadmap.',
      ],
      documents: roadmapDocs,
    },
    {
      id: 'position',
      title: 'Build, buy or partner position',
      verdict: 'Partner',
      tone: 'positive',
      summary: `Partnering with ${company} is the recommended position.`,
      points: [
        'The vendor already holds a validated solution, so partnering is faster than building.',
        'The CoE has no capacity to build this in the current year.',
        'Buying outright would not give M42 a say in how the solution develops.',
      ],
    },
    {
      id: 'backlog',
      title: 'CoE backlog position',
      verdict: 'Not on the backlog',
      tone: 'neutral',
      summary: 'This solution is not currently on the Centre of Excellence backlog.',
      points: [
        'No existing backlog item matches the proposed scope.',
        'Adding it would sit behind two items already planned for the quarter.',
        'A partnership would not need CoE build capacity, only integration support.',
      ],
    },
    {
      id: 'architecture',
      title: 'Architecture, hosting and residency',
      verdict: 'Fits with conditions',
      tone: 'caution',
      summary: `${company} can integrate with M42 systems, but patient data hosting needs to stay in the UAE.`,
      points: [
        'Standard integration through the existing clinical data platform is possible.',
        'The vendor currently hosts patient data outside the UAE and has not yet offered a local option.',
        'In-country residency should be a condition of any agreement.',
      ],
    },
    {
      id: 'ownership',
      title: 'Own versus rent the capability',
      verdict: 'Rent, with shared IP on tuned models',
      tone: 'neutral',
      summary: 'M42 would rent the platform and co-own anything trained on M42 data.',
      points: [
        'The base platform stays vendor-owned and is licensed to M42.',
        'Models tuned on M42 data should be co-owned or licensed exclusively to M42.',
        'An exit plan should cover access to tuned models if the partnership ends.',
      ],
    },
    {
      id: 'sovereignty',
      title: 'Network scale and sovereignty',
      verdict: 'High scale, partly meets sovereignty',
      tone: 'caution',
      summary:
        'The solution could apply across the whole network, but local content is not yet in place.',
      points: [
        'It would apply across all ICUs and wards in the network, not a single site.',
        'The vendor has no UAE entity yet; one is promised within 12 months.',
        'A filing or contract commitment would back the promise.',
      ],
    },
  ]
}
