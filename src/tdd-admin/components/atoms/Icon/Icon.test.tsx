import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Icon } from './Icon'

describe('Icon Atom', () => {
  it('renders search icon', () => {
    const { container } = render(<Icon name="search" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
