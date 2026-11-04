import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function Consumer() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders with default system theme and sets data-theme attribute', () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('system')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('hydrates saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')

    const { unmount } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    unmount()

    localStorage.setItem('theme', 'system')
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme').textContent).toBe('system')
  })

  it('handles localStorage errors gracefully during hydration and setting', async () => {
    const user = userEvent.setup()
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled')
    })
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded')
    })

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    await user.click(screen.getByText('Set Dark'))
    expect(screen.getByTestId('theme').textContent).toBe('dark')

    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
  })

  it('switches theme and persists to localStorage', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    await user.click(screen.getByText('Set Dark'))
    expect(screen.getByTestId('theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolved').textContent).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByText('Set Light'))
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(screen.getByTestId('resolved').textContent).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')

    await user.click(screen.getByText('Set System'))
    expect(screen.getByTestId('theme').textContent).toBe('system')
  })

  it('throws error when useTheme is called outside ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow('useTheme must be used within a ThemeProvider')
    spy.mockRestore()
  })

  it('responds to matchMedia changes when system theme is active', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_evt: string, cb: (e: MediaQueryListEvent) => void) => {
          changeHandler = cb
        },
        removeEventListener: () => {
          changeHandler = null
        },
        dispatchEvent: () => false,
      }),
    })

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    )

    expect(changeHandler).not.toBeNull()
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true } as MediaQueryListEvent)
      }
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
