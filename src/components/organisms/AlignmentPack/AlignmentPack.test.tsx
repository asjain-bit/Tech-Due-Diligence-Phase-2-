import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AlignmentPack, buildOpenQuestions } from './AlignmentPack'
import { INITIAL_PARTNERSHIP_REQUESTS } from '@/types/partnership.types'

const request = INITIAL_PARTNERSHIP_REQUESTS[2]

describe('AlignmentPack', () => {
  it('merges the brief, interest summary and strategy assessment with open questions', () => {
    render(<AlignmentPack request={request} />)
    ;[
      'Initial assessment brief',
      'Interest summary',
      'Strategy assessment',
      'Open questions',
    ].forEach((t) => expect(screen.getByRole('heading', { name: t })).toBeInTheDocument())
    expect(
      screen.getByText(/Parag Agarwal is the lead sponsor, with Najla Al Mansoori/)
    ).toBeInTheDocument()
  })

  it('says who it was sent to', () => {
    render(<AlignmentPack request={request} />)
    expect(screen.getByText('Director')).toBeInTheDocument()
    expect(screen.getByText(/Sponsors: Parag Agarwal, Najla Al Mansoori/)).toBeInTheDocument()
    expect(screen.getByText('Strategy Team')).toBeInTheDocument()
  })

  it('turns strategy conditions into an open question', () => {
    const questions = buildOpenQuestions(INITIAL_PARTNERSHIP_REQUESTS[1])
    expect(questions[0]).toMatch(/Has the vendor confirmed this condition/)
    expect(questions.length).toBeGreaterThanOrEqual(4)
  })
})
