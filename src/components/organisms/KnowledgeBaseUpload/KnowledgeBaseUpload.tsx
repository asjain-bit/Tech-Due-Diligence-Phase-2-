'use client'

/**
 * KnowledgeBaseUpload — Organism
 * First screen of the Strategy Team's review: the M42 knowledge base documents that will be
 * compared with the vendor submission (two are pre-selected), with room to upload more, before
 * the pre-read summary is generated.
 * Used in: PartnershipDetail
 */

import React, { useRef, useState } from 'react'
import { FileSpreadsheet, FileText, FileUp, Info, Presentation, Sparkles, X } from 'lucide-react'
import { isSupportedKnowledgeFile, KNOWLEDGE_BASE_ACCEPT } from '@/lib/preRead'
import type { KnowledgeBaseUploadProps } from './KnowledgeBaseUpload.types'

const MAX_BYTES = 20 * 1024 * 1024

export const FileTypeIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext.startsWith('xl')) return <FileSpreadsheet className={`${className} text-[#16a34a]`} />
  if (ext.startsWith('pp')) return <Presentation className={`${className} text-[#ea580c]`} />
  return <FileText className={`${className} text-[#2563eb]`} />
}

export const KnowledgeBaseUpload: React.FC<KnowledgeBaseUploadProps> = ({
  files,
  onFilesChange,
  onGenerate,
  onViewBrief,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [problems, setProblems] = useState<string[]>([])

  const add = (list: FileList | File[]) => {
    const incoming = Array.from(list)
    const notes: string[] = []
    const fresh = incoming.filter((f) => {
      if (!isSupportedKnowledgeFile(f.name)) {
        notes.push(`${f.name} is not a supported file type.`)
        return false
      }
      if (f.size > MAX_BYTES) {
        notes.push(`${f.name} is larger than 20 MB.`)
        return false
      }
      return !files.some((existing) => existing.name === f.name)
    })
    setProblems(notes)
    if (fresh.length > 0) {
      onFilesChange([
        ...files,
        ...fresh.map((f) => ({ name: f.name, size: f.size, source: 'Uploaded by you' })),
      ])
    }
  }

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-[#0d212c]">Prepare Initial Assessment Brief</h2>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Add relevant M42 knowledge base documents before generating the pre-read summary.
          </p>
        </div>
        {onViewBrief && (
          <button
            type="button"
            onClick={onViewBrief}
            className="text-sm font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
          >
            View initial assessment brief
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          add(e.dataTransfer.files)
        }}
        className={`rounded-2xl border border-dashed px-6 py-10 flex flex-col items-center gap-3 text-center transition ${
          dragging ? 'border-[#36c0c9] bg-[#f0fdfa]' : 'border-[#cbd5e1] bg-white'
        }`}
      >
        <span className="w-12 h-12 rounded-full bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center">
          <FileUp className="w-6 h-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-[#0d212c]">
            Upload supporting documents
          </span>
          <span className="text-sm text-[#64748b]">
            Add roadmap, portfolio, strategy, or policy documents to help the agent assess this
            proposal.
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-10 px-5 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
        >
          Browse files
        </button>
        <span className="text-xs text-[#64748b]">PDF, DOCX, XLSX, PPTX · Max 20 MB per file</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={KNOWLEDGE_BASE_ACCEPT}
          aria-label="Knowledge base files"
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) add(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {problems.length > 0 && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {problems.join(' ')}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[#0d212c]">
          Knowledge base documents{' '}
          <span className="font-normal text-[#64748b]">({files.length})</span>
        </h3>
        {files.length > 0 && (
          <ul aria-label="Knowledge base documents" className="flex flex-col gap-2">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white"
              >
                <span className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <FileTypeIcon name={f.name} />
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[#0d212c] truncate">{f.name}</span>
                  <span className="text-xs text-[#64748b]">{f.source ?? 'M42 knowledge base'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onFilesChange(files.filter((x) => x.name !== f.name))}
                  aria-label={`Remove ${f.name}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            Only documents selected for this assessment will be used.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            The agent will compare the vendor submission against the selected documents.
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onGenerate}
          className="h-11 px-6 rounded-lg bg-[#00c4c4] hover:bg-[#00b0b0] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Generate Pre-read Summary
        </button>
      </div>
    </div>
  )
}
