import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SponsorAssignModal } from './SponsorAssignModal'
import { DEFAULT_INTERNAL_INTERESTS } from '@/types/partnership.types'

const candidates = DEFAULT_INTERNAL_INTERESTS.slice(0, 3)

describe('SponsorAssignModal', () => {
  it('needs a lead before it can assign', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<SponsorAssignModal candidates={candidates} onConfirm={onConfirm} onClose={vi.fn()} />)
    const assign = screen.getByRole('button', { name: 'Assign sponsors' })
    expect(assign).toBeDisabled()
    expect(screen.getByText('Choose the lead sponsor first.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Riza Sayeed/ }))
    expect(assign).toBeEnabled()
    await user.click(assign)
    expect(onConfirm).toHaveBeenCalledWith({ lead: 'Riza Sayeed', co: [] })
  })

  it('picks co-sponsors from the others, and a lead cannot also be a co-sponsor', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<SponsorAssignModal candidates={candidates} onConfirm={onConfirm} onClose={vi.fn()} />)
    await user.click(screen.getByRole('radio', { name: /Riza Sayeed/ }))
    expect(screen.queryByRole('checkbox', { name: 'Riza Sayeed' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Parag Agarwal' }))
    await user.click(screen.getByRole('checkbox', { name: 'Najla Al Mansoori' }))
    // moving the lead to someone who was a co-sponsor removes them from the co-sponsors
    await user.click(screen.getByRole('radio', { name: /Parag Agarwal/ }))
    await user.click(screen.getByRole('button', { name: 'Assign sponsors' }))
    expect(onConfirm).toHaveBeenCalledWith({ lead: 'Parag Agarwal', co: ['Najla Al Mansoori'] })
  })

  it('scrolls inside and closes from the X, Cancel and Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<SponsorAssignModal candidates={candidates} onConfirm={vi.fn()} onClose={onClose} />)
    expect(screen.getByRole('dialog').className).toContain('max-h-[90vh]')
    await user.click(screen.getByRole('button', { name: 'Close assign sponsors' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('shows the chosen lead with a filled lucide radio icon in the primary colour', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <SponsorAssignModal candidates={candidates} onConfirm={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.querySelectorAll('svg.text-\\[\\#36c0c9\\].lucide-circle-dot')).toHaveLength(0)
    await user.click(screen.getByRole('radio', { name: /Riza Sayeed/ }))
    expect(container.querySelectorAll('svg.lucide-circle-dot')).toHaveLength(1)
    expect(container.querySelector('svg.lucide-circle-dot')).toHaveClass('text-[#36c0c9]')
    expect(container.querySelectorAll('svg.lucide-circle')).toHaveLength(2)
  })
})
