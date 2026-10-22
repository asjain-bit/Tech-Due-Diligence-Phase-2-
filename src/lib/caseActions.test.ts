import { describe, it, expect } from 'vitest'
import {
  buildCaseFromForm,
  getStageLabel,
  hasDirectorDecided,
  holdRequest,
  nextCaseCode,
  proceedRequest,
  rejectRequest,
  resumeRequest,
  routeRequest,
} from './caseActions'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'
import type { VendorFormValues } from '@/types/vendorForm'

const [pending, inProgress, , exited, adminCase] = INITIAL_PARTNERSHIP_REQUESTS

const form: VendorFormValues = {
  name: ' Dr. Omar ',
  jobTitle: 'CEO',
  company: 'PulseAI Health',
  phone: '',
  email: 'omar@pulseai.health',
  yearFounded: '2021',
  stageAndExperience: 'Launched in 2022.',
  proposal: 'Deploy our triage model in M42 emergency departments. We would start in Abu Dhabi.',
  focusAreas: ['AI & Diagnostics', 'Medical Imaging'],
  maturityAndRegulatory: 'Clinical validation completed. CE Mark and FDA cleared.',
  relevantApprovals: 'CE, FDA',
  novelty: 'Better triage accuracy.',
  developmentApproach: 'Developed entirely by our team',
  resources: 'Pilot sites and data.',
  populations: ['Adult patients'],
}

describe('case codes', () => {
  it('numbers the next case after the highest existing one', () => {
    expect(nextCaseCode(INITIAL_PARTNERSHIP_REQUESTS)).toBe('PR-126')
    expect(nextCaseCode([])).toBe('PR-1')
  })
})

describe('getStageLabel', () => {
  it('describes where a case is', () => {
    expect(getStageLabel(adminCase)).toBe('Admin review')
    expect(getStageLabel(pending)).toBe('Screening & Fit')
    expect(getStageLabel(exited)).toBe('Exited')
    expect(getStageLabel({ ...pending, status: 'On Hold' })).toBe('On hold')
    expect(getStageLabel({ ...pending, queue: 'routed', caseType: 'Procure' })).toBe(
      'Routed to Procurement'
    )
    expect(getStageLabel({ ...pending, queue: 'routed', caseType: 'M&A' })).toBe(
      'Routed to Corporate Development'
    )
    expect(
      getStageLabel({
        ...pending,
        workflowStages: pending.workflowStages.map((s) => ({ ...s, status: 'completed' as const })),
      })
    ).toBe('Submitted')
  })
})

describe('director actions', () => {
  it('moves an approved case on and records the reason', () => {
    const next = proceedRequest(pending, 'Strong fit')
    expect(next.status).toBe('In Progress')
    expect(next.decision).toEqual({ status: 'proceeded', reason: 'Strong fit', date: 'Just now' })
    expect(next.workflowStages.find((s) => s.id === 3)?.status).toBe('completed')
    expect(next.workflowStages.find((s) => s.id === 4)?.status).toBe('in_progress')
    expect(next.daysInStage).toBe(0)
    expect(proceedRequest(pending, '').decision?.reason).toBe('Approved to proceed to next stage.')
  })

  it('rejects a case with a reason', () => {
    const next = rejectRequest(pending, 'Duplicate')
    expect(next.status).toBe('Exited')
    expect(next.decision?.status).toBe('rejected')
  })

  it('puts a case on hold with the email, and resumes it', () => {
    const held = holdRequest(pending, { to: 'a@b.com', subject: 'S', body: 'B' })
    expect(held.status).toBe('On Hold')
    expect(held.holdInfo).toMatchObject({ to: 'a@b.com', subject: 'S', body: 'B' })
    const back = resumeRequest(held)
    expect(back.status).toBe('Pending')
    expect(back.holdInfo).toBeUndefined()
  })
})

describe('hasDirectorDecided', () => {
  it('is true only once the Director has acted on a case in their queue', () => {
    expect(hasDirectorDecided(pending)).toBe(false)
    expect(hasDirectorDecided(inProgress)).toBe(true)
    expect(hasDirectorDecided(exited)).toBe(true)
    expect(hasDirectorDecided({ ...pending, decision: { status: 'rejected' } })).toBe(true)
    // routed elsewhere with an In Progress status: the Director never saw it
    expect(hasDirectorDecided({ ...pending, queue: 'routed', status: 'In Progress' })).toBe(false)
    expect(hasDirectorDecided(adminCase)).toBe(false)
  })
})

