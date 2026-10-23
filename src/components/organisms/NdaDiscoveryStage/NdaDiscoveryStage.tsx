'use client'

/**
 * NdaDiscoveryStage — Organism
 * Stage 4 runs in a loop. The Director sees the NDA template (download, vendor-signed
 * acknowledgement, upload the signed copy), then the signed NDA with its versions, then the
 * alignment pack generated from it. Everyone else never sees the template: they open on the
 * alignment pack, and Back shows the signed NDA. The action bar is fixed at the bottom.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Film,
  Upload,
} from 'lucide-react'
import { AlignmentPack } from '@/components/organisms/AlignmentPack'
import { NdaExecutionForm } from '@/components/organisms/NdaExecutionForm'
import { UploadSignedNdaModal } from '@/components/organisms/UploadSignedNdaModal'
import { Checkbox } from '@/components/atoms/Checkbox'
import { FilePicker } from '@/components/molecules/FilePicker'
import { StageFooter } from '@/components/molecules/StageFooter'
import type { CaseFile } from '@/types/partnership.types'
import type { NdaDiscoveryStageProps } from './NdaDiscoveryStage.types'

export const NDA_TEMPLATE_URL = '/ADHDS-NDA-Execution-Form-v1.0.docx'

type View = 'template' | 'signed' | 'pack'

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

const PrimaryButton: React.FC<{
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}> = ({ onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="h-10 px-5 rounded-lg bg-[#00a8b0] hover:bg-[#009199] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-2"
  >
    {children}
    <ArrowRight className="w-4 h-4" aria-hidden="true" />
  </button>
)

export const NdaDiscoveryStage: React.FC<NdaDiscoveryStageProps> = ({
  request,
  role,
  onAction,
  onNext,
  className = '',
}) => {
  const isDirector = role === 'director'
  const versions = request.nda?.versions ?? []
  const signed = versions.length > 0
  const latest = versions[versions.length - 1]
  const [view, setView] = useState<View>(signed ? 'pack' : 'template')
  const [acknowledged, setAcknowledged] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pickedVersion, setPickedVersion] = useState<number | null>(null)
  const shown = versions.find((v) => v.version === pickedVersion) ?? latest
  const discovery = request.discovery ?? { notes: [], recordings: [] }
  const confirmed = Boolean(discovery.confirmedOn)

  const discoveryContent = (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-[#64748b]">
        {isDirector
          ? 'The lead sponsor adds notes and recordings and confirms the call.'
          : 'Add the notes and recording to give the team more context, then confirm the call took place.'}
      </p>
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
              names.forEach((name) => onAction({ type: 'discoveryFile', kind: 'recordings', name }))
            }
          />
        </div>
      )}
      {confirmed ? (
        <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          Discovery call completed on {discovery.confirmedOn}
        </span>
      ) : isDirector ? (
        <span className="text-xs text-[#64748b]">Waiting for the lead sponsor.</span>
      ) : (
        <button
          type="button"
          onClick={() => onAction({ type: 'confirmDiscovery' })}
          className="self-start h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition"
        >
          Confirm discovery call completed
        </button>
      )}
    </div>
  )

  const title = (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold text-[#0d212c]">NDA & Discovery</h2>
    </div>
  )

  // Nobody but the Director sees the template: others wait until it has been signed
  if (!signed && !isDirector) {
    return (
      <div className={`flex flex-col gap-6 w-full ${className}`.trim()}>
        {title}
        <p className="text-sm text-[#64748b]">
          Waiting for the Director to upload the signed NDA. It will show here with the alignment
          pack.
        </p>
      </div>
    )
  }

  const current: View = signed ? (view === 'template' ? 'signed' : view) : 'template'

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`.trim()}>
      {title}

      {current === 'template' && (
        <>
          <p className="text-sm text-[#64748b] -mt-4">
            Download the NDA template, complete it with the vendor, and upload the signed copy to
            continue.
          </p>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-base font-semibold text-[#0d212c]">NDA template</h3>
            <a
              href={NDA_TEMPLATE_URL}
              download
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] transition"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download
            </a>
          </div>
          <div
            tabIndex={0}
            aria-label="NDA execution form"
            className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6 max-h-[60vh] overflow-y-auto"
          >
            <NdaExecutionForm request={request} />
          </div>
          <StageFooter>
            <Checkbox
              checked={acknowledged}
              onChange={setAcknowledged}
              label="I acknowledge that the document has been signed by the vendor"
            />
            <PrimaryButton disabled={!acknowledged} onClick={() => setUploading(true)}>
              Proceed
            </PrimaryButton>
          </StageFooter>
        </>
      )}

      {current === 'signed' && shown && (
        <>
          <p className="text-sm text-[#64748b] -mt-4">
            The signed NDA has been uploaded. You can review the document below.
          </p>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-[#0d212c]">Signed NDA</h3>
              <div className="relative">
                <select
                  aria-label="NDA version"
                  value={shown.version}
                  onChange={(e) => setPickedVersion(Number(e.target.value))}
                  className="h-8 appearance-none pl-3 pr-8 rounded-lg border border-[#e2e8f0] bg-white text-xs font-medium text-[#0d212c] hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2] cursor-pointer"
                >
                  {[...versions].reverse().map((v) => (
                    <option key={v.version} value={v.version}>
                      v{v.version}
                      {v.version === latest.version ? ' (current)' : ''} · {v.uploadedOn}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
            {isDirector && (
              <button
                type="button"
                onClick={() => setUploading(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Upload new version
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
            <FileText className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-[#0d212c] truncate">{shown.fileName}</span>
              <span className="text-xs text-[#64748b]">
                Version {shown.version} · {shown.uploadedBy}, {shown.uploadedOn}
              </span>
            </div>
          </div>
          <div
            tabIndex={0}
            aria-label="Signed NDA document"
            className="rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:p-6 max-h-[60vh] overflow-y-auto"
          >
            <NdaExecutionForm request={request} signedOn={shown.uploadedOn} />
          </div>
          <StageFooter>
            {isDirector ? (
              <Checkbox
                checked
                disabled
                onChange={() => undefined}
                label="I acknowledge that the document has been signed by the vendor"
              />
            ) : (
              <span />
            )}
            <PrimaryButton onClick={() => setView('pack')}>Proceed</PrimaryButton>
          </StageFooter>
        </>
      )}

      {current === 'pack' && (
        <>
          <div>
            <button
              type="button"
              onClick={() => setView('signed')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to signed NDA
            </button>
          </div>
          <AlignmentPack
            request={request}
            extraSection={{ id: 'discovery', label: 'Discovery Call', content: discoveryContent }}
          />
          <StageFooter>
            <span />
            <PrimaryButton onClick={onNext}>Next</PrimaryButton>
          </StageFooter>
        </>
      )}

      {uploading && (
        <UploadSignedNdaModal
          nextVersion={versions.length + 1}
          onClose={() => setUploading(false)}
          onUpload={(fileName) => {
            onAction({ type: 'uploadNda', fileName })
            setUploading(false)
            setPickedVersion(null)
            setView('signed')
          }}
        />
      )}
    </div>
  )
}
