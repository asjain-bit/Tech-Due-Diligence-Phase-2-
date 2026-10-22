import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AnalysisDrawer } from './AnalysisDrawer'
import { buildAgentActions } from '@/components/organisms/AgentActions'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const renderDrawer = (index = 0, onClose = vi.fn()) => {
  const request = INITIAL_PARTNERSHIP_REQUESTS[index]
  render(
    <AnalysisDrawer request={request} actions={buildAgentActions(request)} onClose={onClose} />
  )
  return onClose
}

describe('AnalysisDrawer', () => {
  it('lists the checks with a summary and no Completed or Passed chips', () => {
    renderDrawer(1)
    expect(screen.getByRole('dialog', { name: 'Agent Actions' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'These are the checks performed by the agent to generate the initial assessment brief.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('6 checks completed')).toBeInTheDocument()
    expect(screen.getByText('2 risks identified')).toBeInTheDocument()
    expect(screen.queryByText('Passed')).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.getByText('Summary of findings')).toBeInTheDocument()
    expect(screen.getByText(/2 items need attention/)).toBeInTheDocument()
  })

  it('says nothing needs attention when every check passes', () => {
    renderDrawer(0)
    expect(
      screen.getByText(/Nothing needs attention before you decide|need attention/)
    ).toBeInTheDocument()
  })

  it('opens a check to show its detail', async () => {
    const user = userEvent.setup()
    renderDrawer()
    await user.click(screen.getByRole('button', { name: /Duplicate check/i }))
    expect(screen.getByText('Live cases compared')).toBeInTheDocument()
  })

  it('closes from the button, the backdrop and Escape', async () => {
    const user = userEvent.setup()
    const onClose = renderDrawer()
    await user.click(screen.getByRole('button', { name: 'Close AI analysis' }))
    await user.keyboard('{Escape}')
    await user.click(document.querySelector('[aria-hidden="true"].absolute')!)
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
