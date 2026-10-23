'use client'

/**
 * NdaExecutionForm — Organism
 * The ADHDS NDA Execution Form (Parts A to D) as a read-only template, with the case details
 * filled in. The original Word file can be downloaded; this view is not editable.
 * Used in: NdaDiscoveryStage
 */

import React from 'react'
import { CheckSquare, Square } from 'lucide-react'
import type { NdaExecutionFormProps } from './NdaExecutionForm.types'

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label,
  hint,
  children,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] border-t border-[#e2e8f0] first:border-t-0">
    <div className="bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#0d212c]">
      {label}
      {hint && <span className="block text-xs font-normal text-[#64748b]">{hint}</span>}
    </div>
    <div className="px-4 py-3 text-sm text-[#0d212c] min-h-11">{children}</div>
  </div>
)

const Check: React.FC<{ checked?: boolean; label: string }> = ({ checked = false, label }) => (
  <span className="inline-flex items-center gap-2 mr-6">
    {checked ? (
      <CheckSquare className="w-4 h-4 text-[#36c0c9]" aria-hidden="true" />
    ) : (
      <Square className="w-4 h-4 text-slate-400" aria-hidden="true" />
    )}
    <span>{label}</span>
    <span className="sr-only">{checked ? '(selected)' : '(not selected)'}</span>
  </span>
)

const Signature: React.FC = () => <span className="text-[#94a3b8]">Signature</span>

const Part: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <h4 className="text-sm font-semibold text-[#0d212c]">{title}</h4>
    <div className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-white">{children}</div>
  </section>
)

const Approval: React.FC<{ approver: string }> = ({ approver }) => (
  <>
    <Row label="Approver name and contact">{approver}</Row>
    <Row label="Approved?">
      <Check label="Approve" />
      <Check label="Reject" />
    </Row>
    <Row label="Additional comments, if any">&nbsp;</Row>
    <Row label="Signature">
      <Signature />
    </Row>
    <Row label="Date">&nbsp;</Row>
  </>
)

export const NdaExecutionForm: React.FC<NdaExecutionFormProps> = ({ request, className = '' }) => (
  <div className={`flex flex-col gap-6 ${className}`.trim()}>
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-semibold text-[#0d212c]">NDA Execution Form</h3>
      <p className="text-xs text-[#64748b]">
        Read-only. Download the form to have it signed by the vendor.
      </p>
    </div>

    <Part title="Part A: NDA Summary (for completion by Business Owner)">
      <Row label="Customer / Contracting Partner Name(s)">{request.companyName}</Row>
      <Row label="Contracting Partner Registration Details">
        <div className="flex flex-col gap-1">
          <span>License No.: {`L-${request.requestCode.replace(/\D/g, '')}-2026`}</span>
          <span>Incorporated in: {request.companyInfo.location?.split(',')[0] ?? 'UAE'}</span>
          <span>Address: {request.companyInfo.location ?? '—'}</span>
        </div>
      </Row>
      <Row label="Contract Name / Project Name / RFP Name" hint="(if applicable)">
        {request.solution}
      </Row>
      <Row label="NDA Purpose / Reason" hint="(Business Justification)">
        To exchange confidential information while M42 evaluates a partnership with{' '}
        {request.companyName}.
      </Row>
      <Row label="NDA Template">
        <Check checked label="Standard ADHDS Template" />
        <Check label="Non-standard Template" />
      </Row>
      <Row label="Additional Comments" hint="(if any)">
        &nbsp;
      </Row>
      <Row label="Has Business Partner Background Information Form been completed?">
        <Check checked label="Yes" />
        <Check label="No" />
      </Row>
      <Row label="Has Contracting Partner provided requisite supporting documentation?">
        <Check checked label="Yes" />
        <Check label="No" />
      </Row>
    </Part>

    <Part title="Signatures: Business Owner confirmation">
      <Row label="Business Owner declaration">
        By signing and submitting this NDA Execution Form, I, as the Business Owner responsible for
        the NDA and its subject matter, declare that proceeding with the NDA is in the best
        interests of ADHDS and/or M42 Group.
      </Row>
      <Row label="Comments (if any)">&nbsp;</Row>
      <Row label="Business Owner">Director, Partnerships</Row>
      <Row label="Department">Partnerships</Row>
      <Row label="Business Owner name and contact">Zaid Al Ali · zaid.alali@m42.ae</Row>
      <Row label="Business Owner signature">
        <Signature />
      </Row>
      <Row label="Date">&nbsp;</Row>
    </Part>

    <Part title="Business Head: Approval">
      <Row label="Business Head name and contact">&nbsp;</Row>
      <Row label="Approved?">
        <Check label="Approve" />
        <Check label="Reject" />
      </Row>
      <Row label="Comments (if any)">&nbsp;</Row>
      <Row label="Business Head signature">
        <Signature />
      </Row>
      <Row label="Date">&nbsp;</Row>
    </Part>

    <Part title="Part B: Governance & Compliance (for completion by Compliance)">
      <Approval approver="&nbsp;" />
    </Part>

    <Part title="Part C: Legal (for completion by Legal)">
      <Approval approver="&nbsp;" />
    </Part>

    <Part title="Part D: Other Approvers (where applicable)">
      <Approval approver="&nbsp;" />
    </Part>
  </div>
)
