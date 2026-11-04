import type { VendorFormValues } from '@/types/vendorForm'

export interface VendorFormSuggestion {
  field: keyof VendorFormValues
  /** Short label shown with the suggestion */
  label: string
  /** What looks vague or thin, and what to add */
  message: string
}

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
const hasNumber = (text: string) => /\d/.test(text)

/**
 * A light, rule-based "AI check" on the vendor form. It never blocks submission: it points
 * at answers that feel vague and says what extra detail would help reviewers.
 */
export const runVendorFormCheck = (v: VendorFormValues): VendorFormSuggestion[] => {
  const out: VendorFormSuggestion[] = []

  if (
    v.stageAndExperience.trim() &&
    (wordCount(v.stageAndExperience) < 25 || !hasNumber(v.stageAndExperience))
  ) {
    out.push({
      field: 'stageAndExperience',
      label: 'Stage of maturity and experience',
      message:
        'This feels brief. Add milestones with years, such as product launches, market entries or partnerships in the UAE or other healthcare systems.',
    })
  }

  if (v.proposal.trim() && wordCount(v.proposal) < 20) {
    out.push({
      field: 'proposal',
      label: 'Proposal of collaboration',
      message:
        'Say what you want to do with M42: where it would be deployed, the scope and an expected timeline.',
    })
  }

  if (v.focusAreas.length > 4) {
    out.push({
      field: 'focusAreas',
      label: 'Focus area',
      message:
        'Several areas are selected. Keep the ones your solution mainly addresses so the fit is clear.',
    })
  }

  if (
    v.maturityAndRegulatory.trim() &&
    (wordCount(v.maturityAndRegulatory) < 15 ||
      !/(CE|FDA|ISO|MOHAP|DoH|DOH|clearance|approv|certif|deploy)/i.test(v.maturityAndRegulatory))
  ) {
    out.push({
      field: 'maturityAndRegulatory',
      label: 'Maturity and regulatory approvals',
      message:
        'Name any deployments to date and the regulatory clearances you hold (for example CE, FDA, DoH Abu Dhabi), or say what is in progress.',
    })
  }

  const approvals = v.relevantApprovals.trim()
  if (
    approvals &&
    !/not applicable/i.test(approvals) &&
    !/(CE|FDA|ISO|MOHAP|DoH|DOH)/.test(approvals)
  ) {
    out.push({
      field: 'relevantApprovals',
      label: 'Relevant approvals',
      message:
        'Use the standard names (CE, FDA, ISO, UAE MOHAP, DoH) so reviewers can verify them quickly.',
    })
  }

  if (v.novelty.trim() && (wordCount(v.novelty) < 20 || !hasNumber(v.novelty))) {
    out.push({
      field: 'novelty',
      label: 'Novelty and differentiation',
      message:
        'Back the claim with evidence: accuracy figures, trial results, patents or what competitors cannot do.',
    })
  }

  if (
    v.resources.trim() &&
    (wordCount(v.resources) < 12 ||
      !/(data|pilot|fund|integrat|access|clinical|sandbox|site|collaborat)/i.test(v.resources))
  ) {
    out.push({
      field: 'resources',
      label: 'Support sought from M42',
      message:
        'Be specific about the support: data access, pilot sites, technical integration or funding.',
    })
  }

  if (v.populations.length === 0) {
    out.push({
      field: 'populations',
      label: 'Patient populations',
      message: 'Select who is affected, or reviewers will not know the scope of the impact.',
    })
  }

  return out
}
