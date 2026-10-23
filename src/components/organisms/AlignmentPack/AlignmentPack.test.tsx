import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AlignmentPack, buildOpenQuestions } from './AlignmentPack'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[2]

describe('AlignmentPack', () => {
  it('is laid out like the brief, with a side panel and a section for everything so far', () => {
    render(<AlignmentPack request={request} />)
    const nav = within(screen.getByRole('navigation', { name: 'Alignment pack sections' }))
    expect(nav.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Executive Summary',
      'Company Information',
      'Collaboration Proposal',
      'Solution Maturity',
      'Agent Checks',
      'Director Decision',
      'Internal Interest',
      'Strategy Assessment',
      'NDA',
      'Open Questions',
      'Key Dates',
    ])
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(11)
  })

  it('fills the sections with what happened so far', () => {
    render(<AlignmentPack request={request} />)
    expect(screen.getAllByText(request.companyName).length).toBeGreaterThan(0)
    expect(screen.getByText(request.assessmentAreas.proposalOfCollaboration)).toBeInTheDocument()
    expect(
      screen.getByText(/Parag Agarwal is the lead sponsor, with Najla Al Mansoori/)
    ).toBeInTheDocument()
    expect(screen.getByText('Conditions to proceed')).toBeInTheDocument()
    expect(screen.getByText('GenomicX_Signed_NDA_v1.pdf')).toBeInTheDocument()
    expect(screen.getByText('Agent: Proceed')).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveTextContent('Response date')
  })

  it('says who it was sent to', () => {
    render(<AlignmentPack request={request} />)
    expect(screen.getByText('Director')).toBeInTheDocument()
    expect(screen.getByText(/Sponsors: Parag Agarwal, Najla Al Mansoori/)).toBeInTheDocument()
    expect(screen.getByText('Strategy Team')).toBeInTheDocument()
  })

  it('adds an extra section to the end and the side panel', () => {
    render(
      <AlignmentPack
        request={request}
        extraSection={{ id: 'discovery', label: 'Discovery Call', content: <p>Extra content</p> }}
      />
    )
    expect(
      within(screen.getByRole('navigation', { name: 'Alignment pack sections' })).getByRole(
        'button',
        {
          name: 'Discovery Call',
        }
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Extra content')).toBeInTheDocument()
  })

  it('turns strategy conditions into an open question', () => {
    const questions = buildOpenQuestions(INITIAL_PARTNERSHIP_REQUESTS[1])
    expect(questions[0]).toMatch(/Has the vendor confirmed this condition/)
    expect(questions.length).toBeGreaterThanOrEqual(4)
  })
})
