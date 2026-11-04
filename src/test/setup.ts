import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './msw-server'

class LocalStorageMock {
  private store: Record<string, string> = {}

  clear() {
    this.store = {}
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }
}

const mockStorage = new LocalStorageMock()
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
})

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  window.localStorage.clear()
})

afterAll(() => {
  server.close()
})
