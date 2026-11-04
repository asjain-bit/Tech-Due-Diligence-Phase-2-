import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('stays hidden while everything fits on one page', () => {
    const { container } = render(
      <Pagination page={1} pageSize={7} total={7} onPageChange={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the range and moves between pages', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageSize={7} total={15} onPageChange={onPageChange} />)
    expect(screen.getByText('Showing 1–7 of 15')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
