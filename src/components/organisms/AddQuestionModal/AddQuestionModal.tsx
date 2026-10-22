'use client'

/**
 * AddQuestionModal — Organism
 * Small dialog for adding a new question to the questionnaire the Director is sending.
 * Used in: QuestionnaireEditor
 */

import React, { useEffect, useId, useState } from 'react'
import { X } from 'lucide-react'
import type { AddQuestionModalProps } from './AddQuestionModal.types'

const FIELD =
  'w-full rounded-lg border border-[#d6dee6] bg-white text-sm text-[#0d212c] placeholder:text-[#9aa8b5] transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2]'

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ onSave, onClose }) => {
  const [text, setText] = useState('')
  const [cue, setCue] = useState('')
  const [researchNeeded, setResearchNeeded] = useState(false)
  const [attachmentRequired, setAttachmentRequired] = useState(false)
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canSave = text.trim().length > 0 && cue.trim().length > 0

  return (
    <div className="fixed inset-0 z-[70] bg-[#0d212c]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
          <h3 id={titleId} className="text-xl font-semibold text-[#0d212c]">
            Add new question
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add question"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-question-text" className="text-sm font-semibold text-[#0d212c]">
            Question text <span className="text-red-500">*</span>
          </label>
          <input
            id="new-question-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Describe your identity & access management policies..."
            className={`${FIELD} h-11 px-3.5`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-question-cue" className="text-sm font-semibold text-[#0d212c]">
            Response cue <span className="text-red-500">*</span>
          </label>
          <textarea
            id="new-question-cue"
            rows={3}
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="Instructions or cues for the reviewer to answer effectively..."
            className={`${FIELD} p-3.5 resize-none leading-relaxed`}
          />
        </div>

        <div className="flex items-center gap-8 flex-wrap">
          <label className="flex items-center gap-2.5 text-sm font-medium text-[#0d212c] cursor-pointer">
            <input
              type="checkbox"
              checked={researchNeeded}
              onChange={(e) => setResearchNeeded(e.target.checked)}
              className="w-4 h-4 accent-[#36c0c9]"
            />
            Research needed
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-[#0d212c] cursor-pointer">
            <input
              type="checkbox"
              checked={attachmentRequired}
              onChange={(e) => setAttachmentRequired(e.target.checked)}
              className="w-4 h-4 accent-[#36c0c9]"
            />
            Attachment required
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({
                text: text.trim(),
                cue: cue.trim(),
                researchNeeded,
                attachmentRequired,
              })
            }
            className="h-11 px-6 rounded-xl bg-[#36c0c9] hover:bg-[#2fb0b9] disabled:bg-slate-400 disabled:hover:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition cursor-pointer"
          >
            Save question
          </button>
        </div>
      </div>
    </div>
  )
}
