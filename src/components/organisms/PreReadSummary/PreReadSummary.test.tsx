import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PreReadSummary } from './PreReadSummary'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

describe('PreReadSummary', () => {
  it('shows the six sections in order', () => {
    render(<PreReadSummary request={INITIAL_PARTNERSHIP_REQUESTS[0]} />)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Roadmap overlap',
      'Build, buy or partner position',
      'CoE backlog position',
      'Architecture, hosting and residency',
      'Own versus rent the capability',
      'Network scale and sovereignty',
    ])
  })

  it('names the recommended position and the backlog position', () => {
    render(<PreReadSummary request={INITIAL_PARTNERSHIP_REQUESTS[0]} />)
    expect(screen.getByText('Partner')).toBeInTheDocument()
    expect(screen.getByText('Not on the backlog')).toBeInTheDocument()
  })

  it('lists the pitch deck and documents, including files added by the reviewer', () => {
    render(<PreReadSummary request={INITIAL_PARTNERSHIP_REQUESTS[0]} documents={['extra.xlsx']} />)
    const docs = within(screen.getByRole('list', { name: 'Documents reviewed' }))
    expect(docs.getByText('MedTech_Innovations_Pitch_Deck.pptx')).toBeInTheDocument()
    expect(docs.getByText('M42_Roadmap_Register.xlsx')).toBeInTheDocument()
    expect(docs.getByText('extra.xlsx')).toBeInTheDocument()
    expect(docs.getByText('Added by you')).toBeInTheDocument()
  })
})
