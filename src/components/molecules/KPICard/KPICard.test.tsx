import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KPICard } from '@/components/molecules/KPICard'

describe('KPICard', () => {
  it('renders title, value, change, and badgeText', () => {
    render(
      <KPICard
        title="Total Revenue"
        value="$128,450"
        change="+14.2%"
        trend="up"
        badgeText="Q3 Goal"
        description="Compared to last quarterly period"
      />
    )

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$128,450')).toBeInTheDocument()
    expect(screen.getByText('+14.2%')).toBeInTheDocument()
    expect(screen.getByText('Q3 Goal')).toBeInTheDocument()
    expect(screen.getByText('Compared to last quarterly period')).toBeInTheDocument()
  })

  it('applies trend styling for down trend', () => {
    render(<KPICard title="Bounce Rate" value="48%" change="-5.1%" trend="down" />)
    expect(screen.getByText('-5.1%')).toBeInTheDocument()
  })

  it('renders neutral trend without trend icons', () => {
    render(<KPICard title="Active Pods" value="64" change="0.0%" trend="neutral" />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})
