'use client'

/**
 * NdaDiscoveryStage — Organism
 * Stage 4: the NDA (read-only template, download, vendor-signed acknowledgement, signed copy
 * with version history), the alignment pack generated from it, and the discovery call, where the
 * lead sponsor adds notes and recordings and confirms the call happened.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import { CheckCircle2, Download, FileText, Film } from 'lucide-react'
import { AlignmentPack } from '@/components/organisms/AlignmentPack'
import { NdaExecutionForm } from '@/components/organisms/NdaExecutionForm'
import { Checkbox } from '@/components/atoms/Checkbox'
import { FilePicker } from '@/components/molecules/FilePicker'
import type { CaseFile } from '@/types/partnership.types'
import type { NdaDiscoveryStageProps } from './NdaDiscoveryStage.types'

export const NDA_TEMPLATE_URL = '/ADHDS-NDA-Execution-Form-v1.0.docx'

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-semibold text-[#0d212c]">{title}</h3>
      {subtitle && <p className="text-xs text-[#64748b]">{subtitle}</p>}
    </div>
    {children}
  </section>
)

const FileList: React.FC<{ label: string; files: CaseFile[]; icon: React.ReactNode }> = ({
  label,
  files,
  icon,
}) =>
  files.length === 0 ? null : (
    <ul
      aria-label={label}
      className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] bg-white"
    >
      {files.map((f) => (
        <li key={f.name} className="flex items-center gap-3 px-4 py-3">
          {icon}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-[#0d212c] truncate">{f.name}</span>
            <span className="text-xs text-[#64748b]">
              {f.uploadedBy} · {f.uploadedOn}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )

export const NdaDiscoveryStage: React.FC<NdaDiscoveryStageProps> = ({
  request,
  role,
  onAction,
  className = '',
}) => {
  const isDirector = role === 'director'
  const versions = request.nda?.versions ?? []
  const signed = versions.length > 0
  const latest = versions[versions.length - 1]
  const [acknowledged, setAcknowledged] = useState(false)
  const [addingVersion, setAddingVersion] = useState(false)
  const discovery = request.discovery ?? { notes: [], recordings: [] }
  const confirmed = Boolean(discovery.confirmedOn)

  return (
    <div className={`flex flex-col gap-10 w-full ${className}`.trim()}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0d212c]">NDA & Discovery</h2>
        <p className="text-xs text-[#64748b]">
          The NDA is signed by the vendor, then the alignment pack goes out and the discovery call
          takes place.
        </p>
      </div>

      <Section title="NDA">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[#475569]">ADHDS NDA Execution Form v1.0</p>
          <a
            href={NDA_TEMPLATE_URL}
            download
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 transition"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Download
          </a>
        </div>
        <div
          tabIndex={0}
          aria-label="NDA execution form"
          className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6 max-h-[28rem] overflow-y-auto"
        >
          <NdaExecutionForm request={request} />
        </div>
      </Section>

      <Section
        title="Signed NDA"
        subtitle={
          signed
            ? undefined
            : isDirector
              ? 'Once the vendor has signed, confirm it below and upload the signed copy.'
              : 'Waiting for the Director to upload the signed copy.'
        }
      >
        {isDirector && !signed && (
          <Checkbox
            checked={acknowledged}
            onChange={setAcknowledged}
            label="I acknowledge that the document has been signed by the vendor"
          />
        )}

        {isDirector && ((!signed && acknowledged) || addingVersion) && (
          <FilePicker
            label={signed ? 'Upload a new version' : 'Upload signed copy'}
            hint="PDF or Word"
            accept=".pdf,.doc,.docx"
            onPick={(names) => {
              onAction({ type: 'uploadNda', fileName: names[0] })
              setAddingVersion(false)
            }}
          />
        )}

        {signed && latest && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-[#2563eb] shrink-0" aria-hidden="true" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-[#0d212c] truncate">
                    {latest.fileName}
                  </span>
                  <span className="text-xs text-[#64748b]">
                    Signed copy · Version {latest.version} · {latest.uploadedBy},{' '}
                    {latest.uploadedOn}
                  </span>
                </div>
              </div>
              {isDirector && !addingVersion && (
                <button
                  type="button"
                  onClick={() => setAddingVersion(true)}
                  className="text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
                >
                  Upload new version
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-[#475569]">Version history</h4>
              <ul
                aria-label="NDA version history"
                className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] bg-white"
              >
                {[...versions].reverse().map((v) => (
                  <li
                    key={v.version}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="text-sm text-[#0d212c]">
                      v{v.version}
                      {v.version === latest.version && (
                        <span className="ml-2 text-[11px] font-medium text-[#0f766e]">Current</span>
                      )}
                    </span>
                    <span className="text-xs text-[#64748b] truncate">
                      {v.fileName} · {v.uploadedOn}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Section>

      {request.alignmentPackOn && (
        <Section
          title="Alignment pack"
          subtitle={`Generated on ${request.alignmentPackOn} once the signed NDA was uploaded.`}
        >
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6">
            <AlignmentPack request={request} />
          </div>
        </Section>
      )}

      {request.alignmentPackOn && (
        <Section
          title="Discovery call"
          subtitle={
            isDirector
              ? 'The lead sponsor adds notes and recordings and confirms the call.'
              : 'Add the notes and recording to give the team more context, then confirm the call took place.'
          }
        >
          <FileList
            label="Discovery notes"
            files={discovery.notes}
            icon={<FileText className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />}
          />
          <FileList
            label="Discovery recordings"
            files={discovery.recordings}
            icon={<Film className="w-5 h-5 text-[#ea580c]" aria-hidden="true" />}
          />

          {!isDirector && !confirmed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FilePicker
                label="Upload call notes"
                hint="Word, PDF or text"
                accept=".doc,.docx,.pdf,.txt"
                multiple
                onPick={(names) =>
                  names.forEach((name) => onAction({ type: 'discoveryFile', kind: 'notes', name }))
                }
              />
              <FilePicker
                label="Upload call recording"
                hint="Audio or video"
                accept=".mp3,.m4a,.wav,.mp4,.mov"
                multiple
                onPick={(names) =>
                  names.forEach((name) =>
                    onAction({ type: 'discoveryFile', kind: 'recordings', name })
                  )
                }
              />
            </div>
          )}

          {confirmed ? (
            <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              Discovery call completed on {discovery.confirmedOn}
            </span>
          ) : (
            !isDirector && (
              <button
                type="button"
                onClick={() => onAction({ type: 'confirmDiscovery' })}
                className="self-start h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition"
              >
                Confirm discovery call completed
              </button>
            )
          )}
          {isDirector && !confirmed && (
            <span className="text-xs text-[#64748b]">Waiting for the lead sponsor.</span>
          )}
        </Section>
      )}
    </div>
  )
}
