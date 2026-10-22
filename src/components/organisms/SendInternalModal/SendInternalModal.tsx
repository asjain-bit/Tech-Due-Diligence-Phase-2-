'use client'

/**
 * SendInternalModal — Organism
 * Where the Director lines up everything for the Internal Interest team: who is asked and
 * which questions they answer. Sending asks for a final confirmation.
 * Used in: PartnershipDetail
 */

import React, { useEffect, useId, useState } from 'react'
import { Calendar, Check, Send, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { QuestionnaireEditor } from '@/components/organisms/QuestionnaireEditor'
import { cloneQuestions, DEFAULT_QUESTIONNAIRE_ID, getQuestionnaire } from '@/types/questionnaires'
import type { SendInternalModalProps } from './SendInternalModal.types'

export const SendInternalModal: React.FC<SendInternalModalProps> = ({
  members,
  defaultNote,
  onSend,
  onClose,
}) => {
  const [selected, setSelected] = useState<string[]>(members.map((m) => m.id))
  const [questionnaireId, setQuestionnaireId] = useState(DEFAULT_QUESTIONNAIRE_ID)
  const [questions, setQuestions] = useState(() =>
    cloneQuestions(getQuestionnaire(DEFAULT_QUESTIONNAIRE_ID).questions)
  )
  const [note, setNote] = useState(defaultNote)
  const [confirming, setConfirming] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (confirming) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, confirming])

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const questionsValid =
    questions.length > 0 && questions.every((q) => q.text.trim() && q.cue.trim())
  const canSend = selected.length > 0 && questionsValid

  const hint =
    selected.length === 0
      ? 'Select at least one reviewer.'
      : questions.length === 0
        ? 'Add at least one question.'
        : !questionsValid
          ? 'Every question needs text and a response cue.'
          : ''

  return (
    <div className="fixed inset-0 z-50 bg-[#0d212c]/40 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] flex flex-col gap-7 animate-in fade-in zoom-in-95 my-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#36c0c9]/10 text-[#36c0c9] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <h3 id={titleId} className="text-lg font-semibold text-[#0d212c]">
                Send to Internal Interest
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Choose who answers and which questions they get.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close send to Internal Interest"
            className="text-[#94a3b8] hover:text-[#0d212c] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <section className="flex flex-col gap-3" aria-labelledby="send-reviewers-heading">
          <h4 id="send-reviewers-heading" className="text-sm font-semibold text-[#0d212c]">
            Reviewers{' '}
            <span className="font-normal text-[#64748b]">({selected.length} selected)</span>
          </h4>
          <div className="border border-[#e2e8f0] rounded-xl divide-y divide-[#f1f5f9] bg-white">
            {members.map((person) => {
              const checked = selected.includes(person.id)
              return (
                <div
                  key={person.id}
                  onClick={() => toggle(person.id)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 transition cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      role="checkbox"
                      aria-checked={checked}
                      aria-label={person.name}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          toggle(person.id)
                        }
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        checked
                          ? 'bg-[#36c0c9] border-[#36c0c9] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
                      style={{
                        backgroundColor: person.avatarColorBg,
                        color: person.avatarColorText,
                      }}
                    >
                      {person.initials}
                    </div>
                    <span className="text-sm font-medium text-[#0d212c] truncate">
                      {person.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#64748b] shrink-0 pl-2">{person.expertise}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="send-questions-heading">
          <h4 id="send-questions-heading" className="text-sm font-semibold text-[#0d212c]">
            Questions{' '}
            <span className="font-normal text-[#64748b]">
              ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
            </span>
          </h4>
          <QuestionnaireEditor
            questionnaireId={questionnaireId}
            onQuestionnaireChange={(id) => {
              setQuestionnaireId(id)
              setQuestions(cloneQuestions(getQuestionnaire(id).questions))
            }}
            questions={questions}
            onQuestionsChange={setQuestions}
          />
        </section>

        <section className="flex flex-col gap-1.5">
          <label htmlFor="send-internal-note" className="text-sm font-semibold text-[#0d212c]">
            Note to Internal Interest
          </label>
          <textarea
            id="send-internal-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#d6dee6] bg-white text-sm text-[#0d212c] leading-relaxed resize-none transition hover:border-[#bcc7d3] focus:outline-none focus:border-[#a3b1c2]"
          />
        </section>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#f1f5f9] flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Response due in 5 business days
            </span>
            {hint && <span className="text-xs text-amber-700">{hint}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#0d212c] hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setConfirming(true)}
              className="px-5 py-2.5 rounded-lg font-semibold text-xs transition bg-[#36c0c9] hover:bg-[#2fb0b9] text-white cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              Send Request
            </button>
          </div>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Send to Internal Interest?"
          description={`The ${questions.length} ${
            questions.length === 1 ? 'question' : 'questions'
          } and ${selected.length} ${
            selected.length === 1 ? 'reviewer' : 'reviewers'
          } will be sent. After this you will not be able to edit them.`}
          confirmLabel="Send Request"
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            onSend({
              memberIds: selected,
              note,
              questionnaire: { name: getQuestionnaire(questionnaireId).name, questions },
            })
          }
        />
      )}
    </div>
  )
}
