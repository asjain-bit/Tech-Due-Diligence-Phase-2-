'use client'

/**
 * QuestionnaireEditor — Organism
 * Pick a questionnaire, then reorder (drag), edit, delete or add questions before it is sent.
 * Every change saves a new version, and earlier versions can be restored from the history.
 * Changes only apply to this request, never to the questionnaire library.
 * Used in: SendInternalModal
 */

import React, { useState } from 'react'
import { ChevronDown, GripVertical, History, Pencil, Plus, Trash2 } from 'lucide-react'
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
  versions,
  onRestore,
  className = '',
}) => {
  const [adding, setAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const current = versions?.[versions.length - 1]?.version

  const move = (from: number, to: number) => {
    if (to < 0 || to >= questions.length || from === to) return
    const next = [...questions]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onQuestionsChange(next, `Moved question ${from + 1} to position ${to + 1}`)
  }

  const editing = editingIndex === null ? null : questions[editingIndex]

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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h4 className="text-sm font-semibold text-[#0d212c]">
            Questions{' '}
            <span className="font-normal text-[#64748b]">
              ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
            </span>
          </h4>
          {current !== undefined && (
            <span
              aria-label={`Version ${current}`}
              className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6fffa] text-[#0f766e] border border-[#a7f3d0]"
            >
              v{current}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {versions && versions.length > 1 && (
            <button
              type="button"
              aria-expanded={showHistory}
              onClick={() => setShowHistory((o) => !o)}
              className="h-9 px-3 rounded-lg text-sm font-medium text-[#475569] hover:bg-slate-100 cursor-pointer transition flex items-center gap-1.5"
            >
              <History className="w-4 h-4" aria-hidden="true" />
              Version history
            </button>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-9 px-4 rounded-lg border border-[#cbd5e1] bg-white text-sm font-semibold text-[#0d212c] hover:bg-slate-50 cursor-pointer transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add question
          </button>
        </div>
      </div>

      {showHistory && versions && (
        <ul
          aria-label="Version history"
          className="rounded-xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] bg-white"
        >
          {[...versions].reverse().map((v) => (
            <li key={v.version} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[#0d212c]">
                  v{v.version}
                  {v.version === current && (
                    <span className="ml-2 text-[11px] font-medium text-[#0f766e]">Current</span>
                  )}
                </span>
                <span className="text-xs text-[#64748b] truncate">
                  {v.label} · {v.questions.length}{' '}
                  {v.questions.length === 1 ? 'question' : 'questions'}
                </span>
              </div>
              {v.version !== current && onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(v.version)}
                  aria-label={`Restore version ${v.version}`}
                  className="text-xs font-semibold text-[#36c0c9] hover:text-[#2fb0b9] cursor-pointer transition shrink-0"
                >
                  Restore
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {questions.length === 0 ? (
        <p className="text-sm text-[#64748b] text-center py-8 border border-dashed border-[#e2e8f0] rounded-xl">
          No questions yet. Add at least one question to send.
        </p>
      ) : (
        <ol aria-label="Questions" className="flex flex-col gap-3">
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
              className={`rounded-xl border bg-white px-4 py-3.5 flex items-start gap-3 transition ${
                dragIndex === index ? 'border-[#94a3b8] opacity-60' : 'border-[#e2e8f0]'
              }`}
            >
              <span
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => setDragIndex(null)}
                aria-hidden="true"
                className="text-slate-400 cursor-grab active:cursor-grabbing pt-0.5"
              >
                <GripVertical className="w-4 h-4" />
              </span>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-sm font-semibold text-[#0d212c] whitespace-nowrap">
                    Question {index + 1}
                  </h5>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                      q.mandatory
                        ? 'bg-[#e6fffa] text-[#0f766e] border-[#a7f3d0]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {q.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </div>
                <p className="text-sm text-[#0d212c] leading-relaxed">{q.text}</p>
                <p className="text-xs text-[#64748b] leading-relaxed">{q.cue}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingIndex(index)}
                  aria-label={`Edit question ${index + 1}`}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onQuestionsChange(
                      questions.filter((_, i) => i !== index),
                      `Deleted question ${index + 1}`
                    )
                  }
                  aria-label={`Delete question ${index + 1}`}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {adding && (
        <AddQuestionModal
          onClose={() => setAdding(false)}
          onSave={(q) => {
            onQuestionsChange(
              [...questions, { ...q, id: newQuestionId() }],
              `Added question ${questions.length + 1}`
            )
            setAdding(false)
          }}
        />
      )}

      {editing && editingIndex !== null && (
        <AddQuestionModal
          initial={{ text: editing.text, cue: editing.cue, mandatory: editing.mandatory }}
          onClose={() => setEditingIndex(null)}
          onSave={(q) => {
            onQuestionsChange(
              questions.map((existing, i) =>
                i === editingIndex ? { ...existing, ...q } : existing
              ),
              `Edited question ${editingIndex + 1}`
            )
            setEditingIndex(null)
          }}
        />
      )}
    </div>
  )
}
