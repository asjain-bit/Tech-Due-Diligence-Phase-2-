import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TableFilterMenu } from './TableFilterMenu'

const opts = (...v: string[]) => v.map((x) => ({ value: x, label: x }))

describe('TableFilterMenu', () => {
  it('opens a panel with stage, SLA and sort, and reports changes', async () => {
    const user = userEvent.setup()
    const onStageChange = vi.fn()
    const onClear = vi.fn()
    render(
      <TableFilterMenu
        stage="all"
        stageOptions={opts('all', 'Internal Canvas')}
        sla="all"
        slaOptions={opts('all', 'On track')}
        sort="default"
        sortOptions={opts('default', 'company')}
        onStageChange={onStageChange}
        onSlaChange={vi.fn()}
        onSortChange={vi.fn()}
        activeCount={0}
        onClear={onClear}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    await user.selectOptions(screen.getByLabelText('Stage'), 'Internal Canvas')
    expect(onStageChange).toHaveBeenCalledWith('Internal Canvas')
    expect(screen.getByLabelText('SLA status')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(onClear).toHaveBeenCalled()
  })

  it('leaves out the SLA filter when the table has no SLA status', async () => {
    const user = userEvent.setup()
    render(
      <TableFilterMenu
        stage="all"
        stageOptions={opts('all')}
        sort="default"
        sortOptions={opts('default')}
        onStageChange={vi.fn()}
        onSortChange={vi.fn()}
        activeCount={2}
        onClear={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /Filters/ })).toHaveTextContent('2')
    await user.click(screen.getByRole('button', { name: /Filters/ }))
    expect(screen.queryByLabelText('SLA status')).not.toBeInTheDocument()
  })
})
