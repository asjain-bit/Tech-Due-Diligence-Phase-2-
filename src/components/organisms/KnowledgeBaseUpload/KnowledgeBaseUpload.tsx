'use client'

/**
 * KnowledgeBaseUpload — Organism
 * The Strategy Team's "Prepare Pre-read Summary" screen: an upload area whose Browse files opens
 * the Add supporting documents popup, the documents added so far, and Generate Summary.
 * Used in: PartnershipDetail
 */

import React, { useState } from 'react'
import { ArrowRight, FileText, FileUp, Info, Sparkles, X } from 'lucide-react'
import { AddDocumentsModal } from '@/components/organisms/AddDocumentsModal'
import {
  fileTypeLabel,
  formatFileSize,
} from '@/components/organisms/AddDocumentsModal/AddDocumentsModal'
import { FileTypeIcon } from './FileTypeIcon'
import type { KnowledgeBaseUploadProps } from './KnowledgeBaseUpload.types'

export const KnowledgeBaseUpload: React.FC<KnowledgeBaseUploadProps> = ({
  files,
  onFilesChange,
  onGenerate,
  className = '',
}) => {
  const [adding, setAdding] = useState(false)

  return (
    <div className={`flex flex-col gap-6 w-full ${className}`.trim()}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0d212c]">Prepare Pre-read Summary</h2>
        <p className="text-sm text-[#64748b] leading-relaxed">
          Upload relevant documents to help the agent generate the pre-read summary.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-12 flex flex-col items-center gap-3 text-center">
        <span className="w-14 h-14 rounded-full bg-[#e6fffa] text-[#00a8b0] flex items-center justify-center">
          <FileUp className="w-7 h-7" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-[#0d212c]">
            Upload supporting documents
          </span>
          <span className="text-sm text-[#64748b]">
            Add roadmap, portfolio, strategy, or policy documents to help generate the pre-read
            summary.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-10 px-6 rounded-lg border border-[#00a8b0] bg-white text-sm font-semibold text-[#008a8a] hover:bg-[#f0fdfa] cursor-pointer transition"
        >
          Browse files
        </button>
        <span className="text-xs text-[#64748b]">PDF, DOCX, XLSX · Max 20 MB per file</span>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#0d212c]">
            Documents added <span className="font-normal text-[#64748b]">({files.length})</span>
          </h3>
          <ul aria-label="Documents added" className="flex flex-col gap-2">
            {files.map((f) => (
              <li
                key={f.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white"
              >
                <FileTypeIcon name={f.name} className="w-6 h-6" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-[#0d212c] truncate">{f.name}</span>
                  <span className="text-xs text-[#64748b]">
                    {fileTypeLabel(f.name)} · {formatFileSize(f.size)}
                  </span>
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
        </div>
      )}

      <div className="flex items-start justify-between gap-6 flex-wrap text-sm text-[#64748b]">
        <span className="inline-flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          Only documents selected for this assessment will be used.
        </span>
        <span className="inline-flex items-start gap-2 max-w-sm">
          <FileText className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          The agent will analyse the uploaded documents to generate the pre-read summary.
        </span>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onGenerate}
          className="h-11 px-6 rounded-lg bg-[#00a8b0] hover:bg-[#009199] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Generate Summary
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {adding && (
        <AddDocumentsModal
          onClose={() => setAdding(false)}
          onAdd={(picked) => {
            const fresh = picked.filter((p) => !files.some((f) => f.name === p.name))
            onFilesChange([...files, ...fresh])
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
