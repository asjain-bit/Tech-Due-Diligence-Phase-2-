import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from '@/components/templates/AppShell'

describe('AppShell', () => {
  it('renders topbar and main slots', () => {
    render(<AppShell topbar={<div>Top Navigation</div>} main={<div>Main Content Body</div>} />)

    expect(screen.getByText('Top Navigation')).toBeInTheDocument()
    expect(screen.getByTestId('appshell-main')).toHaveTextContent('Main Content Body')
  })

  it('renders and collapses leftbar based on isLeftbarCollapsed prop', () => {
    const { rerender } = render(
      <AppShell
        topbar={<div>Top</div>}
        leftbar={<div>Side Navigation</div>}
        main={<div>Content</div>}
        isLeftbarCollapsed={false}
      />
    )

    const leftbar = screen.getByTestId('appshell-leftbar')
    expect(leftbar).toHaveClass('w-[165px]')
    expect(leftbar).toHaveAttribute('data-collapsed', 'false')

    rerender(
      <AppShell
        topbar={<div>Top</div>}
        leftbar={<div>Side Navigation</div>}
        main={<div>Content</div>}
        isLeftbarCollapsed={true}
      />
    )

    expect(leftbar).toHaveClass('w-[48px]')
    expect(leftbar).toHaveAttribute('data-collapsed', 'true')
  })

  it('shows and hides rightbar slot based on isRightbarOpen', () => {
    const { rerender } = render(
      <AppShell
        topbar={<div>Top</div>}
        main={<div>Content</div>}
        rightbar={<div>Inspector Panel</div>}
        isRightbarOpen={false}
      />
    )

    expect(screen.queryByTestId('appshell-rightbar')).not.toBeInTheDocument()

    rerender(
      <AppShell
        topbar={<div>Top</div>}
        main={<div>Content</div>}
        rightbar={<div>Inspector Panel</div>}
        isRightbarOpen={true}
      />
    )

    const rightbar = screen.getByTestId('appshell-rightbar')
    expect(rightbar).toBeInTheDocument()
    expect(rightbar).toHaveClass('w-[280px]')
    expect(screen.getByText('Inspector Panel')).toBeInTheDocument()
  })
})