describe('routeRequest', () => {
  it('sends a Partnership case to the Director', () => {
    const next = routeRequest(adminCase, { action: 'proceed', type: 'Partnership', reason: 'Fit' })
    expect(next.queue).toBe('director')
    expect(next.caseType).toBe('Partnership')
    expect(next.owner).toBe('Zaid Al Ali')
    expect(next.status).toBe('Pending')
    expect(next.adminDecision).toMatchObject({
      action: 'proceed',
      type: 'Partnership',
      reason: 'Fit',
    })
    expect(next.workflowStages.find((s) => s.id === 2)?.status).toBe('completed')
    expect(next.workflowStages.find((s) => s.id === 3)?.status).toBe('in_progress')
  })

  it('takes Procure and M&A cases out of the Director list', () => {
    const procure = routeRequest(pending, { action: 'proceed', type: 'Procure', reason: 'Buy' })
    expect(procure.queue).toBe('routed')
    expect(procure.owner).toBe('Procurement team')
    const ma = routeRequest(pending, { action: 'proceed', type: 'M&A', reason: 'Acquire' })
    expect(ma.owner).toBe('Corporate Development team')
  })

  it('treats a proceed without a type as Partnership', () => {
    expect(routeRequest(adminCase, { action: 'proceed', reason: 'ok' }).caseType).toBe(
      'Partnership'
    )
  })

  it('closes a rejected case', () => {
    const next = routeRequest(pending, { action: 'reject', reason: 'Out of scope' })
    expect(next.queue).toBe('closed')
    expect(next.status).toBe('Exited')
    expect(next.caseType).toBeUndefined()
  })
})

describe('buildCaseFromForm', () => {
  const when = new Date('2026-10-22T09:00:00Z')

  it('turns the vendor form into a case waiting for the Partnership Admin', () => {
    const c = buildCaseFromForm(form, 'PR-126', when)
    expect(c.requestCode).toBe('PR-126')
    expect(c.queue).toBe('admin')
    expect(c.status).toBe('Pending')
    expect(c.owner).toBe('Nadia Al-Farsi')
    expect(c.companyName).toBe('PulseAI Health')
    expect(c.vendorName).toBe('Dr. Omar')
    expect(c.solution).toBe('Deploy our triage model in M42 emergency departments.')
    expect(c.focusArea).toBe('AI & Diagnostics')
    expect(c.solutionMaturity).toBe('Clinical Validation')
    expect(c.submittedOn).toBe('22 Oct 2026')
    expect(c.deadline).toBe('05 Nov 2026')
    expect(c.companyInfo.phoneNumber).toBeUndefined()
    expect(c.assessmentAreas.regulatoryApprovalList).toEqual(['FDA', 'CE'])
    expect(c.workflowStages[0].status).toBe('completed')
    expect(c.workflowStages[1].status).toBe('in_progress')
  })

  it('infers maturity and approvals from the answers', () => {
    const maturity = (text: string) =>
      buildCaseFromForm({ ...form, maturityAndRegulatory: text }, 'PR-1', when).solutionMaturity
    expect(maturity('Live customers across the region')).toBe('Commercial')
    expect(maturity('Running a pilot in two hospitals')).toBe('Pilot')
    expect(maturity('An idea on paper')).toBe('Concept')
    const approvals = buildCaseFromForm({ ...form, relevantApprovals: 'In progress' }, 'PR-1', when)
    expect(approvals.assessmentAreas.regulatoryApprovalList).toEqual(['Not applicable'])
  })

  it('keeps long headlines short and falls back when no focus area is chosen', () => {
    const long = buildCaseFromForm(
      {
        ...form,
        proposal: `${'word '.repeat(60)}end`,
        focusAreas: [],
        phone: ' +971 50 ',
        developmentApproach: '',
      },
      'PR-2',
      when
    )
    expect(long.solution.length).toBeLessThanOrEqual(110)
    expect(long.solution.endsWith('…')).toBe(true)
    expect(long.focusArea).toBe('General')
    expect(long.companyInfo.phoneNumber).toBe('+971 50')
    expect(long.assessmentAreas.developmentApproach).toBeUndefined()
  })
})
