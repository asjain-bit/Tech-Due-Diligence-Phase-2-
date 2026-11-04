import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StageFooter } from './StageFooter'

describe('StageFooter', () => {
  it('stays in view at the bottom of the stage', () => {
    render(
      <StageFooter>
        <button>Next</button>
      </StageFooter>
    )
    const bar = screen.getByRole('button', { name: 'Next' }).parentElement!
    expect(bar.className).toContain('sticky')
    expect(bar.className).toContain('bottom-0')
  })
})
