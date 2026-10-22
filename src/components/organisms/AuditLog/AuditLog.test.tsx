import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AUDIT_KIND_STYLES, AuditLog } from './AuditLog'
import type { AuditEvent } from '@/types/partnership.types'

const events: AuditEvent[] = [
  {
    id: 'a',
    title: 'Request submitted',
    description: 'Form received.',
    actor: 'Sarah (Vendor)',
    kind: 'user',
    timestamp: '22 Oct 2026, 09:00 AM',
  },
  {
    id: 'b',
    title: 'Brief generated',
    description: '7 checks run.',
    actor: 'Triage Agent',
    kind: 'agent',
    timestamp: '22 Oct 2026, 09:02 AM',
  },
  {
    id: 'c',
    title: 'Risks identified',
    description: 'Two checks need attention.',
    actor: 'Triage Agent',
    kind: 'critical',
    timestamp: '22 Oct 2026, 09:02 AM',
  },
  {
    id: 'd',
    title: 'Approved to proceed',
    description: 'Good fit.',
    actor: 'Zaid Al Ali (Director)',
    kind: 'approval',
    timestamp: '22 Oct 2026, 11:00 AM',
  },
]

describe('AuditLog', () => {
  it('shows the colour legend for the four kinds of entry', () => {
    render(<AuditLog events={events} />)
    const legend = within(screen.getByRole('list', { name: 'Colour legend' }))
    expect(legend.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Critical / Risk',
      'Agent Action',
      'Approval / Sign-off',
      'User Action',
    ])
    expect(Object.keys(AUDIT_KIND_STYLES)).toEqual(['critical', 'agent', 'approval', 'user'])
  })

  it('lists the newest entry first with its actor and time', () => {
    render(<AuditLog events={events} />)
    expect(screen.getByRole('heading', { name: 'Audit Log' })).toBeInTheDocument()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual([
      'Approved to proceed',
      'Risks identified',
      'Brief generated',
      'Request submitted',
    ])
    expect(screen.getByText('Zaid Al Ali (Director)')).toBeInTheDocument()
    expect(screen.getByText('22 Oct 2026, 11:00 AM')).toBeInTheDocument()
    expect(screen.getAllByText(/Actor:/).length).toBe(4)
  })

  it('colour codes each entry by its kind', () => {
    render(<AuditLog events={events} />)
    const rows = screen.getAllByRole('listitem').filter((li) => li.dataset.kind)
    expect(rows.map((r) => r.dataset.kind)).toEqual(['approval', 'critical', 'agent', 'user'])
    expect(rows[1].querySelector('span')).toHaveClass('text-red-500')
    expect(rows[0].querySelector('span')).toHaveClass('text-emerald-500')
    expect(rows[2].querySelector('span')).toHaveClass('text-amber-500')
  })

  it('says so when nothing has been logged', () => {
    render(<AuditLog events={[]} />)
    expect(screen.getByText('No activity has been logged yet.')).toBeInTheDocument()
  })
})
