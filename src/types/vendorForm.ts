export interface VendorFormValues {
  name: string
  jobTitle: string
  company: string
  phone: string
  email: string
  yearFounded: string
  stageAndExperience: string
  proposal: string
  focusAreas: string[]
  maturityAndRegulatory: string
  relevantApprovals: string
  novelty: string
  developmentApproach: string
  resources: string
  populations: string[]
}

export const EMPTY_VENDOR_FORM: VendorFormValues = {
  name: '',
  jobTitle: '',
  company: '',
  phone: '',
  email: '',
  yearFounded: '',
  stageAndExperience: '',
  proposal: '',
  focusAreas: [],
  maturityAndRegulatory: '',
  relevantApprovals: '',
  novelty: '',
  developmentApproach: '',
  resources: '',
  populations: [],
}

export const FOCUS_AREA_OPTIONS = [
  'AI & Diagnostics',
  'Medical Imaging',
  'Clinical Decision Support',
  'Cardiology & Precision Health',
  'Clinical Workflow Automation',
  'Genomics & Oncology',
  'Precision Health & Diagnostics',
  'Rare Diseases',
  'Virtual Care & Remote Monitoring',
  'Preventative Healthcare',
  'Neurology & Digital Health',
]

export const DEVELOPMENT_APPROACH_OPTIONS = [
  'Developed entirely by our team',
  'Co-developed with external partners',
  'Built on third-party technologies or platforms',
]

export const POPULATION_OPTIONS = ['Adult patients', 'Pediatric patients', "Women's health"]

/** Fields that must be filled before the form can be submitted */
export const REQUIRED_VENDOR_FIELDS: (keyof VendorFormValues)[] = [
  'name',
  'jobTitle',
  'company',
  'email',
  'yearFounded',
  'stageAndExperience',
  'proposal',
  'focusAreas',
  'maturityAndRegulatory',
  'relevantApprovals',
  'novelty',
  'resources',
]

export const isFieldFilled = (values: VendorFormValues, field: keyof VendorFormValues) => {
  const v = values[field]
  return Array.isArray(v) ? v.length > 0 : v.trim().length > 0
}

export const missingVendorFields = (values: VendorFormValues) =>
  REQUIRED_VENDOR_FIELDS.filter((f) => !isFieldFilled(values, f))
