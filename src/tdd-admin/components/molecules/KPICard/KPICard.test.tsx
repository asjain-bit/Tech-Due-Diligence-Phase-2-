import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard Molecule', () => {
  it('renders title and value', () => {
    render(<KPICard title="Total Sales" value="$45,230" badgeText="+12%" badgeVariant="success" />)
    expect(screen.getByText('Total Sales')).toBeInTheDocument()
    expect(screen.getByText('$45,230')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('renders change and trend indicator', () => {
    render(<KPICard title="Active Users" value="1,240" change="+5.4%" trend="up" />)
    expect(screen.getByText('+5.4%')).toBeInTheDocument()
  })
})
