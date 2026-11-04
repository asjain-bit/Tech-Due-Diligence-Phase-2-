import type { PartnershipRequest } from '@/types/partnership.types'

export interface TddSection {
  id: string
  title: string
  verdict: 'Satisfactory' | 'Needs attention'
  summary: string
  points: string[]
}

/**
 * The technical due diligence report for a case. Prototype stand-in for the generated report:
 * derived from the case and the same every time.
 */
export const buildTddReport = (request: PartnershipRequest): TddSection[] => [
  {
    id: 'security',
    title: 'Security and compliance',
    verdict: 'Satisfactory',
    summary: `${request.companyName} meets M42's baseline security controls.`,
    points: [
      'ISO 27001 certification is current and covers the hosted platform.',
      'Penetration test results from the last 12 months show no open high-severity findings.',
      'Role-based access and audit logging are in place.',
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture and integration',
    verdict: 'Satisfactory',
    summary:
      'The solution can integrate with the clinical data platform through standard interfaces.',
    points: [
      'HL7 FHIR and DICOM interfaces are supported.',
      'No custom changes to M42 core systems are needed.',
      'Deployment can run in a dedicated tenant.',
    ],
  },
  {
    id: 'data',
    title: 'Data protection and residency',
    verdict: 'Needs attention',
    summary: 'Patient data hosting must be confirmed in the UAE before go-live.',
    points: [
      'The vendor currently hosts outside the UAE and has proposed a UAE region.',
      'A data processing agreement is drafted but not yet signed.',
      'Encryption at rest and in transit is confirmed.',
    ],
  },
  {
    id: 'clinical',
    title: 'Clinical safety and regulatory',
    verdict: 'Satisfactory',
    summary: 'Regulatory approvals and clinical validation are documented.',
    points: [
      'Required regulatory approvals are in place for the target markets.',
      'A clinical safety case and hazard log were provided.',
      'Post-market monitoring is described.',
    ],
  },
  {
    id: 'resilience',
    title: 'Operational resilience',
    verdict: 'Satisfactory',
    summary: 'Availability and support commitments fit a clinical setting.',
    points: [
      '99.9% availability target with a published incident process.',
      'Backup and disaster recovery tested twice a year.',
      '24/7 support for critical issues.',
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial and IP',
    verdict: 'Needs attention',
    summary: 'Ownership of models tuned on M42 data still needs to be agreed.',
    points: [
      'The base platform stays vendor-owned and is licensed to M42.',
      'Co-ownership of tuned models is proposed but not yet in the draft terms.',
      'An exit plan covering access to tuned models is needed.',
    ],
  },
]
