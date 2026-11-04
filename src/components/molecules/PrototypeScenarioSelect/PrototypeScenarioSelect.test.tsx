import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PrototypeScenarioSelect } from './PrototypeScenarioSelect'

describe('PrototypeScenarioSelect', () => {
  it('lists the four outcomes and reports the choice', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PrototypeScenarioSelect onChange={onChange} />)
    const select = screen.getByLabelText("Simulate the team's response")
    expect(screen.getAllByRole('option')).toHaveLength(5)
    await user.selectOptions(select, 'single')
    expect(onChange).toHaveBeenCalledWith('single')
  })

  it('explains in a tooltip that it is for the prototype only', () => {
    render(<PrototypeScenarioSelect onChange={vi.fn()} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'only for prototype functioning and will not be included in the actual developed application'
    )
  })

  it('can be disabled and shows the current value', () => {
    render(<PrototypeScenarioSelect value="multiple" disabled onChange={vi.fn()} />)
    expect(screen.getByLabelText("Simulate the team's response")).toBeDisabled()
    expect(screen.getByLabelText("Simulate the team's response")).toHaveValue('multiple')
  })
})
