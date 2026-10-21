import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { JudgementForm } from './JudgementForm'
import {
  buildInitialJudgementEntries,
  buildStrategyDecisionDraft,
  isJudgementEdited,
  JUDGEMENT_CRITERIA,
} from '@/types/judgementCriteria'

describe('JudgementForm', () => {
  it('explains the agent choice for each of the 7 criteria', () => {
    render(
      <JudgementForm entries={buildInitialJudgementEntries()} decision={null} decisionNote="" />
    )
    JUDGEMENT_CRITERIA.forEach((c) => {
      const block = screen.getByTestId(`criterion-${c.id}`)
      expect(within(block).getByText(c.title)).toBeInTheDocument()
      expect(within(block).getByText(c.agentRationale, { exact: false })).toBeInTheDocument()
      expect(within(block).getByText('Agent pre-filled')).toBeInTheDocument()
    })
  })

  it('flags edits as Manually edited and demands a reason', async () => {
    const user = userEvent.setup()
    const onEntryChange = vi.fn()
    const entries = buildInitialJudgementEntries()
    entries.scale = { value: 'Low', reason: '' }
    render(
      <JudgementForm
        entries={entries}
        onEntryChange={onEntryChange}
        decision="Yes, proceed"
        decisionNote="ok"
      />
    )
    const block = screen.getByTestId('criterion-scale')
    expect(within(block).getByText('Manually edited')).toBeInTheDocument()
    expect(within(block).getByText(/A reason is required/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit decision/i })).toBeDisabled()

    await user.type(within(block).getByLabelText(/Why are you changing this/i), 'x')
    expect(onEntryChange).toHaveBeenCalledWith('scale', { reason: 'x' })

    await user.selectOptions(within(block).getByRole('combobox'), 'Medium')
    expect(onEntryChange).toHaveBeenCalledWith('scale', { value: 'Medium' })
  })

  it('requires a decision and summary before submit', async () => {
    const user = userEvent.setup()
    const onDecisionChange = vi.fn()
    const onSubmit = vi.fn()
    const entries = buildInitialJudgementEntries()
    const { rerender } = render(
      <JudgementForm
        entries={entries}
        decision={null}
        decisionNote=""
        onDecisionChange={onDecisionChange}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByText(/Still needed: your final decision/i)).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /^No/ }))
    expect(onDecisionChange).toHaveBeenCalledWith('No')

    rerender(
      <JudgementForm
        entries={entries}
        decision="No"
        decisionNote=""
        onDecisionChange={onDecisionChange}
        onSubmit={onSubmit}
      />
    )
    expect(screen.getByLabelText(/Reason for declining/i)).toBeInTheDocument()
    expect(screen.getByText(/the decision summary/i)).toBeInTheDocument()

    rerender(
      <JudgementForm
        entries={entries}
        decision="No"
        decisionNote="Not a fit"
        onDecisionChange={onDecisionChange}
        onSubmit={onSubmit}
      />
    )
    await user.click(screen.getByRole('button', { name: /Submit decision/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('is fully locked when readOnly', () => {
    const entries = buildInitialJudgementEntries()
    entries.build_buy = { value: 'Partner', reason: 'Faster' }
    render(
      <JudgementForm readOnly entries={entries} decision="Yes, proceed" decisionNote="Good fit" />
    )
    screen.getAllByRole('combobox').forEach((c) => expect(c).toBeDisabled())
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled())
    expect(screen.getByDisplayValue('Faster')).toBeDisabled()
    expect(screen.getByDisplayValue('Good fit')).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Submit decision/i })).not.toBeInTheDocument()
  })
})

describe('judgement criteria helpers', () => {
  it('detects edits against the agent value', () => {
    const c = JUDGEMENT_CRITERIA[0]
    expect(isJudgementEdited(c, { value: c.agentValue, reason: '' })).toBe(false)
    expect(isJudgementEdited(c, { value: 'Out of scope', reason: '' })).toBe(true)
    expect(isJudgementEdited(c, undefined)).toBe(false)
  })

  it('drafts a short decision summary for each outcome', () => {
    const entries = buildInitialJudgementEntries()
    expect(buildStrategyDecisionDraft('Yes, proceed', entries)).toMatch(/Good fit/)
    expect(buildStrategyDecisionDraft('Proceed with a condition', entries)).toMatch(
      /Proceed only if/
    )
    expect(buildStrategyDecisionDraft('No', entries)).toMatch(/Not a strategic fit/)

    const clean = Object.fromEntries(
      JUDGEMENT_CRITERIA.map((c) => [c.id, { value: 'In scope', reason: '' }])
    )
    expect(buildStrategyDecisionDraft('Yes, proceed', clean)).toMatch(
      /no material strategic concerns/
    )
  })
})
