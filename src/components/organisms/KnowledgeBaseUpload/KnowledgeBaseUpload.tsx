'use client'

/**
 * KnowledgeBaseUpload — Organism
 * Optional step before the pre-read summary is generated: add PowerPoint, Word or Excel files
 * to the knowledge base, or skip straight to generating the summary.
 * Used in: PartnershipDetail
 */

import React, { useRef, useState } from 'react'
import {
  FileSpreadsheet,
  FileText,
  Presentation,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { isSupportedKnowledgeFile, KNOWLEDGE_BASE_ACCEPT } from '@/lib/preRead'
import type { KnowledgeBaseUploadProps } from './KnowledgeBaseUpload.types'

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

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
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [rejected, setRejected] = useState<string[]>([])

  const add = (list: FileList | File[]) => {
    const incoming = Array.from(list)
    const ok = incoming.filter((f) => isSupportedKnowledgeFile(f.name))
    setRejected(incoming.filter((f) => !isSupportedKnowledgeFile(f.name)).map((f) => f.name))
    const fresh = ok
      .filter((f) => !files.some((existing) => existing.name === f.name))
      .map((f) => ({ name: f.name, size: f.size }))
    if (fresh.length > 0) onFilesChange([...files, ...fresh])
  }

  return (
    <div className={`flex flex-col gap-6 w-full max-w-3xl ${className}`.trim()}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-[#0d212c]">Add to the knowledge base</h2>
        <p className="text-sm text-[#64748b] leading-relaxed">
          Optional. Files you add are used alongside the vendor submission when the pre-read summary
          is generated. You can skip this and generate the summary straight away.
        </p>
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
        <span className="w-11 h-11 rounded-full bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center">
          <UploadCloud className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0d212c]">Drag files here</span>
          <span className="text-xs text-[#64748b]">
            PowerPoint, Word or Excel files (.ppt, .pptx, .doc, .docx, .xls, .xlsx)
          </span>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-9 px-4 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
        >
          Choose files
        </button>
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

      {rejected.length > 0 && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {rejected.join(', ')} {rejected.length === 1 ? 'is' : 'are'} not supported. Use
          PowerPoint, Word or Excel files.
        </p>
      )}

      {files.length > 0 && (
        <ul
          aria-label="Added files"
          className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] bg-white"
        >
          {files.map((f) => (
            <li key={f.name} className="flex items-center gap-3 px-4 py-3">
              <FileTypeIcon name={f.name} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-[#0d212c] truncate">{f.name}</span>
                <span className="text-xs text-[#64748b]">{formatSize(f.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((x) => x.name !== f.name))}
                aria-label={`Remove ${f.name}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onGenerate}
          className="h-10 px-5 rounded-lg bg-[#36c0c9] hover:bg-[#2fb0b9] text-sm font-semibold text-white shadow-xs cursor-pointer transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Generate pre-read summary
        </button>
      </div>
    </div>
  )
}
