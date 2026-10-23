'use client'

/**
 * AddDocumentsModal — Organism
 * Popup opened from "Browse files" on the pre-read screen: drag and drop or browse, review the
 * selected files (with Remove all), then add them to the assessment.
 * Used in: KnowledgeBaseUpload
 */

import React, { useEffect, useId, useRef, useState } from 'react'
import { FileUp, X } from 'lucide-react'
import { FileTypeIcon } from '@/components/organisms/KnowledgeBaseUpload/FileTypeIcon'
import { isSupportedKnowledgeFile, KNOWLEDGE_BASE_ACCEPT } from '@/lib/preRead'
import type { KnowledgeBaseFile } from '@/components/organisms/KnowledgeBaseUpload/KnowledgeBaseUpload.types'
import type { AddDocumentsModalProps } from './AddDocumentsModal.types'

const MAX_BYTES = 20 * 1024 * 1024

export const formatFileSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

export const fileTypeLabel = (name: string) => (name.split('.').pop() ?? '').toUpperCase()

export const AddDocumentsModal: React.FC<AddDocumentsModalProps> = ({ onAdd, onClose }) => {
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const take = (list: FileList | File[]) => {
    const notes: string[] = []
    const fresh = Array.from(list).filter((f) => {
      if (!isSupportedKnowledgeFile(f.name)) {
        notes.push(`${f.name} is not a supported file type.`)
        return false
      }
      if (f.size > MAX_BYTES) {
        notes.push(`${f.name} is larger than 20 MB.`)
        return false
      }
      return !files.some((x) => x.name === f.name)
    })
    setProblems(notes)
    if (fresh.length > 0) {
      setFiles((prev) => [...prev, ...fresh.map((f) => ({ name: f.name, size: f.size }))])
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 shrink-0">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-[#0d212c]">
              Add supporting documents
            </h3>
            <p className="text-xs text-[#64748b] mt-1">
              Upload relevant documents to help the agent generate the pre-read summary.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add documents"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              take(e.dataTransfer.files)
            }}
            className={`rounded-xl border border-dashed px-5 py-7 flex flex-col items-center gap-2.5 text-center transition ${
              dragging ? 'border-[#36c0c9] bg-[#f0fdfa]' : 'border-[#cbd5e1] bg-white'
            }`}
          >
            <span className="w-11 h-11 rounded-full bg-[#e6fffa] text-[#36c0c9] flex items-center justify-center">
              <FileUp className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-sm text-[#0d212c]">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[#0369a1] hover:underline cursor-pointer"
              >
                browse files
              </button>
            </span>
            <span className="text-xs text-[#64748b]">PDF, DOCX, XLSX · Max 20 MB per file</span>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={KNOWLEDGE_BASE_ACCEPT}
              aria-label="Supporting documents"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files) take(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {problems.length > 0 && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {problems.join(' ')}
            </p>
          )}

          {files.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#0d212c]">
                  Selected files ({files.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs font-medium text-[#008a8a] hover:text-[#006e6e] cursor-pointer transition"
                >
                  Remove all
                </button>
              </div>
              <ul aria-label="Selected files" className="flex flex-col gap-2">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] bg-white"
                  >
                    <FileTypeIcon name={f.name} className="w-6 h-6" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-[#0d212c] truncate">{f.name}</span>
                      <span className="text-xs text-[#64748b]">
                        {fileTypeLabel(f.name)} · {formatFileSize(f.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((x) => x.name !== f.name))}
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
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={files.length === 0}
            onClick={() => onAdd(files.map((f) => ({ ...f, source: 'Uploaded by you' })))}
            className="h-10 px-5 rounded-lg bg-[#00a8b0] hover:bg-[#009199] disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-semibold text-white transition cursor-pointer"
          >
            Add documents
          </button>
        </div>
      </div>
    </div>
  )
}
