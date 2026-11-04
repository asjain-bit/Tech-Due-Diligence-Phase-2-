import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/components/**/*', 'src/contexts/**/*'],
      exclude: [
        '**/*.stories.*',
        '**/*.config.*',
        '**/*.test.*',
        'src/test/**',
        '**/types/**',
        'src/app/**',
        '**/*.types.ts',
        '**/index.ts',
        'src/components/ai-elements/**',
        'src/components/ui/**',
        'e2e/**',
        '.storybook/**',
      ],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
})
