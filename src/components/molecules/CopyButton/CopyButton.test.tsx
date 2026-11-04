import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CopyButton } from './CopyButton'

describe('CopyButton', () => {
  it('copies the text and confirms', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<CopyButton text="hello" label="subject" />)
    await user.click(screen.getByRole('button', { name: 'Copy subject' }))
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(await screen.findByRole('button', { name: 'subject copied' })).toBeInTheDocument()
  })

  it('stays quiet when the clipboard is blocked', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('blocked'))
    render(<CopyButton text="hello" label="subject" />)
    await user.click(screen.getByRole('button', { name: 'Copy subject' }))
    expect(screen.getByRole('button', { name: 'Copy subject' })).toBeInTheDocument()
  })
})
