'use client'

/**
 * QuestionnaireEditor — Organism
 * Pick a questionnaire, then reorder, edit, delete or add questions before it is sent.
 * Changes only apply to this request, never to the questionnaire library.
 * Used in: SendInternalModal
 */

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { AddQuestionModal } from '@/components/organisms/AddQuestionModal'
import { newQuestionId, QUESTIONNAIRE_LIBRARY } from '@/types/questionnaires'
import type { QuestionnaireEditorProps } from './QuestionnaireEditor.types'

const FIELD =
  'w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] text-sm text-[#0d212c] placeholder:text-[#9aa8b5] transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2]'

export const QuestionnaireEditor: React.FC<QuestionnaireEditorProps> = ({
  questionnaireId,
  onQuestionnaireChange,
  questions,
  onQuestionsChange,
  className = '',
}) => {
  const [adding, setAdding] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const update = (index: number, patch: Partial<(typeof questions)[number]>) =>
    onQuestionsChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)))

  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length || from === to) return
    const next = [...questions]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onQuestionsChange(next)
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`.trim()}>
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="questionnaire-select" className="text-xs font-semibold text-[#475569]">
          Questionnaire
        </label>
        <div className="relative">
          <select
            id="questionnaire-select"
            value={questionnaireId}
            onChange={(e) => onQuestionnaireChange(e.target.value)}
            className={`${FIELD} h-10 appearance-none pl-3 pr-10 cursor-pointer`}
          >
            {QUESTIONNAIRE_LIBRARY.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h4 className="text-sm font-semibold text-[#0d212c]">
          Questions{' '}
          <span className="font-normal text-[#64748b]">
            ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
          </span>
        </h4>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="h-9 px-4 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add question
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-[#64748b] text-center py-8 border border-dashed border-[#e2e8f0] rounded-xl">
          No questions yet. Add at least one question to send.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <li
              key={q.id}
              data-testid={`question-${index + 1}`}
              onDragOver={(e) => {
                if (dragIndex !== null) e.preventDefault()
              }}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, index)
                setDragIndex(null)
              }}
              className={`rounded-xl border bg-white p-5 flex flex-col gap-4 transition ${
                dragIndex === index ? 'border-[#94a3b8] opacity-60' : 'border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-3">
                  <span
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    aria-hidden="true"
                    className="text-slate-400 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-semibold text-[#0d212c] whitespace-nowrap">
                    Question {index + 1}
                  </h4>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Move question ${index + 1} up`}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === questions.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move question ${index + 1} down`}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onQuestionsChange(questions.filter((_, i) => i !== index))}
                    aria-label={`Delete question ${index + 1}`}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`question-text-${q.id}`}
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]"
                >
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  id={`question-text-${q.id}`}
                  value={q.text}
                  onChange={(e) => update(index, { text: e.target.value })}
                  className={`${FIELD} h-10 px-3`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`question-cue-${q.id}`}
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]"
                >
                  Response cue <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={`question-cue-${q.id}`}
                  rows={2}
                  value={q.cue}
                  onChange={(e) => update(index, { cue: e.target.value })}
                  className={`${FIELD} p-3 resize-none leading-relaxed`}
                />
              </div>

              <div className="flex items-center gap-8 flex-wrap">
                <label className="flex items-center gap-2.5 text-sm text-[#0d212c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.researchNeeded}
                    onChange={(e) => update(index, { researchNeeded: e.target.checked })}
                    className="w-4 h-4 accent-[#36c0c9]"
                  />
                  Research needed
                </label>
                <label className="flex items-center gap-2.5 text-sm text-[#0d212c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.attachmentRequired}
                    onChange={(e) => update(index, { attachmentRequired: e.target.checked })}
                    className="w-4 h-4 accent-[#36c0c9]"
                  />
                  Attachment required
                </label>
              </div>
            </li>
          ))}
        </ol>
      )}

      {adding && (
        <AddQuestionModal
          onClose={() => setAdding(false)}
          onSave={(q) => {
            onQuestionsChange([...questions, { ...q, id: newQuestionId() }])
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
